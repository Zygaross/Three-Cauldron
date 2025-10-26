import React, { useState } from 'react';
import { useStellarGaming } from '../hooks/useStellarGaming';
import { Coins, Users, TrendingUp } from 'lucide-react';

export function GamePayoutDemo() {
  console.log('[DEMO] === GamePayoutDemo RENDER ===');
  
  const { 
    connected, 
    address, 
    balance, 
    loading, 
    error,
    connect, 
    sendPayout,
    batchPayout,
  } = useStellarGaming('spooky-games-demo');

  console.log('[DEMO] Hook state - connected:', connected, ', address:', address, ', balance:', balance);
  console.log('[DEMO] Hook state - loading:', loading, ', error:', error);

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [lastResult, setLastResult] = useState(null);

  const handleSinglePayout = async () => {
    if (!recipient || !amount) {
      alert('Please enter recipient and amount');
      return;
    }

    try {
      const result = await sendPayout(recipient, amount, 'Game Win! 🎃');
      setLastResult(result);
      alert(`✅ Payout sent!\n\nHash: ${result.hash.substring(0, 16)}...\n\nView: ${result.explorerUrl}`);
      setRecipient('');
      setAmount('');
    } catch (err) {
      alert(`❌ Failed: ${err.message}`);
    }
  };

  const handleBatchPayout = async () => {
    const winners = [
      { address: recipient || address, amount: '10' },  // Demo: 1st place
      { address: address, amount: '5' },   // Demo: 2nd place
      { address: address, amount: '2.5' }, // Demo: 3rd place
    ];

    try {
      const result = await batchPayout(winners, 'Tournament Winners 🏆');
      setLastResult(result);
      alert(`✅ Batch payout sent!\n\nPaid ${result.recipientCount} winners\nTotal: ${result.totalAmount} XLM\n\nView: ${result.explorerUrl}`);
    } catch (err) {
      alert(`❌ Failed: ${err.message}`);
    }
  };

  if (!connected) {
    return (
      <div className="bg-black/95 border border-purple-500/40 rounded-lg shadow-2xl shadow-purple-500/20 p-4 w-64">
        <div className="text-center">
          <Coins className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">Payout SDK</h3>
          <button
            onClick={connect}
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? '⏳ Connect' : '🔌 Connect'}
          </button>
          {error && (
            <p className="text-red-400 text-xs mt-1">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/95 border border-purple-500/40 rounded-lg shadow-2xl shadow-purple-500/20 overflow-hidden w-80">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-white" />
          <h3 className="text-white font-bold text-sm">Game Payout SDK</h3>
        </div>
        <div className="text-white/80 text-xs">
          {address.substring(0, 8)}...{address.substring(address.length - 6)}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Balance Display */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs">Balance</span>
            <span className="text-white font-bold text-sm">{balance.toFixed(2)} XLM</span>
          </div>
        </div>

        {/* Single Payout */}
        <div className="space-y-2">
          <label className="text-white/80 text-xs font-semibold">Single Payout</label>
          <input
            type="text"
            placeholder="Recipient (G...)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-2 bg-black/60 border border-purple-500/30 text-white rounded-lg text-xs focus:outline-none focus:border-purple-400"
          />
          <input
            type="number"
            placeholder="Amount (XLM)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 bg-black/60 border border-purple-500/30 text-white rounded-lg text-xs focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={handleSinglePayout}
            disabled={loading || !recipient || !amount}
            className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Sending...' : '💰 Send Payout'}
          </button>
        </div>

        {/* Batch Payout Demo */}
        <div className="space-y-2">
          <label className="text-white/80 text-xs font-semibold">Batch Payout</label>
          <button
            onClick={handleBatchPayout}
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? '⏳ Sending...' : <><Users className="w-3 h-3" /> 3 Winners</>}
          </button>
        </div>

        {/* Last Result */}
        {lastResult && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-2">
            <div className="text-green-400 text-xs font-semibold mb-1">✅ Success</div>
            <a
              href={lastResult.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-xs hover:underline"
            >
              View Explorer →
            </a>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-2">
            <div className="text-red-400 text-xs">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
}
