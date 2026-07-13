import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  LOCK_FILE_NAME,
  initializeRepository,
  verifyRepository,
  type LockFile,
} from "../src/bootstrap.ts";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function createTemporaryRepository(): Promise<string> {
  const repositoryPath = await mkdtemp(
    join(tmpdir(), "koneko-roadmap-standard-"),
  );
  await mkdir(join(repositoryPath, ".git"));
  return repositoryPath;
}

async function readLock(repositoryPath: string): Promise<LockFile> {
  return JSON.parse(
    await readFile(join(repositoryPath, LOCK_FILE_NAME), "utf8"),
  ) as LockFile;
}

test("bootstrap writes v1, records checksums, and detects drift", async (context) => {
  const repositoryPath = await createTemporaryRepository();
  context.after(async () => rm(repositoryPath, { recursive: true, force: true }));

  const initialized = await initializeRepository({
    targetPath: repositoryPath,
    standardVersion: "v1",
    includeAllSkills: false,
    skillNames: [],
    force: false,
    dryRun: false,
    packageRoot,
  });

  assert.equal(initialized.standardVersion, "v1");
  assert.equal(initialized.installedSkills.length, 0);
  assert.match(
    await readFile(
      join(repositoryPath, "docs/roadmaps/standard.md"),
      "utf8",
    ),
    /^# Koneko Roadmap Standard/u,
  );

  const lock = await readLock(repositoryPath);
  assert.equal(lock.standardVersion, "v1");
  assert.equal(lock.files.length, 1);
  assert.equal(
    lock.files[0]?.gitBlobSha1,
    "a6d3437df215375a5f1e9013e9bcc0498d2eb1a4",
  );

  assert.equal(
    (
      await verifyRepository({
        targetPath: repositoryPath,
        packageRoot,
      })
    ).isValid,
    true,
  );

  await writeFile(
    join(repositoryPath, "docs/roadmaps/standard.md"),
    "# locally changed\n",
  );

  const drifted = await verifyRepository({
    targetPath: repositoryPath,
    packageRoot,
  });
  assert.equal(drifted.isValid, false);
  assert.equal(drifted.issues[0]?.reason, "checksum-mismatch");

  await assert.rejects(
    initializeRepository({
      targetPath: repositoryPath,
      standardVersion: "v1",
      includeAllSkills: false,
      skillNames: [],
      force: false,
      dryRun: false,
      packageRoot,
    }),
    /Managed files have drifted/u,
  );

  await initializeRepository({
    targetPath: repositoryPath,
    standardVersion: "v1",
    includeAllSkills: false,
    skillNames: [],
    force: true,
    dryRun: false,
    packageRoot,
  });

  assert.equal(
    (
      await verifyRepository({
        targetPath: repositoryPath,
        packageRoot,
      })
    ).isValid,
    true,
  );
});

test("bootstrap installs a selected skill and cleans stale v2 modules on v1 switch", async (context) => {
  const repositoryPath = await createTemporaryRepository();
  context.after(async () => rm(repositoryPath, { recursive: true, force: true }));

  await initializeRepository({
    targetPath: repositoryPath,
    standardVersion: "v2",
    includeAllSkills: false,
    skillNames: ["roadmap-phase-audit"],
    force: false,
    dryRun: false,
    packageRoot,
  });

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
        ".agents/skills/roadmap-phase-audit/SKILL.md",
      ),
      "utf8",
    ),
    /name: roadmap-phase-audit/u,
  );

  await initializeRepository({
    targetPath: repositoryPath,
    standardVersion: "v1",
    includeAllSkills: false,
    skillNames: [],
    force: false,
    dryRun: false,
    packageRoot,
  });

  await assert.rejects(
    readFile(
      join(repositoryPath, "docs/roadmaps/standard/metadata.md"),
      "utf8",
    ),
    (error: unknown) =>
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT",
  );

  const lock = await readLock(repositoryPath);
  assert.equal(lock.standardVersion, "v1");
  assert.deepEqual(lock.installedSkills, ["roadmap-phase-audit"]);
  assert.equal(
    (
      await verifyRepository({
        targetPath: repositoryPath,
        packageRoot,
      })
    ).isValid,
    true,
  );
});
