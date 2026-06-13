const STORAGE_KEY = "mindmirror_encryption_key";

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getOrCreateKey(userId: string): Promise<CryptoKey> {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  const encoder = new TextEncoder();
  const salt = encoder.encode(userId);

  if (stored) {
    const rawKey = base64ToBuffer(stored);
    return crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["encrypt", "decrypt"]);
  }

  const rawKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const exported = await crypto.subtle.exportKey("raw", rawKey);
  sessionStorage.setItem(STORAGE_KEY, bufferToBase64(exported));
  void salt;
  return rawKey;
}

/**
 * Encrypt journal or chat text before storing in Supabase.
 * Key is per-session in sessionStorage — plaintext never leaves the device unencrypted at rest.
 */
export async function encryptText(plaintext: string, userId: string): Promise<string> {
  const key = await getOrCreateKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return `${bufferToBase64(iv.buffer)}.${bufferToBase64(ciphertext)}`;
}

/**
 * Decrypt journal or chat text retrieved from Supabase.
 */
export async function decryptText(encrypted: string, userId: string): Promise<string> {
  if (encrypted.startsWith("demo:")) {
    const binary = atob(encrypted.slice(5));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  const [ivB64, cipherB64] = encrypted.split(".");
  if (!ivB64 || !cipherB64) return encrypted;

  const key = await getOrCreateKey(userId);
  const iv = base64ToBuffer(ivB64);
  const ciphertext = base64ToBuffer(cipherB64);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

/** Clear encryption key on sign-out or data deletion. */
export function clearEncryptionKey(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
