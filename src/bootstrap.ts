import { randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  readFile,
  rename,
  rm,
  rmdir,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";
import { gitBlobSha1, gitBlobSha1ForFile } from "./checksum.ts";

export const STANDARD_VERSIONS = ["v1", "v2"] as const;
export type StandardVersion = (typeof STANDARD_VERSIONS)[number];
export const LOCK_FILE_NAME = ".koneko-roadmap-standard.json";

const TOOL_VERSION = "0.1.0";
const DEFAULT_PACKAGE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);
const SHA1_PATTERN = /^[0-9a-f]{40}$/u;

type ManagedKind = "standard" | "skill";
type ActionKind = ManagedKind | "lock";
type ActionName = "create" | "update" | "keep" | "remove";

interface StandardManifestFile {
  path: string;
  gitBlobSha1: string;
}

interface StandardManifest {
  schemaVersion: 1;
  standardVersion: StandardVersion;
  source: Record<string, unknown>;
  files: StandardManifestFile[];
}

interface SkillManifestEntry {
  name: string;
  sourcePath: string;
  installPath: string;
  gitBlobSha1: string;
}

interface SkillManifest {
  schemaVersion: 1;
  source: Record<string, unknown>;
  skills: SkillManifestEntry[];
}

interface BundleFile {
  kind: ManagedKind;
  name?: string;
  targetPath: string;
  sourcePath: string;
  gitBlobSha1: string;
  content: Uint8Array;
}

interface StandardBundle {
  version: StandardVersion;
  source: Record<string, unknown>;
  files: BundleFile[];
}

interface SkillCatalog {
  source: Record<string, unknown>;
  names: string[];
  skills: Map<string, BundleFile>;
}

export interface ManagedFile {
  kind: ManagedKind;
  name?: string;
  path: string;
  sourcePath: string;
  gitBlobSha1: string;
}

export interface LockFile {
  schemaVersion: 1;
  toolVersion: string;
  standardVersion: StandardVersion;
  installedAt: string;
  standardSource: Record<string, unknown>;
  skillSource?: Record<string, unknown>;
  installedSkills: string[];
  files: ManagedFile[];
}

export interface FileAction {
  kind: ActionKind;
  path: string;
  action: ActionName;
}

export interface InitializeOptions {
  targetPath: string;
  standardVersion: StandardVersion;
  includeAllSkills: boolean;
  skillNames: string[];
  force: boolean;
  dryRun: boolean;
  packageRoot?: string;
}

export interface InitializeResult {
  targetPath: string;
  standardVersion: StandardVersion;
  installedSkills: string[];
  lockFilePath: string;
  dryRun: boolean;
  actions: FileAction[];
}

export interface VerificationIssue {
  path: string;
  expected: string;
  actual: string | null;
  reason: "missing" | "checksum-mismatch" | "bundle-mismatch";
}

export interface VerifyOptions {
  targetPath: string;
  standardVersion?: StandardVersion;
  packageRoot?: string;
}

export interface VerifyResult {
  targetPath: string;
  lockFileFound: boolean;
  standardVersion: StandardVersion;
  checkedFiles: number;
  isValid: boolean;
  issues: VerificationIssue[];
}

export interface AvailableStandard {
  version: StandardVersion;
  fileCount: number;
  source: Record<string, unknown>;
}

export interface AvailableSkill {
  name: string;
  installPath: string;
  gitBlobSha1: string;
}

export interface AvailableResult {
  standards: AvailableStandard[];
  skills: AvailableSkill[];
  skillSource: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasErrorCode(error: unknown, code: string): boolean {
  return (
    isRecord(error) &&
    typeof error.code === "string" &&
    error.code === code
  );
}

function isStandardVersion(value: unknown): value is StandardVersion {
  return STANDARD_VERSIONS.includes(value as StandardVersion);
}

function requireString(
  value: unknown,
  label: string,
  isSha1 = false,
): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }

  if (isSha1 && !SHA1_PATTERN.test(value)) {
    throw new Error(`${label} must be a lowercase 40-character SHA-1.`);
  }

  return value;
}

function assertPortablePath(value: string, label: string): void {
  const parts = value.split(/[\\/]+/u);

  if (isAbsolute(value) || parts.includes("..") || value.length === 0) {
    throw new Error(`${label} must stay inside its declared root: ${value}`);
  }
}

function resolveInside(root: string, portablePath: string): string {
  assertPortablePath(portablePath, "Path");
  const resolvedPath = resolve(root, portablePath);
  const relativePath = relative(root, resolvedPath);

  if (
    relativePath === "" ||
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    throw new Error(`Path escapes its declared root: ${portablePath}`);
  }

  return resolvedPath;
}

async function readJson(filePath: string): Promise<unknown> {
  let source: string;

  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(`Unable to read ${filePath}: ${String(error)}`);
  }

  try {
    return JSON.parse(source) as unknown;
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${String(error)}`);
  }
}

function parseStandardManifest(
  value: unknown,
  manifestPath: string,
): StandardManifest {
  if (!isRecord(value) || value.schemaVersion !== 1) {
    throw new Error(`Unsupported standard manifest: ${manifestPath}`);
  }

  if (!isStandardVersion(value.standardVersion)) {
    throw new Error(`Invalid standardVersion in ${manifestPath}`);
  }

  if (!isRecord(value.source) || !Array.isArray(value.files)) {
    throw new Error(`Invalid standard manifest shape: ${manifestPath}`);
  }

  const files = value.files.map((entry, index): StandardManifestFile => {
    if (!isRecord(entry)) {
      throw new Error(`Invalid files[${index}] in ${manifestPath}`);
    }

    const path = requireString(entry.path, `files[${index}].path`);
    assertPortablePath(path, `files[${index}].path`);

    return {
      path,
      gitBlobSha1: requireString(
        entry.gitBlobSha1,
        `files[${index}].gitBlobSha1`,
        true,
      ),
    };
  });

  return {
    schemaVersion: 1,
    standardVersion: value.standardVersion,
    source: value.source,
    files,
  };
}

function parseSkillManifest(value: unknown, manifestPath: string): SkillManifest {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !isRecord(value.source) ||
    !Array.isArray(value.skills)
  ) {
    throw new Error(`Invalid skill manifest: ${manifestPath}`);
  }

  const skills = value.skills.map((entry, index): SkillManifestEntry => {
    if (!isRecord(entry)) {
      throw new Error(`Invalid skills[${index}] in ${manifestPath}`);
    }

    const sourcePath = requireString(
      entry.sourcePath,
      `skills[${index}].sourcePath`,
    );
    const installPath = requireString(
      entry.installPath,
      `skills[${index}].installPath`,
    );
    assertPortablePath(sourcePath, `skills[${index}].sourcePath`);
    assertPortablePath(installPath, `skills[${index}].installPath`);

    return {
      name: requireString(entry.name, `skills[${index}].name`),
      sourcePath,
      installPath,
      gitBlobSha1: requireString(
        entry.gitBlobSha1,
        `skills[${index}].gitBlobSha1`,
        true,
      ),
    };
  });

  return {
    schemaVersion: 1,
    source: value.source,
    skills,
  };
}

function parseManagedFile(value: unknown, index: number): ManagedFile {
  if (!isRecord(value) || (value.kind !== "standard" && value.kind !== "skill")) {
    throw new Error(`Invalid lock files[${index}].`);
  }

  const path = requireString(value.path, `lock files[${index}].path`);
  const sourcePath = requireString(
    value.sourcePath,
    `lock files[${index}].sourcePath`,
  );
  assertPortablePath(path, `lock files[${index}].path`);
  assertPortablePath(sourcePath, `lock files[${index}].sourcePath`);

  const managedFile: ManagedFile = {
    kind: value.kind,
    path,
    sourcePath,
    gitBlobSha1: requireString(
      value.gitBlobSha1,
      `lock files[${index}].gitBlobSha1`,
      true,
    ),
  };

  if (value.kind === "skill") {
    managedFile.name = requireString(
      value.name,
      `lock files[${index}].name`,
    );
  }

  return managedFile;
}

function parseLockFile(value: unknown, lockPath: string): LockFile {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !isStandardVersion(value.standardVersion) ||
    !isRecord(value.standardSource) ||
    !Array.isArray(value.installedSkills) ||
    !Array.isArray(value.files)
  ) {
    throw new Error(`Invalid lock file: ${lockPath}`);
  }

  const installedSkills = value.installedSkills.map((name, index) =>
    requireString(name, `installedSkills[${index}]`),
  );

  return {
    schemaVersion: 1,
    toolVersion:
      typeof value.toolVersion === "string" ? value.toolVersion : "unknown",
    standardVersion: value.standardVersion,
    installedAt:
      typeof value.installedAt === "string" ? value.installedAt : "unknown",
    standardSource: value.standardSource,
    skillSource: isRecord(value.skillSource) ? value.skillSource : undefined,
    installedSkills,
    files: value.files.map(parseManagedFile),
  };
}

async function loadStandardBundle(
  packageRoot: string,
  version: StandardVersion,
): Promise<StandardBundle> {
  const versionRoot = resolveInside(packageRoot, `standards/${version}`);
  const manifestPath = resolveInside(versionRoot, "manifest.json");
  const manifest = parseStandardManifest(
    await readJson(manifestPath),
    manifestPath,
  );

  if (manifest.standardVersion !== version) {
    throw new Error(
      `Manifest ${manifestPath} declares ${manifest.standardVersion}, expected ${version}.`,
    );
  }

  const files: BundleFile[] = [];
  const seenTargets = new Set<string>();

  for (const entry of manifest.files) {
    if (seenTargets.has(entry.path)) {
      throw new Error(`Duplicate standard target path: ${entry.path}`);
    }
    seenTargets.add(entry.path);

    const sourcePath = `standards/${version}/template/${entry.path}`;
    const absoluteSourcePath = resolveInside(packageRoot, sourcePath);
    const content = await readFile(absoluteSourcePath);
    const actualSha1 = gitBlobSha1(content);

    if (actualSha1 !== entry.gitBlobSha1) {
      throw new Error(
        `Bundled standard checksum mismatch for ${sourcePath}: expected ${entry.gitBlobSha1}, got ${actualSha1}.`,
      );
    }

    files.push({
      kind: "standard",
      targetPath: entry.path,
      sourcePath,
      gitBlobSha1: entry.gitBlobSha1,
      content,
    });
  }

  return {
    version,
    source: manifest.source,
    files,
  };
}

async function loadSkillCatalog(packageRoot: string): Promise<SkillCatalog> {
  const manifestPath = resolveInside(packageRoot, "skills/manifest.json");
  const manifest = parseSkillManifest(await readJson(manifestPath), manifestPath);
  const skills = new Map<string, BundleFile>();
  const seenTargets = new Set<string>();

  for (const entry of manifest.skills) {
    if (skills.has(entry.name)) {
      throw new Error(`Duplicate skill name: ${entry.name}`);
    }
    if (seenTargets.has(entry.installPath)) {
      throw new Error(`Duplicate skill install path: ${entry.installPath}`);
    }
    seenTargets.add(entry.installPath);

    const absoluteSourcePath = resolveInside(packageRoot, entry.sourcePath);
    const content = await readFile(absoluteSourcePath);
    const actualSha1 = gitBlobSha1(content);

    if (actualSha1 !== entry.gitBlobSha1) {
      throw new Error(
        `Bundled skill checksum mismatch for ${entry.sourcePath}: expected ${entry.gitBlobSha1}, got ${actualSha1}.`,
      );
    }

    skills.set(entry.name, {
      kind: "skill",
      name: entry.name,
      targetPath: entry.installPath,
      sourcePath: entry.sourcePath,
      gitBlobSha1: entry.gitBlobSha1,
      content,
    });
  }

  return {
    source: manifest.source,
    names: [...skills.keys()].sort(),
    skills,
  };
}

async function assertGitRepository(targetPath: string): Promise<void> {
  let targetStat;

  try {
    targetStat = await lstat(targetPath);
  } catch (error) {
    throw new Error(`Target path does not exist: ${targetPath} (${String(error)})`);
  }

  if (!targetStat.isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetPath}`);
  }

  try {
    await lstat(resolve(targetPath, ".git"));
  } catch (error) {
    throw new Error(
      `Target path is not a Git repository or worktree: ${targetPath} (${String(error)})`,
    );
  }
}

async function readLockFile(targetPath: string): Promise<LockFile | null> {
  const lockPath = resolve(targetPath, LOCK_FILE_NAME);

  try {
    return parseLockFile(await readJson(lockPath), lockPath);
  } catch (error) {
    if (hasErrorCode(error, "ENOENT")) {
      return null;
    }

    if (error instanceof Error && error.message.startsWith("Unable to read")) {
      const causeText = error.message;
      if (causeText.includes("ENOENT")) {
        return null;
      }
    }

    throw error;
  }
}

async function checksumOrNull(filePath: string): Promise<string | null> {
  try {
    return await gitBlobSha1ForFile(filePath);
  } catch (error) {
    if (hasErrorCode(error, "ENOENT")) {
      return null;
    }
    throw new Error(`Unable to checksum ${filePath}: ${String(error)}`);
  }
}

function toManagedFile(file: BundleFile): ManagedFile {
  return {
    kind: file.kind,
    name: file.name,
    path: file.targetPath,
    sourcePath: file.sourcePath,
    gitBlobSha1: file.gitBlobSha1,
  };
}

function bundleMap(
  standard: StandardBundle,
  skills: SkillCatalog,
): Map<string, BundleFile> {
  const result = new Map<string, BundleFile>();

  for (const file of standard.files) {
    result.set(file.targetPath, file);
  }
  for (const file of skills.skills.values()) {
    if (result.has(file.targetPath)) {
      throw new Error(`Standard and skill target paths collide: ${file.targetPath}`);
    }
    result.set(file.targetPath, file);
  }

  return result;
}

async function atomicWrite(filePath: string, content: Uint8Array | string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  const temporaryPath = resolve(
    dirname(filePath),
    `.${basename(filePath)}.${process.pid}.${randomUUID()}.tmp`,
  );

  try {
    await writeFile(temporaryPath, content);
    await rm(filePath, { force: true });
    await rename(temporaryPath, filePath);
  } finally {
    await rm(temporaryPath, { force: true }).catch(() => undefined);
  }
}

async function removeEmptyParents(filePath: string, stopRoot: string): Promise<void> {
  let currentDirectory = dirname(filePath);

  while (currentDirectory !== stopRoot) {
    const relativePath = relative(stopRoot, currentDirectory);
    if (
      relativePath === "" ||
      relativePath === ".." ||
      relativePath.startsWith(`..${sep}`) ||
      isAbsolute(relativePath)
    ) {
      return;
    }

    try {
      await rmdir(currentDirectory);
    } catch (error) {
      if (
        hasErrorCode(error, "ENOENT") ||
        hasErrorCode(error, "ENOTEMPTY") ||
        hasErrorCode(error, "EEXIST")
      ) {
        return;
      }
      throw error;
    }

    currentDirectory = dirname(currentDirectory);
  }
}

function formatVerificationIssues(issues: VerificationIssue[]): string {
  return issues
    .map(
      (issue) =>
        `- ${issue.path}: ${issue.reason}; expected ${issue.expected}, got ${issue.actual ?? "missing"}`,
    )
    .join("\n");
}

export async function verifyRepository(
  options: VerifyOptions,
): Promise<VerifyResult> {
  const targetPath = resolve(options.targetPath);
  const packageRoot = resolve(options.packageRoot ?? DEFAULT_PACKAGE_ROOT);
  await assertGitRepository(targetPath);

  const lock = await readLockFile(targetPath);
  let standardVersion: StandardVersion;
  let expectedFiles: ManagedFile[];
  const issues: VerificationIssue[] = [];

  if (lock !== null) {
    standardVersion = lock.standardVersion;
    expectedFiles = lock.files;

    const standard = await loadStandardBundle(packageRoot, standardVersion);
    const skills = await loadSkillCatalog(packageRoot);
    const availableFiles = bundleMap(standard, skills);

    for (const file of expectedFiles) {
      const bundledFile = availableFiles.get(file.path);

      if (
        bundledFile === undefined ||
        bundledFile.kind !== file.kind ||
        (file.kind === "skill" && bundledFile.name !== file.name) ||
        bundledFile.gitBlobSha1 !== file.gitBlobSha1
      ) {
        issues.push({
          path: file.path,
          expected: file.gitBlobSha1,
          actual: bundledFile?.gitBlobSha1 ?? null,
          reason: "bundle-mismatch",
        });
      }
    }
  } else {
    if (options.standardVersion === undefined) {
      throw new Error(
        `No ${LOCK_FILE_NAME} was found. Supply --standard v1 or --standard v2 to verify an unmanaged copy.`,
      );
    }

    standardVersion = options.standardVersion;
    const standard = await loadStandardBundle(packageRoot, standardVersion);
    expectedFiles = standard.files.map(toManagedFile);
  }

  for (const file of expectedFiles) {
    const targetFilePath = resolveInside(targetPath, file.path);
    const actualSha1 = await checksumOrNull(targetFilePath);

    if (actualSha1 === null) {
      issues.push({
        path: file.path,
        expected: file.gitBlobSha1,
        actual: null,
        reason: "missing",
      });
    } else if (actualSha1 !== file.gitBlobSha1) {
      issues.push({
        path: file.path,
        expected: file.gitBlobSha1,
        actual: actualSha1,
        reason: "checksum-mismatch",
      });
    }
  }

  return {
    targetPath,
    lockFileFound: lock !== null,
    standardVersion,
    checkedFiles: expectedFiles.length,
    isValid: issues.length === 0,
    issues,
  };
}

export async function initializeRepository(
  options: InitializeOptions,
): Promise<InitializeResult> {
  const targetPath = resolve(options.targetPath);
  const packageRoot = resolve(options.packageRoot ?? DEFAULT_PACKAGE_ROOT);
  await assertGitRepository(targetPath);

  const standard = await loadStandardBundle(
    packageRoot,
    options.standardVersion,
  );
  const skillCatalog = await loadSkillCatalog(packageRoot);
  const existingLock = await readLockFile(targetPath);

  if (existingLock !== null) {
    const existingVerification = await verifyRepository({
      targetPath,
      packageRoot,
    });

    if (!existingVerification.isValid && !options.force) {
      throw new Error(
        `Managed files have drifted. Refusing to overwrite them without --force:\n${formatVerificationIssues(existingVerification.issues)}`,
      );
    }
  }

  const requestedSkillNames = new Set<string>();
  if (options.includeAllSkills) {
    for (const name of skillCatalog.names) {
      requestedSkillNames.add(name);
    }
  }
  for (const name of options.skillNames) {
    requestedSkillNames.add(name);
  }
  if (existingLock !== null) {
    for (const name of existingLock.installedSkills) {
      requestedSkillNames.add(name);
    }
  }

  const installedSkills = [...requestedSkillNames].sort();
  const desiredFiles: BundleFile[] = [...standard.files];

  for (const name of installedSkills) {
    const skill = skillCatalog.skills.get(name);
    if (skill === undefined) {
      throw new Error(
        `Unknown or unavailable roadmap skill: ${name}. Run the list command to see valid names.`,
      );
    }
    desiredFiles.push(skill);
  }

  const desiredByPath = new Map<string, BundleFile>();
  for (const file of desiredFiles) {
    if (desiredByPath.has(file.targetPath)) {
      throw new Error(`Duplicate destination path: ${file.targetPath}`);
    }
    desiredByPath.set(file.targetPath, file);
  }

  const existingByPath = new Map(
    (existingLock?.files ?? []).map((file) => [file.path, file]),
  );
  const actions: FileAction[] = [];

  for (const file of desiredFiles) {
    const targetFilePath = resolveInside(targetPath, file.targetPath);
    const actualSha1 = await checksumOrNull(targetFilePath);

    if (actualSha1 === file.gitBlobSha1) {
      actions.push({ kind: file.kind, path: file.targetPath, action: "keep" });
      continue;
    }

    if (
      actualSha1 !== null &&
      !existingByPath.has(file.targetPath) &&
      !options.force
    ) {
      throw new Error(
        `Refusing to overwrite unmanaged file ${file.targetPath}. Re-run with --force only after reviewing the conflict.`,
      );
    }

    actions.push({
      kind: file.kind,
      path: file.targetPath,
      action: actualSha1 === null ? "create" : "update",
    });
  }

  const staleFiles = (existingLock?.files ?? []).filter(
    (file) => !desiredByPath.has(file.path),
  );

  for (const file of staleFiles) {
    const targetFilePath = resolveInside(targetPath, file.path);
    if ((await checksumOrNull(targetFilePath)) !== null) {
      actions.push({ kind: file.kind, path: file.path, action: "remove" });
    }
  }

  const lockFilePath = resolve(targetPath, LOCK_FILE_NAME);
  actions.push({
    kind: "lock",
    path: LOCK_FILE_NAME,
    action: existingLock === null ? "create" : "update",
  });

  if (!options.dryRun) {
    const actionablePaths = new Set(
      actions
        .filter((action) => action.action === "create" || action.action === "update")
        .map((action) => action.path),
    );

    for (const file of desiredFiles) {
      if (actionablePaths.has(file.targetPath)) {
        await atomicWrite(
          resolveInside(targetPath, file.targetPath),
          file.content,
        );
      }
    }

    for (const file of staleFiles) {
      const targetFilePath = resolveInside(targetPath, file.path);
      await rm(targetFilePath, { force: true });
      await removeEmptyParents(targetFilePath, targetPath);
    }

    const lock: LockFile = {
      schemaVersion: 1,
      toolVersion: TOOL_VERSION,
      standardVersion: options.standardVersion,
      installedAt: new Date().toISOString(),
      standardSource: standard.source,
      skillSource:
        installedSkills.length > 0 ? skillCatalog.source : undefined,
      installedSkills,
      files: desiredFiles
        .map(toManagedFile)
        .sort((left, right) => left.path.localeCompare(right.path)),
    };

    await atomicWrite(
      lockFilePath,
      `${JSON.stringify(lock, null, 2)}\n`,
    );
  }

  return {
    targetPath,
    standardVersion: options.standardVersion,
    installedSkills,
    lockFilePath,
    dryRun: options.dryRun,
    actions,
  };
}

export async function listAvailable(
  packageRoot = DEFAULT_PACKAGE_ROOT,
): Promise<AvailableResult> {
  const resolvedPackageRoot = resolve(packageRoot);
  const standards: AvailableStandard[] = [];

  for (const version of STANDARD_VERSIONS) {
    const standard = await loadStandardBundle(resolvedPackageRoot, version);
    standards.push({
      version,
      fileCount: standard.files.length,
      source: standard.source,
    });
  }

  const skillCatalog = await loadSkillCatalog(resolvedPackageRoot);

  return {
    standards,
    skills: skillCatalog.names.map((name) => {
      const skill = skillCatalog.skills.get(name);
      if (skill === undefined) {
        throw new Error(`Skill catalog lost entry: ${name}`);
      }
      return {
        name,
        installPath: skill.targetPath,
        gitBlobSha1: skill.gitBlobSha1,
      };
    }),
    skillSource: skillCatalog.source,
  };
}
