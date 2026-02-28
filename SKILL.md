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

**Step 1** — List available files and show them to the user:

```bash
clawdump list
```

**Step 2** — Ask the user explicitly:

- Which files they want to share
- Whether they acknowledge that these files are private and will be uploaded to GitHub

Do not proceed until the user has confirmed both. Use their exact words as confirmation.

**Step 3** — Only after the user has explicitly acknowledged, share the files they selected:

```bash
clawdump share <files...> --acknowledge-private-share
```

## Example

```
Agent:  Here are your context files:
        SOUL.md (37 B), MEMORY.md (36 B), AGENTS.md (31 B)

        Which files do you want to share? Please also confirm you understand
        these files will be uploaded as a secret GitHub Gist.

User:   Share SOUL.md and MEMORY.md. I acknowledge they are private.

Agent:  $ clawdump share SOUL.md MEMORY.md --acknowledge-private-share
        → https://gist.github.com/username/abc123
```
