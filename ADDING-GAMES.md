# 🎮 Quick Start Guide - Adding Your HTML Games

## Super Simple 3-Step Process

### Step 1️⃣: Add Your Game Files
1. Copy your HTML game file
2. Paste it into: `public/games/YOUR-GAME-NAME/`
3. Rename it to `index.html`

**Example:**
```
public/games/
  └── my-cool-game/
      └── index.html  ← Your game here!
```

### Step 2️⃣: Register Your Game
Open `public/games/games-manifest.json` and add:

```json
{
  "id": "my-cool-game",
  "title": "🎯 My Cool Game",
  "folder": "my-cool-game",
  "category": "Arcade"
}
```

### Step 3️⃣: Done! 🎉
Your game is now live on the platform!

---

## Complete Example

### For 3 HTML Games:

**1. Create folders:**
```
public/games/
  ├── snake-game/
  │   └── index.html
  ├── pong-game/
  │   └── index.html
  └── tetris-game/
      └── index.html
```

**2. Update `games-manifest.json`:**
```json
{
  "games": [
    {
      "id": "snake-game",
      "title": "🐍 Snake Classic",
      "folder": "snake-game",
      "category": "Arcade",
      "image": "https://picsum.photos/seed/snake/600/400"
    },
    {
      "id": "pong-game",
      "title": "🏓 Pong Master",
      "folder": "pong-game",
      "category": "Arcade",
      "image": "https://picsum.photos/seed/pong/600/400"
    },
    {
      "id": "tetris-game",
      "title": "🧱 Tetris Blocks",
      "folder": "tetris-game",
      "category": "Puzzle",
      "image": "https://picsum.photos/seed/tetris/600/400"
    }
  ]
}
```

**3. That's it!** All three games will appear automatically.

---

## Optional: Add Custom Thumbnails

If you want custom game thumbnails:

1. Add an image to your game folder:
   ```
   public/games/my-game/
     ├── index.html
     └── thumbnail.png  ← Add this
   ```

2. Reference it in the manifest:
   ```json
   {
     "id": "my-game",
     "title": "My Game",
     "folder": "my-game",
     "image": "/games/my-game/thumbnail.png"  ← Use this
   }
   ```

---

## Optional: Add More Details

You can add these optional fields to make games look better:

```json
{
  "id": "my-game",
  "title": "🎮 My Game",
  "folder": "my-game",
  "category": "Action",
  "description": "An awesome game description",
  "rating": 4.8,
  "players": "5.2K",
  "earnings": "1,250 XLM",
  "image": "https://picsum.photos/seed/mygame/600/400"
}
```

---

## Available Categories

- Action
- Adventure
- Arcade
- Battle
- Casino
- Horror
- Puzzle
- Racing
- RPG
- Strategy
- Survival

---

## Tips

✅ **DO:**
- Keep folder names lowercase with hyphens (e.g., `my-game`)
- Name your main file `index.html`
- Include fun emojis in titles
- Test your game in the browser first

❌ **DON'T:**
- Use spaces in folder names
- Use special characters in IDs
- Forget to add the game to `games-manifest.json`

---

## Need a Template?

Copy `public/games/_template/index.html` to start with a working game template!

---

## Testing Your Game

After adding your game, start the dev server:
```bash
npm run dev
```

Your game will be available at:
```
http://localhost:5173/games/your-game-name/
```

And it will appear automatically in the games grid! 🎮
