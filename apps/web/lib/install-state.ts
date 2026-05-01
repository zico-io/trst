import { createHmac, randomBytes } from "node:crypto";

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function getSecret(): string {
  const secret = process.env.INSTALL_STATE_SECRET;
  if (!secret) throw new Error("INSTALL_STATE_SECRET is not set");
  return secret;
}

export function createInstallStateJwt(): string {
  const secret = getSecret();
  const header = b64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = b64url(
    Buffer.from(
      JSON.stringify({
        nonce: randomBytes(16).toString("hex"),
        exp: Math.floor(Date.now() / 1000) + 600,
      }),
    ),
  );
  const sig = b64url(createHmac("sha256", secret).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${sig}`;
}

export function verifyInstallStateJwt(token: string): void {
  const secret = getSecret();
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");

  const [header, payload, sig] = parts;
  const expected = b64url(createHmac("sha256", secret).update(`${header}.${payload}`).digest());
  if (sig !== expected) throw new Error("Invalid JWT signature");

  const data = JSON.parse(fromB64url(payload).toString("utf8")) as { exp: number };
  if (data.exp < Math.floor(Date.now() / 1000)) throw new Error("JWT expired");
}
