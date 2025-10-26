# Quick helper script to add a new game to the manifest
# Usage: .\add-game.ps1

Write-Host "`n🎮 Add New Game to Stellar Gaming Platform`n" -ForegroundColor Cyan
Write-Host "Answer the questions below (press Enter for defaults):`n"

$manifestPath = "public\games\games-manifest.json"

# Get game details
$gameId = Read-Host "Game ID (lowercase-with-hyphens)"
if ([string]::IsNullOrWhiteSpace($gameId)) {
    Write-Host "❌ Game ID is required!" -ForegroundColor Red
    exit
}

$title = Read-Host "Game Title [$gameId]"
if ([string]::IsNullOrWhiteSpace($title)) { $title = $gameId }

$folder = Read-Host "Folder name [$gameId]"
if ([string]::IsNullOrWhiteSpace($folder)) { $folder = $gameId }

$category = Read-Host "Category (Action/Arcade/RPG/etc) [Arcade]"
if ([string]::IsNullOrWhiteSpace($category)) { $category = "Arcade" }

$description = Read-Host "Description (optional)"

$rating = Read-Host "Rating (1-5) [4.5]"
if ([string]::IsNullOrWhiteSpace($rating)) { $rating = "4.5" }

$players = Read-Host "Players count (e.g., 1.2K) [New]"
if ([string]::IsNullOrWhiteSpace($players)) { $players = "New" }

$earnings = Read-Host "Earnings (e.g., 500 XLM) [0 XLM]"
if ([string]::IsNullOrWhiteSpace($earnings)) { $earnings = "0 XLM" }

$useCustomImage = Read-Host "Use custom image? (y/n) [n]"
if ($useCustomImage -eq "y") {
    $image = Read-Host "Image path (e.g., /games/$folder/thumbnail.png)"
} else {
    $image = "https://picsum.photos/seed/$gameId/600/400"
}

# Create game object
$newGame = @{
    id = $gameId
    title = $title
    folder = $folder
    image = $image
    category = $category
    rating = [double]$rating
    players = $players
    earnings = $earnings
}

if (![string]::IsNullOrWhiteSpace($description)) {
    $newGame.description = $description
}

# Read existing manifest
$manifest = @{ games = @() }
if (Test-Path $manifestPath) {
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    # Convert to hashtable to allow modification
    $manifest = @{ games = @($manifest.games) }
}

# Add new game
$manifest.games += $newGame

# Write back
$manifest | ConvertTo-Json -Depth 10 | Set-Content $manifestPath

Write-Host "`n✅ Game added successfully!`n" -ForegroundColor Green
Write-Host "📋 Game details:" -ForegroundColor Yellow
$newGame | ConvertTo-Json -Depth 10 | Write-Host
Write-Host "`n📁 Now add your HTML file to: public\games\$folder\index.html" -ForegroundColor Cyan
Write-Host "`n🚀 Run 'npm run dev' to see your game!`n" -ForegroundColor Green
