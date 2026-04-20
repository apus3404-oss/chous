import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { MoveRuleValidator } from "../../src/rules/validators/move";
import { RenameGlobRuleValidator } from "../../src/rules/validators/renameGlob";
import type { MoveRule, RenameGlobRule } from "../../src/types";
import type { RuleValidatorContext } from "../../src/rules/validators/types";
import ignore from "ignore";

const TEST_ROOT = resolve(import.meta.dir, "../fixtures/validator-test");

function createMockContext(root: string): RuleValidatorContext {
  const ig = ignore();
  return {
    root,
    cachedGlobScan: async (pattern: string) => {
      // Simple mock - just return files that match the pattern
      const files: string[] = [];
      const scanDir = (dir: string) => {
        if (!existsSync(dir)) return;
        const fs = require("node:fs");
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          if (entry.isFile()) {
            files.push(fullPath);
          } else if (entry.isDirectory()) {
            scanDir(fullPath);
          }
        }
      };
      scanDir(root);
      return files;
    },
    ig,
    rawIssues: [],
  };
}

describe("MoveRuleValidator", () => {
  const validator = new MoveRuleValidator();

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

  it("should handle move rule", () => {
    const rule: MoveRule = {
      kind: "move",
      from: "*.css",
      toDir: "styles",
      source: { file: "/test/.chous", line: 1 },
    };

    expect(validator.canHandle(rule)).toBe(true);
  });

  it("should not handle non-move rules", () => {
    const rule = {
      kind: "allow",
      names: ["src"],
      source: { file: "/test/.chous", line: 1 },
    };

    expect(validator.canHandle(rule)).toBe(false);
  });

  it("should detect files that need to be moved", async () => {
    // Create test files
    writeFileSync(join(TEST_ROOT, "style.css"), "body {}");
    writeFileSync(join(TEST_ROOT, "app.css"), "div {}");

    const rule: MoveRule = {
      kind: "move",
      from: "*.css",
      toDir: "styles",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    expect(context.rawIssues.length).toBeGreaterThan(0);
    expect(context.rawIssues[0]?.ruleKind).toBe("move");
    expect(context.rawIssues[0]?.message.key).toBe("issue.move.shouldMoveToDir");
  });

  it("should not report files already in target directory", async () => {
    // Create target directory and file
    const stylesDir = join(TEST_ROOT, "styles");
    mkdirSync(stylesDir);
    writeFileSync(join(stylesDir, "style.css"), "body {}");

    const rule: MoveRule = {
      kind: "move",
      from: "*.css",
      toDir: "styles",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    // Should not report the file that's already in styles/
    const issuesForFileInStyles = context.rawIssues.filter(
      (i) => i.displayPath.includes("styles/")
    );
    expect(issuesForFileInStyles.length).toBe(0);
  });

  it("should report unsafe move when target exists", async () => {
    // Create source and target files
    writeFileSync(join(TEST_ROOT, "style.css"), "source");
    const stylesDir = join(TEST_ROOT, "styles");
    mkdirSync(stylesDir);
    writeFileSync(join(stylesDir, "style.css"), "target exists");

    const rule: MoveRule = {
      kind: "move",
      from: "*.css",
      toDir: "styles",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues.find((i) => i.displayPath === "style.css");
    expect(issue).toBeDefined();
    expect(issue?.message.key).toBe("issue.move.unsafeManual");
    expect(issue?.severity).toBe("warn");
  });

  it("should report safe move when target doesn't exist", async () => {
    writeFileSync(join(TEST_ROOT, "style.css"), "content");

    const rule: MoveRule = {
      kind: "move",
      from: "*.css",
      toDir: "styles",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues.find((i) => i.displayPath === "style.css");
    expect(issue).toBeDefined();
    expect(issue?.message.key).toBe("issue.move.shouldMoveToDir");
    expect(issue?.severity).toBe("error");
  });

  it("should handle glob patterns", async () => {
    // Create nested structure
    const srcDir = join(TEST_ROOT, "src");
    mkdirSync(srcDir);
    writeFileSync(join(srcDir, "app.css"), "content");
    writeFileSync(join(srcDir, "main.css"), "content");

    const rule: MoveRule = {
      kind: "move",
      from: "src/*.css",
      toDir: "styles",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    expect(context.rawIssues.length).toBeGreaterThan(0);
    expect(context.rawIssues.every((i) => i.ruleKind === "move")).toBe(true);
  });

  it("should warn when destination is not a directory", async () => {
    writeFileSync(join(TEST_ROOT, "style.css"), "content");
    writeFileSync(join(TEST_ROOT, "styles"), "this is a file, not a dir");

    const rule: MoveRule = {
      kind: "move",
      from: "*.css",
      toDir: "styles",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const destIssue = context.rawIssues.find(
      (i) => i.message.key === "issue.move.destMustBeDir"
    );
    expect(destIssue).toBeDefined();
    expect(destIssue?.severity).toBe("warn");
  });
});

describe("RenameGlobRuleValidator", () => {
  const validator = new RenameGlobRuleValidator();

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

  it("should handle renameGlob rule", () => {
    const rule: RenameGlobRule = {
      kind: "renameGlob",
      from: "*.spec.ts",
      to: "*.test.ts",
      source: { file: "/test/.chous", line: 1 },
    };

    expect(validator.canHandle(rule)).toBe(true);
  });

  it("should not handle non-renameGlob rules", () => {
    const rule = {
      kind: "move",
      from: "*.css",
      toDir: "styles",
      source: { file: "/test/.chous", line: 1 },
    };

    expect(validator.canHandle(rule)).toBe(false);
  });

  it("should detect files that need to be renamed", async () => {
    writeFileSync(join(TEST_ROOT, "user.spec.ts"), "test content");
    writeFileSync(join(TEST_ROOT, "auth.spec.ts"), "test content");

    const rule: RenameGlobRule = {
      kind: "renameGlob",
      from: "*.spec.ts",
      to: "*.test.ts",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    expect(context.rawIssues.length).toBeGreaterThan(0);
    expect(context.rawIssues[0]?.ruleKind).toBe("renameGlob");
  });

  it("should report safe rename when target doesn't exist", async () => {
    writeFileSync(join(TEST_ROOT, "user.spec.ts"), "content");

    const rule: RenameGlobRule = {
      kind: "renameGlob",
      from: "*.spec.ts",
      to: "*.test.ts",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues.find((i) => i.displayPath.includes("user.spec.ts"));
    expect(issue).toBeDefined();
    expect(issue?.message.key).toBe("issue.renameGlob.shouldRenameTo");
    expect(issue?.severity).toBe("error");
  });

  it("should report unsafe rename when target exists", async () => {
    writeFileSync(join(TEST_ROOT, "user.spec.ts"), "source");
    writeFileSync(join(TEST_ROOT, "user.test.ts"), "target exists");

    const rule: RenameGlobRule = {
      kind: "renameGlob",
      from: "*.spec.ts",
      to: "*.test.ts",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues.find((i) => i.displayPath.includes("user.spec.ts"));
    expect(issue).toBeDefined();
    expect(issue?.message.key).toBe("issue.renameGlob.targetExistsManual");
    expect(issue?.severity).toBe("warn");
  });

  it("should handle .spec.ts to .test.ts conversion", async () => {
    writeFileSync(join(TEST_ROOT, "component.spec.ts"), "content");

    const rule: RenameGlobRule = {
      kind: "renameGlob",
      from: "**/*.spec.ts",
      to: "**/*.test.ts",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues[0];
    expect(issue).toBeDefined();
    expect(issue?.message.params?.to).toContain("test.ts");
  });

  it("should handle .tests.ts to .test.ts conversion", async () => {
    writeFileSync(join(TEST_ROOT, "component.tests.ts"), "content");

    const rule: RenameGlobRule = {
      kind: "renameGlob",
      from: "**/*.tests.ts",
      to: "**/*.test.ts",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues[0];
    expect(issue).toBeDefined();
    expect(issue?.message.params?.to).toContain("test.ts");
  });

  it("should handle nested directory patterns", async () => {
    const testsDir = join(TEST_ROOT, "tests");
    const unitDir = join(testsDir, "unit");
    mkdirSync(unitDir, { recursive: true });
    writeFileSync(join(unitDir, "user.spec.ts"), "content");

    const rule: RenameGlobRule = {
      kind: "renameGlob",
      from: "tests/**/*.spec.ts",
      to: "tests/**/*.test.ts",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    expect(context.rawIssues.length).toBeGreaterThan(0);
    const issue = context.rawIssues[0];
    expect(issue?.displayPath).toContain("tests/unit/user.spec.ts");
  });

  it("should report when target cannot be inferred", async () => {
    writeFileSync(join(TEST_ROOT, "file.txt"), "content");

    const rule: RenameGlobRule = {
      kind: "renameGlob",
      from: "*.txt",
      to: "**/*.md", // Complex pattern that can't be inferred
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues[0];
    expect(issue).toBeDefined();
    expect(issue?.message.key).toBe("issue.renameGlob.cannotInferTarget");
  });

  it("should handle multiple files matching pattern", async () => {
    writeFileSync(join(TEST_ROOT, "a.spec.ts"), "content");
    writeFileSync(join(TEST_ROOT, "b.spec.ts"), "content");
    writeFileSync(join(TEST_ROOT, "c.spec.ts"), "content");

    const rule: RenameGlobRule = {
      kind: "renameGlob",
      from: "*.spec.ts",
      to: "*.test.ts",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    expect(context.rawIssues.length).toBe(3);
    expect(context.rawIssues.every((i) => i.ruleKind === "renameGlob")).toBe(true);
  });
});
