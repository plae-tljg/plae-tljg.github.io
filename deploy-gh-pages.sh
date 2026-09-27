#!/usr/bin/env bash
#
# Local deploy — the fallback for when you want to publish without pushing
# to main (GitHub Actions does the same thing automatically on every push).
#
#   ./deploy-gh-pages.sh
#
set -euo pipefail

cd "$(dirname "$0")"

REMOTE_URL="$(git remote get-url origin)"
BRANCH="gh-pages"

echo "▸ Checking synced content"
npm run content:verify

echo "▸ Building"
npm run build

echo "▸ Preparing publish directory"
touch dist/.nojekyll

cd dist
git init -q -b "$BRANCH"
git add -A
git -c user.name="$(git -C .. config user.name || echo deploy)" \
    -c user.email="$(git -C .. config user.email || echo deploy@local)" \
    commit -q -m "deploy $(date '+%Y-%m-%d %H:%M:%S')"

echo "▸ Pushing to $REMOTE_URL ($BRANCH)"
git push -f "$REMOTE_URL" "$BRANCH"

echo "✔ Done. GitHub Pages will pick up the new build in a minute or two."
