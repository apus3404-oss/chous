import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { extractFixableIssues, validateFixes, applyFixes, formatFixPreview } from "../../src/rules/fix";
import type { Issue } from "../../src/types";

// Test fixture directory
const TEST_ROOT = resolve(import.meta.dir, "../fixtures/fix-test");

describe("fix - extractFixableIssues", () => {
  it("should extract move issues", () => {
    const issues: Issue[] = [
      {
        ruleKind: "move",
        path: "/project/file.css",
        displayPath: "file.css",
        message: { key: "issue.move.shouldMoveToDir", params: { dir: "styles/" } },
        category: "forbidden",
        severity: "error",
      },
    ];

    const fixable = extractFixableIssues(issues, "/project");

    expect(fixable).toHaveLength(1);
    expect(fixable[0]).toMatchObject({
      fixAction: "move",
      sourcePath: "/project/file.css",
      targetPath: resolve("/project/styles/file.css"),
    });
  });

  it("should extract rename issues", () => {
    const issues: Issue[] = [
      {
        ruleKind: "renameGlob",
        path: "/project/test.spec.ts",
        displayPath: "test.spec.ts",
        message: { key: "issue.renameGlob.shouldRenameTo", params: { to: "test.test.ts" } },
        category: "forbidden",
        severity: "error",
      },
    ];

    const fixable = extractFixableIssues(issues, "/project");

    expect(fixable).toHaveLength(1);
    expect(fixable[0]).toMatchObject({
      fixAction: "rename",
      sourcePath: "/project/test.spec.ts",
      targetPath: resolve("/project/test.test.ts"),
    });
  });

  it("should skip non-error severity issues", () => {
    const issues: Issue[] = [
      {
        ruleKind: "move",
        path: "/project/file.css",
        displayPath: "file.css",
        message: { key: "issue.move.unsafeManual", params: { dir: "styles/" } },
        category: "forbidden",
        severity: "warn", // Not "error"
      },
    ];

    const fixable = extractFixableIssues(issues, "/project");

    expect(fixable).toHaveLength(0);
  });

  it("should skip issues without proper message keys", () => {
    const issues: Issue[] = [
      {
        ruleKind: "move",
        path: "/project/file.css",
        displayPath: "file.css",
        message: { key: "issue.move.destMustBeDir", params: {} },
        category: "forbidden",
        severity: "error",
      },
    ];

    const fixable = extractFixableIssues(issues, "/project");

    expect(fixable).toHaveLength(0);
  });

  it("should handle multiple fixable issues", () => {
    const issues: Issue[] = [
      {
        ruleKind: "move",
        path: "/project/a.css",
        displayPath: "a.css",
        message: { key: "issue.move.shouldMoveToDir", params: { dir: "styles/" } },
        category: "forbidden",
        severity: "error",
      },
      {
        ruleKind: "renameGlob",
        path: "/project/b.spec.ts",
        displayPath: "b.spec.ts",
        message: { key: "issue.renameGlob.shouldRenameTo", params: { to: "b.test.ts" } },
        category: "forbidden",
        severity: "error",
      },
    ];

    const fixable = extractFixableIssues(issues, "/project");

    expect(fixable).toHaveLength(2);
    expect(fixable[0]?.fixAction).toBe("move");
    expect(fixable[1]?.fixAction).toBe("rename");
  });
});

describe("fix - validateFixes", () => {
  beforeEach(() => {
    // Create test directory
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true });
    }
    mkdirSync(TEST_ROOT, { recursive: true });
  });

  afterEach(() => {
    // Cleanup
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true });
    }
  });

  it("should mark fix as safe when source exists and target doesn't", () => {
    const sourceFile = join(TEST_ROOT, "source.txt");
    writeFileSync(sourceFile, "content");

    const issues = [
      {
        ruleKind: "move" as const,
        path: sourceFile,
        displayPath: "source.txt",
        message: { key: "issue.move.shouldMoveToDir", params: { dir: "dest/" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "move" as const,
        sourcePath: sourceFile,
        targetPath: join(TEST_ROOT, "dest", "source.txt"),
      },
    ];

    const { safe, unsafe } = validateFixes(issues);

    expect(safe).toHaveLength(1);
    expect(unsafe).toHaveLength(0);
  });

  it("should mark fix as unsafe when source doesn't exist", () => {
    const sourceFile = join(TEST_ROOT, "nonexistent.txt");

    const issues = [
      {
        ruleKind: "move" as const,
        path: sourceFile,
        displayPath: "nonexistent.txt",
        message: { key: "issue.move.shouldMoveToDir", params: { dir: "dest/" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "move" as const,
        sourcePath: sourceFile,
        targetPath: join(TEST_ROOT, "dest", "nonexistent.txt"),
      },
    ];

    const { safe, unsafe } = validateFixes(issues);

    expect(safe).toHaveLength(0);
    expect(unsafe).toHaveLength(1);
  });

  it("should mark fix as unsafe when target already exists", () => {
    const sourceFile = join(TEST_ROOT, "source.txt");
    const targetFile = join(TEST_ROOT, "target.txt");
    writeFileSync(sourceFile, "source");
    writeFileSync(targetFile, "target");

    const issues = [
      {
        ruleKind: "rename" as const,
        path: sourceFile,
        displayPath: "source.txt",
        message: { key: "issue.renameGlob.shouldRenameTo", params: { to: "target.txt" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "rename" as const,
        sourcePath: sourceFile,
        targetPath: targetFile,
      },
    ];

    const { safe, unsafe } = validateFixes(issues);

    expect(safe).toHaveLength(0);
    expect(unsafe).toHaveLength(1);
  });

  it("should mark move as safe when target directory exists", () => {
    const sourceFile = join(TEST_ROOT, "source.txt");
    const targetDir = join(TEST_ROOT, "dest");
    mkdirSync(targetDir);
    writeFileSync(sourceFile, "content");

    const issues = [
      {
        ruleKind: "move" as const,
        path: sourceFile,
        displayPath: "source.txt",
        message: { key: "issue.move.shouldMoveToDir", params: { dir: "dest/" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "move" as const,
        sourcePath: sourceFile,
        targetPath: join(targetDir, "source.txt"),
      },
    ];

    const { safe, unsafe } = validateFixes(issues);

    expect(safe).toHaveLength(1);
    expect(unsafe).toHaveLength(0);
  });

  it("should handle mixed safe and unsafe fixes", () => {
    const safeSource = join(TEST_ROOT, "safe.txt");
    const unsafeSource = join(TEST_ROOT, "unsafe.txt");
    const unsafeTarget = join(TEST_ROOT, "target.txt");

    writeFileSync(safeSource, "safe");
    writeFileSync(unsafeSource, "unsafe");
    writeFileSync(unsafeTarget, "exists");

    const issues = [
      {
        ruleKind: "move" as const,
        path: safeSource,
        displayPath: "safe.txt",
        message: { key: "issue.move.shouldMoveToDir", params: { dir: "dest/" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "move" as const,
        sourcePath: safeSource,
        targetPath: join(TEST_ROOT, "dest", "safe.txt"),
      },
      {
        ruleKind: "rename" as const,
        path: unsafeSource,
        displayPath: "unsafe.txt",
        message: { key: "issue.renameGlob.shouldRenameTo", params: { to: "target.txt" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "rename" as const,
        sourcePath: unsafeSource,
        targetPath: unsafeTarget,
      },
    ];

    const { safe, unsafe } = validateFixes(issues);

    expect(safe).toHaveLength(1);
    expect(unsafe).toHaveLength(1);
  });
});

describe("fix - applyFixes", () => {
  beforeEach(() => {
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true });
    }
    mkdirSync(TEST_ROOT, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true });
    }
  });

  it("should apply move fix successfully", async () => {
    const sourceFile = join(TEST_ROOT, "source.txt");
    const targetDir = join(TEST_ROOT, "dest");
    const targetFile = join(targetDir, "source.txt");

    writeFileSync(sourceFile, "test content");

    const issues = [
      {
        ruleKind: "move" as const,
        path: sourceFile,
        displayPath: "source.txt",
        message: { key: "issue.move.shouldMoveToDir", params: { dir: "dest/" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "move" as const,
        sourcePath: sourceFile,
        targetPath: targetFile,
      },
    ];

    const result = await applyFixes(issues, {
      root: TEST_ROOT,
      dryRun: false,
      verbose: false,
      interactive: false,
    });

    expect(result.fixed).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(existsSync(sourceFile)).toBe(false);
    expect(existsSync(targetFile)).toBe(true);
    expect(readFileSync(targetFile, "utf8")).toBe("test content");
  });

  it("should apply rename fix successfully", async () => {
    const sourceFile = join(TEST_ROOT, "old.txt");
    const targetFile = join(TEST_ROOT, "new.txt");

    writeFileSync(sourceFile, "test content");

    const issues = [
      {
        ruleKind: "rename" as const,
        path: sourceFile,
        displayPath: "old.txt",
        message: { key: "issue.renameGlob.shouldRenameTo", params: { to: "new.txt" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "rename" as const,
        sourcePath: sourceFile,
        targetPath: targetFile,
      },
    ];

    const result = await applyFixes(issues, {
      root: TEST_ROOT,
      dryRun: false,
      verbose: false,
      interactive: false,
    });

    expect(result.fixed).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(existsSync(sourceFile)).toBe(false);
    expect(existsSync(targetFile)).toBe(true);
    expect(readFileSync(targetFile, "utf8")).toBe("test content");
  });

  it("should create target directory if it doesn't exist", async () => {
    const sourceFile = join(TEST_ROOT, "source.txt");
    const targetFile = join(TEST_ROOT, "nested", "deep", "source.txt");

    writeFileSync(sourceFile, "test content");

    const issues = [
      {
        ruleKind: "move" as const,
        path: sourceFile,
        displayPath: "source.txt",
        message: { key: "issue.move.shouldMoveToDir", params: { dir: "nested/deep/" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "move" as const,
        sourcePath: sourceFile,
        targetPath: targetFile,
      },
    ];

    const result = await applyFixes(issues, {
      root: TEST_ROOT,
      dryRun: false,
      verbose: false,
      interactive: false,
    });

    expect(result.fixed).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(existsSync(targetFile)).toBe(true);
  });

  it("should handle dry-run mode without applying changes", async () => {
    const sourceFile = join(TEST_ROOT, "source.txt");
    const targetFile = join(TEST_ROOT, "target.txt");

    writeFileSync(sourceFile, "test content");

    const issues = [
      {
        ruleKind: "rename" as const,
        path: sourceFile,
        displayPath: "source.txt",
        message: { key: "issue.renameGlob.shouldRenameTo", params: { to: "target.txt" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "rename" as const,
        sourcePath: sourceFile,
        targetPath: targetFile,
      },
    ];

    const result = await applyFixes(issues, {
      root: TEST_ROOT,
      dryRun: true,
      verbose: false,
      interactive: false,
    });

    expect(result.fixed).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    // Files should not be changed in dry-run
    expect(existsSync(sourceFile)).toBe(true);
    expect(existsSync(targetFile)).toBe(false);
  });

  it("should report errors for failed operations", async () => {
    const sourceFile = join(TEST_ROOT, "source.txt");
    const targetFile = join(TEST_ROOT, "target.txt");

    writeFileSync(sourceFile, "test");
    writeFileSync(targetFile, "exists"); // Target already exists

    const issues = [
      {
        ruleKind: "rename" as const,
        path: sourceFile,
        displayPath: "source.txt",
        message: { key: "issue.renameGlob.shouldRenameTo", params: { to: "target.txt" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "rename" as const,
        sourcePath: sourceFile,
        targetPath: targetFile,
      },
    ];

    const result = await applyFixes(issues, {
      root: TEST_ROOT,
      dryRun: false,
      verbose: false,
      interactive: false,
    });

    expect(result.fixed).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.error).toBeTruthy();
  });

  it("should apply multiple fixes in sequence", async () => {
    const file1 = join(TEST_ROOT, "file1.txt");
    const file2 = join(TEST_ROOT, "file2.txt");
    const target1 = join(TEST_ROOT, "dest", "file1.txt");
    const target2 = join(TEST_ROOT, "renamed.txt");

    writeFileSync(file1, "content1");
    writeFileSync(file2, "content2");

    const issues = [
      {
        ruleKind: "move" as const,
        path: file1,
        displayPath: "file1.txt",
        message: { key: "issue.move.shouldMoveToDir", params: { dir: "dest/" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "move" as const,
        sourcePath: file1,
        targetPath: target1,
      },
      {
        ruleKind: "rename" as const,
        path: file2,
        displayPath: "file2.txt",
        message: { key: "issue.renameGlob.shouldRenameTo", params: { to: "renamed.txt" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "rename" as const,
        sourcePath: file2,
        targetPath: target2,
      },
    ];

    const result = await applyFixes(issues, {
      root: TEST_ROOT,
      dryRun: false,
      verbose: false,
      interactive: false,
    });

    expect(result.fixed).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(existsSync(target1)).toBe(true);
    expect(existsSync(target2)).toBe(true);
  });
});

describe("fix - formatFixPreview", () => {
  it("should format move issues", () => {
    const issues = [
      {
        ruleKind: "move" as const,
        path: "/project/file.css",
        displayPath: "file.css",
        message: { key: "issue.move.shouldMoveToDir", params: { dir: "styles/" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "move" as const,
        sourcePath: "/project/file.css",
        targetPath: "/project/styles/file.css",
      },
    ];

    const preview = formatFixPreview(issues, "/project");

    expect(preview).toContain("Move (1)");
    expect(preview).toContain("file.css");
    expect(preview).toContain("styles/file.css");
  });

  it("should format rename issues", () => {
    const issues = [
      {
        ruleKind: "renameGlob" as const,
        path: "/project/test.spec.ts",
        displayPath: "test.spec.ts",
        message: { key: "issue.renameGlob.shouldRenameTo", params: { to: "test.test.ts" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "rename" as const,
        sourcePath: "/project/test.spec.ts",
        targetPath: "/project/test.test.ts",
      },
    ];

    const preview = formatFixPreview(issues, "/project");

    expect(preview).toContain("Rename (1)");
    expect(preview).toContain("test.spec.ts");
    expect(preview).toContain("test.test.ts");
  });

  it("should format mixed issues", () => {
    const issues = [
      {
        ruleKind: "move" as const,
        path: "/project/a.css",
        displayPath: "a.css",
        message: { key: "issue.move.shouldMoveToDir", params: { dir: "styles/" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "move" as const,
        sourcePath: "/project/a.css",
        targetPath: "/project/styles/a.css",
      },
      {
        ruleKind: "rename" as const,
        path: "/project/b.spec.ts",
        displayPath: "b.spec.ts",
        message: { key: "issue.renameGlob.shouldRenameTo", params: { to: "b.test.ts" } },
        category: "forbidden" as const,
        severity: "error" as const,
        fixAction: "rename" as const,
        sourcePath: "/project/b.spec.ts",
        targetPath: "/project/b.test.ts",
      },
    ];

    const preview = formatFixPreview(issues, "/project");

    expect(preview).toContain("Move (1)");
    expect(preview).toContain("Rename (1)");
  });
});
