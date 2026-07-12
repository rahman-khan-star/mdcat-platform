import { NextRequest } from "next/server";

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacSign(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(CSRF_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64urlEncode(signature);
}

export async function generateCsrfToken(sessionId: string): Promise<string> {
  const payload = JSON.stringify({
    sid: sessionId,
    ts: Date.now(),
  });
  const encoded = base64urlEncode(new TextEncoder().encode(payload).buffer);
  const signature = await hmacSign(encoded);
  return `${encoded}.${signature}`;
}

export async function validateCsrfToken(token: string, sessionId: string): Promise<boolean> {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return false;

    const expectedSignature = await hmacSign(encoded);
    if (signature !== expectedSignature) return false;

    const payloadBytes = base64urlDecode(encoded);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));

    if (payload.sid !== sessionId) return false;

    // Token expires after 1 hour
    if (Date.now() - payload.ts > 60 * 60 * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

export function getCsrfTokenFromRequest(request: NextRequest): string | null {
  // Check header first
  const headerToken = request.headers.get("x-csrf-token");
  if (headerToken) return headerToken;

  // Check form body for non-JSON requests
  return null;
}
