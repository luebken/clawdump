# clawdump

An [OpenClaw](https://openclaw.ai) skill that lets users share their context files as a secret GitHub Gist — so others can view and learn from real-world OpenClaw setups.

## What it does

When you type `/clawdump` in OpenClaw, the agent:

1. Finds your OpenClaw workspace (`~/.openclaw/workspace/`)
2. Lists all context files that exist (`SOUL.md`, `MEMORY.md`, `AGENTS.md`, etc.)
3. Asks you to confirm which files to share
4. Uploads the selected files to a **secret** GitHub Gist
5. Returns the Gist URL

## Context files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Agent configuration |
| `SOUL.md` | Personality / soul definition |
| `TOOLS.md` | Tool configuration |
| `IDENTITY.md` | Identity configuration |
| `USER.md` | User context |
| `HEARTBEAT.md` | Autonomous behavior / heartbeat |
| `BOOTSTRAP.md` | Bootstrap instructions |
| `MEMORY.md` | Memory |

## Requirements

- [OpenClaw](https://openclaw.ai) with skills support
- [GitHub CLI](https://cli.github.com) (`gh`) installed and authenticated

### Setting up gh

Install the GitHub CLI from [cli.github.com](https://cli.github.com), then authenticate with the `gist` scope:

```bash
gh auth login --hostname github.com --git-protocol https --scopes "gist,repo"
```

Verify it works:

```bash
gh auth status
```

## Install

```bash
git clone https://github.com/luebken/clawdump ~/.openclaw/skills/clawdump

# or via npm
npm install -g clawdump
```

## Usage

In an OpenClaw session:

```
/clawdump
```

## Privacy

All gists are created as **secret** — not listed publicly, only accessible via the direct URL. Review file contents before sharing, especially `MEMORY.md` and `USER.md` which may contain personal information.

## Roadmap

- ✅ **Milestone 1**: Skill + GitHub Gist upload, installed via GitHub URL
- ✅ **Milestone 2**: Web viewer at `luebken.github.io/clawdump` — renders shared gists beautifully
