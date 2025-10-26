import React, { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, TrendingUp, Package, Sparkles, Zap } from 'lucide-react';

const ITEMS = [
  { id: 1, name: '💎 Diamond Ring', basePrice: 50, emoji: '💍', rarity: 'legendary' },
  { id: 2, name: '👑 Golden Crown', basePrice: 40, emoji: '👑', rarity: 'epic' },
  { id: 3, name: '🚗 Luxury Car', basePrice: 100, emoji: '🚗', rarity: 'legendary' },
  { id: 4, name: '🏰 Castle', basePrice: 200, emoji: '🏰', rarity: 'mythic' },
  { id: 5, name: '⌚ Rolex Watch', basePrice: 30, emoji: '⌚', rarity: 'rare' },
  { id: 6, name: '👜 Designer Bag', basePrice: 25, emoji: '👜', rarity: 'rare' },
  { id: 7, name: '🎨 Rare Artwork', basePrice: 60, emoji: '🖼️', rarity: 'epic' },
  { id: 8, name: '🛥️ Yacht', basePrice: 150, emoji: '🛥️', rarity: 'legendary' },
  { id: 9, name: '💻 Mac Pro', basePrice: 20, emoji: '💻', rarity: 'common' },
  { id: 10, name: '🎮 Gaming Console', basePrice: 15, emoji: '🎮', rarity: 'common' },
  { id: 11, name: '📱 iPhone Pro', basePrice: 18, emoji: '📱', rarity: 'common' },
  { id: 12, name: '✈️ Private Jet', basePrice: 500, emoji: '✈️', rarity: 'mythic' },
];

const RARITY_COLORS = {
  common: 'from-gray-600 to-gray-800',
  rare: 'from-blue-600 to-blue-800',
  epic: 'from-purple-600 to-purple-800',
  legendary: 'from-yellow-600 to-orange-600',
  mythic: 'from-pink-600 to-red-600'
};

const BuyingGame = () => {
  const [money, setMoney] = useState(1000);
  const [inventory, setInventory] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [bidPrice, setBidPrice] = useState(0);
  const [auctionProgress, setAuctionProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [auctionEnded, setAuctionEnded] = useState(false);

  useEffect(() => {
    startNewAuction();
  }, []);

  useEffect(() => {
    if (auctionProgress > 0 && auctionProgress < 100 && !auctionEnded) {
      const timer = setTimeout(() => {
        setAuctionProgress(prev => Math.min(prev + 1, 100));
      }, 50);
      return () => clearTimeout(timer);
    } else if (auctionProgress >= 100 && !auctionEnded) {
      endAuction();
    }
  }, [auctionProgress, auctionEnded]);

  const startNewAuction = () => {
    const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const priceVariation = 0.8 + Math.random() * 0.4;
    const price = Math.round(randomItem.basePrice * priceVariation);
    
    setCurrentItem({ ...randomItem, currentPrice: price });
    setBidPrice(price);
    setAuctionProgress(0);
    setAuctionEnded(false);
    setMessage('');
  };

  const endAuction = () => {
    setAuctionEnded(true);
    setAuctionProgress(100);
  };

  const buyItem = () => {
    if (!currentItem || auctionEnded) return;
    
    if (money >= bidPrice) {
      setMoney(prev => prev - bidPrice);
      setInventory(prev => [...prev, { ...currentItem, boughtFor: bidPrice }]);
      setMessage(`🎉 Bought ${currentItem.name} for $${bidPrice}!`);
      
      const resellMultiplier = 0.8 + Math.random() * 0.7;
      const resellValue = Math.round(bidPrice * resellMultiplier);
      setTotalValue(prev => prev + resellValue);
      
      setTimeout(() => {
        startNewAuction();
      }, 2000);
    } else {
      setMessage('❌ Not enough money!');
    }
  };

  const skipItem = () => {
    setMessage('⏭️ Skipped this auction');
    setTimeout(() => {
      startNewAuction();
    }, 1000);
  };

  const sellAll = () => {
    const earnings = inventory.reduce((sum, item) => {
      const resellMultiplier = 0.8 + Math.random() * 0.7;
      return sum + Math.round(item.boughtFor * resellMultiplier);
    }, 0);
    
    setMoney(prev => prev + earnings);
    setMessage(`💰 Sold everything for $${earnings}!`);
    setInventory([]);
    setTotalValue(0);
  };

  const resetGame = () => {
    setMoney(1000);
    setInventory([]);
    setTotalValue(0);
    setMessage('');
    startNewAuction();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-transparent bg-clip-text">
            💰 Buying Sh*t 💰
          </h1>
          <p className="text-gray-300 text-lg">Buy low, hope for high! 🚀</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4 shadow-lg border-2 border-green-400">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm opacity-80">Cash</span>
            </div>
            <div className="text-2xl font-bold">${money}</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 shadow-lg border-2 border-blue-400">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-5 h-5" />
              <span className="text-sm opacity-80">Items</span>
            </div>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 shadow-lg border-2 border-purple-400">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm opacity-80">Est. Value</span>
            </div>
            <div className="text-2xl font-bold">${totalValue}</div>
          </div>
        </div>

        {currentItem && (
          <div className="mb-6">
            <div className={`bg-gradient-to-br ${RARITY_COLORS[currentItem.rarity]} rounded-xl p-6 shadow-2xl border-4 border-yellow-400 transform hover:scale-105 transition-all`}>
              <div className="text-center mb-4">
                <div className="text-8xl mb-4 animate-bounce">{currentItem.emoji}</div>
                <h2 className="text-3xl font-bold mb-2">{currentItem.name}</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="text-yellow-300 font-semibold uppercase">{currentItem.rarity}</span>
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">${bidPrice}</div>
                
                <div className="mt-4">
                  <div className="bg-gray-800 rounded-full h-4 overflow-hidden border-2 border-yellow-400">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-red-500 h-full transition-all duration-100"
                      style={{ width: `${auctionProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-2 opacity-80">
                    {auctionEnded ? 'AUCTION ENDED!' : 'Time remaining...'}
                  </p>
                </div>
              </div>

              {!auctionEnded && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={buyItem}
                    disabled={money < bidPrice}
                    className={`py-4 rounded-lg font-bold text-xl shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2 ${
                      money >= bidPrice 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-2 border-green-300' 
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <ShoppingCart className="w-6 h-6" />
                    BUY NOW
                  </button>
                  
                  <button
                    onClick={skipItem}
                    className="py-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg font-bold text-xl hover:from-gray-700 hover:to-gray-800 shadow-lg border-2 border-gray-400 transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-6 h-6" />
                    SKIP
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-center text-xl font-bold animate-pulse border-2 border-pink-400">
            {message}
          </div>
        )}

        {inventory.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6" />
                Your Collection
              </h3>
              <button
                onClick={sellAll}
                className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-700 shadow-lg border-2 border-yellow-300 transform hover:scale-105 transition-all"
              >
                💵 Sell All
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {inventory.map((item, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${RARITY_COLORS[item.rarity]} rounded-lg p-4 text-center shadow-lg border-2 border-opacity-50`}
                >
                  <div className="text-4xl mb-2">{item.emoji}</div>
                  <div className="text-sm font-semibold mb-1">{item.name}</div>
                  <div className="text-xs opacity-80">${item.boughtFor}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={resetGame}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg font-bold text-lg hover:from-red-700 hover:to-pink-700 shadow-lg border-2 border-red-400 transform hover:scale-105 transition-all"
          >
            🔄 New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyingGame;
