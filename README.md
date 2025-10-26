# Three Cauldron — Spooky Games Platform

This repository contains the Three Cauldron (previously "Spooky Games") web platform: a small collection of self-contained, demo-style React games and a lightweight front-end that showcases them. It also includes some development tooling and helper pieces for integrating with Soroban contracts on the Stellar testnet.

The tone of this README is intentionally concise and practical — what you need to run, test, and iterate on the project without any fluff.

## What this repo contains

- `public/games/` — each game is a small Vite+React app inside its own folder. Games ship a `dist/` build and a simple `index.html` for embedding as demos.
- `src/` — the main platform UI (React + Vite) that loads the games manifest and renders the landing page + debug utilities.
- `contracts/` — contract source and build artifacts (Rust / Cargo) used for Soroban development. These are large and ignored in the repo index.
- `tests/` — Playwright end-to-end tests verifying key pages and game launches.
- Utility scripts and flavors: small helpers, a WebSocket server for `piano-flight`, and the `BuyMTK` debug component.

## Quick core details (tooling)

- Framework: React (Vite)
- Styling: Tailwind CSS
- E2E: Playwright
- Soroban / Stellar: `@stellar/stellar-sdk` (Contract, rpc, TransactionBuilder) and `@stellar/freighter-api` for Freighter integration
- Node: some games and the piano-flight server use small Node scripts (e.g., `public/games/piano-flight/server.js`)

## Requirements

- Node.js (18+ recommended)
- npm or yarn
- A modern browser with Freighter installed for Soroban interactions (if you plan to trigger transactions)

## Get started — platform dev (root)

1. Install top-level dependencies (the platform itself):

```powershell
cd c:\stellar-gaming-platform\spooky-games
npm install
```

2. Start the Vite dev server for the platform UI (serves the app that lists/embeds games):

```powershell
npm run dev
# or
npx vite
```

The platform expects games to be available under `public/games/<name>/index.html` or a `dist` build inside each game folder. See the per-game section below for game-specific dev/build steps.

## Per-game dev & build

Each game in `public/games/<game-name>` is a standalone Vite app. Typical workflow inside a game folder:

```powershell
cd public/games/spooky-poker
npm install
npm run dev        # run dev server for that game
npm run build      # produce dist/ for embedding in the main site
```

After building, the platform will often link to the game's `dist/index.html` for demoing.

## Playwright tests

Playwright is configured to exercise the landing page and games. Run tests from repo root:

```powershell
npx playwright install
npx playwright test
```

Tests run against the dev server, so start `npm run dev` in a separate shell before running Playwright.

## Soroban / Freighter notes (contracts & BuyMTK)

- The project includes example integration points that call Soroban contracts via `@stellar/stellar-sdk` and rely on Freighter for signing (the `BuyMTK` debug component and the poker game's transfer flow).
- IMPORTANT: Contract identifiers are hard-coded placeholders in a few files. Example:

  - `public/games/spooky-poker/App.jsx` — look for `CONTRACT_ID` and `ESCROW_ADDRESS` constants near the top of the file.
  - `src/components/BuyMTK.jsx` — similar `CONTRACT_ID` usage.

- If you plan to interact with real testnet contracts:
  1. Deploy your contract to Soroban testnet and note the contract id.
  2. Replace the `CONTRACT_ID` constant in the files above.
  3. Use Freighter in your browser to sign transactions (the code expects Freighter-style sign results; different Freighter versions vary slightly — see code comments and logs if you see XDR/SCVal errors).

## piano-flight WebSocket server

For the piano-flight demo there is a small Node WebSocket server at `public/games/piano-flight/server.js`. To run it locally:

```powershell
cd public/games/piano-flight
npm install
node server.js
# server listens on ws://localhost:3000 by default (see file for config)
```

## Commit history and repo size

Large artifacts (Rust `target/`, per-game `dist/` builds, and `node_modules`) are excluded from Git via `.gitignore`. The initial import removed build artifacts from the index so the repository is clean and pushable.

If you see very large files in history and want them purged, I can help with a history rewrite (BFG or `git filter-repo`) — it rewrites history and requires a force-push.

## Contributing

- Keep game folders self-contained. Use `base: './'` in each game's `vite.config.js` so builds are portable inside `public/games/<name>/dist`.
- When adding a new game:
  1. Create `public/games/<your-game>` as a Vite app.
  2. Ensure `index.html` and built artifacts are relative-path friendly (`base: './'`).
  3. Optionally update `public/games/games-manifest.json` if you want the platform to list the demo.

## CI / Suggested next steps

- A minimal GitHub Actions workflow that installs Node and runs the Playwright smoke tests is a nice next step.
- If you want a clean, smaller repo on GitHub we can remove large committed artifacts from history. I can help do that safely.

## Contact / maintainers

If anything in this README is unclear or you want help wiring a contract or CI, open an issue or ping the maintainers. We can add a CONTRIBUTING.md and code owners if you'd like a formal process.

---

This README is intentionally brief and operational — it focuses on how to run and work with the project. If you want a more narrative README (screenshots, architecture diagrams, or a developer onboarding checklist) tell me what you'd like and I will add it.
# 🎃 Spooky Games Platform

A Halloween-themed Web3 gaming platform powered by Stellar blockchain and Soroban smart contracts.

## 🌟 Features

- **Halloween Theme**: Dark, spooky UI with orange/purple color scheme and animations
- **Freighter Wallet Integration**: Connect your Stellar wallet securely
- **Username NFT System**: Claim and manage unique on-chain usernames
- **Modular Game System**: Easy-to-add HTML games with automatic integration
- **Clean Architecture**: Modern React with latest Stellar SDK v12
- **Production Ready**: Built with Vite for optimal performance

## 🎮 Adding Your Own Games

We've made it super easy to add HTML-based games to the platform!

### Quick Method (3 Steps):

1. **Add your game folder**: `public/games/your-game-name/index.html`
2. **Register in manifest**: Add entry to `public/games/games-manifest.json`
3. **Done!** Your game appears automatically

### Using the Helper Script:

```bash
# Interactive game addition
node add-game.js
# or
.\add-game.ps1
```

📖 **Full Guide**: See [ADDING-GAMES.md](./ADDING-GAMES.md) for complete instructions and examples!

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## 🧪 Complete Testing Guide

### Prerequisites

1. **Install Freighter Wallet** ([freighter.app](https://www.freighter.app/))
2. **Switch to Testnet** in Freighter settings
3. **Fund account** at [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test)

### Test Scenarios

#### ✅ Wallet Connection Test
1. Open http://localhost:5174
2. Click "Connect Wallet"
3. Approve in Freighter popup
4. Verify address shows in header (e.g., "GABC...XYZ")

#### ✅ Username Claim Test
1. Click wallet address dropdown
2. Click edit icon (pencil)
3. Enter username: "SpookyGamer" (3-20 chars)
4. Click save (checkmark)
5. Approve transaction in Freighter
6. Wait for "✅ Username saved successfully!"
7. Verify "✓ NFT" badge appears

#### ✅ Username Persistence Test
1. Refresh page (F5)
2. App auto-reconnects to wallet
3. Open account dropdown
4. Verify username still displays

#### ✅ Username Change Test
1. Click edit icon
2. Change username to "GhostHunter"
3. Save and approve transaction
4. Verify username updates

#### ✅ Disconnect Test
1. Click "Disconnect" button
2. Verify "Connect Wallet" button returns
3. Verify username state clears

### Browser Console Checks

Press F12 → Console. Look for:

```
✅ Wallet connected: GABC...XYZ
ℹ️ Username loaded: SpookyGamer
✅ Username claimed successfully
```

❌ No red errors should appear

### Visual Verification

- [ ] Orange skull logo with glow
- [ ] Gradient buttons (orange→purple)
- [ ] Animated floating skulls 💀
- [ ] Feature cards hover with glow
- [ ] Status messages slide from right
- [ ] Responsive layout on mobile

## 🔧 Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Frontend | React | 19.0.0 |
| Build | Vite | 7.1.12 |
| Blockchain | Stellar SDK | 12.3.0 |
| Wallet | Freighter API | 5.0.0 |
| Icons | Lucide React | Latest |
| Animations | GSAP | Latest |

## 📦 Smart Contract

- **Network**: Stellar Testnet
- **Contract**: `CDXY2KO5EVI6XFOJRICECVNGXUTDDENPO3Z2RHNRFP7WN4I4QZHCIDKG`
- **RPC**: `https://soroban-testnet.stellar.org`

## 🏗️ Project Structure

```
spooky-games/
├── src/
│   ├── App.jsx          # Main UI component
│   ├── App.css          # Halloween theme
│   ├── stellar-sdk.js   # Blockchain integration
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json         # Dependencies
└── vite.config.js       # Build config
```

## 🎨 Color Palette

```css
--orange: #ff6b35      /* Primary accent */
--purple: #6a0dad      /* Secondary accent */
--bg-dark: #0a0a0a     /* Background */
--bg-card: #1a1a1a     /* Cards */
--success: #00ff88     /* Success */
--error: #ff4444       /* Error */
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Wallet not connected" | Install Freighter, unlock wallet, switch to Testnet |
| Transaction fails | Fund account with 2+ XLM from Friendbot |
| "Loading username..." stuck | Check network, verify RPC URL accessible |
| Build errors | `rm -rf node_modules && npm install` |

### View Transaction on Stellar Expert

Copy transaction hash from console → Visit:
```
https://stellar.expert/explorer/testnet/tx/[HASH]
```

## 🔐 Security

- ✅ Testnet only (no real funds)
- ✅ Freighter manages private keys
- ✅ Review all transactions before signing
- ✅ Official Stellar RPC endpoint

## 🚢 Build & Deploy

```bash
# Production build
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
# Drag & drop dist/ folder
```

## 💻 Development

### SDK v12 Pattern (Important!)

```javascript
// ✅ Correct
const tx = new TransactionBuilder(...).build();
const sim = await server.simulateTransaction(tx);
const prepared = assembleTransaction(tx, sim);

// ❌ Wrong (old SDK v11)
const prepared = assembleTransaction(tx, sim).build();
```

### Adding Features

1. Create component in `src/components/`
2. Import in `App.jsx`  
3. Add styles to `App.css`
4. Test with `npm run dev`
5. Build with `npm run build`

## 📱 Responsive Design

- **Desktop**: Full layout
- **Tablet**: Optimized grid
- **Mobile**: Single column

## 📄 License

MIT - Free to use for your projects!

---

🎃 **Built with 💀 and ✨ on Stellar** 🎃
