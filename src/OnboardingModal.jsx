import React from 'react';
import { Wallet, Flame, Check, ExternalLink } from 'lucide-react';

export const OnboardingModal = ({ 
  showOnboarding, 
  setShowOnboarding, 
  onboardingStep, 
  setOnboardingStep, 
  connectWallet,
  walletAddress 
}) => {
  if (!showOnboarding) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <div className="relative max-w-2xl w-full mx-6">
        {/* Close button */}
        <button
          onClick={() => setShowOnboarding(false)}
          className="absolute -top-4 -right-4 w-12 h-12 bg-orange-600 hover:bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all hover:scale-110 shadow-xl z-10"
        >
          ✕
        </button>

        <div className="bg-gradient-to-br from-orange-950/80 via-red-950/80 to-purple-950/80 border-2 border-orange-500/50 rounded-3xl p-10 shadow-2xl shadow-orange-500/30">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-1/4 h-2 mx-1 rounded-full transition-all duration-500 ${
                    step <= onboardingStep
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 0: Welcome */}
          {onboardingStep === 0 && (
            <div className="text-center">
              <div className="text-7xl mb-6 animate-bounce">👻</div>
              <h2 className="text-4xl font-black text-white mb-4">
                Welcome to <span className="text-orange-400">Spooky Games</span>
              </h2>
              <p className="text-orange-200 text-lg mb-8 leading-relaxed">
                The first haunted Web3 gaming platform powered by Stellar blockchain.
                Earn cursed tokens, collect spooky NFTs, and rule the underworld!
              </p>
              <button
                onClick={() => setOnboardingStep(1)}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all hover:scale-105"
              >
                Let's Get Started 🎃
              </button>
            </div>
          )}

          {/* Step 1: About */}
          {onboardingStep === 1 && (
            <div>
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Flame className="text-orange-500" />
                What is Spooky Games?
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 bg-black/40 p-4 rounded-xl border border-orange-500/30 hover:border-orange-500/60 transition-all">
                  <div className="text-3xl">🎮</div>
                  <div>
                    <h3 className="font-bold text-orange-300 mb-1">Play Halloween Games</h3>
                    <p className="text-orange-100/80">
                      Explore horror-themed games built on blockchain technology
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-black/40 p-4 rounded-xl border border-orange-500/30 hover:border-orange-500/60 transition-all">
                  <div className="text-3xl">💰</div>
                  <div>
                    <h3 className="font-bold text-orange-300 mb-1">Earn Real Rewards</h3>
                    <p className="text-orange-100/80">
                      Get paid in XLM (Stellar Lumens) for playing and winning
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-black/40 p-4 rounded-xl border border-orange-500/30 hover:border-orange-500/60 transition-all">
                  <div className="text-3xl">🖼️</div>
                  <div>
                    <h3 className="font-bold text-orange-300 mb-1">Own NFT Assets</h3>
                    <p className="text-orange-100/80">
                      Collect and trade unique cursed NFTs and in-game items
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOnboardingStep(2)}
                className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all"
              >
                Next: Connect Your Wallet →
              </button>
            </div>
          )}

          {/* Step 2: Wallet Instructions */}
          {onboardingStep === 2 && (
            <div>
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Wallet className="text-orange-500" />
                Connect Freighter Wallet
              </h2>
              <div className="bg-black/40 p-6 rounded-xl border border-orange-500/30 mb-6">
                <p className="text-orange-200 mb-4 leading-relaxed">
                  To play and earn, you'll need a Stellar wallet. We recommend <strong className="text-orange-400">Freighter</strong>,
                  a secure browser extension wallet.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      1
                    </div>
                    <p className="text-orange-100">Install Freighter extension from the Chrome Web Store</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      2
                    </div>
                    <p className="text-orange-100">Create a new wallet or import an existing one</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      3
                    </div>
                    <p className="text-orange-100">Click the button below to connect</p>
                  </div>
                </div>
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all"
                >
                  Get Freighter <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <button
                onClick={connectWallet}
                className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Connect Freighter Wallet
              </button>
            </div>
          )}

          {/* Step 3: Success */}
          {onboardingStep === 3 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-black text-white mb-4">
                You're All Set! 🎉
              </h2>
              <p className="text-orange-200 text-lg mb-2">
                Wallet connected successfully!
              </p>
              <p className="text-orange-400/80 text-sm mb-8 font-mono break-all px-4">
                {walletAddress.slice(0, 12)}...{walletAddress.slice(-12)}
              </p>
              <p className="text-orange-100 mb-6">
                You can now explore haunted games, earn XLM rewards, and collect cursed NFTs!
              </p>
              <div className="text-5xl mb-4 animate-pulse">🎃👻💀</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
