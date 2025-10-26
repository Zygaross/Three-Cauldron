#!/bin/bash

# Build the contract
echo "🔨 Building username-nft contract..."
cd contracts/username-nft
stellar contract build

# Optimize the wasm
echo "⚡ Optimizing wasm..."
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/username_nft.wasm

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Next steps:"
echo "1. Deploy to testnet:"
echo "   stellar contract deploy --wasm target/wasm32-unknown-unknown/release/username_nft.wasm --network testnet --source YOURSECRETKEY"
echo ""
echo "2. Update src/stellar-sdk.js with the new contract ID"
