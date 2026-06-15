# Verifies handoff package completeness against route inventory.
$ErrorActionPreference = "Stop"
$Handoff = Join-Path (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)) "Element-P2P-Handoff"

$requiredPages = @(
    "src\app\pages\auth\Login.tsx",
    "src\app\pages\auth\SignUp.tsx",
    "src\app\pages\auth\ForgotPassword.tsx",
    "src\app\pages\ClientPresentation.tsx",
    "src\app\pages\UploadSplit.tsx",
    "src\app\pages\Dashboard.tsx",
    "src\app\pages\PurchaseRequests.tsx",
    "src\app\pages\MainPurchaseRequest.tsx",
    "src\app\pages\MainPurchaseRequestV2.tsx",
    "src\app\pages\MainPurchaseRequestV1.tsx"
)

$requiredComponents = @(
    "src\app\components\auth\RequireAuth.tsx",
    "src\app\components\auth\GuestRoute.tsx",
    "src\app\components\auth\RedirectHome.tsx",
    "src\app\components\Sidebar.tsx",
    "src\app\components\TopHeader.tsx",
    "src\app\components\PurchaseRequestModal.tsx",
    "src\app\components\pr-workflow\PRWorkflowHeader.tsx",
    "src\app\components\page-comments\PageCommentSystem.tsx"
)

$requiredAssets = @(
    "src\imports\Eluv8P2P-final-logo.svg",
    "src\imports\Logo-for-Figma.svg",
    "src\imports\Logo-for-Figma-1.svg"
)

$requiredConfig = @(
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "index.html",
    "tsconfig.json",
    ".env.example",
    "HANDOFF.md",
    "MANIFEST.md"
)

$all = $requiredPages + $requiredComponents + $requiredAssets + $requiredConfig
$missing = @()
foreach ($f in $all) {
    if (-not (Test-Path (Join-Path $Handoff $f))) { $missing += $f }
}

if ($missing.Count -gt 0) {
    Write-Error "VERIFICATION FAILED - Missing: $($missing -join ', ')"
}

$uiCount = (Get-ChildItem (Join-Path $Handoff "src\app\components\ui") -Filter "*.tsx").Count
Write-Host "VERIFICATION PASSED"
Write-Host "  Pages: $($requiredPages.Count)/$($requiredPages.Count)"
Write-Host "  UI components: $uiCount"
Write-Host "  Total files: $((Get-ChildItem $Handoff -Recurse -File).Count)"
