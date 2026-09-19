import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

import { env } from '../../config/env.js';

// Email-verification and password-reset codes.
//
// Codes are stored only as an HMAC keyed with a server-side secret, never in
// plain text — anyone who can read the database (a leaked backup, an
// over-permissive DB user) must not be able to read a live reset code and take
// over an account. A bare SHA-256 would NOT achieve that: there are only a
// million six-digit codes, so it could be reversed instantly. The secret is
// what makes the stored value useless without access to the server.

export type OneTimeCodePurpose = 'email-verification' | 'password-reset';

// Cryptographically secure — Math.random() is predictable and unfit for
// anything that gates account access.
export function generateOneTimeCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

// Purpose and email are part of the signed message, so a code issued for one
// flow or account can't be replayed against another. The email is normalized
// because the User model lowercases it but request payloads don't.
export function hashOneTimeCode(
  purpose: OneTimeCodePurpose,
  email: string,
  code: string,
): string {
  return createHmac('sha256', env.JWT_SECRET_KEY)
    .update(`${purpose}:${email.trim().toLowerCase()}:${code}`)
    .digest('hex');
}

export function verifyOneTimeCode(
  purpose: OneTimeCodePurpose,
  email: string,
  submittedCode: string,
  storedHash: string | undefined,
): boolean {
  if (!storedHash) return false;

  const expected = Buffer.from(
    hashOneTimeCode(purpose, email, submittedCode),
    'hex',
  );
  // A plain-text value stored before this change isn't valid hex of the right
  // length, so it never matches — those users just request a new code.
  const actual = Buffer.from(storedHash, 'hex');

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
