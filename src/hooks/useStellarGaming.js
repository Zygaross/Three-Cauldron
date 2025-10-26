import { useState, useCallback, useEffect } from 'react';
import { StellarGameSDK } from '../services/StellarGameSDK';

/**
 * React Hook for Stellar Gaming SDK
 * Makes it super easy to use in React components
 */
export function useStellarGaming(gameId = 'spooky-games') {
  const [sdk] = useState(() => new StellarGameSDK({ gameId }));
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    try {
      console.log('[HOOK] === CONNECT BUTTON CLICKED ===');
      setLoading(true);
      setError(null);
      
      console.log('[HOOK] 🔗 Calling sdk.connectWallet()...');
      const addr = await sdk.connectWallet();
      console.log('[HOOK] ✅ Connected! Address:', addr);
      
      setAddress(addr);
      setConnected(true);
      console.log('[HOOK] ✅ State updated');
      
      // Load balance
      console.log('[HOOK] 💰 Loading balance...');
      const bal = await sdk.getBalance();
      console.log('[HOOK] 💰 Balance:', bal.xlm);
      setBalance(bal.xlm);
      
      console.log('[HOOK] === CONNECT COMPLETE ===\n');
      return addr;
    } catch (err) {
      console.error('[HOOK] 💥 Connect failed:', err);
      console.log('[HOOK] Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  const sendPayout = useCallback(async (recipient, amount, memo) => {
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.sendPayment(recipient, amount, memo);
      // Refresh balance after successful payment
      const bal = await sdk.getBalance();
      setBalance(bal.xlm);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  const batchPayout = useCallback(async (recipients, memo) => {
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.batchPayments(recipients, memo);
      // Refresh balance
      const bal = await sdk.getBalance();
      setBalance(bal.xlm);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  const refreshBalance = useCallback(async () => {
    if (!connected || !address) return;
    try {
      const bal = await sdk.getBalance();
      setBalance(bal.xlm);
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  }, [sdk, connected, address]);

  // Auto-check wallet connection on mount (like we do in App.jsx)
  useEffect(() => {
    console.log('[HOOK] === useEffect TRIGGERED ===');
    console.log('[HOOK] SDK instance:', sdk);
    
    const checkExistingConnection = async () => {
      try {
        console.log('[HOOK] 🔍 Starting checkExistingConnection...');
        
        const isConnected = await sdk.isWalletConnected();
        console.log('[HOOK] 📊 sdk.isWalletConnected() returned:', isConnected);
        console.log('[HOOK] 📊 sdk.walletAddress is:', sdk.walletAddress);
        
        if (isConnected && sdk.walletAddress) {
          console.log('[HOOK] ✅ Connection detected! Setting state...');
          setConnected(true);
          setAddress(sdk.walletAddress);
          console.log('[HOOK] ✅ State updated - connected: true, address:', sdk.walletAddress);
          
          // Load balance
          console.log('[HOOK] 💰 Loading balance...');
          const bal = await sdk.getBalance();
          console.log('[HOOK] 💰 Balance result:', bal);
          setBalance(bal.xlm);
          console.log('[HOOK] ✅ Balance set to:', bal.xlm, 'XLM');
        } else {
          console.log('[HOOK] ℹ️ No connection detected');
          console.log('[HOOK] ℹ️ isConnected:', isConnected);
          console.log('[HOOK] ℹ️ sdk.walletAddress:', sdk.walletAddress);
        }
        
        console.log('[HOOK] === checkExistingConnection COMPLETE ===\n');
      } catch (err) {
        console.log('[HOOK] 💥 ERROR in checkExistingConnection:', err);
        console.log('[HOOK] Error name:', err.name);
        console.log('[HOOK] Error message:', err.message);
        console.log('[HOOK] Error stack:', err.stack);
      }
    };
    
    checkExistingConnection();
  }, [sdk]);

  return {
    // State
    connected,
    address,
    balance,
    loading,
    error,
    
    // Methods
    connect,
    sendPayout,
    batchPayout,
    refreshBalance,
    hasBalance: sdk.hasBalance.bind(sdk),
    getBalance: sdk.getBalance.bind(sdk),
    
    // Raw SDK for advanced usage
    sdk,
  };
}
