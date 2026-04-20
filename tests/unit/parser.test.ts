import { describe, expect, it } from "bun:test";
import { parseFsLintConfig, parseFsLintConfigGroups } from "../../src/config/parser";

describe("parser - basic rules", () => {
  it("should parse allow rule", () => {
    const config = parseFsLintConfig("allow src, dist");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "allow",
      names: ["src", "dist"],
    });
  });

  it("should parse allow rule with array syntax", () => {
    const config = parseFsLintConfig("allow [src, dist, node_modules]");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "allow",
      names: ["src", "dist", "node_modules"],
    });
  });

  it("should parse no rule", () => {
    const config = parseFsLintConfig("no *.log, *.tmp");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "no",
      names: ["*.log", "*.tmp"],
    });
  });

  it("should parse has rule", () => {
    const config = parseFsLintConfig("has README.md, LICENSE");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "has",
      names: ["README.md", "LICENSE"],
    });
  });

  it("should parse must have rule", () => {
    const config = parseFsLintConfig("must have package.json, tsconfig.json");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "has",
      names: ["package.json", "tsconfig.json"],
    });
  });

  it("should parse move rule", () => {
    const config = parseFsLintConfig("move *.css to styles");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "move",
      from: "*.css",
      toDir: "styles",
    });
  });

  it("should parse optional rule", () => {
    const config = parseFsLintConfig("optional .env, .env.local");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "optional",
      names: [".env", ".env.local"],
    });
  });
});

describe("parser - naming rules", () => {
  it("should parse use naming rule for files", () => {
    const config = parseFsLintConfig("use kebab-case for files **/*.ts");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "naming",
      target: "those",
      pattern: "**/*.ts",
      style: "kebab-case",
      fileType: "files",
    });
  });

  it("should parse use naming rule for dirs", () => {
    const config = parseFsLintConfig("use PascalCase for dirs components");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "naming",
      target: "in",
      pattern: "components",
      style: "PascalCase",
      fileType: "dirs",
    });
  });

  it("should parse multiple naming styles", () => {
    const config = parseFsLintConfig("use PascalCase, camelCase for files **/*.tsx");
    expect(config.rules).toHaveLength(2);
    expect(config.rules[0]?.style).toBe("PascalCase");
    expect(config.rules[1]?.style).toBe("camelCase");
  });

  it("should parse naming rule with prefix", () => {
    const config = parseFsLintConfig("use kebab-case for files **/*.test.ts prefix: /test-/");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "naming",
      style: "kebab-case",
      prefix: "/test-/",
    });
  });

  it("should parse naming rule with suffix", () => {
    const config = parseFsLintConfig("use PascalCase for files **/*.tsx suffix: /.tsx$/");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "naming",
      style: "PascalCase",
      suffix: "/.tsx$/",
    });
  });

  it("should parse naming rule with except", () => {
    const config = parseFsLintConfig("use kebab-case for files **/*.ts except index.ts, types.ts");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "naming",
      style: "kebab-case",
      except: ["index.ts", "types.ts"],
    });
  });

  it("should validate naming styles", () => {
    expect(() => parseFsLintConfig("use InvalidStyle for files **/*.ts")).toThrow();
  });
});

describe("parser - nested blocks", () => {
  it("should parse nested in block with allow", () => {
    const config = parseFsLintConfig(`
in src:
  allow components, utils
`);
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "inDirOnly",
      dir: "src",
      only: ["components", "utils"],
      mode: "permissive",
    });
  });

  it("should parse nested in block with strict", () => {
    const config = parseFsLintConfig(`
allow src, dist
in src:
  allow components
  strict
`);
    expect(config.rules).toHaveLength(3);
    const strictRule = config.rules[2];
    expect(strictRule).toMatchObject({
      kind: "inDirOnly",
      dir: "src",
      mode: "strict",
    });
  });

  it("should parse deeply nested blocks", () => {
    const config = parseFsLintConfig(`
in app:
  allow components, pages
  in components:
    allow Button, Input
`);
    expect(config.rules).toHaveLength(2);
    expect(config.rules[0]?.kind).toBe("inDirOnly");
    expect(config.rules[1]).toMatchObject({
      kind: "inDirOnly",
      dir: "app/components",
      only: ["Button", "Input"],
    });
  });

  it("should handle brace syntax for nested blocks", () => {
    const config = parseFsLintConfig(`
in src {
  allow components
}
`);
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "inDirOnly",
      dir: "src",
      only: ["components"],
    });
  });

  it("should prefix patterns in nested blocks", () => {
    const config = parseFsLintConfig(`
in docs:
  move *.md to articles
`);
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "move",
      from: "docs/*.md",
      toDir: "docs/articles",
    });
  });
});

describe("parser - conditional rules", () => {
  it("should parse if empty condition", () => {
    const config = parseFsLintConfig("move *.log to logs if empty");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]?.when).toEqual([{ type: "isEmpty" }]);
  });

  it("should parse if contains condition", () => {
    const config = parseFsLintConfig("allow tests if contains package.json");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]?.when).toEqual([{ type: "contains", pattern: "package.json" }]);
  });

  it("should parse if exists condition", () => {
    const config = parseFsLintConfig("has tsconfig.json if exists src");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]?.when).toEqual([{ type: "exists", pattern: "src" }]);
  });

  it("should parse if parent-matches condition", () => {
    const config = parseFsLintConfig("use kebab-case for files **/*.ts if parent-matches PascalCase");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]?.when).toEqual([{ type: "parentMatches", style: "PascalCase" }]);
  });

  it("should parse if file-size condition", () => {
    const config = parseFsLintConfig("move *.log to archive if file-size > 1MB");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]?.when).toEqual([{ type: "fileSize", op: ">", value: "1MB" }]);
  });
});

describe("parser - rename rules", () => {
  it("should parse rename glob rule", () => {
    const config = parseFsLintConfig("rename **/*.spec.ts to **/*.test.ts");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "renameGlob",
      from: "**/*.spec.ts",
      to: "**/*.test.ts",
    });
  });

  it("should parse rename dir rule", () => {
    const config = parseFsLintConfig("rename test, spec to tests");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "renameDir",
      fromNames: ["test", "spec"],
      toName: "tests",
    });
  });

  it("should handle relative path in rename", () => {
    const config = parseFsLintConfig("rename tests/**/*.spec.ts to *.test.ts");
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "renameGlob",
      from: "tests/**/*.spec.ts",
      to: "tests/**/*.test.ts",
    });
  });
});

describe("parser - comments and whitespace", () => {
  it("should ignore comments", () => {
    const config = parseFsLintConfig(`
# This is a comment
allow src
# Another comment
allow dist
`);
    expect(config.rules).toHaveLength(2);
  });

  it("should ignore empty lines", () => {
    const config = parseFsLintConfig(`
allow src

allow dist

`);
    expect(config.rules).toHaveLength(2);
  });

  it("should handle line continuations", () => {
    const config = parseFsLintConfig(`
allow src, \\
  dist, \\
  node_modules
`);
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "allow",
      names: ["src", "dist", "node_modules"],
    });
  });
});

describe("parser - multi-line arrays", () => {
  it("should parse multi-line array syntax", () => {
    const config = parseFsLintConfig(`
allow [
  src,
  dist,
  node_modules
]
`);
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "allow",
      names: ["src", "dist", "node_modules"],
    });
  });

  it("should handle comments in arrays", () => {
    const config = parseFsLintConfig(`
allow [
  src,
  # This is ignored
  dist
]
`);
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0]).toMatchObject({
      kind: "allow",
      names: ["src", "dist"],
    });
  });
});

describe("parser - config groups", () => {
  it("should parse single config group", () => {
    const configs = parseFsLintConfigGroups("allow src");
    expect(configs).toHaveLength(1);
    expect(configs[0]?.rules).toHaveLength(1);
  });

  it("should parse multiple config groups", () => {
    const configs = parseFsLintConfigGroups(`
allow src
---
allow dist
`);
    expect(configs).toHaveLength(2);
    expect(configs[0]?.rules[0]).toMatchObject({ kind: "allow", names: ["src"] });
    expect(configs[1]?.rules[0]).toMatchObject({ kind: "allow", names: ["dist"] });
  });

  it("should handle separator with whitespace", () => {
    const configs = parseFsLintConfigGroups(`
allow src
  ---
allow dist
`);
    expect(configs).toHaveLength(2);
  });
});

describe("parser - aliases", () => {
  it("should support yes alias for allow", () => {
    const config = parseFsLintConfig("yes src, dist");
    expect(config.rules[0]?.kind).toBe("allow");
  });

  it("should support ohyes alias for allow", () => {
    const config = parseFsLintConfig("ohyes src, dist");
    expect(config.rules[0]?.kind).toBe("allow");
  });

  it("should support deny alias for no", () => {
    const config = parseFsLintConfig("deny *.log");
    expect(config.rules[0]?.kind).toBe("no");
  });

  it("should support reject alias for no", () => {
    const config = parseFsLintConfig("reject *.tmp");
    expect(config.rules[0]?.kind).toBe("no");
  });
});

describe("parser - error handling", () => {
  it("should throw on invalid rule", () => {
    expect(() => parseFsLintConfig("invalid rule syntax")).toThrow();
  });

  it("should throw on invalid naming style", () => {
    expect(() => parseFsLintConfig("use InvalidCase for files **/*.ts")).toThrow();
  });

  it("should throw on empty where directive", () => {
    expect(() => parseFsLintConfig("[where:]")).toThrow();
  });

  it("should throw on malformed move rule", () => {
    expect(() => parseFsLintConfig("move *.css")).toThrow();
  });

  it("should throw on malformed rename rule", () => {
    expect(() => parseFsLintConfig("rename to newname")).toThrow();
  });
});

describe("parser - where directives", () => {
  it("should parse where:cwd directive", () => {
    const config = parseFsLintConfig(`
[where:cwd]
allow src
`);
    expect(config.where).toEqual({ type: "cwd" });
  });

  it("should parse where:glob directive", () => {
    const config = parseFsLintConfig(`
[where:**/package.json]
has dependencies
`);
    expect(config.where).toEqual({ type: "glob", patterns: ["**/package.json"] });
  });

  it("should parse path directive", () => {
    const config = parseFsLintConfig(`
[src]
allow components
`);
    expect(config.where).toEqual({ type: "paths", paths: ["src"] });
  });
});
