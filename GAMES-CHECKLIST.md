# ✅ Adding Your 3 HTML Games - Checklist

Follow this checklist to add your games in under 5 minutes!

## Before You Start

- [ ] I have 3 HTML game files ready
- [ ] I have the project running (`npm run dev`)

## For Each Game

### Game 1: _________________

- [ ] Created folder: `public/games/game-1/`
- [ ] Copied HTML file to: `public/games/game-1/index.html`
- [ ] Added entry to `games-manifest.json`
- [ ] Tested at: `http://localhost:5173/games/game-1/`

### Game 2: _________________

- [ ] Created folder: `public/games/game-2/`
- [ ] Copied HTML file to: `public/games/game-2/index.html`
- [ ] Added entry to `games-manifest.json`
- [ ] Tested at: `http://localhost:5173/games/game-2/`

### Game 3: _________________

- [ ] Created folder: `public/games/game-3/`
- [ ] Copied HTML file to: `public/games/game-3/index.html`
- [ ] Added entry to `games-manifest.json`
- [ ] Tested at: `http://localhost:5173/games/game-3/`

## Final Steps

- [ ] All games appear in the platform
- [ ] All games are playable when clicked
- [ ] Thumbnails look good (or using placeholder images)
- [ ] Categories are correct

## Your games-manifest.json Should Look Like:

```json
{
  "games": [
    {
      "id": "game-1",
      "title": "Game 1 Title",
      "folder": "game-1",
      "category": "Arcade",
      "image": "https://picsum.photos/seed/game1/600/400"
    },
    {
      "id": "game-2",
      "title": "Game 2 Title",
      "folder": "game-2",
      "category": "Action",
      "image": "https://picsum.photos/seed/game2/600/400"
    },
    {
      "id": "game-3",
      "title": "Game 3 Title",
      "folder": "game-3",
      "category": "Puzzle",
      "image": "https://picsum.photos/seed/game3/600/400"
    }
  ]
}
```

## Quick Copy-Paste Template

Use this template for each game entry:

```json
{
  "id": "your-game-id",
  "title": "🎮 Your Game Title",
  "folder": "your-game-id",
  "category": "Arcade",
  "image": "https://picsum.photos/seed/yourgame/600/400"
}
```

## Common Issues

**Game doesn't appear?**
- Check that folder name matches `"folder"` value in manifest
- Make sure file is named `index.html` (lowercase)
- Refresh the page with Ctrl+F5

**Game won't load?**
- Check browser console for errors (F12)
- Make sure your HTML file doesn't have syntax errors
- Test the game URL directly

**Wrong thumbnail?**
- Change the seed in the image URL
- Or add your own: `"/games/your-game/thumbnail.png"`

## Need Help?

📖 See the full guide: [ADDING-GAMES.md](./ADDING-GAMES.md)
📁 See folder structure: [public/games/STRUCTURE.md](./public/games/STRUCTURE.md)
