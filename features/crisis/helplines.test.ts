import { describe, it, expect } from "vitest";
import { formatHelplineList } from "@/features/crisis/helplines";

describe("formatHelplineList", () => {
  it("includes all verified helplines", () => {
    const text = formatHelplineList();
    expect(text).toContain("Tele-MANAS");
    expect(text).toContain("14416");
    expect(text).toContain("iCall");
    expect(text).toContain("AASRA");
  });
});
