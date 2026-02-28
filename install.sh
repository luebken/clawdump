#!/usr/bin/env bash
# clawdump install script
# Usage: curl -fsSL https://raw.githubusercontent.com/luebken/clawdump/main/install.sh | bash

set -euo pipefail

REPO="https://github.com/luebken/clawdump"
SKILL_NAME="clawdump"

# OpenClaw managed skills dir (same place clawhub installs to)
STATE_DIR="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
INSTALL_DIR="$STATE_DIR/skills/$SKILL_NAME"

echo "Installing $SKILL_NAME skill..."
echo "→ $INSTALL_DIR"

if [ -d "$INSTALL_DIR" ]; then
  echo "Already installed. Updating..."
  git -C "$INSTALL_DIR" pull --ff-only
else
  git clone --depth=1 "$REPO" "$INSTALL_DIR"
fi

echo ""
echo "✓ Done! Start a new OpenClaw session to use /clawdump."
