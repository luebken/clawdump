#!/usr/bin/env node
import { existsSync, readdirSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const CONTEXT_FILES = [
  { name: "SOUL.md", description: "Personality / soul definition" },
  { name: "MEMORY.md", description: "Memory" },
  { name: "AGENTS.md", description: "Agent configuration" },
  { name: "IDENTITY.md", description: "Identity configuration" },
  { name: "USER.md", description: "User context" },
  { name: "TOOLS.md", description: "Tool configuration" },
  { name: "HEARTBEAT.md", description: "Heartbeat / autonomous behavior" },
  { name: "BOOTSTRAP.md", description: "Bootstrap instructions" },
];

function resolveWorkspaceDir(): string {
  const stateDir =
    process.env.OPENCLAW_STATE_DIR?.trim() ||
    path.join(os.homedir(), ".openclaw");
  const profile = process.env.OPENCLAW_PROFILE?.trim();
  if (profile && profile.toLowerCase() !== "default") {
    return path.join(stateDir, `workspace-${profile}`);
  }
  return path.join(stateDir, "workspace");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function findExistingFiles(workspaceDir: string) {
  const dir = existsSync(workspaceDir) ? readdirSync(workspaceDir) : [];
  return CONTEXT_FILES.flatMap((f) => {
    if (!dir.includes(f.name)) return [];
    const filePath = path.join(workspaceDir, f.name);
    const size = statSync(filePath).size;
    return [{ ...f, filePath, size }];
  });
}

function cmdList() {
  const workspaceDir = resolveWorkspaceDir();
  const files = findExistingFiles(workspaceDir);

  if (files.length === 0) {
    console.log(`No context files found in: ${workspaceDir}`);
    console.log("Set OPENCLAW_STATE_DIR or OPENCLAW_PROFILE if your workspace is elsewhere.");
    process.exit(0);
  }

  console.log(`Context files in ${workspaceDir}:\n`);
  for (const f of files) {
    console.log(`  ${f.name.padEnd(16)} ${formatBytes(f.size).padStart(8)}    ${f.description}`);
  }
  console.log(`\nTo share, run:\n  clawdump share <files...> --acknowledge-private-share`);
}

function cmdShare(args: string[]) {
  const acknowledgeFlag = "--acknowledge-private-share";
  if (!args.includes(acknowledgeFlag)) {
    console.error(`Error: --acknowledge-private-share flag is required.`);
    console.error(`This confirms you understand the selected files will be uploaded as a secret GitHub Gist.`);
    console.error(`\n  clawdump share <files...> ${acknowledgeFlag}`);
    process.exit(1);
  }

  const fileNames = args.filter((a) => !a.startsWith("--"));
  if (fileNames.length === 0) {
    console.error("Error: no files specified.");
    console.error("  clawdump share SOUL.md MEMORY.md --acknowledge-private-share");
    process.exit(1);
  }

  const workspaceDir = resolveWorkspaceDir();
  const dir = existsSync(workspaceDir) ? readdirSync(workspaceDir) : [];

  const filePaths: string[] = [];
  for (const name of fileNames) {
    if (!dir.includes(name)) {
      console.error(`Error: file not found in workspace: ${name}`);
      process.exit(1);
    }
    filePaths.push(path.join(workspaceDir, name));
  }

  const ghAuth = spawnSync("gh", ["auth", "status"], { encoding: "utf-8" });
  if (ghAuth.error || ghAuth.status !== 0) {
    console.error(
      ghAuth.error
        ? "Error: `gh` not found. Install from https://cli.github.com"
        : "Error: `gh` is not authenticated. Run: gh auth login --hostname github.com --git-protocol https --scopes \"gist,repo\""
    );
    process.exit(1);
  }

  console.log(`Uploading ${fileNames.join(", ")} as a secret GitHub Gist...`);

  const result = spawnSync(
    "gh",
    ["gist", "create", "--public=false", ...filePaths],
    { encoding: "utf-8" }
  );

  if (result.status !== 0) {
    console.error("Error: upload failed.");
    console.error(result.stderr?.trim());
    process.exit(1);
  }

  console.log(`\nShared: ${result.stdout.trim()}`);
  console.log("Only people with the link can view it.");
}

function printHelp() {
  console.log(`clawdump — share your OpenClaw context files as a secret GitHub Gist

Usage:
  clawdump list                                          List available context files
  clawdump share <files...> --acknowledge-private-share  Upload selected files to a secret Gist

Examples:
  clawdump list
  clawdump share SOUL.md MEMORY.md --acknowledge-private-share

Environment:
  OPENCLAW_STATE_DIR   Override the OpenClaw state directory (default: ~/.openclaw)
  OPENCLAW_PROFILE     Use a named profile workspace (default: workspace/)
`);
}

const [, , cmd, ...rest] = process.argv;

switch (cmd) {
  case "list":
    cmdList();
    break;
  case "share":
    cmdShare(rest);
    break;
  default:
    printHelp();
}
