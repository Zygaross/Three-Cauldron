import * as StellarSdk from '@stellar/stellar-sdk';

// Test how to parse signed XDR from Freighter
console.log('Testing Transaction XDR parsing...\n');

// Simulate what we get back from Freighter (a base64 XDR string)
const mockSignedXDR = 'AAAAAgAAAADg3G3hclysZlFitS+s5zWyiiJD5B0STWy5LXCj6i5yxQAAAGQADKI/AAAABAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAODcbeFyXKxmUWK1L6znNbKKIkPkHRJNbLktcKPqLnLFAAAAAQAAAADg3G3hclysZlFitS+s5zWyiiJD5B0STWy5LXCj6i5yxQAAAAAAAAAAAJiWgAAAAAAAAAAB6i5yxQAAAEBKwqWy3TaOxoGnfCX/2C08RrxVX9AJkXX0G6xLJaKhC08nGE5Z5XdFXwKUaZakN7b5JQCnWqTSt2swXq++mWcN';

console.log('1. Using TransactionBuilder.fromXDR():');
try {
  const tx1 = StellarSdk.TransactionBuilder.fromXDR(mockSignedXDR, StellarSdk.Networks.TESTNET);
  console.log('   ✅ Success! Type:', tx1.constructor.name);
  console.log('   Can submit:', typeof tx1.toEnvelope === 'function');
} catch (e) {
  console.log('   ❌ Error:', e.message);
}

console.log('\n2. Using new Transaction(xdr, networkPassphrase):');
try {
  const tx2 = new StellarSdk.Transaction(mockSignedXDR, StellarSdk.Networks.TESTNET);
  console.log('   ✅ Success! Type:', tx2.constructor.name);
} catch (e) {
  console.log('   ❌ Error:', e.message.substring(0, 100));
}

console.log('\n3. Using xdr.TransactionEnvelope.fromXDR() then Transaction:');
try {
  const envelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(mockSignedXDR, 'base64');
  const tx3 = new StellarSdk.Transaction(envelope, StellarSdk.Networks.TESTNET);
  console.log('   ✅ Success! Type:', tx3.constructor.name);
  console.log('   Can submit:', typeof tx3.toEnvelope === 'function');
} catch (e) {
  console.log('   ❌ Error:', e.message.substring(0, 100));
}

console.log('\n✅ Correct method identified!');
