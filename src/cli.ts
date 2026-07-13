#!/usr/bin/env node

import {
  STANDARD_VERSIONS,
  initializeRepository,
  listAvailable,
  verifyRepository,
  type StandardVersion,
} from "./bootstrap.ts";

const CLI_VERSION = "0.1.0";
type Command = "init" | "verify" | "list" | "help" | "version";

interface CliOptions {
  command: Command;
  targetPath: string;
  standardVersion: StandardVersion;
  isStandardExplicit: boolean;
  includeAllSkills: boolean;
  skillNames: string[];
  force: boolean;
  dryRun: boolean;
  json: boolean;
}

function requireValue(args: string[], index: number, option: string): string {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`${option} requires a value.`);
  }
  return value;
}

function parseStandardVersion(value: string): StandardVersion {
  if (!STANDARD_VERSIONS.includes(value as StandardVersion)) {
    throw new Error(
      `Unknown standard version ${value}. Expected one of: ${STANDARD_VERSIONS.join(", ")}.`,
    );
  }
  return value as StandardVersion;
}

function parseArguments(argv: string[]): CliOptions {
  const args = [...argv];
  let command: Command = "init";

  if (args[0] !== undefined && !args[0].startsWith("-")) {
    const candidate = args.shift();
    if (
      candidate !== "init" &&
      candidate !== "verify" &&
      candidate !== "list" &&
      candidate !== "help" &&
      candidate !== "version"
    ) {
      throw new Error(`Unknown command: ${candidate}`);
    }
    command = candidate;
  }

  const options: CliOptions = {
    command,
    targetPath: process.cwd(),
    standardVersion: "v2",
    isStandardExplicit: false,
    includeAllSkills: false,
    skillNames: [],
    force: false,
    dryRun: false,
    json: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    switch (argument) {
      case "--":
        break;
      case "--help":
      case "-h":
        options.command = "help";
        break;
      case "--version":
      case "-v":
        options.command = "version";
        break;
      case "--path": {
        const value = requireValue(args, index, "--path");
        options.targetPath = value;
        index += 1;
        break;
      }
      case "--standard": {
        const value = requireValue(args, index, "--standard");
        options.standardVersion = parseStandardVersion(value);
        options.isStandardExplicit = true;
        index += 1;
        break;
      }
      case "--skills":
        options.includeAllSkills = true;
        break;
      case "--skill": {
        const value = requireValue(args, index, "--skill");
        options.skillNames.push(value);
        index += 1;
        break;
      }
      case "--force":
        options.force = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--json":
        options.json = true;
        break;
      default:
        if (argument.startsWith("-")) {
          throw new Error(`Unknown option: ${argument}`);
        }
        throw new Error(`Unexpected positional argument: ${argument}`);
    }
  }

  if (
    options.command === "verify" &&
    (options.includeAllSkills ||
      options.skillNames.length > 0 ||
      options.force ||
      options.dryRun)
  ) {
    throw new Error(
      "verify accepts --path, optional --standard, --json, and help/version options only.",
    );
  }

  if (
    options.command === "list" &&
    (options.targetPath !== process.cwd() ||
      options.isStandardExplicit ||
      options.includeAllSkills ||
      options.skillNames.length > 0 ||
      options.force ||
      options.dryRun)
  ) {
    throw new Error("list accepts --json and help/version options only.");
  }

  return options;
}

function printHelp(): void {
  console.log(`koneko-roadmap-standard ${CLI_VERSION}

Bootstrap and verify versioned Koneko roadmap standards.

Usage:
  koneko-roadmap-standard [init] [options]
  koneko-roadmap-standard verify [options]
  koneko-roadmap-standard list [--json]

Commands:
  init      Install a standard into a Git repository. This is the default command.
  verify    Check managed repository files against the recorded Git blob checksums.
  list      List bundled standards and portable roadmap skills.
  help      Show this help.
  version   Show the CLI version.

Init options:
  --path <directory>     Target Git repository. Defaults to the current directory.
  --standard <v1|v2>    Standard version to install. Defaults to v2.
  --skills              Install every bundled portable roadmap skill.
  --skill <name>        Install one named skill. Repeat for multiple skills.
  --force               Replace drifted managed files or conflicting unmanaged files.
  --dry-run             Report the planned file operations without writing.
  --json                Emit machine-readable JSON.

Verify options:
  --path <directory>     Target Git repository. Defaults to the current directory.
  --standard <v1|v2>    Verify an unmanaged copy when no lockfile exists.
  --json                Emit machine-readable JSON.

The installer writes .koneko-roadmap-standard.json in the target repository.
Without --force, it refuses to overwrite drifted managed files or conflicting
unmanaged files.`);
}

function printInitializeResult(
  result: Awaited<ReturnType<typeof initializeRepository>>,
): void {
  console.log(
    `${result.dryRun ? "Dry run for" : "Initialized"} roadmap standard ${result.standardVersion} in ${result.targetPath}`,
  );

  for (const action of result.actions) {
    console.log(`  ${action.action.padEnd(6)} ${action.kind.padEnd(8)} ${action.path}`);
  }

  if (result.installedSkills.length === 0) {
    console.log("Skills: none");
  } else {
    console.log(`Skills: ${result.installedSkills.join(", ")}`);
  }

  console.log(`Lockfile: ${result.lockFilePath}`);
}

function printVerifyResult(
  result: Awaited<ReturnType<typeof verifyRepository>>,
): void {
  if (result.isValid) {
    console.log(
      `Verified ${result.checkedFiles} managed file(s) for ${result.standardVersion} in ${result.targetPath}.`,
    );
    return;
  }

  console.error(
    `Verification failed for ${result.standardVersion} in ${result.targetPath}:`,
  );
  for (const issue of result.issues) {
    console.error(
      `  ${issue.reason.padEnd(17)} ${issue.path}\n    expected: ${issue.expected}\n    actual:   ${issue.actual ?? "missing"}`,
    );
  }
}

function printAvailable(
  result: Awaited<ReturnType<typeof listAvailable>>,
): void {
  console.log("Standards:");
  for (const standard of result.standards) {
    console.log(`  ${standard.version}: ${standard.fileCount} file(s)`);
  }

  console.log("\nPortable roadmap skills:");
  for (const skill of result.skills) {
    console.log(`  ${skill.name} -> ${skill.installPath}`);
  }
}

async function main(): Promise<void> {
  const options = parseArguments(process.argv.slice(2));

  if (options.command === "help") {
    printHelp();
    return;
  }

  if (options.command === "version") {
    console.log(CLI_VERSION);
    return;
  }

  if (options.command === "list") {
    const result = await listAvailable();
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printAvailable(result);
    }
    return;
  }

  if (options.command === "verify") {
    const result = await verifyRepository({
      targetPath: options.targetPath,
      standardVersion: options.isStandardExplicit
        ? options.standardVersion
        : undefined,
    });

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printVerifyResult(result);
    }

    if (!result.isValid) {
      process.exitCode = 1;
    }
    return;
  }

  const result = await initializeRepository({
    targetPath: options.targetPath,
    standardVersion: options.standardVersion,
    includeAllSkills: options.includeAllSkills,
    skillNames: options.skillNames,
    force: options.force,
    dryRun: options.dryRun,
  });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printInitializeResult(result);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
