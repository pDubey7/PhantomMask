/**
 * API route for message signing
 * Next.js App Router API endpoint
 * 
 * SERVER-SIDE ONLY:
 * - All cryptography runs server-side using Node.js crypto libraries
 * - No browser crypto APIs (WebCrypto, SubtleCrypto) are used
 * - No React components or client-side code involved
 * - Private keys are received but all signing operations execute server-side
 * 
 * This ensures:
 * - Consistent cryptographic behavior across all clients
 * - No dependency on browser crypto API availability
 * - Framework-agnostic protocol logic execution
 * - Private keys are only used server-side for signing, never exposed to browser
 */

import { NextResponse } from 'next/server';
import { signMessage } from '../../../core/sign';

export async function POST(request: Request) {
  try {
    // Parse JSON request body
    const body = await request.json();
    const { derivedPrivateKey, message } = body;

    // Validate input
    if (!derivedPrivateKey || typeof derivedPrivateKey !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: derivedPrivateKey is required and must be a string' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: message is required and must be a string' },
        { status: 400 }
      );
    }

    // Sign message (runs server-side)
    // This calls core/sign.ts which uses @noble/ed25519
    // All cryptographic operations execute in Node.js, not in the browser
    const result = signMessage(derivedPrivateKey, message);

    // Return signature and public key
    // The private key was used server-side but is not included in the response
    return NextResponse.json({
      signature: result.signature,
      publicKey: result.publicKey,
    });
  } catch (error) {
    // Handle errors gracefully
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Signing failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
