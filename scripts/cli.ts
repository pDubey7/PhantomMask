#!/usr/bin/env node
/**
 * PhantomMask v1 CLI
 * 
 * Command-line interface for PhantomMask protocol operations.
 * Uses only core/ protocol logic - no Next.js dependencies.
 * 
 * Usage:
 *   npm run cli derive <masterPrivateKey> <appId>
 *   npm run cli sign <derivedPrivateKey> <message>
 *   npm run cli test
 */

import { ed } from '../core/noble';
import { deriveAppIdentity } from '../core/derive';
import { signMessage, verifySignature } from '../core/sign';
import bs58 from 'bs58';

/**
 * Derives a per-app identity from a master private key
 */
function derive(masterPrivateKey: string, appId: string) {
  console.log('Deriving app identity...\n');
  console.log(`Master private key: ${masterPrivateKey}`);
  console.log(`App ID: ${appId}\n`);

  const identity = deriveAppIdentity(masterPrivateKey, appId);

  console.log('Derived identity:');
  console.log(`  Private key: ${identity.privateKey}`);
  console.log(`  Public key:  ${identity.publicKey}\n`);

  return identity;
}

/**
 * Signs a message using a derived private key
 */
function sign(derivedPrivateKey: string, message: string) {
  console.log('Signing message...\n');
  console.log(`Derived private key: ${derivedPrivateKey}`);
  console.log(`Message: "${message}"\n`);

  const result = signMessage(derivedPrivateKey, message);

  console.log('Signature result:');
  console.log(`  Signature: ${result.signature}`);
  console.log(`  Public key: ${result.publicKey}\n`);

  // Verify the signature
  const isValid = verifySignature(result.signature, message, result.publicKey);
  console.log(`Verification: ${isValid ? '✅ Valid' : '❌ Invalid'}\n`);

  return result;
}

/**
 * Runs protocol tests to verify correctness
 */
function runTests() {
  console.log('='.repeat(60));
  console.log('PhantomMask v1 - Protocol Tests');
  console.log('='.repeat(60));
  console.log();

  // Test 1: Determinism
  console.log('Test 1: Determinism\n');
  const masterKey1 = bs58.encode(ed.utils.randomPrivateKey());
  const appId1 = 'test-app';
  const identity1a = deriveAppIdentity(masterKey1, appId1);
  const identity1b = deriveAppIdentity(masterKey1, appId1);
  
  if (identity1a.privateKey !== identity1b.privateKey || identity1a.publicKey !== identity1b.publicKey) {
    throw new Error('❌ Determinism test failed');
  }
  console.log('✅ Same master key + same app ID → same identity\n');

  // Test 2: Unlinkability
  console.log('Test 2: App-level unlinkability\n');
  const masterKey2 = bs58.encode(ed.utils.randomPrivateKey());
  const identity2a = deriveAppIdentity(masterKey2, 'app-alpha');
  const identity2b = deriveAppIdentity(masterKey2, 'app-beta');
  
  if (identity2a.publicKey === identity2b.publicKey) {
    throw new Error('❌ Unlinkability test failed');
  }
  console.log('✅ Same master key + different app ID → different identity\n');

  // Test 3: Signing
  console.log('Test 3: Message signing\n');
  const masterKey3 = bs58.encode(ed.utils.randomPrivateKey());
  const identity3 = deriveAppIdentity(masterKey3, 'signing-app');
  const message3 = 'Test message';
  const sigResult = signMessage(identity3.privateKey, message3);
  const isValid3 = verifySignature(sigResult.signature, message3, sigResult.publicKey);
  
  if (!isValid3) {
    throw new Error('❌ Signing test failed');
  }
  console.log('✅ Derived identity can sign and verify messages\n');

  console.log('='.repeat(60));
  console.log('✅ All protocol tests passed');
  console.log('='.repeat(60));
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log('PhantomMask v1 CLI\n');
  console.log('Usage:');
  console.log('  npm run cli derive <masterPrivateKey> <appId>');
  console.log('  npm run cli sign <derivedPrivateKey> <message>');
  console.log('  npm run cli test\n');
  console.log('Examples:');
  console.log('  npm run cli derive <base58-key> my-app');
  console.log('  npm run cli sign <base58-key> "Hello, PhantomMask!"');
  console.log('  npm run cli test');
  process.exit(0);
}

try {
  switch (command) {
    case 'derive':
      if (args.length < 3) {
        console.error('Error: derive requires masterPrivateKey and appId');
        process.exit(1);
      }
      derive(args[1], args[2]);
      break;

    case 'sign':
      if (args.length < 3) {
        console.error('Error: sign requires derivedPrivateKey and message');
        process.exit(1);
      }
      sign(args[1], args.slice(2).join(' '));
      break;

    case 'test':
      runTests();
      break;

    default:
      console.error(`Error: Unknown command "${command}"`);
      console.log('Available commands: derive, sign, test');
      process.exit(1);
  }
} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : error);
  process.exit(1);
}
