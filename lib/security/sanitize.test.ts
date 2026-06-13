import { describe, it, expect } from "vitest";
import { sanitizeAiOutput } from "@/lib/security/sanitize";

describe("sanitizeAiOutput", () => {
  it("strips dangerous HTML in browser environment", () => {
    const result = sanitizeAiOutput('<script>alert("xss")</script>Hello');
    expect(result).not.toContain("<script>");
    expect(result).toContain("Hello");
  });
});
