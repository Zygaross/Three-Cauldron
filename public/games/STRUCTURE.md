# 📁 Games Folder Structure

## Overview

```
public/games/
├── README.md                    # Documentation
├── games-manifest.json          # Game registry (EDIT THIS!)
├── _template/                   # Template for new games
│   └── index.html              
├── example-game/                # Example game (can delete)
│   └── index.html
├── your-game-1/                 # ← ADD YOUR GAMES HERE
│   ├── index.html              # Your game file
│   ├── thumbnail.png           # (optional) Custom image
│   ├── style.css               # (optional) Styles
│   └── assets/                 # (optional) Images, sounds, etc.
├── your-game-2/
│   └── index.html
└── your-game-3/
    └── index.html
```

## The Only File You Need to Edit

**`public/games/games-manifest.json`** - This is where you register all your games!

```json
{
  "games": [
    {
      "id": "my-first-game",
      "title": "🎮 My First Game",
      "folder": "my-first-game",
      "category": "Arcade"
    },
    {
      "id": "my-second-game",
      "title": "🎯 My Second Game",
      "folder": "my-second-game",
      "category": "Action"
    }
  ]
}
```

## How Games Are Loaded

1. **Platform starts** → Reads `games-manifest.json`
2. **For each game** → Constructs URL: `/games/{folder}/index.html`
3. **User clicks "Play"** → Opens game in new tab
4. **Your game loads** → Runs in isolated environment

## Integration Points

Your HTML games are completely standalone and don't need to integrate with the platform. They will:

- ✅ Load in a new browser tab
- ✅ Run independently
- ✅ Have their own styling
- ✅ Work exactly as they do standalone

The platform just provides:
- 🎨 A beautiful gallery to showcase your games
- 👥 User profiles and wallets (for future integration)
- 📊 Stats and ratings display
- 🔍 Search and filtering

## Example: Adding 3 Games

### Step 1: Create folders and add your HTML files

```
public/games/
├── snake/
│   └── index.html          ← Your snake.html goes here (rename to index.html)
├── pong/
│   └── index.html          ← Your pong.html goes here (rename to index.html)
└── tetris/
    └── index.html          ← Your tetris.html goes here (rename to index.html)
```

### Step 2: Update games-manifest.json

```json
{
  "games": [
    {
      "id": "snake",
      "title": "🐍 Snake Classic",
      "folder": "snake",
      "category": "Arcade",
      "image": "https://picsum.photos/seed/snake/600/400"
    },
    {
      "id": "pong",
      "title": "🏓 Pong",
      "folder": "pong",
      "category": "Arcade",
      "image": "https://picsum.photos/seed/pong/600/400"
    },
    {
      "id": "tetris",
      "title": "🧱 Tetris",
      "folder": "tetris",
      "category": "Puzzle",
      "image": "https://picsum.photos/seed/tetris/600/400"
    }
  ]
}
```

### Step 3: That's it! 🎉

Run `npm run dev` and your games will appear in the platform.

## Pro Tips

### Use Custom Thumbnails
Add a screenshot of your game:
```
public/games/snake/
├── index.html
└── thumbnail.png           ← Add this
```

Then reference it:
```json
{
  "id": "snake",
  "image": "/games/snake/thumbnail.png"  ← Use this instead
}
```

### Keep Assets Organized
```
public/games/my-game/
├── index.html
├── thumbnail.png
├── css/
│   └── style.css
├── js/
│   └── game.js
└── assets/
    ├── sprites/
    ├── sounds/
    └── music/
```

Reference them in your HTML:
```html
<link rel="stylesheet" href="css/style.css">
<script src="js/game.js"></script>
<img src="assets/sprites/player.png">
```

### Test Individually
Before adding to the platform, test your game directly:
```
http://localhost:5173/games/your-game/index.html
```

## Quick Reference

| What | Where | Required? |
|------|-------|-----------|
| Game HTML | `public/games/{folder}/index.html` | ✅ Yes |
| Game registration | `public/games/games-manifest.json` | ✅ Yes |
| Thumbnail | `public/games/{folder}/thumbnail.png` | ❌ Optional |
| Other assets | `public/games/{folder}/...` | ❌ Optional |

## Need Help?

- 📖 Full guide: [ADDING-GAMES.md](../ADDING-GAMES.md)
- 🎨 Use template: Copy `_template/index.html`
- 🤖 Use script: Run `node add-game.js` or `.\add-game.ps1`
