import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Wallet, TrendingUp, Star, Users, Skull, Flame, Zap, Menu, X, LogOut, Coins, Filter, ChevronDown, Edit2, Check } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { isAllowed, getAddress, requestAccess } from '@stellar/freighter-api';
import { LandingPage } from './LandingPage';
import { OnboardingModal } from './OnboardingModal';
import { WalletDiagnostics } from './WalletDiagnostics';
import { usernameNFT } from './stellar-sdk';
import { featuredGames } from './gamesData';
import { ContractTester } from './ContractTester';
import { GamePayoutDemo } from './components/GamePayoutDemo';
import BuyMTK from './components/BuyMTK';
import { getAllGames } from './utils/gamesLoader';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [isLoadingUsername, setIsLoadingUsername] = useState(false);
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [allGames, setAllGames] = useState(featuredGames); // State for dynamically loaded games
  const gamesPerPage = 9;
  
  const mainContentRef = useRef(null);
  const gamesGridRef = useRef(null);
  const accountMenuRef = useRef(null);
  // Using usernameNFT from stellar-sdk

  // Load games from manifest on mount
  useEffect(() => {
    getAllGames(featuredGames).then(games => {
      setAllGames(games);
    });
  }, []);

  const stats = [
    { icon: Users, label: "Active Players", value: "2.4M+", color: "from-orange-500 to-red-600" },
    { icon: Gamepad2, label: "Three Cauldron Games", value: "450+", color: "from-purple-500 to-pink-600" },
    { icon: TrendingUp, label: "Total Rewards", value: "1.2M XLM", color: "from-green-500 to-emerald-600" },
    { icon: Skull, label: "Magic NFTs", value: "666", color: "from-red-500 to-orange-600" }
  ];

  // Get unique categories for filter
  const categories = ['All', ...new Set(allGames.map(game => game.category))];

  // Filter and sort games
  const getFilteredAndSortedGames = () => {
    let filtered = allGames;
    
    // Apply category filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(game => game.category === filterCategory);
    }
    
    // Apply sorting
    let sorted = [...filtered];
    switch (sortBy) {
      case 'players-high':
        sorted.sort((a, b) => parseFloat(b.players) - parseFloat(a.players));
        break;
      case 'players-low':
        sorted.sort((a, b) => parseFloat(a.players) - parseFloat(b.players));
        break;
      case 'earnings-high':
        sorted.sort((a, b) => parseFloat(b.earnings) - parseFloat(a.earnings));
        break;
      case 'earnings-low':
        sorted.sort((a, b) => parseFloat(a.earnings) - parseFloat(a.earnings));
        break;
      case 'rating-high':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      default:
        // Keep default order
        break;
    }
    
    return sorted;
  };

  // Pagination logic
  const filteredGames = getFilteredAndSortedGames();
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to games section when changing pages
    if (gamesGridRef.current) {
      gamesGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, sortBy]);

  useEffect(() => {
    // Always scroll to top on page load
    window.scrollTo(0, 0);
    
    checkWalletConnection();
    console.log('Featured games count:', featuredGames.length);
  }, []);

  // GSAP Animations for stat cards and game cards
  useEffect(() => {
    // Animate stat cards on scroll
    gsap.fromTo('.stat-card',
      { 
        opacity: 0,
        y: 50,
        scale: 0.8
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.stats-container',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animate game cards
    gsap.fromTo('.game-card',
      {
        opacity: 0,
        y: 30,
        rotateX: -15
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.games-grid',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animate icons with parallax effect
    gsap.to('.floating-icon', {
      y: '+=30',
      rotation: '+=10',
      duration: 3,
      ease: 'sine.inOut',
      stagger: 0.2,
      repeat: -1,
      yoyo: true
    });

  }, [currentGames]); // Re-run when games change (pagination)


  // Load username from blockchain when wallet connects
  useEffect(() => {
    if (walletAddress) {
      loadUsernameFromChain();
    }
  }, [walletAddress]);

  const loadUsernameFromChain = async () => {
    if (!walletAddress) return;
    
    setIsLoadingUsername(true);
    try {
      const fetchedUsername = await usernameNFT.getUsername(walletAddress);
      
      if (fetchedUsername) {
        setUsername(fetchedUsername);
        console.log('✅ Loaded username from blockchain:', fetchedUsername);
      } else {
        setUsername('');
      }
    } catch (error) {
      console.error('Failed to load username from blockchain:', error);
      setUsername('');
    } finally {
      setIsLoadingUsername(false);
    }
  };

  const saveUsername = async () => {
    if (!tempUsername.trim() || !walletAddress) {
      return;
    }

    setUsernameSaving(true);
    try {
      // Try to claim the username - let the contract handle validation
      console.log('Attempting to claim/change username:', tempUsername);
      
      // Check if user already has a username (just for UI feedback)
      const existingUsername = username; // Use local state instead of querying
      
      if (existingUsername) {
        // User is changing their username
        console.log('Changing username from', existingUsername, 'to', tempUsername);
        const result = await usernameNFT.changeUsername(tempUsername, walletAddress);
        
        if (result.success) {
          setUsername(result.username);
          setIsEditingUsername(false);
          setTempUsername('');
          alert(`✅ Username changed to "${result.username}"! Transaction: ${result.hash.substring(0, 8)}...`);
        }
      } else {
        // User is claiming their first username
        console.log('Claiming username:', tempUsername);
        const result = await usernameNFT.claimUsername(tempUsername, walletAddress);
        
        if (result.success) {
          setUsername(result.username);
          setIsEditingUsername(false);
          setTempUsername('');
          const hashMsg = result.hash ? ` Transaction: ${result.hash.substring(0, 8)}...` : '';
          alert(`✅ Username "${result.username}" claimed as NFT!${hashMsg}`);
        }
      }
    } catch (error) {
      console.error('Failed to save username:', error);
      
      // Better error messages based on common issues
      const errorMsg = error.message || error.toString();
      
      if (errorMsg.includes('already') || errorMsg.includes('taken') || errorMsg.includes('exists')) {
        alert('❌ Username already taken! Please choose another one.');
      } else if (errorMsg.includes('3-20') || errorMsg.includes('character')) {
        alert('❌ Gametag must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens.');
      } else if (errorMsg.includes('denied') || errorMsg.includes('rejected')) {
        alert('❌ Transaction rejected. Please try again.');
      } else {
        alert(`❌ Failed to save username. Please try again.\n\nError: ${errorMsg.substring(0, 100)}`);
      }
    } finally {
      setUsernameSaving(false);
    }
  };

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu]);

  const checkWalletConnection = async () => {
    try {
      // Give the extension time to inject
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if Freighter is installed and has permission
      const allowed = await isAllowed();
      if (allowed) {
        // If allowed, get the address (this means user has connected before)
        const { address, error } = await getAddress();
        if (!error && address) {
          setWalletConnected(true);
          setWalletAddress(address);
        }
      }
    } catch (error) {
      console.log('Wallet not connected yet:', error);
      // This is fine - user hasn't connected yet
    }
  };

  const connectWallet = async () => {
    try {
      // Request access first, then get the address
      await requestAccess();
      const { address, error } = await getAddress();
      
      if (error) {
        throw new Error(error);
      }
      
      setWalletConnected(true);
      setWalletAddress(address);
      setOnboardingStep(3);
      
      setTimeout(() => {
        setShowOnboarding(false);
      }, 3000);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // Parse the error to provide better feedback
      const errorMsg = error.message || error.toString();
      
      if (errorMsg.includes('User declined') || errorMsg.includes('User rejected')) {
        alert('Connection rejected. Please approve the connection request in Freighter to continue.');
      } else if (errorMsg.includes('not installed') || errorMsg.includes('No extension')) {
        const installNow = confirm(
          'Freighter wallet extension is not detected!\n\n' +
          'Click OK to open the Freighter website and install it.\n' +
          'After installation, please refresh this page.'
        );
        if (installNow) {
          window.open('https://www.freighter.app/', '_blank');
        }
      } else if (errorMsg.includes('locked')) {
        alert('Please unlock your Freighter wallet and try again.');
      } else {
        alert(`Error connecting to Freighter wallet: ${errorMsg}\n\nPlease make sure Freighter is installed and unlocked.`);
      }
    }
  };

  const handleGetStarted = () => {
    if (walletConnected) {
      scrollToGames();
    } else {
      setShowOnboarding(true);
      setOnboardingStep(0);
    }
  };

  const scrollToGames = () => {
    console.log('Scrolling to games, mainContentRef:', mainContentRef.current);
    if (mainContentRef.current) {
      gsap.to(window, {
        duration: 1.5,
        scrollTo: { y: mainContentRef.current },
        ease: 'power3.inOut',
      });
    } else {
      console.error('mainContentRef is not set!');
    }
  };

  useEffect(() => {
    // Disable game card animations - show immediately
    // gsap.from('.game-card', {
    //   scrollTrigger: {
    //     trigger: gamesGridRef.current,
    //     start: 'top 80%',
    //   },
    //   opacity: 0,
    //   y: 80,
    //   scale: 0.9,
    //   stagger: 0.12,
    //   duration: 0.9,
    //   ease: 'power3.out',
    // });
  }, []);

  return (
    <div className="min-h-screen bg-[#050608] relative">
      {/* Account Menu Header - Only show when wallet connected */}
      {walletConnected && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#050608]/80 backdrop-blur-md border-b border-orange-500/30">
          <div className="container mx-auto px-6 py-3 flex items-center justify-between max-w-7xl">
            <div className="flex items-center gap-2">
              <Skull className="w-6 h-6 text-orange-500" />
              <span className="text-white font-bold">Haunted Games</span>
            </div>
            
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600/20 border border-orange-500/40 hover:bg-orange-600/30 transition-colors"
            >
              <Wallet className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-semibold hidden md:block">
                {username || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
              </span>
              {showAccountMenu ? <X className="w-4 h-4 text-orange-400" /> : <Menu className="w-4 h-4 text-orange-400" />}
            </button>
          </div>
          
          {/* Account Dropdown Menu */}
          {showAccountMenu && (
            <div ref={accountMenuRef} className="absolute top-full right-6 mt-2 w-72 bg-black/95 border border-orange-500/40 rounded-lg shadow-2xl shadow-orange-500/20 overflow-hidden">
              <div className="p-4 border-b border-orange-500/30">
                <div className="text-xs text-orange-400/60 mb-1">
                  Gametag {username && <span className="text-green-400">✓ NFT</span>}
                </div>
                {isLoadingUsername ? (
                  <div className="text-white/60 text-sm">Loading from blockchain...</div>
                ) : isEditingUsername ? (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="text"
                        value={tempUsername}
                        onChange={(e) => {
                          // Only allow lowercase letters, numbers, underscores, and hyphens
                          const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                          setTempUsername(value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tempUsername.length >= 3 && !usernameSaving) {
                            saveUsername();
                          } else if (e.key === 'Escape') {
                            setIsEditingUsername(false);
                            setTempUsername('');
                          }
                        }}
                        placeholder="gametag_123"
                        maxLength={20}
                        className="flex-1 bg-black/60 border border-orange-500/30 text-white text-sm rounded px-2 py-1 focus:outline-none focus:border-orange-400/60"
                        autoFocus
                        disabled={usernameSaving}
                      />
                      <button
                        onClick={saveUsername}
                        className="p-1 rounded hover:bg-orange-600/20 transition-colors disabled:opacity-50"
                        disabled={tempUsername.length < 3 || usernameSaving}
                      >
                        <Check className={`w-4 h-4 ${tempUsername.length >= 3 && !usernameSaving ? 'text-green-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingUsername(false);
                          setTempUsername('');
                        }}
                        className="p-1 rounded hover:bg-orange-600/20 transition-colors disabled:opacity-50"
                        disabled={usernameSaving}
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                    <div className="text-xs text-orange-400/60 mt-1">
                      {usernameSaving ? '⏳ Saving to blockchain...' : '3-20 chars, letters/numbers/_/- • Press Enter to save'}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-white font-semibold">
                      {username || 'Not set'}
                    </div>
                    <button
                      onClick={() => {
                        setIsEditingUsername(true);
                        setTempUsername(username);
                      }}
                      className="p-1 rounded hover:bg-orange-600/20 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-orange-400" />
                    </button>
                  </div>
                )}
                
                <div className="text-xs text-orange-400/60 mt-3 mb-1">Wallet Address</div>
                <div className="text-white font-mono text-xs break-all">{walletAddress}</div>
              </div>
              
              <div className="p-2">
                <button 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-600/20 transition-colors text-left"
                  onClick={() => window.open('https://stellar.expert/explorer/public', '_blank')}
                >
                  <Coins className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-white font-semibold text-sm">Manage Assets</div>
                    <div className="text-orange-400/60 text-xs">View balances & transactions</div>
                  </div>
                </button>
                
                <button 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-600/20 transition-colors text-left"
                  onClick={() => window.open('https://www.freighter.app/', '_blank')}
                >
                  <Wallet className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-white font-semibold text-sm">Freighter Wallet</div>
                    <div className="text-orange-400/60 text-xs">Open wallet extension</div>
                  </div>
                </button>
                
                <div className="border-t border-orange-500/30 my-2"></div>
                
                {/* DEBUG: Deploy New Contract */}
                <button 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-600/20 transition-colors text-left"
                  onClick={async () => {
                    if (confirm('Deploy a fresh contract? This will clear all usernames and let you start fresh.')) {
                      try {
                        const newContractId = prompt(
                          'Run this command in your terminal:\n\n' +
                          'cd contracts\\username-nft; stellar contract deploy --wasm target\\wasm32v1-none\\release\\username_nft.wasm --network testnet --source deployer\n\n' +
                          'Then paste the new contract ID here:'
                        );
                        
                        if (newContractId && newContractId.length === 56) {
                          alert(`✅ To use contract ${newContractId}:\n\n` +
                                `1. Open src/stellar-sdk.js\n` +
                                `2. Update USERNAME_NFT_CONTRACT to:\n` +
                                `   '${newContractId}'\n` +
                                `3. Refresh the page`);
                        }
                      } catch (error) {
                        alert('Failed: ' + error.message);
                      }
                    }
                  }}
                >
                  <span className="w-5 h-5 text-purple-400">🔧</span>
                  <div>
                    <div className="text-purple-400 font-semibold text-sm">Deploy Fresh Contract</div>
                    <div className="text-purple-400/60 text-xs">Reset usernames (debug)</div>
                  </div>
                </button>
                
                <div className="border-t border-orange-500/30 my-2"></div>
                
                <button 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600/20 transition-colors text-left"
                  onClick={() => {
                    setWalletConnected(false);
                    setWalletAddress('');
                    setShowAccountMenu(false);
                  }}
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-red-400 font-semibold text-sm">Disconnect Wallet</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onboarding Modal */}
      <OnboardingModal
        showOnboarding={showOnboarding}
        setShowOnboarding={setShowOnboarding}
        onboardingStep={onboardingStep}
        setOnboardingStep={setOnboardingStep}
        connectWallet={connectWallet}
        walletAddress={walletAddress}
      />

      {/* Landing Page */}
      <LandingPage
        onGetStarted={handleGetStarted}
        walletConnected={walletConnected}
        scrollToGames={scrollToGames}
      />

      {/* Main Content - Games Section */}
      <div ref={mainContentRef} className="min-h-screen bg-linear-to-b from-[#050608] via-orange-950/20 to-[#050608] pt-24 pb-20 relative overflow-hidden">
        {/* Floating Background Icons - Bouncing DVD Style */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
          <Skull className="floating-icon absolute top-20 left-[10%] w-16 h-16 text-orange-500 animate-bounce1" />
          <Flame className="floating-icon absolute top-40 right-[15%] w-12 h-12 text-orange-500 animate-bounce2" />
          <Skull className="floating-icon absolute top-[60%] left-[20%] w-20 h-20 text-purple-500 animate-bounce3" />
          <Flame className="floating-icon absolute top-[30%] right-[30%] w-14 h-14 text-red-500 animate-bounce4" />
          <Skull className="floating-icon absolute bottom-40 right-[10%] w-16 h-16 text-orange-500 animate-bounce5" />
          <Flame className="floating-icon absolute bottom-60 left-[25%] w-12 h-12 text-purple-500 animate-bounce6" />
          <Skull className="floating-icon absolute top-[45%] right-[5%] w-18 h-18 text-red-500 animate-bounce1" style={{animationDelay: '3s'}} />
          <Flame className="floating-icon absolute bottom-32 right-[35%] w-16 h-16 text-orange-500 animate-bounce2" style={{animationDelay: '5s'}} />
          <Skull className="floating-icon absolute top-[25%] left-[5%] w-14 h-14 text-orange-500 animate-bounce3" style={{animationDelay: '2s'}} />
          <Flame className="floating-icon absolute top-[70%] right-[20%] w-10 h-10 text-purple-500 animate-bounce4" style={{animationDelay: '4s'}} />
          <Skull className="floating-icon absolute top-[15%] right-[40%] w-12 h-12 text-red-500 animate-bounce5" style={{animationDelay: '6s'}} />
          <Flame className="floating-icon absolute bottom-20 left-[15%] w-16 h-16 text-orange-500 animate-bounce6" style={{animationDelay: '1s'}} />
          <Skull className="floating-icon absolute top-[50%] left-[40%] w-14 h-14 text-purple-500 animate-bounce1" style={{animationDelay: '7s'}} />
          <Flame className="floating-icon absolute top-[80%] right-[45%] w-12 h-12 text-red-500 animate-bounce2" style={{animationDelay: '2.5s'}} />
          <Skull className="floating-icon absolute bottom-[70%] left-[35%] w-16 h-16 text-orange-500 animate-bounce3" style={{animationDelay: '4.5s'}} />
          <Flame className="floating-icon absolute top-[35%] left-[50%] w-14 h-14 text-purple-500 animate-bounce4" style={{animationDelay: '3.5s'}} />
          <Skull className="floating-icon absolute bottom-[45%] right-[25%] w-18 h-18 text-red-500 animate-bounce5" style={{animationDelay: '5.5s'}} />
          <Flame className="floating-icon absolute top-[55%] left-[8%] w-10 h-10 text-orange-500 animate-bounce6" style={{animationDelay: '1.5s'}} />
          <Skull className="floating-icon absolute bottom-[55%] right-[50%] w-14 h-14 text-purple-500 animate-bounce1" style={{animationDelay: '6.5s'}} />
          <Flame className="floating-icon absolute top-[90%] left-[45%] w-12 h-12 text-red-500 animate-bounce2" style={{animationDelay: '8s'}} />
        </div>
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Games Grid */}
          <div ref={gamesGridRef} className="mb-16">
            <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Skull className="w-10 h-10 text-orange-500 animate-pulse" />
                  <div className="absolute inset-0 blur-lg bg-orange-500/50 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">Haunted Games</h3>
                  <p className="text-orange-400/80 text-sm font-medium">Dare to play if you dare... 👻</p>
                </div>
              </div>
              
              {/* Filter Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-black/60 border border-orange-500/30 text-orange-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400/60 cursor-pointer"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-orange-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-black/60 border border-orange-500/30 text-orange-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400/60 cursor-pointer"
                  >
                    <option value="default">Default</option>
                    <option value="players-high">Most Players</option>
                    <option value="players-low">Least Players</option>
                    <option value="earnings-high">Highest Earnings</option>
                    <option value="earnings-low">Lowest Earnings</option>
                    <option value="rating-high">Highest Rating</option>
                    <option value="rating-low">Lowest Rating</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              {currentGames.map((game) => (
                <div 
                  key={game.id}
                  className="game-card group relative rounded-xl overflow-hidden bg-black/60 border border-transparent hover:border-orange-400/60 shadow-lg shadow-black/50 hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    if (game.isPlayable && game.demoUrl) {
                      window.open(game.demoUrl, '_blank');
                    }
                  }}
                  style={{ cursor: game.isPlayable ? 'pointer' : 'default' }}
                >
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <img 
                      src={game.image} 
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    
                    {game.isPlayable && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-bold animate-pulse shadow-lg shadow-green-500/50">
                        🎮 PLAYABLE NOW
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-md bg-black/70 text-xs text-orange-400 font-semibold">
                      {game.category}
                    </div>
                    
                    <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 bg-black/70 px-2 py-1 rounded-md">
                      <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                      <span className="text-white text-xs font-semibold">{game.rating}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="text-lg font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                      {game.title}
                    </h4>
                    
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center space-x-1 text-orange-300/80">
                        <Users className="w-3 h-3" />
                        <span>{game.players}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-semibold">{game.earnings}</span>
                      </div>
                    </div>

                    <button className="w-full py-2 rounded-lg bg-orange-900/30 text-orange-100/60 text-sm font-semibold hover:bg-orange-900/40 hover:text-orange-100/80 transition-colors">
                      Play Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-orange-900/30 text-orange-100/60 font-semibold hover:bg-orange-900/40 hover:text-orange-100/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-900/30 text-orange-100/60 hover:bg-orange-900/40 hover:text-orange-100/80'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-orange-900/30 text-orange-100/60 font-semibold hover:bg-orange-900/40 hover:text-orange-100/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Testing/Debug Footer - Bottom of Page */}
        <div className="mt-20 pb-12 border-t border-orange-500/20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex justify-center gap-4 pt-8 flex-wrap">
              {/* Game Payout SDK Demo - handles its own wallet connection */}
              <GamePayoutDemo />

              {/* Contract Tester */}
              <ContractTester walletAddress={walletAddress} walletConnected={walletConnected} />

              {/* Buy MTK Token Component */}
              <BuyMTK />
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Panel - Removed for production */}
      {/* <WalletDiagnostics /> */}

      </div>
  );
}

export default App;




