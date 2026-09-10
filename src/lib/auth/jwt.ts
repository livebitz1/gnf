const JWT_SECRET = process.env.JWT_SECRET || "gnf_jwt_secret_esports_2026_super_secure_key_1337";

// Helper: base64url encode
function base64UrlEncode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }
  return btoa(str)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// Helper: base64url decode
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64").toString("utf-8");
  }
  return atob(base64);
}

// HMAC-SHA256 Sign
async function hmacSha256(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  const binaryString = String.fromCharCode(...hashArray);
  return base64UrlEncode(binaryString);
}

export async function signJwt(payload: any, expiresInSeconds = 86400 * 30): Promise<string> {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = await hmacSha256(dataToSign, JWT_SECRET);
  return `${dataToSign}.${signature}`;
}

export async function verifyJwt(token: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    if (!token || typeof token !== "string") {
      return { valid: false, error: "Missing token" };
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format" };
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const dataToSign = `${headerB64}.${payloadB64}`;
    const expectedSignature = await hmacSha256(dataToSign, JWT_SECRET);

    if (signatureB64 !== expectedSignature) {
      return { valid: false, error: "Invalid signature" };
    }

    const payloadJson = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: "Token expired" };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err?.message || "Token verification failed" };
  }
}

// Fast SHA-256 Password Hash with Salt
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = "gnf_salt_2026_";
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !password) return false;
  if (storedHash === password) return true;
  const computedHash = await hashPassword(password);
  return computedHash === storedHash;
}
