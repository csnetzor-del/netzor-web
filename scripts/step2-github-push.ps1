# Step 2 - Push NETZOR to GitHub (run after creating empty repo on github.com)
# Usage: .\scripts\step2-github-push.ps1 -RepoUrl "https://github.com/YOUR_USERNAME/netzor-web.git"

param(
    [Parameter(Mandatory = $true)]
    [string]$RepoUrl
)

$RepoUrl = $RepoUrl.Trim()
Set-Location (Join-Path $PSScriptRoot "..")

$remotes = git remote 2>$null
if ($remotes -match "origin") {
    git remote remove origin
}

git remote add origin $RepoUrl
if ($LASTEXITCODE -ne 0) {
    git remote set-url origin $RepoUrl
}

Write-Host "Pushing to $RepoUrl ..."
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Done! Repo pushed successfully."
    Write-Host "Next: Step 3 - Deploy on Render (see DEPLOYMENT.md)"
} else {
    Write-Host ""
    Write-Host "Push failed. Run: gh auth login"
    Write-Host "Then try again, or use a Personal Access Token when Git asks for password."
    exit 1
}
