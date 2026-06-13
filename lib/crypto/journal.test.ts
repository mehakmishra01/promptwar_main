import { describe, it, expect, beforeEach } from "vitest";
import { encryptText, decryptText, clearEncryptionKey } from "@/lib/crypto/journal";

describe("journal crypto", () => {
  beforeEach(() => {
    clearEncryptionKey();
    sessionStorage.clear();
  });

  it("encrypts and decrypts round-trip", async () => {
    const plaintext = "Today was a tough mock test day";
    const encrypted = await encryptText(plaintext, "user-1");
    expect(encrypted).not.toContain(plaintext);
    const decrypted = await decryptText(encrypted, "user-1");
    expect(decrypted).toBe(plaintext);
  });

  it("decrypts demo-prefixed entries from seed script", async () => {
    const encoded = btoa("Seeded demo entry");
    const decrypted = await decryptText(`demo:${encoded}`, "user-1");
    expect(decrypted).toBe("Seeded demo entry");
  });
});
