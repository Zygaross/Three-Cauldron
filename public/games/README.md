# Games Folder

## How to Add a New HTML Game

### Step 1: Add Your Game Files
1. Create a new folder in `public/games/` with your game name (e.g., `my-awesome-game/`)
2. Place your HTML file in this folder (must be named `index.html`)
3. Include any assets (CSS, JS, images) in the same folder

### Step 2: Register Your Game
1. Open `public/games/games-manifest.json`
2. Add a new entry with your game details:

```json
{
  "id": "unique-game-id",
  "title": "Your Game Title",
  "folder": "my-awesome-game",
  "image": "/games/my-awesome-game/thumbnail.png",
  "category": "Action",
  "description": "Short description of your game",
  "rating": 4.5
}
```

### Folder Structure Example:
```
public/games/
  ├── my-awesome-game/
  │   ├── index.html          (required - your game)
  │   ├── thumbnail.png       (recommended - game thumbnail)
  │   ├── style.css          (optional)
  │   ├── script.js          (optional)
  │   └── assets/            (optional)
  ├── another-game/
  │   └── index.html
  └── games-manifest.json     (required - game registry)
```

### Field Descriptions:
- **id**: Unique identifier (lowercase, use hyphens)
- **title**: Display name of the game
- **folder**: Name of the folder containing the game
- **image**: Path to thumbnail (or use a placeholder URL)
- **category**: One of: Action, Adventure, Arcade, Battle, Casino, Horror, Racing, RPG, Strategy, Survival
- **description**: Brief description (optional)
- **rating**: Number between 1-5 (optional, defaults to 4.5)
- **players**: Player count display (optional, e.g., "1.2K")
- **earnings**: Earnings display (optional, e.g., "500 XLM")

That's it! Your game will automatically appear in the platform.
