/**
 * Key derivation logic
 * Framework-agnostic protocol logic
 */

import { ed } from './noble';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha512';
import bs58 from 'bs58';

/**
 * Domain separator for app identity derivation
 * Ensures explicit domain separation for different use cases
 */
const DOMAIN_SEPARATOR = 'PhantomMask-v1-app:';

/**
 * Derives a deterministic per-app identity from a master private key
 * 
 * @param masterPrivateKey - Base58-encoded master private key (32 bytes)
 * @param appId - Application identifier string
 * @returns Object with derived private key and public key (both base58-encoded)
 * 
 * Properties:
 * - Same wallet + same app ID → same identity (deterministic)
 * - Same wallet + different app ID → different identity (unlinkable)
 * - Uses HMAC-SHA512 with explicit domain separation
 * - No randomness involved
 */
export function deriveAppIdentity(
  masterPrivateKey: string,
  appId: string
): { privateKey: string; publicKey: string } {
  // Decode master private key from base58
  const masterKeyBytes = bs58.decode(masterPrivateKey);
  
  if (masterKeyBytes.length !== 32) {
    throw new Error(`Master private key must be 32 bytes, got ${masterKeyBytes.length}`);
  }

  // Create domain-separated message: "PhantomMask-v1-app:" + appId
  const domainMessage = DOMAIN_SEPARATOR + appId;
  const messageBytes = new TextEncoder().encode(domainMessage);

  // Use HMAC-SHA512 for key derivation with explicit domain separation
  // HMAC(key=masterPrivateKey, message=domainMessage)
  const hmacOutput = hmac(sha512, masterKeyBytes, messageBytes);

  // Take first 32 bytes as the derived private key
  // ed25519 will handle proper clamping internally when deriving the public key
  const derivedPrivateKey = hmacOutput.slice(0, 32);

  // Derive the public key from the private key
  const derivedPublicKey = ed.getPublicKey(derivedPrivateKey);

  // Encode both keys to base58
  return {
    privateKey: bs58.encode(derivedPrivateKey),
    publicKey: bs58.encode(derivedPublicKey),
  };
}
