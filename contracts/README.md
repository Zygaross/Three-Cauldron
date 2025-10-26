# Username NFT Contract - Build & Deploy Guide

## Prerequisites

Install Stellar CLI:
```bash
cargo install --locked stellar-cli
```

## Build Contract

```bash
cd contracts/username-nft
stellar contract build
```

This creates: `target/wasm32-unknown-unknown/release/username_nft.wasm`

## Deploy to Testnet

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/username_nft.wasm \
  --network testnet \
  --source YOUR_SECRET_KEY
```

This will output a contract ID like: `CABC123...XYZ`

## Update Frontend

Update `src/stellar-sdk.js`:

```javascript
const USERNAME_NFT_CONTRACT = 'YOUR_NEW_CONTRACT_ID';
```

## Contract Methods

### `claim_username(username: String)`
- Claims a username for the caller
- Username must be 3-20 characters
- Can only claim once per address
- Parameters: just the username (address is derived from invoker)

### `get_username(address: Address)`
- Gets the username for any address
- Returns `Option<String>`

### `change_username(new_username: String)`
- Changes the caller's existing username
- Must have already claimed a username

## Testing Locally

```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --network testnet \
  --source YOUR_SECRET_KEY \
  -- \
  claim_username \
  --username "spookygamer"
```

## Key Differences from Old Contract

✅ **Takes only 1 parameter**: `claim_username(username)` - address is auto-derived
✅ **Uses `env.invoker()`**: Gets caller from transaction context
✅ **Simpler interface**: No need to pass address explicitly
✅ **Returns Result**: Better error handling with descriptive messages
