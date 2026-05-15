param(
  [Parameter(Mandatory = $true)]
  [string]$Message
)

$ErrorActionPreference = "Stop"

# The local machine previously had this unsafe variable set. Do not inherit it
# into dependency installation or build commands.
$env:NODE_TLS_REJECT_UNAUTHORIZED = ""

pnpm typecheck
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml

git status --short

if (-not (git status --porcelain)) {
  Write-Host "No changes to commit."
  exit 0
}

git add .
git commit -m $Message
git push
