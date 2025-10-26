import { useState, useEffect } from 'react';
import { Skull, Wallet, User, LogOut, Edit2, Check, X } from 'lucide-react';
import { usernameNFT } from './stellar-sdk';
import './App.css';

function App() {
  // Wallet state
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  // Username NFT state
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [isLoadingUsername, setIsLoadingUsername] = useState(false);
  const [usernameSaving, setUsernameSaving] = useState(false);
  
  // UI state
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Load username when wallet connects
  useEffect(() => {
    if (walletConnected && walletAddress) {
      loadUsername();
    }
  }, [walletConnected, walletAddress]);

  const checkWalletConnection = async () => {
    try {
      const connected = await usernameNFT.isWalletConnected();
      if (connected) {
        const address = await usernameNFT.getWalletAddress();
        setWalletAddress(address);
        setWalletConnected(true);
      }
    } catch (error) {
      console.log('Wallet not connected:', error);
    }
  };

  const connectWallet = async () => {
    try {
      const address = await usernameNFT.getWalletAddress();
      setWalletAddress(address);
      setWalletConnected(true);
      setStatusMessage(' Wallet connected!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      setStatusMessage(' Failed to connect wallet');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setWalletConnected(false);
    setUsername('');
    setShowAccountMenu(false);
    setStatusMessage('Wallet disconnected');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const loadUsername = async () => {
    if (!walletAddress) return;
    
    setIsLoadingUsername(true);
    try {
      const name = await usernameNFT.getUsername(walletAddress);
      if (name) {
        setUsername(name);
        console.log('? Username loaded:', name);
      } else {
        console.log('? No username NFT found');
      }
    } catch (error) {
      console.error('Failed to load username:', error);
    } finally {
      setIsLoadingUsername(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!tempUsername.trim()) return;
    
    setUsernameSaving(true);
    try {
      if (username) {
        // Change existing username
        await usernameNFT.changeUsername(tempUsername);
      } else {
        // Claim new username
        await usernameNFT.claimUsername(tempUsername);
      }
      
      setUsername(tempUsername);
      setIsEditingUsername(false);
      setTempUsername('');
      setStatusMessage(' Username saved successfully!');
      setTimeout(() => setStatusMessage(''), 5000);
    } catch (error) {
      console.error('Failed to save username:', error);
      setStatusMessage( Failed: $error.message);
      setTimeout(() => setStatusMessage(''), 5000);
    } finally {
      setUsernameSaving(false);
    }
  };

  const startEditingUsername = () => {
    setTempUsername(username || '');
    setIsEditingUsername(true);
  };

  const cancelEditingUsername = () => {
    setIsEditingUsername(false);
    setTempUsername('');
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `$addr.slice(0, 4)`...`$addr.slice(-4)`;
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Skull size={32} />
            <span className="logo-text">SPOOKY GAMES</span>
          </div>

          <div className="header-actions">
            {!walletConnected ? (
              <button className="connect-btn" onClick={connectWallet}>
                <Wallet size={20} />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="account-menu-wrapper">
                <button
                  className="account-btn"
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                >
                  <User size={20} />
                  <span>{formatAddress(walletAddress)}</span>
                </button>

                {showAccountMenu && (
                  <div className="account-dropdown">
                    <div className="account-header">
                      <p className="account-address">{walletAddress}</p>
                    </div>

                    <div className="username-section">
                      {isLoadingUsername ? (
                        <p className="loading">Loading username...</p>
                      ) : (
                        <>
                          {!isEditingUsername ? (
                            <div className="username-display">
                              <div className="username-info">
                                {username ? (
                                  <>
                                    <span className="username-badge"> NFT</span>
                                    <span className="username-text">{username}</span>
                                  </>
                                ) : (
                                  <span className="no-username">No username claimed</span>
                                )}
                              </div>
                              <button
                                className="icon-btn"
                                onClick={startEditingUsername}
                                title={username ? 'Change username' : 'Claim username'}
                              >
                                <Edit2 size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="username-edit">
                              <input
                                type="text"
                                value={tempUsername}
                                onChange={(e) => setTempUsername(e.target.value)}
                                placeholder="Enter username (3-20 chars)"
                                className="username-input"
                                maxLength={20}
                                disabled={usernameSaving}
                              />
                              <div className="username-actions">
                                <button
                                  className="icon-btn success"
                                  onClick={handleSaveUsername}
                                  disabled={usernameSaving || tempUsername.length < 3}
                                  title="Save"
                                >
                                  {usernameSaving ? '...' : <Check size={16} />}
                                </button>
                                <button
                                  className="icon-btn cancel"
                                  onClick={cancelEditingUsername}
                                  disabled={usernameSaving}
                                  title="Cancel"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <button className="disconnect-btn" onClick={disconnectWallet}>
                      <LogOut size={16} />
                      <span>Disconnect</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Status Messages */}
      {statusMessage && (
        <div className="status-message">
          {statusMessage}
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="hero">
          <h1 className="hero-title">
            <span className="skull-icon"></span>
            Welcome to Spooky Games
            <span className="skull-icon"></span>
          </h1>
          <p className="hero-subtitle">
            The haunted Web3 gaming platform powered by Stellar
          </p>
        </div>

        <div className="features">
          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>Play Spooky Games</h3>
            <p>Explore horror-themed blockchain games</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>Earn Crypto</h3>
            <p>Get paid in XLM for playing and winning</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>Own NFT Username</h3>
            <p>Claim your unique identity on-chain</p>
          </div>
        </div>

        {!walletConnected && (
          <div className="cta-section">
            <button className="cta-button" onClick={connectWallet}>
              <Wallet size={24} />
              <span>Connect Freighter Wallet to Start</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Built on Stellar Testnet  Powered by Soroban Smart Contracts</p>
        <p className="contract-info">
          Username NFT: CDXY...IDKG
        </p>
      </footer>
    </div>
  );
}

export default App;
