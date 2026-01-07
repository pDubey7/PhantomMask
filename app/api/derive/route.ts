/**
 * API route for key derivation
 * Next.js App Router API endpoint
 * 
 * SERVER-SIDE ONLY:
 * - All cryptography runs server-side using Node.js crypto libraries
 * - No browser crypto APIs (WebCrypto, SubtleCrypto) are used
 * - No React components or client-side code involved
 * - Private keys never leave the server (only public keys are returned)
 * 
 * This ensures:
 * - Consistent cryptographic behavior across all clients
 * - No dependency on browser crypto API availability
 * - Protection of sensitive key material
 * - Framework-agnostic protocol logic execution
 */

import { NextResponse } from 'next/server';
import { deriveAppIdentity } from '../../../core/derive';

export async function POST(request: Request) {
  try {
    // Parse JSON request body
    const body = await request.json();
    const { masterPrivateKey, appId } = body;

    // Validate input
    if (!masterPrivateKey || typeof masterPrivateKey !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: masterPrivateKey is required and must be a string' },
        { status: 400 }
      );
    }

    if (!appId || typeof appId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: appId is required and must be a string' },
        { status: 400 }
      );
    }

    // Derive app identity (runs server-side)
    // This calls core/derive.ts which uses @noble/ed25519 and @noble/hashes
    // All cryptographic operations execute in Node.js, not in the browser
    const identity = deriveAppIdentity(masterPrivateKey, appId);

    // Return ONLY the public key - never return private keys
    // The private key is derived server-side but immediately discarded from the response
    // This ensures private key material never leaves the server
    return NextResponse.json({
      publicKey: identity.publicKey,
    });
  } catch (error) {
    // Handle errors gracefully
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Derivation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
