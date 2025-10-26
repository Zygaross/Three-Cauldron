# 🚀 Deploy Username NFT Contract

## Step 1: Install Stellar CLI

```powershell
# Install Rust if you haven't already
winget install Rustlang.Rustup

# Install Stellar CLI
cargo install --locked stellar-cli
```

## Step 2: Build the Contract

```powershell
cd contracts\username-nft
stellar contract build
```

## Step 3: Deploy to Testnet

You need a Stellar secret key. You can use your Freighter wallet's secret key or generate a new one.

```powershell
stellar contract deploy `
  --wasm target\wasm32-unknown-unknown\release\username_nft.wasm `
  --network testnet `
  --source YOUR_SECRET_KEY_HERE
```

This will output something like:
```
CABC1234567890ABCDEFGHIJKLMNOP...XYZ
```

## Step 4: Update the Frontend

Edit `src/stellar-sdk.js` and replace the contract address:

```javascript
const USERNAME_NFT_CONTRACT = 'YOUR_NEW_CONTRACT_ID_FROM_STEP_3';
```

## Step 5: Test It!

Refresh the app and try claiming a username. It should work now!

## What's Different?

Our new contract:
- ✅ Takes **1 parameter** instead of 2 (`claim_username(username)`)
- ✅ Automatically gets the caller's address using `env.invoker()`
- ✅ Returns proper `Result<(), String>` for better error messages
- ✅ Uses modern Soroban SDK patterns
- ✅ We own it and can modify it!

## Troubleshooting

**"command not found: stellar"**
- Restart PowerShell after installing Rust/Stellar CLI

**"error: could not compile"**
- Make sure you're in the `contracts/username-nft` directory
- Run `rustup target add wasm32-unknown-unknown`

**"insufficient balance"**
- Fund your account at: https://laboratory.stellar.org/#account-creator?network=test
