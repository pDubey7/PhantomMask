# PhantomMask v1

A protocol for deterministic per-application identity derivation and message signing.

## Protocol Overview

PhantomMask v1 provides a deterministic key derivation scheme that generates unique cryptographic identities for each application from a single master private key. Each derived identity is cryptographically unlinkable across different applications while maintaining deterministic behavior within the same application context.

## What PhantomMask Does

### Identity Derivation

Given a master private key and an application identifier (appId), PhantomMask derives a unique ed25519 key pair using HMAC-SHA512 with explicit domain separation:

- **Input**: Master private key (32 bytes, base58-encoded), Application ID (string)
- **Output**: Derived private key (32 bytes, base58-encoded), Derived public key (32 bytes, base58-encoded)
- **Algorithm**: `HMAC-SHA512(masterPrivateKey, "PhantomMask-v1-app:" + appId)[0:32]`

### Properties

1. **Determinism**: Same master key + same app ID → same identity (always)
2. **Unlinkability**: Same master key + different app ID → different identity (cryptographically unlinkable)
3. **No randomness**: All operations are deterministic
4. **Full signing capability**: Derived identities are complete ed25519 key pairs capable of signing and verifying messages

### Message Signing

Derived identities can sign arbitrary messages using standard ed25519 signatures:

- **Input**: Derived private key, Message (string)
- **Output**: Signature (64 bytes, base58-encoded), Public key (32 bytes, base58-encoded)
- **Verification**: Standard ed25519 signature verification

## Privacy Guarantees

### App-Level Unlinkability

PhantomMask provides cryptographic unlinkability between identities derived for different applications. Given two public keys from the same master key but different app IDs, it is computationally infeasible to determine they share a common origin without knowledge of the master private key.

This means:
- Applications cannot link user identities across different apps
- Public keys from different apps appear as independent, unrelated identities
- No correlation is possible without the master private key

### What PhantomMask Does NOT Provide

1. **Anonymity**: Public keys are still pseudonymous identifiers. If a public key is associated with a real-world identity in one context, that association remains.

2. **Forward secrecy**: Compromise of the master private key reveals all derived identities for all applications.

3. **Key rotation**: There is no built-in mechanism for rotating or revoking derived identities. A compromised derived identity remains compromised.

4. **Metadata protection**: The protocol does not protect against metadata analysis, traffic analysis, or timing attacks.

5. **Browser-side execution**: All cryptographic operations must run server-side. PhantomMask does not support browser-based key derivation or signing.

6. **Wallet integration**: PhantomMask is a protocol/tooling project, not a wallet. It does not integrate with wallet software or provide wallet adapter functionality.

## Architecture

### Core Protocol (`core/`)

The protocol logic is framework-agnostic and located in `core/`:

- `noble.ts`: Ed25519 cryptography configuration using @noble/ed25519
- `derive.ts`: Deterministic key derivation using HMAC-SHA512
- `sign.ts`: Message signing and verification

All cryptographic operations use Node.js-compatible libraries (@noble/ed25519, @noble/hashes) and execute server-side.

### Next.js API Routes (`app/api/`)

Next.js is used exclusively as a thin HTTP wrapper around the core protocol:

- `POST /api/derive`: Derives app identity, returns public key only
- `POST /api/sign`: Signs messages using derived private keys

**Why Next.js is used only as a thin wrapper:**

1. **Server-side execution**: All cryptography runs in Node.js, not in browsers. Next.js provides the HTTP server infrastructure.

2. **No client-side crypto**: No React components, no browser crypto APIs (WebCrypto, SubtleCrypto), no client-side JavaScript execution of cryptographic operations.

3. **Framework independence**: The core protocol (`core/`) has zero dependencies on Next.js and can be used in any Node.js environment.

4. **API-only usage**: Next.js is used solely for its API route handlers. No static generation, no client-side rendering, no React components (except a minimal demo page).

5. **Consistency**: Server-side execution ensures consistent cryptographic behavior across all clients, regardless of browser capabilities or JavaScript runtime differences.

The Next.js layer is approximately 60 lines of HTTP request/response handling. All protocol logic remains in `core/`.

## Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **npm**: v9 or higher (comes with Node.js)
- **Git**: For cloning the repository ([Download](https://git-scm.com/))

Verify installations:
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher


## CLI Usage

The CLI tool (`scripts/cli.ts`) provides direct access to protocol operations without Next.js:

```bash
# Derive an app identity
npm run cli derive <masterPrivateKey> <appId>

# Sign a message
npm run cli sign <derivedPrivateKey> <message>

# Run protocol tests
npm run cli test
```

The CLI uses only `core/` protocol logic and has no Next.js dependencies.

## Installation

```bash
npm install
```

## Development

```bash
# Start Next.js dev server (API routes)
npm run dev

# Run CLI tool
npm run cli test

# Build for production
npm run build
```

## API Endpoints

### POST /api/derive

Derives an app identity from a master private key.

**Request:**
```json
{
  "masterPrivateKey": "base58-encoded-32-bytes",
  "appId": "application-identifier"
}
```

**Response:**
```json
{
  "publicKey": "base58-encoded-32-bytes"
}
```

**Note**: Private keys are never returned. Only the public key is exposed.

### POST /api/sign

Signs a message using a derived private key.

**Request:**
```json
{
  "derivedPrivateKey": "base58-encoded-32-bytes",
  "message": "message to sign"
}
```

**Response:**
```json
{
  "signature": "base58-encoded-64-bytes",
  "publicKey": "base58-encoded-32-bytes"
}
```

## Technology Stack

- **Node.js ESM**: ES Modules for all code
- **TypeScript**: Type safety throughout
- **@noble/ed25519@2.x**: Ed25519 signature scheme
- **@noble/hashes**: HMAC-SHA512 for key derivation
- **bs58**: Base58 encoding/decoding
- **Next.js 14**: HTTP API route handlers (server-side only)

## License

MIT

## Security Considerations

### CLI Usage

- **Private keys in terminal history**: The CLI logs private keys to the console. Be aware that these may be stored in terminal history files (e.g., `~/.bash_history`, `~/.zsh_history`).
- **Process list visibility**: Private keys passed as command-line arguments are visible in system process lists.
- **Best practice**: Use the CLI only in trusted environments. Consider clearing terminal history after use or using tools that don't log command history.

### API Usage

- **Private keys in transit**: Private keys are transmitted over HTTPS to API endpoints. Always use HTTPS in production.
- **Server-side processing**: All cryptographic operations run server-side. The server receives private keys but never returns them in responses.
- **No key storage**: The API does not store any keys. Keys exist only in memory during request processing.

### General Security

- **Never commit private keys**: Do not commit private keys to version control.
- **Use HTTPS**: Always use HTTPS when calling API endpoints.
- **Key management**: Master private keys should be stored securely (hardware wallet, encrypted storage, etc.).


## Deployment

PhantomMask v1 has no dependencies on:
- Environment variables
- API keys or secrets
- Database connections
- External services

The protocol is stateless and can be deployed to any platform that supports Next.js:
- Vercel
- Netlify
- Railway
- AWS Lambda
- Any Node.js hosting platform

**Important**: Always use HTTPS in production to protect private keys in transit.
