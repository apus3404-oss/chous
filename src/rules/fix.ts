import { basename, dirname, resolve } from "node:path";
import { existsSync, mkdirSync, renameSync } from "node:fs";
import type { Issue } from "../types";
import { toDisplayPath } from "../fsutil";

export type FixableIssue = Issue & {
  fixAction: "move" | "rename";
  sourcePath: string;
  targetPath: string;
};

export type FixOptions = {
  root: string;
  dryRun: boolean;
  verbose: boolean;
  interactive: boolean;
};

export type FixResult = {
  fixed: FixableIssue[];
  skipped: FixableIssue[];
  errors: Array<{ issue: FixableIssue; error: string }>;
};

/**
 * Extract fixable issues from lint results
 */
export function extractFixableIssues(issues: Issue[], root: string): FixableIssue[] {
  const fixable: FixableIssue[] = [];

  for (const issue of issues) {
    // Only fix issues with severity "error" (safe to fix)
    if (issue.severity !== "error") continue;

    // Move rule: extract target directory from message
    if (issue.ruleKind === "move" && issue.message.key === "issue.move.shouldMoveToDir") {
      const dir = issue.message.params?.dir as string;
      if (!dir) continue;

      const sourcePath = issue.path;
      const targetDir = resolve(root, dir.replace(/\/$/, ""));
      const targetPath = resolve(targetDir, basename(sourcePath));

      fixable.push({
        ...issue,
        fixAction: "move",
        sourcePath,
        targetPath,
      });
    }

    // Rename rule: extract target path from message
    if (issue.ruleKind === "renameGlob" && issue.message.key === "issue.renameGlob.shouldRenameTo") {
      const to = issue.message.params?.to as string;
      if (!to) continue;

      const sourcePath = issue.path;
      const targetPath = resolve(root, to);

      fixable.push({
        ...issue,
        fixAction: "rename",
        sourcePath,
        targetPath,
      });
    }
  }

  return fixable;
}

/**
 * Validate that fixes are still safe to apply
 */
export function validateFixes(issues: FixableIssue[]): {
  safe: FixableIssue[];
  unsafe: FixableIssue[];
} {
  const safe: FixableIssue[] = [];
  const unsafe: FixableIssue[] = [];

  for (const issue of issues) {
    // Check if source still exists
    if (!existsSync(issue.sourcePath)) {
      unsafe.push(issue);
      continue;
    }

    // Check if target already exists
    if (existsSync(issue.targetPath)) {
      unsafe.push(issue);
      continue;
    }

    // For move operations, check if target directory can be created
    if (issue.fixAction === "move") {
      const targetDir = dirname(issue.targetPath);
      const parentDir = dirname(targetDir);

      // Parent must exist and be a directory
      if (existsSync(parentDir) && !existsSync(targetDir)) {
        safe.push(issue);
        continue;
      }

      // Or target dir already exists and is a directory
      if (existsSync(targetDir)) {
        try {
          const stat = require("node:fs").statSync(targetDir);
          if (stat.isDirectory()) {
            safe.push(issue);
            continue;
          }
        } catch {
          unsafe.push(issue);
          continue;
        }
      }

      unsafe.push(issue);
      continue;
    }

    // For rename operations, just check source and target
    safe.push(issue);
  }

  return { safe, unsafe };
}

/**
 * Apply fixes to the filesystem
 */
export async function applyFixes(
  issues: FixableIssue[],
  options: FixOptions
): Promise<FixResult> {
  const result: FixResult = {
    fixed: [],
    skipped: [],
    errors: [],
  };

  // Validate all fixes first
  const { safe, unsafe } = validateFixes(issues);
  result.skipped.push(...unsafe);

  if (options.dryRun) {
    // In dry-run mode, just report what would be done
    result.fixed.push(...safe);
    return result;
  }

  // Apply each fix
  for (const issue of safe) {
    try {
      if (issue.fixAction === "move") {
        // Create target directory if it doesn't exist
        const targetDir = dirname(issue.targetPath);
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true });
        }

        // Move the file
        renameSync(issue.sourcePath, issue.targetPath);
        result.fixed.push(issue);

        if (options.verbose) {
          console.log(
            `✓ Moved: ${toDisplayPath(issue.sourcePath, options.root)} → ${toDisplayPath(issue.targetPath, options.root)}`
          );
        }
      } else if (issue.fixAction === "rename") {
        // Rename the file
        renameSync(issue.sourcePath, issue.targetPath);
        result.fixed.push(issue);

        if (options.verbose) {
          console.log(
            `✓ Renamed: ${toDisplayPath(issue.sourcePath, options.root)} → ${toDisplayPath(issue.targetPath, options.root)}`
          );
        }
      }
    } catch (error) {
      result.errors.push({
        issue,
        error: error instanceof Error ? error.message : String(error),
      });

      if (options.verbose) {
        console.error(
          `✗ Failed: ${toDisplayPath(issue.sourcePath, options.root)} - ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  return result;
}

/**
 * Format fix preview for display
 */
export function formatFixPreview(issues: FixableIssue[], root: string): string {
  const lines: string[] = [];

  lines.push("\nFixable issues:\n");

  const moveIssues = issues.filter((i) => i.fixAction === "move");
  const renameIssues = issues.filter((i) => i.fixAction === "rename");

  if (moveIssues.length > 0) {
    lines.push(`\n📦 Move (${moveIssues.length}):`);
    for (const issue of moveIssues) {
      lines.push(
        `  ${toDisplayPath(issue.sourcePath, root)} → ${toDisplayPath(issue.targetPath, root)}`
      );
    }
  }

  if (renameIssues.length > 0) {
    lines.push(`\n✏️  Rename (${renameIssues.length}):`);
    for (const issue of renameIssues) {
      lines.push(
        `  ${toDisplayPath(issue.sourcePath, root)} → ${toDisplayPath(issue.targetPath, root)}`
      );
    }
  }

  return lines.join("\n");
}
