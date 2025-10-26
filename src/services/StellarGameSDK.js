import * as StellarSdk from '@stellar/stellar-sdk';
import { isAllowed, getAddress, signTransaction } from '@stellar/freighter-api';

/**
 * Stellar Gaming Platform SDK
 * Easy-to-use interface for game developers to handle all blockchain operations
 */
export class StellarGameSDK {
  constructor(config = {}) {
    this.network = config.network || 'testnet';
    this.networkPassphrase = this.network === 'mainnet' 
      ? StellarSdk.Networks.PUBLIC 
      : StellarSdk.Networks.TESTNET;
    
    this.horizonUrl = this.network === 'mainnet'
      ? 'https://horizon.stellar.org'
      : 'https://horizon-testnet.stellar.org';
    
    this.sorobanUrl = this.network === 'mainnet'
      ? 'https://soroban-mainnet.stellar.org'
      : 'https://soroban-testnet.stellar.org';
    
    this.server = new StellarSdk.Horizon.Server(this.horizonUrl);
    this.rpcServer = new StellarSdk.SorobanRpc.Server(this.sorobanUrl);
    
    // Contract addresses
    this.contracts = {
      treasury: config.treasuryContract || import.meta.env.VITE_TREASURY_CONTRACT,
      payout: config.payoutContract || import.meta.env.VITE_PAYOUT_CONTRACT,
      registry: config.registryContract || import.meta.env.VITE_REGISTRY_CONTRACT,
    };
    
    this.gameId = config.gameId || 'spooky-games';
    this.walletAddress = null;
  }

  /**
   * Initialize wallet connection - Uses the working pattern from App.jsx
   */
  async connectWallet() {
    console.log('[SDK] === connectWallet START ===');
    
    try {
      // Add small delay to ensure Freighter is ready
      console.log('[SDK] ⏳ Waiting 100ms for Freighter...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if wallet is allowed
      console.log('[SDK] 📞 Calling isAllowed()...');
      const allowed = await isAllowed();
      console.log('[SDK] ✅ isAllowed result:', allowed);
      
      if (!allowed) {
        const error = 'Freighter wallet access not allowed. Please allow access in your wallet.';
        console.log('[SDK] ❌', error);
        throw new Error(error);
      }
      
      // Get wallet address
      console.log('[SDK] 🔑 Calling getAddress()...');
      const result = await getAddress();
      console.log('[SDK] 📬 getAddress raw result:', result);
      console.log('[SDK] 📬 result.address:', result.address);
      console.log('[SDK] 📬 result.error:', result.error);
      
      if (result.error || !result.address) {
        const error = result.error || 'Failed to get wallet address from Freighter';
        console.log('[SDK] ❌', error);
        throw new Error(error);
      }
      
      this.walletAddress = result.address;
      console.log('[SDK] ✅ Wallet connected! Address:', this.walletAddress);
      console.log('[SDK] === connectWallet END ===\n');
      return this.walletAddress;
    } catch (err) {
      // If the API calls fail, Freighter is not installed
      if (err.message.includes('freighter') || err.name === 'ReferenceError') {
        console.log('[SDK] ❌ Freighter not installed (caught error):', err.message);
        throw new Error('Freighter wallet not installed. Please install from https://freighter.app');
      }
      throw err;
    }
  }

  /**
   * Check if wallet is connected
   */
  async isWalletConnected() {
    try {
      console.log('[SDK] === isWalletConnected START ===');
      
      console.log('[SDK] ⏳ Waiting 100ms for Freighter...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[SDK] 📞 Calling isAllowed()...');
      const allowed = await isAllowed();
      console.log('[SDK] ✅ isAllowed result:', allowed);
      
      if (allowed && !this.walletAddress) {
        console.log('[SDK] 🔑 Getting wallet address (current walletAddress:', this.walletAddress, ')');
        const result = await getAddress();
        console.log('[SDK] 📬 getAddress raw result:', result);
        console.log('[SDK] 📬 getAddress result.address:', result.address);
        console.log('[SDK] 📬 getAddress result.error:', result.error);
        
        if (!result.error && result.address) {
          this.walletAddress = result.address;
          console.log('[SDK] ✅ Wallet address SET to:', this.walletAddress);
        } else {
          console.log('[SDK] ⚠️ Could not get address - error:', result.error);
        }
      } else if (allowed && this.walletAddress) {
        console.log('[SDK] ℹ️ Already have wallet address:', this.walletAddress);
      } else {
        console.log('[SDK] ❌ Not allowed by Freighter');
      }
      
      const finalResult = allowed && !!this.walletAddress;
      console.log('[SDK] 🎯 FINAL RESULT:', finalResult, '(allowed:', allowed, ', walletAddress:', this.walletAddress, ')');
      console.log('[SDK] === isWalletConnected END ===\n');
      return finalResult;
    } catch (error) {
      console.log('[SDK] 💥 ERROR in isWalletConnected:', error);
      console.log('[SDK] Error name:', error.name);
      console.log('[SDK] Error message:', error.message);
      console.log('[SDK] (This is fine if Freighter not installed)');
      return false;
    }
  }

  /**
   * PAYMENT OPERATIONS
   */

  /**
   * Send XLM payment to a player
   * @param {string} recipientAddress - Player's Stellar address
   * @param {number|string} amount - Amount in XLM
   * @param {string} memo - Optional transaction memo
   */
  async sendPayment(recipientAddress, amount, memo = '') {
    try {
      if (!this.walletAddress) {
        await this.connectWallet();
      }

      const account = await this.server.loadAccount(this.walletAddress);
      
      const txBuilder = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      });

      txBuilder.addOperation(
        StellarSdk.Operation.payment({
          destination: recipientAddress,
          asset: StellarSdk.Asset.native(),
          amount: amount.toString(),
        })
      );

      if (memo) {
        txBuilder.addMemo(StellarSdk.Memo.text(memo));
      }

      const transaction = txBuilder.setTimeout(30).build();

      // Sign with Freighter
      const signedXdr = await signTransaction(transaction.toXDR(), {
        networkPassphrase: this.networkPassphrase,
      });

      const xdrString = typeof signedXdr === 'string' 
        ? signedXdr 
        : signedXdr.signedTxXdr || signedXdr.xdr || signedXdr;

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(xdrString, this.networkPassphrase);
      const result = await this.server.submitTransaction(signedTx);

      return {
        success: true,
        hash: result.hash,
        amount: amount,
        recipient: recipientAddress,
        explorerUrl: `https://stellar.expert/explorer/${this.network}/tx/${result.hash}`,
      };
    } catch (error) {
      console.error('Payment failed:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Batch send payments to multiple players
   */
  async batchPayments(recipients, memo = '') {
    try {
      if (!this.walletAddress) {
        await this.connectWallet();
      }

      const account = await this.server.loadAccount(this.walletAddress);
      
      const txBuilder = new StellarSdk.TransactionBuilder(account, {
        fee: (StellarSdk.BASE_FEE * recipients.length).toString(),
        networkPassphrase: this.networkPassphrase,
      });

      recipients.forEach(({ address, amount }) => {
        txBuilder.addOperation(
          StellarSdk.Operation.payment({
            destination: address,
            asset: StellarSdk.Asset.native(),
            amount: amount.toString(),
          })
        );
      });

      if (memo) {
        txBuilder.addMemo(StellarSdk.Memo.text(memo));
      }

      const transaction = txBuilder.setTimeout(30).build();

      const signedXdr = await signTransaction(transaction.toXDR(), {
        networkPassphrase: this.networkPassphrase,
      });

      const xdrString = typeof signedXdr === 'string' 
        ? signedXdr 
        : signedXdr.signedTxXdr || signedXdr.xdr || signedXdr;

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(xdrString, this.networkPassphrase);
      const result = await this.server.submitTransaction(signedTx);

      return {
        success: true,
        hash: result.hash,
        recipientCount: recipients.length,
        totalAmount: recipients.reduce((sum, r) => sum + parseFloat(r.amount), 0),
        explorerUrl: `https://stellar.expert/explorer/${this.network}/tx/${result.hash}`,
      };
    } catch (error) {
      console.error('Batch payment failed:', error);
      throw this._handleError(error);
    }
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Get player's XLM balance
   */
  async getBalance(address = null) {
    try {
      const targetAddress = address || this.walletAddress;
      if (!targetAddress) {
        throw new Error('No address provided and wallet not connected');
      }

      const account = await this.server.loadAccount(targetAddress);
      const xlmBalance = account.balances.find(b => b.asset_type === 'native');
      
      return {
        xlm: parseFloat(xlmBalance.balance),
        address: targetAddress,
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Check if player has sufficient balance
   */
  async hasBalance(requiredAmount, address = null) {
    try {
      const { xlm } = await this.getBalance(address);
      return xlm >= requiredAmount;
    } catch (error) {
      return false;
    }
  }

  /**
   * Error handler with user-friendly messages
   */
  _handleError(error) {
    const errorMsg = error.message || error.toString();
    
    if (errorMsg.includes('denied') || errorMsg.includes('rejected')) {
      return new Error('Transaction rejected by user');
    } else if (errorMsg.includes('tx_insufficient_balance')) {
      return new Error('Insufficient balance. Please add more XLM to your wallet.');
    } else if (errorMsg.includes('not installed') || errorMsg.includes('freighter')) {
      return new Error('Freighter wallet not found. Install from https://freighter.app');
    } else if (errorMsg.includes('timeout')) {
      return new Error('Transaction timeout. Please try again.');
    } else {
      return new Error(`Transaction failed: ${errorMsg.substring(0, 100)}`);
    }
  }
}

/**
 * Create a singleton instance for easy importing
 */
export const stellarGaming = new StellarGameSDK({
  network: import.meta.env.VITE_STELLAR_NETWORK || 'testnet',
  gameId: 'spooky-games',
});
