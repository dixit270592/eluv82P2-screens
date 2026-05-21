# Moves this repo to org "eluv82p2-screens", renames it to the org Pages site repo,
# and enables GitHub Actions Pages. Result URL:
#   https://eluv82p2-screens.github.io/presentation
#
# Prerequisite: create a free GitHub org named "eluv82p2-screens" at
# https://github.com/account/organizations/new

param(
  [string]$Org = 'eluv82p2-screens',
  [string]$SourceOwner = 'dixit270592',
  [string]$SourceRepo = 'eluv82P2-screens'
)

function Get-GitHubToken {
  $input = "protocol=https`nhost=github.com`n`n"
  $filled = $input | git credential fill 2>$null
  foreach ($line in $filled) {
    if ($line -match '^password=(.+)$') { return $matches[1] }
  }
  throw 'GitHub token not found. Run: gh auth login'
}

function Invoke-GitHubApi {
  param(
    [string]$Method = 'GET',
    [string]$Uri,
    [string]$Body
  )
  $headers = @{
    Authorization = "Bearer $(Get-GitHubToken)"
    Accept = 'application/vnd.github+json'
    'X-GitHub-Api-Version' = '2022-11-28'
  }
  $params = @{ Uri = $Uri; Method = $Method; Headers = $headers; TimeoutSec = 60 }
  if ($Body) {
    $params.Body = $Body
    $params.ContentType = 'application/json'
  }
  return Invoke-RestMethod @params
}

Write-Host "Checking for organization '$Org'..."
try {
  $null = Invoke-GitHubApi -Uri "https://api.github.com/orgs/$Org"
} catch {
  Write-Host ""
  Write-Host "Organization '$Org' was not found."
  Write-Host "Create it first (free): https://github.com/account/organizations/new"
  Write-Host "Use organization name: $Org"
  exit 1
}

$targetRepo = "$Org.github.io"
Write-Host "Transferring $SourceOwner/$SourceRepo to $Org..."
try {
  Invoke-GitHubApi -Method POST -Uri "https://api.github.com/repos/$SourceOwner/$SourceRepo/transfer" -Body (@{
    new_owner = $Org
  } | ConvertTo-Json)
} catch {
  if ($_.ErrorDetails.Message -notmatch 'already exists|same') { throw }
}

Write-Host "Renaming repository to $targetRepo..."
Invoke-GitHubApi -Method PATCH -Uri "https://api.github.com/repos/$Org/$SourceRepo" -Body (@{
  name = $targetRepo
} | ConvertTo-Json)

Write-Host "Enabling GitHub Pages (GitHub Actions)..."
try {
  Invoke-GitHubApi -Method POST -Uri "https://api.github.com/repos/$Org/$targetRepo/pages" -Body (@{
    build_type = 'workflow'
  } | ConvertTo-Json)
} catch {
  Invoke-GitHubApi -Method PUT -Uri "https://api.github.com/repos/$Org/$targetRepo/pages" -Body (@{
    build_type = 'workflow'
  } | ConvertTo-Json)
}

Write-Host "Triggering deploy workflow..."
$wf = Invoke-GitHubApi -Uri "https://api.github.com/repos/$Org/$targetRepo/actions/workflows/deploy-github-pages.yml"
Invoke-GitHubApi -Method POST -Uri "https://api.github.com/repos/$Org/$targetRepo/actions/workflows/$($wf.id)/dispatches" -Body (@{
  ref = 'main'
} | ConvertTo-Json)

Write-Host ""
Write-Host "Done. After the workflow finishes, your client link will be:"
Write-Host "  https://$Org.github.io/presentation"
