import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsContent } from "@/features/settings/settings-content";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signOut: vi.fn() },
    from: () => ({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    }),
  }),
}));

describe("SettingsContent", () => {
  it("renders helplines and sign out", () => {
    render(<SettingsContent userId="u1" examType="JEE" />);
    expect(screen.getByText(/Preparing for:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sign out of mindmirror/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/call tele-manas/i)).toBeInTheDocument();
  });
});
