import { randomBytes } from 'crypto';

// Generate a 256-bit secret key (32 bytes)
const secretKey = randomBytes(32).toString('hex');

console.log("Generated 256-bit Secret Key:", secretKey);