# 🎮 Stellar Game SDK - Developer Guide

## Quick Start

### Installation
The SDK is already included in the project. Just import and use!

```javascript
import { StellarGameSDK } from './services/StellarGameSDK';
// OR use the React hook
import { useStellarGaming } from './hooks/useStellarGaming';
```

### Basic Usage (JavaScript/TypeScript)

```javascript
// Initialize SDK
const game = new StellarGameSDK({
  gameId: 'my-awesome-game',
  network: 'testnet' // or 'mainnet'
});

// Connect wallet
await game.connectWallet();

// Send a payout
const result = await game.sendPayment(
  'GPLAYER123...', // recipient address
  '50',            // amount in XLM
  'You won!'       // optional memo
);

console.log('Transaction:', result.explorerUrl);
```

### React Hook Usage

```jsx
import { useStellarGaming } from '../hooks/useStellarGaming';

function MyGameComponent() {
  const {
    connected,
    address,
    balance,
    loading,
    connect,
    sendPayout
  } = useStellarGaming('my-game');

  const handleWin = async () => {
    try {
      const result = await sendPayout(
        playerAddress,
        winAmount,
        'Congratulations!'
      );
      alert(`Paid ${winAmount} XLM! ${result.explorerUrl}`);
    } catch (error) {
      alert(`Failed: ${error.message}`);
    }
  };

  return (
    <>
      {!connected ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <>
          <p>Balance: {balance} XLM</p>
          <button onClick={handleWin}>Send Payout</button>
        </>
      )}
    </>
  );
}
```

## API Reference

### StellarGameSDK Methods

#### `connectWallet()`
Connects to Freighter wallet and returns the address.

```javascript
const address = await sdk.connectWallet();
```

#### `sendPayment(recipient, amount, memo)`
Sends XLM to a single recipient.

```javascript
const result = await sdk.sendPayment(
  'GPLAYER...', // Stellar address
  '25.5',       // Amount in XLM (string or number)
  'Prize!'      // Optional memo
);
// Returns: { success, hash, amount, recipient, explorerUrl }
```

#### `batchPayments(recipients, memo)`
Sends XLM to multiple recipients in one transaction.

```javascript
const result = await sdk.batchPayments([
  { address: 'GFIRST...', amount: '100' },
  { address: 'GSECOND...', amount: '50' },
  { address: 'GTHIRD...', amount: '25' }
], 'Tournament Winners');
// Returns: { success, hash, recipientCount, totalAmount, explorerUrl }
```

#### `getBalance(address)`
Get XLM balance for an address (defaults to connected wallet).

```javascript
const balance = await sdk.getBalance();
// Returns: { xlm: 123.45, address: 'G...' }
```

#### `hasBalance(requiredAmount, address)`
Check if an address has sufficient balance.

```javascript
const canPlay = await sdk.hasBalance(10); // Check for 10 XLM
```

## Examples

### Example 1: Simple Game Payout
```javascript
const game = new StellarGameSDK({ gameId: 'poker' });
await game.connectWallet();

// Player won!
await game.sendPayment(winnerAddress, '50', 'Poker Win!');
```

### Example 2: Tournament with Multiple Winners
```javascript
const game = new StellarGameSDK({ gameId: 'tournament' });
await game.connectWallet();

const winners = [
  { address: 'G1ST...', amount: '1000' },
  { address: 'G2ND...', amount: '500' },
  { address: 'G3RD...', amount: '250' }
];

await game.batchPayments(winners, 'Tournament #42');
```

### Example 3: Check Balance Before Betting
```javascript
const game = new StellarGameSDK({ gameId: 'dice' });
await game.connectWallet();

const betAmount = 100;
if (await game.hasBalance(betAmount)) {
  // Process bet
  console.log('Bet accepted!');
} else {
  alert('Insufficient balance!');
}
```

### Example 4: React Component
See `src/components/GamePayoutDemo.jsx` for a complete working example!

## Error Handling

All methods throw user-friendly errors:

```javascript
try {
  await game.sendPayment(recipient, amount);
} catch (error) {
  // Error messages are user-friendly:
  // - "Transaction rejected by user"
  // - "Insufficient balance. Please add more XLM to your wallet."
  // - "Freighter wallet not found. Install from https://freighter.app"
  alert(error.message);
}
```

## Testing

1. **Start dev server**: `npm run dev`
2. **Connect Freighter wallet** (on Testnet)
3. **Get testnet XLM**: https://laboratory.stellar.org/#account-creator
4. **Try the demo**: Look for the purple "Game Payout SDK" panel in bottom-right

## Configuration

Edit `.env` file:

```bash
VITE_STELLAR_NETWORK=testnet  # or mainnet
VITE_GAME_ID=my-game
```

## Support

- Stellar Docs: https://developers.stellar.org
- Freighter Wallet: https://freighter.app
- Testnet Friendbot: https://laboratory.stellar.org/#account-creator
- Explorer: https://stellar.expert/explorer/testnet
