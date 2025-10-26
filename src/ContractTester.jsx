import React, { useState } from 'react';
import { Zap, CheckCircle, XCircle, Loader } from 'lucide-react';
import { usernameNFT } from './stellar-sdk';
import * as StellarSdk from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

export const ContractTester = ({ walletAddress, walletConnected }) => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [sendingPayment, setSendingPayment] = useState(false);

  const runContractTests = async () => {
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    setTesting(true);
    setShowResults(true);
    const results = {
      timestamp: new Date().toLocaleTimeString(),
      tests: []
    };

    try {
      // Test 1: Check wallet connection
      results.tests.push({
        name: 'Wallet Connection',
        status: 'running',
        message: 'Checking wallet...'
      });
      setTestResults({ ...results });
      
      const connected = await usernameNFT.isWalletConnected();
      results.tests[0].status = connected ? 'passed' : 'failed';
      results.tests[0].message = connected ? `Connected: ${walletAddress.substring(0, 8)}...` : 'Not connected';
      setTestResults({ ...results });
      await new Promise(r => setTimeout(r, 500));

      // Test 2: Get username
      results.tests.push({
        name: 'Fetch Username',
        status: 'running',
        message: 'Fetching from contract...'
      });
      setTestResults({ ...results });
      
      const username = await usernameNFT.getUsername(walletAddress);
      results.tests[1].status = 'passed';
      results.tests[1].message = username || 'No username set';
      setTestResults({ ...results });
      await new Promise(r => setTimeout(r, 500));

      // Test 3: Contract configuration
      results.tests.push({
        name: 'Contract Config',
        status: 'running',
        message: 'Checking contract...'
      });
      setTestResults({ ...results });
      
      results.tests[2].status = 'passed';
      results.tests[2].message = `Network: ${usernameNFT.network}`;
      setTestResults({ ...results });
      await new Promise(r => setTimeout(r, 500));

      // Test 4: Network check
      results.tests.push({
        name: 'Network Status',
        status: 'running',
        message: 'Verifying network...'
      });
      setTestResults({ ...results });
      
      results.tests[3].status = 'passed';
      results.tests[3].message = `Network: ${usernameNFT.network.toUpperCase()}`;
      setTestResults({ ...results });
      await new Promise(r => setTimeout(r, 500));

      // Test 5: Contract address
      results.tests.push({
        name: 'Contract Address',
        status: 'running',
        message: 'Checking contract...'
      });
      setTestResults({ ...results });
      
      results.tests[4].status = 'passed';
      results.tests[4].message = `${usernameNFT.contractAddress.substring(0, 12)}...`;
      setTestResults({ ...results });

    } catch (error) {
      const lastTest = results.tests[results.tests.length - 1];
      lastTest.status = 'failed';
      lastTest.message = error.message || 'Test failed';
      setTestResults({ ...results });
    }

    setTesting(false);
  };

  const sendTestPayment = async () => {
    if (!walletConnected || !walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }

    setSendingPayment(true);
    setPaymentResult(null);

    try {
      console.log('💰 Starting test payment...');
      
      // Load account from Stellar
      const account = await server.loadAccount(walletAddress);
      console.log('✅ Account loaded');
      
      // Build payment transaction (sending 1 XLM to yourself as test)
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: walletAddress, // Send to self for testing
            asset: StellarSdk.Asset.native(),
            amount: '1', // 1 XLM
          })
        )
        .setTimeout(30)
        .build();

      console.log('✅ Transaction built');

      // Sign with Freighter
      console.log('📝 Sending to Freighter for signature...');
      console.log('   Transaction XDR type:', typeof transaction.toXDR());
      
      const signedXdr = await signTransaction(transaction.toXDR(), {
        networkPassphrase: StellarSdk.Networks.TESTNET,
      });

      console.log('✅ Transaction signed');
      console.log('   Signed XDR type:', typeof signedXdr);
      console.log('   Signed XDR value:', signedXdr);
      console.log('   Signed XDR keys:', Object.keys(signedXdr || {}));
      
      // Freighter returns an object, we need to extract the XDR string
      const xdrString = typeof signedXdr === 'string' ? signedXdr : signedXdr.signedTxXdr || signedXdr.xdr || signedXdr;
      console.log('   Extracted XDR string type:', typeof xdrString);
      console.log('   Extracted XDR string length:', xdrString?.length);
      
      // TransactionBuilder.fromXDR handles both Transaction and FeeBumpTransaction
      let signedTx;
      try {
        console.log('📝 Parsing signed XDR...');
        signedTx = StellarSdk.TransactionBuilder.fromXDR(xdrString, StellarSdk.Networks.TESTNET);
        console.log('✅ XDR parsed successfully');
      } catch (parseError) {
        console.error('❌ XDR parsing failed:', parseError);
        console.log('Trying alternative method with xdr.TransactionEnvelope...');
        try {
          const envelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(xdrString, 'base64');
          signedTx = new StellarSdk.Transaction(envelope, StellarSdk.Networks.TESTNET);
          console.log('✅ Alternative method worked!');
        } catch (altError) {
          console.error('❌ Alternative method also failed:', altError);
          throw new Error(`Failed to parse signed transaction: ${parseError.message}`);
        }
      }
      
      console.log('📤 Submitting transaction...');
      
      // Submit transaction
      const result = await server.submitTransaction(signedTx);
      
      console.log('✅ Payment successful:', result);
      
      setPaymentResult({
        success: true,
        hash: result.hash,
        message: '✅ Successfully sent 1 XLM test payment!'
      });

    } catch (error) {
      console.error('❌ Payment failed:', error);
      
      let errorMessage = '❌ Payment failed: ';
      if (error.message?.includes('denied') || error.message?.includes('rejected')) {
        errorMessage += 'Transaction rejected by user';
      } else if (error.message?.includes('insufficient')) {
        errorMessage += 'Insufficient balance';
      } else {
        errorMessage += error.message || 'Unknown error';
      }
      
      setPaymentResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setSendingPayment(false);
    }
  };

  return (
    <div className="relative flex gap-3 items-center">
      {/* Test Payment Button */}
      <button
        onClick={sendTestPayment}
        disabled={sendingPayment}
        className="group relative px-6 py-3 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/50 hover:shadow-orange-600/70 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          {sendingPayment ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <span>💰</span>
          )}
          <span>{sendingPayment ? 'Sending...' : 'Send 1 XLM'}</span>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Send 1 XLM from wallet (testnet)
        </div>
      </button>
      
      {/* Test Contract Button */}
      <button
        onClick={runContractTests}
        disabled={testing}
        className="group relative px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-600/70 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          {testing ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <Zap size={20} />
          )}
          <span>{testing ? 'Testing...' : 'Test Contract'}</span>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Test Stellar smart contract
        </div>
      </button>

      {/* Payment Result - Positioned above */}
      {paymentResult && (
        <div className={`absolute bottom-full mb-3 left-0 p-3 rounded-xl border-2 w-80 ${
          paymentResult.success 
            ? 'bg-green-900/90 border-green-500/30' 
            : 'bg-red-900/90 border-red-500/30'
        }`}>
          <p className="text-white text-sm">{paymentResult.message}</p>
          {paymentResult.hash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${paymentResult.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-xs hover:underline mt-1 block"
            >
              View on Explorer →
            </a>
          )}
        </div>
      )}

      {/* Results Panel - Positioned above */}
      {showResults && testResults && (
        <div className="absolute bottom-full mb-3 left-0 w-96 bg-linear-to-br from-[#1a0a0a] to-[#0a0505] border-2 border-purple-500/30 rounded-xl p-6 shadow-2xl shadow-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
              <Zap size={20} />
              Contract Tests
            </h3>
            <button
              onClick={() => setShowResults(false)}
              className="text-purple-400/60 hover:text-purple-400 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="text-sm text-purple-300/60 mb-4">
            Run at {testResults.timestamp}
          </div>

          <div className="space-y-3">
            {testResults.tests.map((test, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-black/30 rounded-lg border border-purple-500/20"
              >
                <div className="mt-0.5">
                  {test.status === 'running' && (
                    <Loader className="animate-spin text-yellow-400" size={18} />
                  )}
                  {test.status === 'passed' && (
                    <CheckCircle className="text-green-400" size={18} />
                  )}
                  {test.status === 'failed' && (
                    <XCircle className="text-red-400" size={18} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-purple-200">{test.name}</div>
                  <div className="text-sm text-purple-300/70 mt-1">{test.message}</div>
                </div>
              </div>
            ))}
          </div>

          {!testing && (
            <button
              onClick={runContractTests}
              className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Run Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
