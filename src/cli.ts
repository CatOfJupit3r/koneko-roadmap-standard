#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import {
  STANDARD_VERSIONS,
  initializeRepository,
  listAvailable,
  verifyRepository,
  type AvailableSkill,
  type InitializeOptions,
  type InitializeResult,
  type StandardVersion,
} from "./bootstrap.ts";

const CLI_VERSION = "0.2.0";
type Command = "init" | "verify" | "list" | "help" | "version";
type SkillMode = "all" | "select" | "none";

interface CliOptions {
  command: Command;
  targetPath: string;
  isPathExplicit: boolean;
  standardVersion: StandardVersion;
  isStandardExplicit: boolean;
  includeAllSkills: boolean;
  skillNames: string[];
  force: boolean;
  dryRun: boolean;
  json: boolean;
  interactive: boolean;
}

interface PromptSession {
  ask(prompt: string): Promise<string>;
  close(): void;
}

interface Choice<T extends string> {
  value: T;
  label: string;
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
    isPathExplicit: false,
    standardVersion: "v2",
    isStandardExplicit: false,
    includeAllSkills: false,
    skillNames: [],
    force: false,
    dryRun: false,
    json: false,
    interactive: false,
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
        options.isPathExplicit = true;
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
      case "--interactive":
        options.interactive = true;
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
      options.dryRun ||
      options.interactive)
  ) {
    throw new Error(
      "verify accepts --path, optional --standard, --json, and help/version options only.",
    );
  }

  if (
    options.command === "list" &&
    (options.isPathExplicit ||
      options.isStandardExplicit ||
      options.includeAllSkills ||
      options.skillNames.length > 0 ||
      options.force ||
      options.dryRun ||
      options.interactive)
  ) {
    throw new Error("list accepts --json and help/version options only.");
  }

  if (options.command !== "init" && options.interactive) {
    throw new Error("--interactive is only available for init.");
  }

  if (options.interactive && options.json) {
    throw new Error("--interactive cannot be combined with --json.");
  }

  return options;
}

function printHelp(): void {
  console.log(`koneko-roadmap-standard ${CLI_VERSION}

Interactively bootstrap and verify versioned Koneko roadmap standards.

Run a cloned repository directly with Node:
  node .

Usage:
  node .                         Start the interactive setup wizard.
  node . init                    Start the interactive setup wizard.
  node . verify [options]        Verify an installed standard.
  node . list [--json]           List bundled standards and skills.
  koneko-roadmap-standard init [options]

Commands:
  init      Install or update a standard. Bare init is interactive.
  verify    Check managed repository files against recorded Git blob checksums.
  list      List bundled standards and portable roadmap skills.
  help      Show this help.
  version   Show the CLI version.

Interactive setup:
  Prompts for the target repository, standard version, and roadmap skills.
  Shows a checksum-validated dry-run before asking for write confirmation.
  If managed or destination files conflict, asks before enabling force mode.

Init automation options:
  --path <directory>     Target Git repository. Defaults to the current directory.
  --standard <v1|v2>    Standard version to install. Defaults to v2.
  --skills              Install every bundled portable roadmap skill.
  --skill <name>        Install one named skill. Repeat for multiple skills.
  --force               Replace drifted managed files or conflicting unmanaged files.
  --dry-run             Report planned file operations without writing.
  --json                Emit machine-readable JSON.
  --interactive         Force prompts; supplied init options become wizard defaults.

Verify options:
  --path <directory>     Target Git repository. Defaults to the current directory.
  --standard <v1|v2>    Verify an unmanaged copy when no lockfile exists.
  --json                Emit machine-readable JSON.

Supplying init options without --interactive uses non-interactive automation mode.
The installer writes .koneko-roadmap-standard.json in the target repository.`);
}

function printInitializeResult(result: InitializeResult): void {
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

function createPromptSession(): PromptSession {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: Boolean(process.stdin.isTTY && process.stdout.isTTY),
  });
  const lines = readline[Symbol.asyncIterator]();

  return {
    async ask(prompt: string): Promise<string> {
      process.stdout.write(prompt);
      const next = await lines.next();
      if (next.done) {
        throw new Error("Interactive setup was cancelled before it completed.");
      }
      return next.value.trim();
    },
    close(): void {
      readline.close();
    },
  };
}

async function promptText(
  session: PromptSession,
  message: string,
  defaultValue: string,
): Promise<string> {
  const answer = await session.ask(`${message} [${defaultValue}]: `);
  return answer === "" ? defaultValue : answer;
}

async function promptChoice<T extends string>(
  session: PromptSession,
  message: string,
  choices: Choice<T>[],
  defaultValue: T,
): Promise<T> {
  const defaultIndex = choices.findIndex((choice) => choice.value === defaultValue);
  if (defaultIndex === -1) {
    throw new Error(`Prompt default is not a valid choice: ${defaultValue}`);
  }

  while (true) {
    console.log(`\n${message}`);
    choices.forEach((choice, index) => {
      const recommended = choice.value === defaultValue ? " (default)" : "";
      console.log(`  ${index + 1}. ${choice.label}${recommended}`);
    });

    const answer = await session.ask(`Choose [${defaultIndex + 1}]: `);
    if (answer === "") {
      return defaultValue;
    }

    if (/^\d+$/u.test(answer)) {
      const index = Number.parseInt(answer, 10) - 1;
      const choice = choices[index];
      if (choice !== undefined) {
        return choice.value;
      }
    }

    const normalized = answer.toLowerCase();
    const namedChoice = choices.find(
      (choice) => choice.value.toLowerCase() === normalized,
    );
    if (namedChoice !== undefined) {
      return namedChoice.value;
    }

    console.log(`Enter a number from 1 to ${choices.length} or a choice name.`);
  }
}

async function promptConfirm(
  session: PromptSession,
  message: string,
  defaultValue: boolean,
): Promise<boolean> {
  const hint = defaultValue ? "Y/n" : "y/N";

  while (true) {
    const answer = (await session.ask(`${message} [${hint}]: `)).toLowerCase();
    if (answer === "") {
      return defaultValue;
    }
    if (answer === "y" || answer === "yes") {
      return true;
    }
    if (answer === "n" || answer === "no") {
      return false;
    }
    console.log("Enter yes or no.");
  }
}

async function promptSkillNames(
  session: PromptSession,
  skills: AvailableSkill[],
  defaultNames: string[],
): Promise<string[]> {
  const knownNames = new Set(skills.map((skill) => skill.name));
  for (const name of defaultNames) {
    if (!knownNames.has(name)) {
      throw new Error(`Unknown or unavailable roadmap skill: ${name}.`);
    }
  }

  console.log("\nAvailable roadmap skills:");
  skills.forEach((skill, index) => {
    console.log(`  ${index + 1}. ${skill.name}`);
  });

  const defaultLabel = defaultNames.length === 0 ? "none" : defaultNames.join(", ");

  while (true) {
    const answer = await session.ask(
      `Enter comma-separated numbers or names, or 'all' [${defaultLabel}]: `,
    );
    if (answer === "") {
      return [...defaultNames];
    }
    if (answer.toLowerCase() === "all") {
      return skills.map((skill) => skill.name);
    }

    const selected = new Set<string>();
    const invalid: string[] = [];

    for (const token of answer.split(",").map((value) => value.trim()).filter(Boolean)) {
      if (/^\d+$/u.test(token)) {
        const skill = skills[Number.parseInt(token, 10) - 1];
        if (skill === undefined) {
          invalid.push(token);
        } else {
          selected.add(skill.name);
        }
        continue;
      }

      const skill = skills.find(
        (candidate) => candidate.name.toLowerCase() === token.toLowerCase(),
      );
      if (skill === undefined) {
        invalid.push(token);
      } else {
        selected.add(skill.name);
      }
    }

    if (invalid.length === 0) {
      return skills
        .map((skill) => skill.name)
        .filter((name) => selected.has(name));
    }

    console.log(`Unknown skill selection: ${invalid.join(", ")}`);
  }
}

function isForceableConflict(error: unknown): boolean {
  return error instanceof Error && error.message.includes("--force");
}

async function previewInteractiveInstallation(
  session: PromptSession,
  options: Omit<InitializeOptions, "dryRun">,
): Promise<{ preview: InitializeResult; force: boolean } | null> {
  let force = options.force;

  while (true) {
    try {
      const preview = await initializeRepository({
        ...options,
        force,
        dryRun: true,
      });
      return { preview, force };
    } catch (error) {
      if (force || !isForceableConflict(error)) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      console.error(`\n${message}\n`);
      const confirmed = await promptConfirm(
        session,
        "Replace the conflicting managed or destination files with the bundled copies?",
        false,
      );
      if (!confirmed) {
        console.log("Cancelled. No files were changed.");
        return null;
      }
      force = true;
    }
  }
}

async function runInteractiveInitialize(options: CliOptions): Promise<void> {
  const session = createPromptSession();

  try {
    console.log(`Koneko Roadmap Standard ${CLI_VERSION}`);
    console.log("Interactive setup will preview every managed file before writing.\n");

    const targetPath = await promptText(
      session,
      "Target Git repository",
      options.targetPath,
    );
    const standardVersion = await promptChoice<StandardVersion>(
      session,
      "Which roadmap standard should be installed?",
      [
        { value: "v2", label: "v2 — modular standard (recommended)" },
        { value: "v1", label: "v1 — legacy single-file standard" },
      ],
      options.standardVersion,
    );

    const available = await listAvailable();
    const defaultSkillMode: SkillMode = options.includeAllSkills
      ? "all"
      : options.skillNames.length > 0
        ? "select"
        : "all";
    const skillMode = await promptChoice<SkillMode>(
      session,
      "Which portable roadmap skills should be added?",
      [
        { value: "all", label: "Install all roadmap skills (recommended)" },
        { value: "select", label: "Choose individual roadmap skills" },
        { value: "none", label: "Do not add new roadmap skills" },
      ],
      defaultSkillMode,
    );

    const includeAllSkills = skillMode === "all";
    const skillNames =
      skillMode === "select"
        ? await promptSkillNames(session, available.skills, options.skillNames)
        : [];

    const selectedOptions: Omit<InitializeOptions, "dryRun"> = {
      targetPath,
      standardVersion,
      includeAllSkills,
      skillNames,
      force: options.force,
    };
    const previewResult = await previewInteractiveInstallation(
      session,
      selectedOptions,
    );
    if (previewResult === null) {
      return;
    }

    console.log("");
    printInitializeResult(previewResult.preview);

    if (options.dryRun) {
      console.log("Dry run complete. No files were changed.");
      return;
    }

    const confirmed = await promptConfirm(
      session,
      "\nApply these changes?",
      false,
    );
    if (!confirmed) {
      console.log("Cancelled. No files were changed.");
      return;
    }

    const result = await initializeRepository({
      ...selectedOptions,
      force: previewResult.force,
      dryRun: false,
    });
    console.log("");
    printInitializeResult(result);

    const verification = await verifyRepository({ targetPath: result.targetPath });
    printVerifyResult(verification);
    if (!verification.isValid) {
      process.exitCode = 1;
    }
  } finally {
    session.close();
  }
}

function isBareInteractiveInvocation(argv: string[]): boolean {
  return argv.length === 0 || (argv.length === 1 && argv[0] === "init");
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const options = parseArguments(argv);

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

  if (options.interactive || isBareInteractiveInvocation(argv)) {
    await runInteractiveInitialize(options);
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
