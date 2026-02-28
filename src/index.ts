#!/usr/bin/env node
import {
  cancel,
  intro,
  isCancel,
  multiselect,
  note,
  outro,
  spinner,
} from "@clack/prompts";
import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const CONTEXT_FILES = [
  { name: "SOUL.md", description: "Personality / soul definition" },
  { name: "MEMORY.md", description: "Memory" },
  { name: "AGENTS.md", description: "Agent configuration" },
  { name: "IDENTITY.md", description: "Identity configuration" },
  { name: "USER.md", description: "User context" },
  { name: "TOOLS.md", description: "Tool configuration" },
  { name: "HEARTBEAT.md", description: "Heartbeat / autonomous behavior" },
  { name: "BOOTSTRAP.md", description: "Bootstrap instructions" },
  { name: "memory.md", description: "Memory (alt)" },
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

async function main() {
  intro("clawdump — share your OpenClaw context");

  const workspaceDir = resolveWorkspaceDir();

  const existingFiles = CONTEXT_FILES.flatMap((f) => {
    const filePath = path.join(workspaceDir, f.name);
    if (!existsSync(filePath)) return [];
    const size = statSync(filePath).size;
    return [{ ...f, filePath, size }];
  });

  if (existingFiles.length === 0) {
    note(`No context files found in:\n  ${workspaceDir}`, "Nothing to share");
    outro(
      "Set OPENCLAW_STATE_DIR or OPENCLAW_PROFILE if your workspace is elsewhere."
    );
    process.exit(0);
  }

  const selected = await multiselect({
    message: `Select files to share from ${workspaceDir}`,
    options: existingFiles.map((f) => ({
      value: f.filePath,
      label: f.name,
      hint: `${f.description} · ${formatBytes(f.size)}`,
    })),
    required: true,
  });

  if (isCancel(selected)) {
    cancel("Cancelled — nothing was shared.");
    process.exit(0);
  }

  const ghAuth = spawnSync("gh", ["auth", "status"], { encoding: "utf-8" });
  if (ghAuth.error || ghAuth.status !== 0) {
    cancel(
      ghAuth.error
        ? "`gh` not found. Install from https://cli.github.com"
        : "`gh` is not authenticated. Run `gh auth login` first."
    );
    process.exit(1);
  }

  const s = spinner();
  s.start("Uploading to GitHub Gist...");

  const result = spawnSync(
    "gh",
    ["gist", "create", "--public=false", ...(selected as string[])],
    { encoding: "utf-8" }
  );

  if (result.status !== 0) {
    s.stop("Upload failed");
    note(result.stderr?.trim() || "Unknown error", "Error");
    process.exit(1);
  }

  const gistUrl = result.stdout.trim();
  s.stop("Uploaded!");

  note(gistUrl, "Shared — only people with the link can view it");
  outro("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
