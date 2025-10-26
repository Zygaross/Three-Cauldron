/**
 * Stellar SDK Integration for Username NFT
 * Clean implementation following Stellar SDK v12 best practices
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { Server as SorobanServer } from '@stellar/stellar-sdk/rpc';
import { Client } from '@stellar/stellar-sdk/contract';
import {
  isAllowed,
  getAddress,
  signTransaction
} from '@stellar/freighter-api';

// Contract configuration
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const RPC_URL = 'https://soroban-testnet.stellar.org';
const USERNAME_NFT_CONTRACT = 'CCUBWRVCCUIZKU3V6ZD5LOB6G33UQMFL7FZLQVWD6E2I37U7YZY7BRPS';

/**
 * Username NFT Manager
 * Handles all interactions with the username NFT contract using the Client pattern
 */
export class UsernameNFTManager {
  constructor() {
    this.networkPassphrase = NETWORK_PASSPHRASE;
    this.rpcUrl = RPC_URL;
    this.contractAddress = USERNAME_NFT_CONTRACT;
    this.network = 'testnet';
    this.rpcServer = new SorobanServer(RPC_URL);
  }

  /**
   * Check if Freighter wallet is connected
   */
  async isWalletConnected() {
    try {
      return await isAllowed();
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
      return false;
    }
  }

  /**
   * Get user's wallet address
   */
  async getWalletAddress() {
    console.log('[USERNAME NFT] === getWalletAddress START ===');
    
    try {
      console.log('[USERNAME NFT] 📞 Calling getAddress()...');
      
      // Get address from Freighter using the correct API method
      const result = await getAddress();
      console.log('[USERNAME NFT] 📬 getAddress() raw result:', result);
      console.log('[USERNAME NFT] 📬 result type:', typeof result);
      
      if (typeof result === 'object') {
        console.log('[USERNAME NFT] 📬 result.address:', result.address);
        console.log('[USERNAME NFT] 📬 result.error:', result.error);
        console.log('[USERNAME NFT] 📬 result keys:', Object.keys(result));
      }
      
      // Handle both string and object responses (same pattern as App.jsx)
      const address = typeof result === 'string' ? result : result.address;
      console.log('[USERNAME NFT] 🎯 Extracted address:', address);
      
      if (!address) {
        console.log('[USERNAME NFT] ❌ No address found in result');
        throw new Error('No address returned from Freighter');
      }

      console.log('[USERNAME NFT] ✅ Got wallet address:', address);
      console.log('[USERNAME NFT] === getWalletAddress END ===\n');
      return address;
    } catch (error) {
      console.log('[USERNAME NFT] 💥 ERROR in getWalletAddress:', error);
      console.log('[USERNAME NFT] Error name:', error.name);
      console.log('[USERNAME NFT] Error message:', error.message);
      console.log('[USERNAME NFT] Error stack:', error.stack);
      
      // If error message suggests Freighter isn't installed, throw helpful message
      if (error.message && error.message.includes('not installed')) {
        throw new Error('Freighter wallet extension not found. Please install Freighter.');
      }
      
      throw new Error('Please connect your Freighter wallet and try again');
    }
  }

  /**
   * Get username for an address  
   */
  async getUsername(address) {
    try {
      const contract = new StellarSdk.Contract(this.contractAddress);
      
      // Try to get the account, but use a fallback if it fails
      let sourceAccount;
      try {
        sourceAccount = await this.rpcServer.getAccount(address);
      } catch (error) {
        // Use a dummy account for simulation if the account doesn't exist yet
        sourceAccount = new StellarSdk.Account(
          'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
          '0'
        );
      }
      
      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(
          contract.call(
            'get_username',
            StellarSdk.xdr.ScVal.scvAddress(
              StellarSdk.Address.fromString(address).toScAddress()
            )
          )
        )
        .setTimeout(30)
        .build();

      const sim = await this.rpcServer.simulateTransaction(tx);
      
      // Check for errors
      if (StellarSdk.SorobanRpc.Api.isSimulationError(sim)) {
        console.log('[USERNAME NFT] Simulation error:', sim.error);
        return null;
      }
      
      if (StellarSdk.SorobanRpc.Api.isSimulationRestore(sim)) {
        console.log('[USERNAME NFT] Storage expired, needs restore');
        return null;
      }
      
      // SDK v12 uses sim.result (singular), not sim.results (plural)
      const retval = sim.result?.retval;
      
      if (retval) {
        let username = StellarSdk.scValToNative(retval);
        
        // Handle Option<String> - it might be wrapped or null
        if (username === null || username === undefined) {
          return null;
        }
        
        // If it's already a string, return it
        if (typeof username === 'string') {
          console.log('[USERNAME NFT] ✅ Loaded username:', username);
          return username;
        }
        
        // If it's an array or object, try to unwrap it
        if (Array.isArray(username) && username.length > 0) {
          username = username[0];
          console.log('[USERNAME NFT] ✅ Loaded username (unwrapped):', username);
          return username;
        }
        
        return username;
      }
      
      return null;
    } catch (error) {
      console.error('[USERNAME NFT] Error fetching username:', error);
      return null;
    }
  }  /**
   * Claim a new username
   */
  async claimUsername(username) {
    console.log('[USERNAME NFT] Claiming username:', username);
    
    try {
      const sanitized = username.toLowerCase().trim();
      
      if (sanitized.length < 3 || sanitized.length > 20) {
        throw new Error('Username must be 3-20 characters');
      }

      const ownerAddress = await this.getWalletAddress();
      const sourceAccount = await this.rpcServer.getAccount(ownerAddress);
      const contract = new StellarSdk.Contract(this.contractAddress);
      
      console.log('[USERNAME NFT] Building transaction for owner:', ownerAddress);
      
      // Contract takes owner address + username
      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(
          contract.call(
            'claim_username',
            StellarSdk.xdr.ScVal.scvAddress(
              StellarSdk.Address.fromString(ownerAddress).toScAddress()
            ),
            StellarSdk.xdr.ScVal.scvString(sanitized)
          )
        )
        .setTimeout(30)
        .build();

      console.log('[USERNAME NFT] Simulating transaction...');
      
      // Simulate with ResourceConfig to allow auth simulation
      const sim = await this.rpcServer.simulateTransaction(tx);
      
      console.log('[USERNAME NFT] Simulation result:', {
        success: !StellarSdk.SorobanRpc.Api.isSimulationError(sim),
        auth: sim.result?.auth?.length || 0,
        hasRetval: !!sim.results?.[0]?.retval
      });
      
      // Check for simulation errors
      if (StellarSdk.SorobanRpc.Api.isSimulationError(sim)) {
        console.error('[USERNAME NFT] Full simulation error:', JSON.stringify(sim, null, 2));
        const errorMessage = sim.error || 'Simulation failed';
        console.error('[USERNAME NFT] Error message:', errorMessage);
        
        if (errorMessage.includes('already has a username')) {
          throw new Error('This address already has a username. Use "Change Username" instead.');
        }
        
        // Show the actual error to the user
        throw new Error(`Contract error: ${errorMessage}`);
      }
      
      console.log('[USERNAME NFT] Simulation successful, assembling transaction with auth...');
      
      // Assemble transaction with simulation results (includes auth entries)
      const prepared = StellarSdk.SorobanRpc.assembleTransaction(tx, sim).build();
      
      console.log('[USERNAME NFT] Transaction assembled, requesting signature from Freighter...');
      const xdr = prepared.toXDR('base64');
      
      // Sign the transaction (Freighter will handle the auth signature)
      const signedResult = await signTransaction(xdr, {
        networkPassphrase: this.networkPassphrase,
      });
      
      console.log('[USERNAME NFT] Transaction signed, submitting to network...');
      
      const signedXdr = typeof signedResult === 'string' 
        ? signedResult 
        : signedResult.signedTxXdr || signedResult.xdr || signedResult;
      
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase);
      const sendResult = await this.rpcServer.sendTransaction(signedTx);
      
      console.log('[USERNAME NFT] Transaction sent:', sendResult);
      
      console.log('[USERNAME NFT] ✅ Username claimed successfully!');
      return { success: true, username: sanitized };

    } catch (error) {
      console.error('[USERNAME NFT] ❌ Claim failed:', error);
      throw error;
    }
  }

  /**
   * Change existing username
   */
  async changeUsername(newUsername) {
    try {
      const sanitized = newUsername.toLowerCase().trim();

      if (sanitized.length < 3 || sanitized.length > 20) {
        throw new Error('Username must be 3-20 characters');
      }

      const ownerAddress = await this.getWalletAddress();
      const contract = new StellarSdk.Contract(this.contractAddress);
      
      const tx = new StellarSdk.TransactionBuilder(
        await this.rpcServer.getAccount(ownerAddress),
        { fee: StellarSdk.BASE_FEE, networkPassphrase: this.networkPassphrase }
      )
        .addOperation(
          contract.call(
            'change_username',
            StellarSdk.xdr.ScVal.scvAddress(
              StellarSdk.Address.fromString(ownerAddress).toScAddress()
            ),
            StellarSdk.xdr.ScVal.scvString(sanitized)
          )
        )
        .setTimeout(30)
        .build();

      const sim = await this.rpcServer.simulateTransaction(tx);
      const prepared = StellarSdk.SorobanRpc.assembleTransaction(tx, sim).build();
      
      const signedXdr = await signTransaction(prepared.toXDR('base64'), {
        networkPassphrase: this.networkPassphrase,
      });
      
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        this.networkPassphrase
      );
      
      await this.rpcServer.sendTransaction(signedTx);
      
      return { success: true, username: sanitized };

    } catch (error) {
      console.error('Failed to change username:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const usernameNFT = new UsernameNFTManager();


