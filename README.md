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
