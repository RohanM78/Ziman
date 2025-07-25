import { Buffer } from 'buffer';

// Ensure Buffer polyfill is available globally across the app
if (typeof global !== 'undefined' && (global as any).Buffer === undefined) {
  (global as any).Buffer = Buffer;
}