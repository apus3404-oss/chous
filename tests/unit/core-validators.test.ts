import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { AllowRuleValidator } from "../../src/rules/validators/allow";
import { HasRuleValidator } from "../../src/rules/validators/has";
import { NamingRuleValidator } from "../../src/rules/validators/naming";
import type { AllowRule, HasRule, NamingRule } from "../../src/types";
import type { RuleValidatorContext } from "../../src/rules/validators/types";
import ignore from "ignore";

const TEST_ROOT = resolve(import.meta.dir, "../fixtures/core-validators-test");

function createMockContext(root: string): RuleValidatorContext {
  const ig = ignore();
  return {
    root,
    cachedGlobScan: async (pattern: string) => {
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

describe("AllowRuleValidator", () => {
  const validator = new AllowRuleValidator();

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

  it("should handle allow rule", () => {
    const rule: AllowRule = {
      kind: "allow",
      names: ["src", "dist"],
      source: { file: "/test/.chous", line: 1 },
    };

    expect(validator.canHandle(rule)).toBe(true);
  });

  it("should not handle non-allow rules", () => {
    const rule = {
      kind: "move",
      from: "*.css",
      toDir: "styles",
      source: { file: "/test/.chous", line: 1 },
    };

    expect(validator.canHandle(rule)).toBe(false);
  });

  it("should allow specified directories", async () => {
    mkdirSync(join(TEST_ROOT, "src"));
    mkdirSync(join(TEST_ROOT, "dist"));

    const rule: AllowRule = {
      kind: "allow",
      names: ["src", "dist"],
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    // Allow rules don't generate issues - they define what's allowed
    expect(context.rawIssues.length).toBe(0);
  });

  it("should handle glob patterns", async () => {
    writeFileSync(join(TEST_ROOT, "app.js"), "content");
    writeFileSync(join(TEST_ROOT, "test.js"), "content");

    const rule: AllowRule = {
      kind: "allow",
      names: ["*.js"],
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    expect(context.rawIssues.length).toBe(0);
  });

  it("should handle multiple patterns", async () => {
    mkdirSync(join(TEST_ROOT, "src"));
    mkdirSync(join(TEST_ROOT, "tests"));
    writeFileSync(join(TEST_ROOT, "README.md"), "content");

    const rule: AllowRule = {
      kind: "allow",
      names: ["src", "tests", "*.md"],
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    expect(context.rawIssues.length).toBe(0);
  });
});

describe("HasRuleValidator", () => {
  const validator = new HasRuleValidator();

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

  it("should handle has rule", () => {
    const rule: HasRule = {
      kind: "has",
      names: ["README.md", "LICENSE"],
      source: { file: "/test/.chous", line: 1 },
    };

    expect(validator.canHandle(rule)).toBe(true);
  });

  it("should not handle non-has rules", () => {
    const rule = {
      kind: "allow",
      names: ["src"],
      source: { file: "/test/.chous", line: 1 },
    };

    expect(validator.canHandle(rule)).toBe(false);
  });

  it("should report missing required files", async () => {
    // Don't create README.md - it should be reported as missing

    const rule: HasRule = {
      kind: "has",
      names: ["README.md", "LICENSE"],
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    expect(context.rawIssues.length).toBeGreaterThan(0);
    const readmeIssue = context.rawIssues.find((i) => i.displayPath === "README.md");
    expect(readmeIssue).toBeDefined();
    expect(readmeIssue?.message.key).toBe("issue.has.missing");
  });

  it("should not report existing required files", async () => {
    writeFileSync(join(TEST_ROOT, "README.md"), "content");
    writeFileSync(join(TEST_ROOT, "LICENSE"), "content");

    const rule: HasRule = {
      kind: "has",
      names: ["README.md", "LICENSE"],
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    expect(context.rawIssues.length).toBe(0);
  });

  it("should handle glob patterns", async () => {
    // Create package.json but not tsconfig.json

    writeFileSync(join(TEST_ROOT, "package.json"), "{}");

    const rule: HasRule = {
      kind: "has",
      names: ["package.json", "tsconfig.json"],
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    expect(context.rawIssues.length).toBe(1);
    const issue = context.rawIssues[0];
    expect(issue?.displayPath).toBe("tsconfig.json");
  });

  it("should handle nested paths", async () => {
    const srcDir = join(TEST_ROOT, "src");
    mkdirSync(srcDir);
    writeFileSync(join(srcDir, "index.ts"), "content");

    const rule: HasRule = {
      kind: "has",
      names: ["src/index.ts", "src/main.ts"],
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    expect(context.rawIssues.length).toBe(1);
    const issue = context.rawIssues[0];
    expect(issue?.displayPath).toBe("src/main.ts");
  });

  it("should report all missing files", async () => {
    // Create none of the required files

    const rule: HasRule = {
      kind: "has",
      names: ["README.md", "LICENSE", "package.json"],
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    expect(context.rawIssues.length).toBe(3);
    expect(context.rawIssues.every((i) => i.message.key === "issue.has.missing")).toBe(true);
  });
});

describe("NamingRuleValidator", () => {
  const validator = new NamingRuleValidator();

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

  it("should handle naming rule", () => {
    const rule: NamingRule = {
      kind: "naming",
      target: "those",
      pattern: "**/*.ts",
      style: "kebab-case",
      source: { file: "/test/.chous", line: 1 },
    };

    expect(validator.canHandle(rule)).toBe(true);
  });

  it("should not handle non-naming rules", () => {
    const rule = {
      kind: "allow",
      names: ["src"],
      source: { file: "/test/.chous", line: 1 },
    };

    expect(validator.canHandle(rule)).toBe(false);
  });

  it("should validate kebab-case naming", async () => {
    writeFileSync(join(TEST_ROOT, "user-service.ts"), "content");
    writeFileSync(join(TEST_ROOT, "UserService.ts"), "content"); // Wrong case

    const rule: NamingRule = {
      kind: "naming",
      target: "those",
      pattern: "*.ts",
      style: "kebab-case",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues.find((i) => i.displayPath.includes("UserService.ts"));
    expect(issue).toBeDefined();
    expect(issue?.message.key).toBe("issue.naming.wrongStyle");
  });

  it("should validate PascalCase naming", async () => {
    writeFileSync(join(TEST_ROOT, "UserService.ts"), "content");
    writeFileSync(join(TEST_ROOT, "user-service.ts"), "content"); // Wrong case

    const rule: NamingRule = {
      kind: "naming",
      target: "those",
      pattern: "*.ts",
      style: "PascalCase",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues.find((i) => i.displayPath.includes("user-service.ts"));
    expect(issue).toBeDefined();
    expect(issue?.message.key).toBe("issue.naming.wrongStyle");
  });

  it("should validate camelCase naming", async () => {
    writeFileSync(join(TEST_ROOT, "userService.ts"), "content");
    writeFileSync(join(TEST_ROOT, "UserService.ts"), "content"); // Wrong case

    const rule: NamingRule = {
      kind: "naming",
      target: "those",
      pattern: "*.ts",
      style: "camelCase",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues.find((i) => i.displayPath.includes("UserService.ts"));
    expect(issue).toBeDefined();
  });

  it("should validate snake_case naming", async () => {
    writeFileSync(join(TEST_ROOT, "user_service.py"), "content");
    writeFileSync(join(TEST_ROOT, "UserService.py"), "content"); // Wrong case

    const rule: NamingRule = {
      kind: "naming",
      target: "those",
      pattern: "*.py",
      style: "snake_case",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues.find((i) => i.displayPath.includes("UserService.py"));
    expect(issue).toBeDefined();
  });

  it("should validate SCREAMING_SNAKE_CASE naming", async () => {
    writeFileSync(join(TEST_ROOT, "API_KEY.ts"), "content");
    writeFileSync(join(TEST_ROOT, "api-key.ts"), "content"); // Wrong case

    const rule: NamingRule = {
      kind: "naming",
      target: "those",
      pattern: "*.ts",
      style: "SCREAMING_SNAKE_CASE",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues.find((i) => i.displayPath.includes("api-key.ts"));
    expect(issue).toBeDefined();
  });

  it("should validate flatcase naming", async () => {
    writeFileSync(join(TEST_ROOT, "userservice.ts"), "content");
    writeFileSync(join(TEST_ROOT, "UserService.ts"), "content"); // Wrong case

    const rule: NamingRule = {
      kind: "naming",
      target: "those",
      pattern: "*.ts",
      style: "flatcase",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues.find((i) => i.displayPath.includes("UserService.ts"));
    expect(issue).toBeDefined();
  });

  it("should handle except clause", async () => {
    writeFileSync(join(TEST_ROOT, "UserService.ts"), "content");
    writeFileSync(join(TEST_ROOT, "index.ts"), "content"); // Exception

    const rule: NamingRule = {
      kind: "naming",
      target: "those",
      pattern: "*.ts",
      style: "kebab-case",
      except: ["index.ts"],
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    // UserService.ts should be reported, but index.ts should not
    const userServiceIssue = context.rawIssues.find((i) => i.displayPath.includes("UserService.ts"));
    const indexIssue = context.rawIssues.find((i) => i.displayPath.includes("index.ts"));

    expect(userServiceIssue).toBeDefined();
    expect(indexIssue).toBeUndefined();
  });

  it("should handle nested directory patterns", async () => {
    const srcDir = join(TEST_ROOT, "src");
    const utilsDir = join(srcDir, "utils");
    mkdirSync(utilsDir, { recursive: true });

    writeFileSync(join(utilsDir, "user-helper.ts"), "content");
    writeFileSync(join(utilsDir, "UserHelper.ts"), "content"); // Wrong case

    const rule: NamingRule = {
      kind: "naming",
      target: "those",
      pattern: "src/**/*.ts",
      style: "kebab-case",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    const issue = context.rawIssues.find((i) => i.displayPath.includes("UserHelper.ts"));
    expect(issue).toBeDefined();
  });

  it("should handle fileType filter for files", async () => {
    mkdirSync(join(TEST_ROOT, "UserService"));
    writeFileSync(join(TEST_ROOT, "UserService.ts"), "content");

    const rule: NamingRule = {
      kind: "naming",
      target: "those",
      pattern: "**/*",
      style: "kebab-case",
      fileType: "files",
      source: { file: join(TEST_ROOT, ".chous"), line: 1 },
    };

    const context = createMockContext(TEST_ROOT);
    await validator.validate(rule, context, 0, { rules: [rule] });

    // Should only report the file, not the directory
    const fileIssue = context.rawIssues.find((i) => i.displayPath.includes("UserService.ts"));
    expect(fileIssue).toBeDefined();
  });
});
