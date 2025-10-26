import React, { useState, useEffect } from 'react';
import { isAllowed, getAddress, requestAccess } from '@stellar/freighter-api';

export const WalletDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    windowFreighter: false,
    isAllowedResult: null,
    address: null,
    errors: [],
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = {
      windowFreighter: typeof window.freighter !== 'undefined',
      isAllowedResult: null,
      address: null,
      errors: [],
    };

    // Test isAllowed
    try {
      const allowed = await isAllowed();
      results.isAllowedResult = allowed;
    } catch (error) {
      results.errors.push(`isAllowed error: ${error.message}`);
    }

    setDiagnostics(results);
  };

  const testConnection = async () => {
    try {
      await requestAccess();
      const { address, error } = await getAddress();
      
      if (error) {
        throw new Error(error);
      }
      
      setDiagnostics(prev => ({
        ...prev,
        address,
        errors: [],
      }));
      alert(`✅ Connected! Address: ${address.slice(0, 12)}...${address.slice(-12)}`);
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        errors: [...prev.errors, `getAddress error: ${error.message}`],
      }));
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 border-2 border-orange-500 rounded-lg p-4 max-w-md text-xs font-mono z-50">
      <h3 className="text-orange-400 font-bold mb-2">🔍 Wallet Diagnostics</h3>
      
      <div className="space-y-1 text-white mb-3">
        <div>
          window.freighter: {' '}
          <span className={diagnostics.windowFreighter ? 'text-green-400' : 'text-red-400'}>
            {diagnostics.windowFreighter ? '✅ Detected' : '❌ Not Found'}
          </span>
        </div>
        
        <div>
          isAllowed(): {' '}
          <span className={diagnostics.isAllowedResult === null ? 'text-gray-400' : diagnostics.isAllowedResult ? 'text-green-400' : 'text-yellow-400'}>
            {diagnostics.isAllowedResult === null ? 'Not checked' : diagnostics.isAllowedResult ? '✅ Yes' : '⚠️ No'}
          </span>
        </div>
        
        {diagnostics.address && (
          <div className="text-green-400">
            Connected: {diagnostics.address.slice(0, 8)}...
          </div>
        )}
        
        {diagnostics.errors.length > 0 && (
          <div className="mt-2 pt-2 border-t border-red-500/30">
            <div className="text-red-400 font-bold">Errors:</div>
            {diagnostics.errors.map((error, i) => (
              <div key={i} className="text-red-300 text-[10px]">{error}</div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={testConnection}
        className="w-full px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold"
      >
        Test Connection
      </button>
      
      <button
        onClick={runDiagnostics}
        className="w-full mt-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
      >
        Refresh
      </button>
    </div>
  );
};
