import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { LOCK_FILE_NAME, type LockFile } from "../src/bootstrap.ts";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

interface CliResult {
  code: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
}

async function createTemporaryRepository(): Promise<string> {
  const repositoryPath = await mkdtemp(
    join(tmpdir(), "koneko-roadmap-cli-"),
  );
  await mkdir(join(repositoryPath, ".git"));
  return repositoryPath;
}

async function runRepositoryWithNode(
  args: string[],
  input = "",
): Promise<CliResult> {
  return await new Promise<CliResult>((resolveResult, reject) => {
    const child = spawn(process.execPath, [".", ...args], {
      cwd: packageRoot,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      resolveResult({ code, signal, stdout, stderr });
    });

    child.stdin.end(input);
  });
}

test("the cloned repository is directly executable with node", async () => {
  const result = await runRepositoryWithNode(["--help"]);

  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.signal, null);
  assert.match(result.stdout, /node \./u);
  assert.match(result.stdout, /interactive setup wizard/iu);
});

test(
  "bare node execution runs the interactive wizard and installs recommended defaults",
  { timeout: 20_000 },
  async (context) => {
    const repositoryPath = await createTemporaryRepository();
    context.after(async () => rm(repositoryPath, { recursive: true, force: true }));

    const result = await runRepositoryWithNode(
      [],
      `${repositoryPath}\n\n\ny\n`,
    );

    assert.equal(result.code, 0, result.stderr);
    assert.equal(result.signal, null);
    assert.match(result.stdout, /Interactive setup/iu);
    assert.match(result.stdout, /Dry run for roadmap standard v2/u);
    assert.match(result.stdout, /Initialized roadmap standard v2/u);
    assert.match(result.stdout, /Verified \d+ managed file/u);

    assert.match(
      await readFile(
        join(repositoryPath, "docs/roadmaps/standard/metadata.md"),
        "utf8",
      ),
      /^# Roadmap Metadata Standard/u,
    );
    assert.match(
      await readFile(
        join(
          repositoryPath,
          ".agents/skills/roadmap-creation-workflow/SKILL.md",
        ),
        "utf8",
      ),
      /name: roadmap-creation-workflow/u,
    );

    const lock = JSON.parse(
      await readFile(join(repositoryPath, LOCK_FILE_NAME), "utf8"),
    ) as LockFile;
    assert.equal(lock.standardVersion, "v2");
    assert.equal(lock.installedSkills.length, 5);
  },
);
