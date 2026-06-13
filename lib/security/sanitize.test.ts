import { describe, it, expect } from "vitest";
import { sanitizeAiOutput } from "@/lib/security/sanitize";

describe("sanitizeAiOutput", () => {
  it("strips dangerous HTML in browser environment", () => {
    const result = sanitizeAiOutput('<script>alert("xss")</script>Hello');
    expect(result).not.toContain("<script>");
    expect(result).toContain("Hello");
  });

  it("escapes HTML when window is undefined (SSR)", () => {
    const originalWindow = global.window;
    // @ts-expect-error simulate server render
    delete global.window;
    expect(sanitizeAiOutput("<b>hi</b>")).toBe("&lt;b&gt;hi&lt;/b&gt;");
    global.window = originalWindow;
  });
});
