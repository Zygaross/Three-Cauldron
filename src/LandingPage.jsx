import React, { useState, useEffect } from 'react';
import { Skull, Flame, ChevronDown } from 'lucide-react';

export const LandingPage = ({ onGetStarted, walletConnected, scrollToGames }) => {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide scroll wheel when scrolled more than 100px from top
      setIsAtTop(window.scrollY < 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Massive spooky title */}
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="landing-title mb-8">
          {/* Floating skull */}
          <div className="inline-block mb-8 animate-levitate">
            <div className="relative">
              <div className="text-9xl">💀</div>
              <div className="absolute inset-0 blur-2xl bg-orange-500/30 animate-pulse"></div>
            </div>
          </div>

          <h1 className="text-7xl md:text-9xl font-black mb-6 leading-none">
            <span className="block text-white drop-shadow-2xl mb-4">THREE</span>
            <span className="block bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 text-transparent bg-clip-text drop-shadow-2xl">
              CAULDRON
            </span>
          </h1>
        </div>

        <p className="landing-subtitle text-2xl md:text-3xl text-orange-200 mb-12 max-w-3xl mx-auto font-medium">
          Enter the <span className="text-orange-400 font-bold">mystical realm</span> of Web3 gaming.
          <br />
          Earn crypto. Collect NFTs. <span className="text-red-400 font-bold">Master the magic</span>.
        </p>

        {/* CTA Button or Scroll Indicator */}
        {!walletConnected ? (
          <div className="landing-cta">
            <button
              onClick={onGetStarted}
              className="group relative px-12 py-6 bg-gradient-to-r from-orange-600 via-red-600 to-red-700 text-white font-black text-2xl rounded-2xl hover:shadow-2xl hover:shadow-orange-500/60 transition-all transform hover:scale-110 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-300/30 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <span className="relative flex items-center gap-3">
                🎃 Get Started
                <Flame className="w-6 h-6 animate-pulse" />
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
            </button>
          </div>
        ) : (
          <div className={`fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-300 ${isAtTop ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button
              onClick={scrollToGames}
              className="group flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="w-10 h-16 border-4 border-orange-500 rounded-full flex items-center justify-center relative overflow-hidden hover:border-orange-400 transition-colors shadow-lg shadow-orange-500/50">
                {/* Scroll wheel dot */}
                <div className="w-2 h-3 bg-orange-500 rounded-full animate-scroll-down"></div>
              </div>
            </button>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 text-6xl opacity-20" style={{animation: 'floatSway 7.3s ease-in-out infinite', animationDelay: '0.4s'}}>
          🦇
        </div>
        <div className="absolute top-1/3 right-20 text-5xl opacity-15" style={{animation: 'spinFloat 8.7s ease-in-out infinite', animationDelay: '2.1s'}}>
          👻
        </div>
        <div className="absolute bottom-1/4 left-1/4 text-7xl opacity-10" style={{animation: 'bob 6.2s ease-in-out infinite', animationDelay: '3.8s'}}>
          🎃
        </div>
        <div className="absolute bottom-1/3 right-1/4 text-6xl opacity-15" style={{animation: 'spinFloat 9.1s ease-in-out infinite', animationDelay: '5.3s'}}>
          🕷️
        </div>
      </div>
    </div>
  );
};
