/**
 * Admin session management using Web Crypto API.
 * Compatible with both Node.js and Edge runtime (Next.js middleware).
 */

const COOKIE_NAME = "admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "devex-bike-shop-demo-secret-key";

// Default credentials — override via environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
// Default password stored as SHA-256 hash (never plain text in codebase)
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  "dca59be855bdb7733143f30ae880454cefbfc1c0501f9507e53c06832554886a";

/**
 * SHA-256 hash using Web Crypto API (works in Edge + Node).
 */
async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * HMAC-SHA256 sign using Web Crypto API (works in Edge + Node).
 */
async function hmacSign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Create a signed session token.
 * Format: username:expiry:signature
 */
async function createToken(username: string): Promise<string> {
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const data = `${username}:${expiry}`;
  const signature = await hmacSign(data, SESSION_SECRET);
  return `${data}:${signature}`;
}

/**
 * Validate a session token.
 * Returns the username if valid, null otherwise.
 */
export async function validateToken(token: string): Promise<string | null> {
  const parts = token.split(":");
  if (parts.length !== 3) return null;

  const [username, expiryStr, signature] = parts;
  const expiry = Number(expiryStr);

  // Check expiry
  if (isNaN(expiry) || Date.now() > expiry) return null;

  // Verify signature
  const data = `${username}:${expiryStr}`;
  const expected = await hmacSign(data, SESSION_SECRET);

  if (signature !== expected) return null;

  return username;
}

/**
 * Verify admin credentials by comparing SHA-256 hash of input password.
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_USERNAME) return false;
  const inputHash = await sha256(password);
  return inputHash === ADMIN_PASSWORD_HASH;
}

/**
 * Create a session cookie value for the given username.
 */
export async function createSessionToken(username: string): Promise<string> {
  return createToken(username);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
