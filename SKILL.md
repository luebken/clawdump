---
name: clawdump
description: Share OpenClaw context files as a secret GitHub Gist using the clawdump CLI. Use when the user wants to share, export, or back up their OpenClaw configuration.
---

# clawdump

## Setup

```bash
npm install -g clawdump
```

## Usage

**Step 1** — Show the user which files are available:

```bash
clawdump list
```

Present the output to the user and ask which files they want to share.

**Step 2** — Share the files the user selected:

```bash
clawdump share <files...> --acknowledge-private-share
```

The `--acknowledge-private-share` flag is required and confirms the user has approved sharing those specific files.

## Example

```bash
clawdump list
# → shows SOUL.md, MEMORY.md, AGENTS.md

clawdump share SOUL.md MEMORY.md --acknowledge-private-share
# → https://gist.github.com/username/abc123
```
