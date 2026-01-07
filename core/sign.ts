/**
 * Signing logic
 * Framework-agnostic protocol logic
 */

import { ed } from './noble';
import bs58 from 'bs58';

/**
 * Signs a message using a derived private key
 * 
 * @param derivedPrivateKey - Base58-encoded derived private key (32 bytes)
 * @param message - Message string to sign
 * @returns Object with signature (base58) and public key used for signing (base58)
 */
export function signMessage(
  derivedPrivateKey: string,
  message: string
): { signature: string; publicKey: string } {
  // Decode private key from base58
  const privateKeyBytes = bs58.decode(derivedPrivateKey);
  
  if (privateKeyBytes.length !== 32) {
    throw new Error(`Derived private key must be 32 bytes, got ${privateKeyBytes.length}`);
  }

  // Derive the public key from the private key
  const publicKeyBytes = ed.getPublicKey(privateKeyBytes);
  const publicKey = bs58.encode(publicKeyBytes);

  // Encode message to bytes
  const messageBytes = new TextEncoder().encode(message);

  // Sign the message
  const signatureBytes = ed.sign(messageBytes, privateKeyBytes);
  const signature = bs58.encode(signatureBytes);

  return {
    signature,
    publicKey,
  };
}

/**
 * Verifies a signature against a message and public key
 * 
 * @param signature - Base58-encoded signature (64 bytes)
 * @param message - Original message string
 * @param publicKey - Base58-encoded public key (32 bytes)
 * @returns true if signature is valid, false otherwise
 */
export function verifySignature(
  signature: string,
  message: string,
  publicKey: string
): boolean {
  try {
    // Decode signature and public key from base58
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(publicKey);

    if (signatureBytes.length !== 64) {
      throw new Error(`Signature must be 64 bytes, got ${signatureBytes.length}`);
    }
    if (publicKeyBytes.length !== 32) {
      throw new Error(`Public key must be 32 bytes, got ${publicKeyBytes.length}`);
    }

    // Encode message to bytes
    const messageBytes = new TextEncoder().encode(message);

    // Verify the signature
    return ed.verify(signatureBytes, messageBytes, publicKeyBytes);
  } catch (error) {
    // If any error occurs during verification, return false
    return false;
  }
}
