/**
 * Noble cryptography utilities
 * Framework-agnostic protocol logic
 */

import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

// Wire sha512 as the hash function for ed25519
ed.etc.sha512Sync = (...m: Uint8Array[]) => sha512(ed.etc.concatBytes(...m));

// Export the configured ed object
export { ed };
