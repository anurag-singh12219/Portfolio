<#
PowerShell helper: safely stage & commit repository changes while ensuring
personal/private files (like resume PDF) remain unstaged.

Usage:
  .\commit-safe.ps1 -Message "chore: update site"
#>

param(
  [string]$Message = "chore: update site"
)

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git is not available in PATH. Install Git or run from a shell with Git.";
  exit 1;
}

Write-Host "Git status (uncommitted changes):";
git status --porcelain

Write-Host "\nStaging all changes...";
git add -A

# Ensure personal files stay unstaged even if present
if (Test-Path "public/Anurag_Singh_Resume.pdf") {
  try {
    git restore --staged public/Anurag_Singh_Resume.pdf 2>$null
  } catch {
    # ignore
  }
}

Write-Host "\nStaged files (preview):";
git status --porcelain

Write-Host "\nCommitting with message:`n  $Message\n";
git commit -m $Message

if ($LASTEXITCODE -eq 0) {
  Write-Host "Commit created successfully.";
} else {
  Write-Host "No changes were committed (nothing staged or commit aborted).";
}
