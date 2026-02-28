---
name: clawdump
description: "Share your OpenClaw context files (SOUL.md, MEMORY.md, AGENTS.md, IDENTITY.md, USER.md, TOOLS.md, HEARTBEAT.md, BOOTSTRAP.md) as a secret GitHub Gist. Use when the user types /clawdump or asks to share, export, or back up their OpenClaw configuration or context files."
user-invocable: true
metadata:
  {
    "openclaw":
      {
        "emoji": "📤",
        "requires": { "bins": ["gh"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "gh",
              "bins": ["gh"],
              "label": "Install GitHub CLI (brew)",
            },
          ],
      },
  }
---

# clawdump — Share OpenClaw Context Files

Share your OpenClaw context files as a **secret GitHub Gist** so others can view and learn from your setup.

## Phase 1 — Resolve Workspace Directory

Determine the OpenClaw workspace directory from environment:

```bash
# Check OPENCLAW_STATE_DIR override
STATE_DIR="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"

# Check OPENCLAW_PROFILE for non-default profiles
PROFILE="${OPENCLAW_PROFILE:-}"
if [ -n "$PROFILE" ] && [ "${PROFILE,,}" != "default" ]; then
  WORKSPACE_DIR="$STATE_DIR/workspace-$PROFILE"
else
  WORKSPACE_DIR="$STATE_DIR/workspace"
fi

echo "Workspace: $WORKSPACE_DIR"
```

## Phase 2 — Discover Context Files

Check which of the standard OpenClaw context files exist in the workspace:

```bash
for FILE in AGENTS.md SOUL.md TOOLS.md IDENTITY.md USER.md HEARTBEAT.md BOOTSTRAP.md MEMORY.md memory.md; do
  if [ -f "$WORKSPACE_DIR/$FILE" ]; then
    SIZE=$(wc -c < "$WORKSPACE_DIR/$FILE" | tr -d ' ')
    echo "✓  $FILE  (${SIZE} bytes)"
  else
    echo "✗  $FILE  (missing)"
  fi
done
```

## Phase 3 — Present File List and Confirm Selection

Show the user the list of **existing** files. Present them as a numbered checklist, for example:

```
Found these context files in ~/.openclaw/workspace:

  [1] ✓  SOUL.md       (1.2 KB)
  [2] ✓  MEMORY.md     (3.4 KB)
  [3] ✓  AGENTS.md     (512 B)
  [4] ✓  IDENTITY.md   (256 B)
  [5] ✓  USER.md       (780 B)
  [6] ✗  TOOLS.md      (missing — skip)
  [7] ✗  HEARTBEAT.md  (missing — skip)
  [8] ✗  BOOTSTRAP.md  (missing — skip)

All present files are selected by default.
Type numbers to deselect (e.g. "3 5"), or press Enter to share all.
```

Wait for the user's response. Apply their deselections. If the user types "cancel" or "quit", abort and report "Cancelled — nothing was shared."

Confirm the final selection:

```
Will share: SOUL.md, MEMORY.md, IDENTITY.md, USER.md
Proceed? (yes/no)
```

If the user declines, abort.

## Phase 4 — Verify GitHub CLI Auth

Check that `gh` is authenticated before uploading:

```bash
gh auth status
```

If the command fails or returns an auth error, stop and tell the user:

> "`gh` is not authenticated. Run `gh auth login` to connect your GitHub account, then try `/clawdump` again."

## Phase 5 — Upload to GitHub Gist

Create a **secret** gist containing the selected files:

```bash
gh gist create --public=false \
  "$WORKSPACE_DIR/SOUL.md" \
  "$WORKSPACE_DIR/MEMORY.md"
  # (include only the files the user selected)
```

`gh gist create` returns a URL like `https://gist.github.com/username/GIST_ID`.

Extract the gist ID from the URL (the last path segment).

## Phase 6 — Report Result

Report the gist URL clearly:

```
✓ Shared successfully!

  Gist (secret):  https://gist.github.com/username/abc123def456
  Files shared:   SOUL.md, MEMORY.md, IDENTITY.md, USER.md

Only people with the link can view it.
```

## Notes

- All gists are **secret** — they are not listed publicly, only accessible via the direct URL.
- Files are uploaded with their original names and content unchanged.
- To reshare after edits, run `/clawdump` again — it creates a new gist each time.
- Sensitive data: review each file before sharing. MEMORY.md and USER.md may contain personal information.
