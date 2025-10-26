import React, { useState, useEffect } from 'react';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const SuitIcon = ({ suit }) => {
  const color = suit === 'hearts' || suit === 'diamonds' ? 'text-orange-500' : 'text-purple-400';
  const icons = {
    hearts: <Heart className={`w-4 h-4 ${color} fill-current`} />,
    diamonds: <Diamond className={`w-4 h-4 ${color} fill-current`} />,
    clubs: <Club className={`w-4 h-4 ${color} fill-current`} />,
    spades: <Spade className={`w-4 h-4 ${color} fill-current`} />
  };
  return icons[suit];
};

const Card = ({ rank, suit, hidden }) => {
  if (hidden) {
    return (
      <div className="w-16 h-24 bg-gradient-to-br from-purple-900 to-black rounded border-2 border-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/50 transform hover:scale-105 transition-transform">
        <div className="text-orange-500 text-2xl animate-pulse">🎃</div>
      </div>
    );
  }
  
  return (
    <div className="w-16 h-24 bg-gradient-to-br from-gray-900 to-gray-800 rounded border-2 border-orange-500 p-2 flex flex-col justify-between shadow-lg shadow-orange-500/30 transform hover:scale-105 transition-transform hover:shadow-orange-500/60">
      <div className="flex items-center gap-1">
        <span className="text-lg font-bold text-orange-400">{rank}</span>
        <SuitIcon suit={suit} />
      </div>
      <div className="flex items-center gap-1 self-end rotate-180">
        <span className="text-lg font-bold text-orange-400">{rank}</span>
        <SuitIcon suit={suit} />
      </div>
    </div>
  );
};

// Hand evaluation functions
const getHandRank = (cards) => {
  const rankValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
  const sortedCards = [...cards].sort((a, b) => rankValues[b.rank] - rankValues[a.rank]);
  
  const ranks = sortedCards.map(c => c.rank);
  const suits = sortedCards.map(c => c.suit);
  const rankCounts = {};
  ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
  
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = suits.every(s => s === suits[0]);
  
  // Check straight
  const uniqueRanks = [...new Set(ranks.map(r => rankValues[r]))].sort((a, b) => b - a);
  let isStraight = false;
  if (uniqueRanks.length === 5) {
    isStraight = uniqueRanks[0] - uniqueRanks[4] === 4;
    // Check for A-2-3-4-5 straight
    if (!isStraight && uniqueRanks[0] === 14) {
      isStraight = uniqueRanks[1] === 5 && uniqueRanks[2] === 4 && uniqueRanks[3] === 3 && uniqueRanks[4] === 2;
    }
  }
  
  // Royal Flush
  if (isFlush && isStraight && uniqueRanks[0] === 14 && uniqueRanks[4] === 10) {
    return { score: 10, name: 'Royal Flush' };
  }
  // Straight Flush
  if (isFlush && isStraight) {
    return { score: 9, name: 'Straight Flush', high: uniqueRanks[0] };
  }
  // Four of a Kind
  if (counts[0] === 4) {
    return { score: 8, name: 'Four of a Kind' };
  }
  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return { score: 7, name: 'Full House' };
  }
  // Flush
  if (isFlush) {
    return { score: 6, name: 'Flush', high: uniqueRanks[0] };
  }
  // Straight
  if (isStraight) {
    return { score: 5, name: 'Straight', high: uniqueRanks[0] };
  }
  // Three of a Kind
  if (counts[0] === 3) {
    return { score: 4, name: 'Three of a Kind' };
  }
  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    return { score: 3, name: 'Two Pair' };
  }
  // One Pair
  if (counts[0] === 2) {
    return { score: 2, name: 'One Pair' };
  }
  // High Card
  return { score: 1, name: 'High Card', high: uniqueRanks[0] };
};

const getBestHand = (holeCards, communityCards) => {
  const allCards = [...holeCards, ...communityCards];
  let bestHand = null;
  
  // Generate all 5-card combinations
  for (let i = 0; i < allCards.length; i++) {
    for (let j = i + 1; j < allCards.length; j++) {
      for (let k = j + 1; k < allCards.length; k++) {
        for (let l = k + 1; l < allCards.length; l++) {
          for (let m = l + 1; m < allCards.length; m++) {
            const hand = [allCards[i], allCards[j], allCards[k], allCards[l], allCards[m]];
            const rank = getHandRank(hand);
            if (!bestHand || rank.score > bestHand.score) {
              bestHand = rank;
            }
          }
        }
      }
    }
  }
  
  return bestHand;
};

const PokerGame = () => {
  const [gameState, setGameState] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [raiseAmount, setRaiseAmount] = useState(10);

  const initializeGame = () => {
    const deck = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ rank, suit });
      }
    }
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return {
      player1: { chips: 1000, hand: [deck[0], deck[1]], bet: 0, folded: false, totalBetThisRound: 0 },
      player2: { chips: 1000, hand: [deck[2], deck[3]], bet: 0, folded: false, totalBetThisRound: 0 },
      communityCards: [deck[4], deck[5], deck[6], deck[7], deck[8]],
      pot: 0,
      currentTurn: 1,
      round: 'preflop',
      revealedCards: 0,
      deck: deck.slice(9),
      lastAction: null,
      actionsThisRound: 0,
      lastRaiseAmount: 10
    };
  };

  useEffect(() => {
    // Load initial game state
    const data = localStorage.getItem('poker-game');
    if (data) {
      setGameState(JSON.parse(data));
    }
    setLoading(false);

    // Listen for changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'poker-game' && e.newValue) {
        setGameState(JSON.parse(e.newValue));
      }
    };
    
    // Clear localStorage when tab/window closes
    const handleBeforeUnload = () => {
      localStorage.removeItem('poker-game');
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Auto-update raise amount when minimum changes
  useEffect(() => {
    if (gameState) {
      const minRaise = gameState.lastRaiseAmount * 2;
      setRaiseAmount(minRaise);
    }
  }, [gameState?.lastRaiseAmount]);

  const saveGame = (state) => {
    localStorage.setItem('poker-game', JSON.stringify(state));
    setGameState(state);
  };

  const startNewGame = () => {
    const newGame = initializeGame();
    saveGame(newGame);
    setRaiseAmount(10);
  };

  const advanceRound = (newState) => {
    // Reset bets for new round
    newState.player1.bet = 0;
    newState.player2.bet = 0;
    newState.player1.totalBetThisRound = 0;
    newState.player2.totalBetThisRound = 0;
    newState.actionsThisRound = 0;
    newState.lastAction = null;
    newState.currentTurn = 1; // Player 1 starts each round
    newState.lastRaiseAmount = 10; // Reset minimum raise for new round
    
    // Reveal more cards
    if (newState.revealedCards === 0) {
      newState.revealedCards = 3;
      newState.round = 'flop';
    } else if (newState.revealedCards === 3) {
      newState.revealedCards = 4;
      newState.round = 'turn';
    } else if (newState.revealedCards === 4) {
      newState.revealedCards = 5;
      newState.round = 'river';
    } else {
      // Showdown
      const p1Hand = getBestHand(newState.player1.hand, newState.communityCards.slice(0, 5));
      const p2Hand = getBestHand(newState.player2.hand, newState.communityCards.slice(0, 5));
      
      let winner = null;
      if (p1Hand.score > p2Hand.score) {
        winner = 1;
      } else if (p2Hand.score > p1Hand.score) {
        winner = 2;
      } else {
        // Tie - split pot
        newState.player1.chips += Math.floor(newState.pot / 2);
        newState.player2.chips += Math.ceil(newState.pot / 2);
        alert(`It's a tie! Both players have ${p1Hand.name}. Pot split!`);
        newState.pot = 0;
        return;
      }
      
      if (winner) {
        newState[`player${winner}`].chips += newState.pot;
        alert(`Player ${winner} wins with ${winner === 1 ? p1Hand.name : p2Hand.name}!\nPlayer 1: ${p1Hand.name}\nPlayer 2: ${p2Hand.name}`);
        newState.pot = 0;
      }
    }
  };

  const handleAction = (action, amount = 0) => {
    if (!gameState || gameState.currentTurn !== currentPlayer) return;
    
    const newState = { ...gameState };
    const player = newState[`player${currentPlayer}`];
    const otherPlayer = newState[`player${currentPlayer === 1 ? 2 : 1}`];
    
    if (action === 'fold') {
      player.folded = true;
      otherPlayer.chips += newState.pot;
      newState.pot = 0;
      alert(`Player ${currentPlayer} folded! Player ${currentPlayer === 1 ? 2 : 1} wins $${newState.pot}!`);
      saveGame(newState);
      return;
    }
    
    if (action === 'check') {
      // Check is only valid if bets are equal
      if (player.bet !== otherPlayer.bet) return;
      newState.lastAction = 'check';
      newState.actionsThisRound++;
    }
    
    if (action === 'call') {
      const callAmount = otherPlayer.bet - player.bet;
      if (callAmount > 0 && player.chips >= callAmount) {
        player.chips -= callAmount;
        player.bet += callAmount;
        player.totalBetThisRound += callAmount;
        newState.pot += callAmount;
        newState.lastAction = 'call';
        newState.actionsThisRound++;
        newState.lastRaiseAmount = 10; // Reset raise amount when calling
      }
    }
    
    if (action === 'raise') {
      const currentBet = otherPlayer.bet;
      const totalBet = currentBet + amount;
      const addAmount = totalBet - player.bet;
      
      if (player.chips >= addAmount && addAmount > 0) {
        player.chips -= addAmount;
        player.bet = totalBet;
        player.totalBetThisRound += addAmount;
        newState.pot += addAmount;
        newState.lastAction = 'raise';
        newState.actionsThisRound = 1; // Reset action count after raise
        newState.lastRaiseAmount = amount; // Track the raise amount
      } else {
        alert('Not enough chips to raise!');
        return;
      }
    }
    
    // Check if betting round is complete
    const bothPlayersActed = newState.actionsThisRound >= 2;
    const betsAreEqual = player.bet === otherPlayer.bet;
    
    if (bothPlayersActed && betsAreEqual) {
      advanceRound(newState);
    } else {
      // Switch turns
      newState.currentTurn = currentPlayer === 1 ? 2 : 1;
    }
    
    saveGame(newState);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-orange-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="text-9xl animate-bounce">👻</div>
        </div>
        <div className="text-orange-500 text-2xl animate-pulse z-10 font-bold tracking-wider">
          Loading the spirits... 👻🎃
        </div>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-orange-950 flex items-center justify-center relative overflow-hidden">
        {/* Floating spooky elements */}
        <div className="absolute top-10 left-10 text-6xl animate-bounce opacity-30">🦇</div>
        <div className="absolute top-20 right-20 text-6xl animate-pulse opacity-30">🕷️</div>
        <div className="absolute bottom-20 left-20 text-6xl animate-bounce opacity-30 animation-delay-500">🕸️</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-pulse opacity-30 animation-delay-1000">☠️</div>
        
        <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-lg shadow-2xl shadow-orange-500/50 border-2 border-orange-500 relative z-10 animate-pulse">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-6xl animate-bounce">👻</div>
          <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 animate-pulse">
            🎃 Choose Your Fate 🎃
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPlayer(1)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 border-2 border-purple-400 shadow-lg shadow-purple-500/50 transform hover:scale-110 transition-all duration-300 font-bold text-lg"
            >
              👻 Player 1<br/><span className="text-sm">The Ghost</span>
            </button>
            <button
              onClick={() => setCurrentPlayer(2)}
              className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-800 text-white rounded-lg hover:from-orange-700 hover:to-orange-900 border-2 border-orange-400 shadow-lg shadow-orange-500/50 transform hover:scale-110 transition-all duration-300 font-bold text-lg"
            >
              🎃 Player 2<br/><span className="text-sm">The Pumpkin</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-orange-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 animate-bounce text-7xl opacity-20">🕷️</div>
        <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-lg shadow-2xl shadow-orange-500/50 border-2 border-orange-500 relative z-10">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-7xl">☠️</div>
          <h1 className="text-2xl font-bold mb-6 text-orange-500 text-center">🕷️ The Cards Await... 🕷️</h1>
          <button
            onClick={startNewGame}
            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/50 border-2 border-orange-400 transform hover:scale-110 transition-all duration-300 font-bold text-lg"
          >
            🎃 Summon New Game 🎃
          </button>
        </div>
      </div>
    );
  }

  const player = gameState[`player${currentPlayer}`];
  const opponent = gameState[`player${currentPlayer === 1 ? 2 : 1}`];
  const isMyTurn = gameState.currentTurn === currentPlayer;
  
  // Calculate minimum raise (double the last raise amount)
  const minRaise = gameState.lastRaiseAmount * 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-orange-950 p-8 relative overflow-hidden">
      {/* Floating spooky background elements */}
      <div className="absolute top-10 left-10 text-5xl animate-bounce opacity-10">🦇</div>
      <div className="absolute top-40 right-20 text-5xl animate-pulse opacity-10 animation-delay-500">🕷️</div>
      <div className="absolute bottom-40 left-32 text-5xl animate-bounce opacity-10 animation-delay-1000">👻</div>
      <div className="absolute bottom-20 right-32 text-5xl animate-pulse opacity-10">🕸️</div>
      <div className="absolute top-1/2 left-5 text-4xl animate-bounce opacity-10 animation-delay-700">☠️</div>
      <div className="absolute top-1/3 right-10 text-4xl animate-pulse opacity-10 animation-delay-300">🦇</div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-6 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-5xl animate-bounce">🦇</div>
          <h1 className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 drop-shadow-lg animate-pulse">
            🎃 HALLOWEEN HOLD'EM 🎃
          </h1>
          <div className="bg-gradient-to-r from-purple-900/50 to-orange-900/50 rounded-lg p-3 border-2 border-orange-500 shadow-lg shadow-orange-500/30 inline-block">
            <p className="text-xl text-orange-400 font-bold">You are Player {currentPlayer} {currentPlayer === 1 ? '👻' : '🎃'}</p>
            <p className="text-sm mt-1 text-purple-300">🕸️ Round: <span className="text-orange-400 font-bold">{gameState.round}</span> | 💀 Pot: <span className="text-orange-400 font-bold">${gameState.pot}</span> 💰</p>
            {gameState.lastAction && <p className="text-sm text-orange-300 mt-1">⚡ Last action: <span className="font-bold">{gameState.lastAction}</span></p>}
          </div>
        </div>

        {/* Opponent */}
        <div className="bg-gradient-to-br from-purple-900/70 to-black/70 p-6 rounded-lg mb-6 border-2 border-purple-500 shadow-xl shadow-purple-500/40 backdrop-blur-sm relative transform hover:scale-[1.02] transition-transform">
          <div className="absolute -top-3 -right-3 text-4xl animate-spin-slow">🕷️</div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-orange-400 text-2xl font-bold flex items-center gap-2">
              Player {currentPlayer === 1 ? 2 : 1} {currentPlayer === 1 ? '🎃' : '👻'} 
              {!isMyTurn && <span className="text-lg text-green-400 animate-pulse">⚡ TURN</span>}
            </h2>
            <div className="text-orange-300 bg-black/50 px-4 py-2 rounded-lg border border-orange-500">
              <span className="font-bold text-xl">${opponent.chips} 💰</span>
              {opponent.bet > 0 && <span className="ml-4 text-purple-300">Bet: <span className="text-orange-400 font-bold">${opponent.bet}</span></span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Card hidden={true} />
            <Card hidden={true} />
          </div>
          {opponent.folded && <p className="text-red-400 mt-2 font-bold text-xl animate-pulse">☠️ FOLDED ☠️</p>}
        </div>

        {/* Community Cards */}
        <div className="bg-gradient-to-br from-orange-900/70 to-black/70 p-6 rounded-lg mb-6 border-2 border-orange-500 shadow-xl shadow-orange-500/40 backdrop-blur-sm relative transform hover:scale-[1.02] transition-transform">
          <div className="absolute -top-3 -left-3 text-4xl animate-bounce">🦇</div>
          <div className="absolute -top-3 -right-3 text-4xl animate-bounce animation-delay-500">🦇</div>
          <h3 className="text-orange-400 text-2xl mb-4 text-center font-bold">🕷️ THE CURSED CARDS 🕷️</h3>
          <div className="flex gap-3 justify-center">
            {gameState.communityCards.slice(0, gameState.revealedCards).map((card, i) => (
              <Card key={i} rank={card.rank} suit={card.suit} />
            ))}
            {[...Array(5 - gameState.revealedCards)].map((_, i) => (
              <Card key={`hidden-${i}`} hidden={true} />
            ))}
          </div>
        </div>

        {/* Current Player */}
        <div className="bg-gradient-to-br from-purple-900/70 to-black/70 p-6 rounded-lg mb-6 border-2 border-purple-500 shadow-xl shadow-purple-500/40 backdrop-blur-sm relative transform hover:scale-[1.02] transition-transform">
          <div className="absolute -bottom-3 -left-3 text-4xl animate-pulse">☠️</div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-orange-400 text-2xl font-bold flex items-center gap-2">
              🦇 Your Haunted Hand 🦇
              {isMyTurn && <span className="text-lg text-green-400 animate-pulse">⚡ YOUR TURN</span>}
            </h2>
            <div className="text-orange-300 bg-black/50 px-4 py-2 rounded-lg border border-orange-500">
              <span className="font-bold text-xl">${player.chips} 💰</span>
              {player.bet > 0 && <span className="ml-4 text-purple-300">Bet: <span className="text-orange-400 font-bold">${player.bet}</span></span>}
            </div>
          </div>
          <div className="flex gap-2">
            {player.hand.map((card, i) => (
              <Card key={i} rank={card.rank} suit={card.suit} />
            ))}
          </div>
          {player.folded && <p className="text-red-400 mt-2 font-bold text-xl animate-pulse">☠️ FOLDED ☠️</p>}
        </div>

        {/* Actions */}
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-6 rounded-lg border-2 border-orange-500 shadow-xl shadow-orange-500/40 backdrop-blur-sm relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-5xl animate-bounce">🎃</div>
          {isMyTurn && !player.folded ? (
            <div>
              <h3 className="text-center text-orange-400 text-xl font-bold mb-4">⚡ MAKE YOUR MOVE ⚡</h3>
              <div className="flex gap-3 flex-wrap justify-center mb-6">
                <button
                  onClick={() => handleAction('fold')}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 shadow-lg shadow-red-500/50 border-2 border-red-400 transform hover:scale-110 transition-all duration-300 font-bold text-lg"
                >
                  💀 FOLD 💀
                </button>
                <button
                  onClick={() => handleAction('check')}
                  className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg hover:from-gray-700 hover:to-gray-900 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-gray-500/50 border-2 border-gray-400 transform hover:scale-110 transition-all duration-300 font-bold text-lg disabled:transform-none"
                  disabled={player.bet !== opponent.bet}
                >
                  👻 CHECK 👻
                </button>
                <button
                  onClick={() => handleAction('call')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50 border-2 border-purple-400 transform hover:scale-110 transition-all duration-300 font-bold text-lg disabled:transform-none"
                  disabled={player.bet >= opponent.bet}
                >
                  🕷️ CALL ${Math.max(0, opponent.bet - player.bet)} 🕷️
                </button>
                <button
                  onClick={() => {
                    const amount = Math.max(minRaise, raiseAmount);
                    if (raiseAmount < minRaise) {
                      alert(`Minimum raise is $${minRaise}!`);
                      return;
                    }
                    handleAction('raise', amount);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-800 text-white rounded-lg hover:from-orange-700 hover:to-orange-900 shadow-lg shadow-orange-500/50 border-2 border-orange-400 transform hover:scale-110 transition-all duration-300 font-bold text-lg animate-pulse"
                >
                  🎃 RAISE ${raiseAmount} 🎃
                </button>
              </div>
              
              {/* Raise amount input */}
              {/* Raise amount input */}
              {/* Raise amount input */}
              <div className="flex items-center justify-center gap-3 bg-black/50 p-4 rounded-lg border border-orange-500">
                <label className="text-orange-400 font-bold text-lg">💰 Raise amount:</label>
                <input
                  type="text"
                  value={raiseAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === '-') {
                      setRaiseAmount('');
                    } else {
                      const num = parseInt(val);
                      if (!isNaN(num)) {
                        setRaiseAmount(num);
                      }
                    }
                  }}
                  placeholder={`Min: ${minRaise}`}
                  className="border-2 border-orange-500 rounded-lg px-4 py-3 w-32 bg-gray-900 text-orange-400 font-bold text-xl focus:outline-none focus:border-orange-400 focus:shadow-lg focus:shadow-orange-500/50"
                />
                <span className="text-purple-400 text-sm font-bold">(min: ${minRaise})</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-orange-400 text-2xl font-bold py-8 animate-pulse">
              {player.folded ? '☠️ YOU HAVE BEEN DEFEATED ☠️' : '👻 THE SPIRITS ARE THINKING... 👻'}
            </p>
          )}
          
          <button
            onClick={startNewGame}
            className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/50 border-2 border-orange-400 transform hover:scale-105 transition-all duration-300 font-bold text-xl"
          >
            🎃 SUMMON NEW GAME 🎃
          </button>
        </div>
      </div>
    </div>
  );
};

export default PokerGame;
