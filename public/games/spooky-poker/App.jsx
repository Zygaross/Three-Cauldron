import React, { useState, useEffect } from 'react';
import { Heart, Diamond, Club, Spade } from 'lucide-react';
import {
  Contract,
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Address,
  xdr,
} from "@stellar/stellar-sdk";
import {
  signTransaction,
  requestAccess,
} from "@stellar/freighter-api";

const NETWORK_PASSPHRASE = Networks.TESTNET;
const RPC_URL = "https://soroban-testnet.stellar.org";
const CONTRACT_ID = "CDGHL3D7A3LIZRPMWNCQGLID2IDADH74FDKPTHBOS4TI22XLN5VZTZEA";
const ESCROW_ADDRESS = "GD6EAGRBKKRQ3T5Q3NDNWJZYEPOCZFM2UNKXHC7Z3G2BIJ2MMJT3HOGR"; // Replace with actual escrow wallet
const BUY_IN = 1000; // 1000 MTK tokens

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const SuitIcon = ({ suit }) => {
  const color = suit === 'hearts' || suit === 'diamonds' ? 'text-orange-500' : 'text-purple-400';
  const icons = {
    hearts: <Heart className={w-4 h-4 ${color} fill-current} />,
    diamonds: <Diamond className={w-4 h-4 ${color} fill-current} />,
    clubs: <Club className={w-4 h-4 ${color} fill-current} />,
    spades: <Spade className={w-4 h-4 ${color} fill-current} />
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
  
  const uniqueRanks = [...new Set(ranks.map(r => rankValues[r]))].sort((a, b) => b - a);
  let isStraight = false;
  if (uniqueRanks.length === 5) {
    isStraight = uniqueRanks[0] - uniqueRanks[4] === 4;
    if (!isStraight && uniqueRanks[0] === 14) {
      isStraight = uniqueRanks[1] === 5 && uniqueRanks[2] === 4 && uniqueRanks[3] === 3 && uniqueRanks[4] === 2;
    }
  }
  
  if (isFlush && isStraight && uniqueRanks[0] === 14 && uniqueRanks[4] === 10) {
    return { score: 10, name: 'Royal Flush' };
  }
  if (isFlush && isStraight) {
    return { score: 9, name: 'Straight Flush', high: uniqueRanks[0] };
  }
  if (counts[0] === 4) {
    return { score: 8, name: 'Four of a Kind' };
  }
  if (counts[0] === 3 && counts[1] === 2) {
    return { score: 7, name: 'Full House' };
  }
  if (isFlush) {
    return { score: 6, name: 'Flush', high: uniqueRanks[0] };
  }
  if (isStraight) {
    return { score: 5, name: 'Straight', high: uniqueRanks[0] };
  }
  if (counts[0] === 3) {
    return { score: 4, name: 'Three of a Kind' };
  }
  if (counts[0] === 2 && counts[1] === 2) {
    return { score: 3, name: 'Two Pair' };
  }
  if (counts[0] === 2) {
    return { score: 2, name: 'One Pair' };
  }
  return { score: 1, name: 'High Card', high: uniqueRanks[0] };
};

const getBestHand = (holeCards, communityCards) => {
  const allCards = [...holeCards, ...communityCards];
  let bestHand = null;
  
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
  const [player1Address, setPlayer1Address] = useState(null);
  const [player2Address, setPlayer2Address] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(10);
  const [status, setStatus] = useState('');

  // Transfer MTK tokens using the contract
  const transferMTK = async (fromAddress, toAddress, amount) => {
    try {
      setLoading(true);
      setStatus(Transferring ${amount} MTK tokens...);

      const server = new rpc.Server(RPC_URL, { allowHttp: true });
      const account = await server.getAccount(fromAddress);
      const contract = new Contract(CONTRACT_ID);

      const fromAddr = new Address(fromAddress);
      const toAddr = new Address(toAddress);
      const amountScVal = xdr.ScVal.scvI128(
        new xdr.Int128Parts({
          lo: xdr.Uint64.fromString(String(amount)),
          hi: xdr.Int64.fromString("0")
        })
      );

      let tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
      .addOperation(
        contract.call(
          "transfer",
          fromAddr.toScVal(),
          toAddr.toScVal(),
          amountScVal
        )
      )
      .setTimeout(30)
      .build();

      tx = await server.prepareTransaction(tx);

      const signedXdr = await signTransaction(tx.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      const signedTx = TransactionBuilder.fromXDR(
        signedXdr.signedTxXdr,
        NETWORK_PASSPHRASE
      );

      const sendResp = await server.sendTransaction(signedTx);
      
      let txResponse = await server.getTransaction(sendResp.hash);
      while (txResponse.status === "NOT_FOUND") {
        await new Promise((r) => setTimeout(r, 2000));
        txResponse = await server.getTransaction(sendResp.hash);
      }

      if (txResponse.status === "SUCCESS") {
        setStatus(Successfully transferred ${amount} MTK!);
        setLoading(false);
        return true;
      } else {
        setStatus("Transfer failed!");
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error("Transfer error:", err);
      setStatus("Error: " + err.message);
      setLoading(false);
      return false;
    }
  };

  const initializeGame = () => {
    const deck = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ rank, suit });
      }
    }
    
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
      lastRaiseAmount: 10,
      escrowAmount: BUY_IN * 2 // Track total in escrow
    };
  };

  const connectWallet = async (playerNum) => {
    try {
      const accessObj = await requestAccess();
      if (accessObj.error) {
        alert("Error connecting wallet: " + accessObj.error);
        return null;
      }
      return accessObj.address;
    } catch (err) {
      alert("Error: " + err.message);
      return null;
    }
  };

  const startNewGame = async () => {
    // Connect both players' wallets
    setStatus("Player 1: Connect your Freighter wallet...");
    const p1Addr = await connectWallet(1);
    if (!p1Addr) return;
    setPlayer1Address(p1Addr);

    setStatus("Player 2: Connect your Freighter wallet...");
    const p2Addr = await connectWallet(2);
    if (!p2Addr) return;
    setPlayer2Address(p2Addr);

    // Transfer buy-in from Player 1 to escrow
    setStatus(Player 1: Approve ${BUY_IN} MTK transfer to escrow...);
    const p1Transfer = await transferMTK(p1Addr, ESCROW_ADDRESS, BUY_IN);
    if (!p1Transfer) {
      alert("Player 1 failed to transfer buy-in!");
      return;
    }

    // Transfer buy-in from Player 2 to escrow
    setStatus(Player 2: Approve ${BUY_IN} MTK transfer to escrow...);
    const p2Transfer = await transferMTK(p2Addr, ESCROW_ADDRESS, BUY_IN);
    if (!p2Transfer) {
      alert("Player 2 failed to transfer buy-in!");
      return;
    }

    // Start the game
    const newGame = initializeGame();
    setGameState(newGame);
    setCurrentPlayer(1);
    setRaiseAmount(10);
    setStatus("Game started! Both players deposited 1000 MTK to escrow.");
  };

  const payoutWinner = async (winnerNum) => {
    const winnerAddress = winnerNum === 1 ? player1Address : player2Address;
    const totalPot = gameState.escrowAmount;

    setStatus(Transferring ${totalPot} MTK to Player ${winnerNum}...);
    
    // Transfer from escrow to winner
    // Note: This requires the escrow wallet to sign the transaction
    // In a real implementation, you'd need a server-side component or multisig
    alert(Player ${winnerNum} wins ${totalPot} MTK! (Payout would happen here with proper escrow setup));
  };

  const advanceRound = (newState) => {
    newState.player1.bet = 0;
    newState.player2.bet = 0;
    newState.player1.totalBetThisRound = 0;
    newState.player2.totalBetThisRound = 0;
    newState.actionsThisRound = 0;
    newState.lastAction = null;
    newState.currentTurn = 1;
    newState.lastRaiseAmount = 10;
    
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
      // Showdown - determine winner and payout
      const p1Hand = getBestHand(newState.player1.hand, newState.communityCards.slice(0, 5));
      const p2Hand = getBestHand(newState.player2.hand, newState.communityCards.slice(0, 5));
      
      let winner = null;
      if (p1Hand.score > p2Hand.score) {
        winner = 1;
      } else if (p2Hand.score > p1Hand.score) {
        winner = 2;
      } else {
        alert(It's a tie! Both players have ${p1Hand.name}. Pot split!);
        // In a real implementation, split the escrow between both players
        return;
      }
      
      if (winner) {
        alert(Player ${winner} wins with ${winner === 1 ? p1Hand.name : p2Hand.name}!\nPlayer 1: ${p1Hand.name}\nPlayer 2: ${p2Hand.name});
        payoutWinner(winner);
      }
    }
  };

  const handleAction = (action, amount = 0) => {
    if (!gameState || gameState.currentTurn !== currentPlayer) return;
    
    const newState = { ...gameState };
    const player = newState[player${currentPlayer}];
    const otherPlayer = newState[player${currentPlayer === 1 ? 2 : 1}];
    
    if (action === 'fold') {
      player.folded = true;
      const winner = currentPlayer === 1 ? 2 : 1;
      alert(Player ${currentPlayer} folded! Player ${winner} wins!);
      payoutWinner(winner);
      return;
    }
    
    if (action === 'check') {
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
        newState.lastRaiseAmount = 10;
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
        newState.actionsThisRound = 1;
        newState.lastRaiseAmount = amount;
      } else {
        alert('Not enough chips to raise!');
        return;
      }
    }
    
    const bothPlayersActed = newState.actionsThisRound >= 2;
    const betsAreEqual = player.bet === otherPlayer.bet;
    
    if (bothPlayersActed && betsAreEqual) {
      advanceRound(newState);
    } else {
      newState.currentTurn = currentPlayer === 1 ? 2 : 1;
    }
    
    setGameState(newState);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-orange-950 flex items-center justify-center">
        <div className="text-orange-500 text-2xl animate-pulse font-bold">
          {status || "Processing..."}
        </div>
      </div>
    );
  }

  if (!currentPlayer || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-orange-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl animate-bounce opacity-30">🦇</div>
        <div className="absolute top-20 right-20 text-6xl animate-pulse opacity-30">🕷️</div>
        
        <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-lg shadow-2xl shadow-orange-500/50 border-2 border-orange-500 relative z-10">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-7xl">☠️</div>
          <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-purple-500">
            🎃 MTK Poker - {BUY_IN} MTK Buy-in 🎃
          </h1>
          {status && <p className="text-orange-400 text-center mb-4">{status}</p>}
          <button
            onClick={startNewGame}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/50 border-2 border-orange-400 transform hover:scale-110 transition-all duration-300 font-bold text-lg disabled:opacity-50"
          >
            🎃 Start Game (Both Players Connect) 🎃
          </button>
        </div>
      </div>
    );
  }

  const player = gameState[player${currentPlayer}];
  const opponent = gameState[player${currentPlayer === 1 ? 2 : 1}];
  const isMyTurn = gameState.currentTurn === currentPlayer;
  const minRaise = gameState.lastRaiseAmount * 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-orange-950 p-8 relative overflow-hidden">
      <div className="absolute top-10 left-10 text-5xl animate-bounce opacity-10">🦇</div>
      <div className="absolute top-40 right-20 text-5xl animate-pulse opacity-10 animation-delay-500">🕷️</div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-6 relative">
          <h1 className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 drop-shadow-lg animate-pulse">
            🎃 HALLOWEEN HOLD'EM 🎃
          </h1>
          <div className="bg-gradient-to-r from-purple-900/50 to-orange-900/50 rounded-lg p-3 border-2 border-orange-500 shadow-lg shadow-orange-500/30 inline-block">
            <p className="text-xl text-orange-400 font-bold">You are Player {currentPlayer} {currentPlayer === 1 ? '👻' : '🎃'}</p>
            <p className="text-sm mt-1 text-purple-300">🕸️ Round: <span className="text-orange-400 font-bold">{gameState.round}</span> | 💀 Pot: <span className="text-orange-400 font-bold">${gameState.pot}</span> 💰</p>
            <p className="text-sm text-green-400">🎰 Escrow: <span className="font-bold">{gameState.escrowAmount} MTK</span></p>
            {gameState.lastAction && <p className="text-sm text-orange-300 mt-1">⚡ Last action: <span className="font-bold">{gameState.lastAction}</span></p>}
          </div>
        </div>

        {/* Opponent */}
        <div className="bg-gradient-to-br from-purple-900/70 to-black/70 p-6 rounded-lg mb-6 border-2 border-purple-500 shadow-xl shadow-purple-500/40 backdrop-blur-sm relative">
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
        </div>

        {/* Community Cards */}
        <div className="bg-gradient-to-br from-orange-900/70 to-black/70 p-6 rounded-lg mb-6 border-2 border-orange-500 shadow-xl shadow-orange-500/40 backdrop-blur-sm relative">
          <h3 className="text-orange-400 text-2xl mb-4 text-center font-bold">🕷️ THE CURSED CARDS 🕷️</h3>
          <div className="flex gap-3 justify-center">
            {gameState.communityCards.slice(0, gameState.revealedCards).map((card, i) => (
              <Card key={i} rank={card.rank} suit={card.suit} />
            ))}
            {[...Array(5 - gameState.revealedCards)].map((_, i) => (
              <Card key={hidden-${i}} hidden={true} />
            ))}
          </div>
        </div>

        {/* Current Player */}
        <div className="bg-gradient-to-br from-purple-900/70 to-black/70 p-6 rounded-lg mb-6 border-2 border-purple-500 shadow-xl shadow-purple-500/40 backdrop-blur-sm relative">
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
        </div>

        {/* Actions */}
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-6 rounded-lg border-2 border-orange-500 shadow-xl shadow-orange-500/40 backdrop-blur-sm relative">
          {isMyTurn && !player.folded ? (
            <div>
              <h3 className="text-center text-orange-400 text-xl font-bold mb-4">⚡ MAKE YOUR MOVE ⚡</h3>
              <div className="flex gap-3 flex-wrap justify-center mb-6">
                <button
                  onClick={() => handleAction('fold')}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 shadow-lg shadow-red-500/50 border-2 border-red-400 font-bold text-lg"
                >
                  💀 FOLD 💀
                </button>
                <button
                  onClick={() => handleAction('check')}
                  className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg hover:from-gray-700 hover:to-gray-900 disabled:opacity-30 shadow-lg shadow-gray-500/50 border-2 border-gray-400 font-bold text-lg"
                  disabled={player.bet !== opponent.bet}
                >
                  👻 CHECK 👻
                </button>
                <button
                  onClick={() => handleAction('call')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 disabled:opacity-30 shadow-lg shadow-purple-500/50 border-2 border-purple-400 font-bold text-lg"
                  disabled={player.bet >= opponent.bet}
                >
                  🕷️ CALL ${Math.max(0, opponent.bet - player.bet)} 🕷️
                </button>
                <button
                  onClick={() => {
                    if (raiseAmount < minRaise) {
                      alert(Minimum raise is $${minRaise}!);
                      return;
                    }
                    handleAction('raise', raiseAmount);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-800 text-white rounded-lg hover:from-orange-700 hover:to-orange-900 shadow-lg shadow-orange-500/50 border-2 border-orange-400 font-bold text-lg"
                >
                  🎃 RAISE ${raiseAmount} 🎃
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-3 bg-black/50 p-4 rounded-lg border border-orange-500">
                <label className="text-orange-400 font-bold text-lg">💰 Raise amount:</label>
                <input
                  type="number"
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(parseInt(e.target.value) || 0)}
                  className="border-2 border-orange-500 rounded-lg px-4 py-3 w-32 bg-gray-900 text-orange-400 font-bold text-xl"
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
            className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/50 border-2 border-orange-400 font-bold text-xl"
          >
            🎃 SUMMON NEW GAME 🎃
          </button>
        </div>
      </div>
    </div>
  );
};

export default PokerGame;