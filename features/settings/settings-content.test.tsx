import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsContent, DeleteAllData } from "@/features/settings/settings-content";
import { clearEncryptionKey } from "@/lib/crypto/journal";

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMocks,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
    from: () => ({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    }),
  }),
}));

vi.mock("@/lib/crypto/journal", () => ({
  clearEncryptionKey: vi.fn(),
}));

describe("SettingsContent", () => {
  it("renders helplines and sign out", () => {
    render(<SettingsContent userId="u1" examType="JEE" />);
    expect(screen.getByText(/Preparing for:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sign out of mindmirror/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/call tele-manas/i)).toBeInTheDocument();
  });

  it("signs out and redirects home", async () => {
    const user = userEvent.setup();
    render(<SettingsContent userId="u1" examType="JEE" />);
    await user.click(screen.getByLabelText(/sign out of mindmirror/i));
    await waitFor(() => expect(clearEncryptionKey).toHaveBeenCalled());
    expect(routerMocks.push).toHaveBeenCalledWith("/");
  });
});

describe("DeleteAllData", () => {
  it("shows confirmation before deleting", async () => {
    const user = userEvent.setup();
    render(<DeleteAllData userId="u1" />);
    await user.click(screen.getByLabelText(/delete all my data/i));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm delete all data/i)).toBeInTheDocument();
  });

  it("deletes all data after confirmation", async () => {
    const user = userEvent.setup();
    render(<DeleteAllData userId="u1" />);
    await user.click(screen.getByLabelText(/delete all my data/i));
    await user.click(screen.getByLabelText(/confirm delete all data/i));
    await waitFor(() => expect(clearEncryptionKey).toHaveBeenCalled());
    expect(routerMocks.push).toHaveBeenCalledWith("/");
  });

  it("cancels deletion confirmation", async () => {
    const user = userEvent.setup();
    render(<DeleteAllData userId="u1" />);
    await user.click(screen.getByLabelText(/delete all my data/i));
    await user.click(screen.getByLabelText(/cancel data deletion/i));
    expect(screen.getByLabelText(/delete all my data/i)).toBeInTheDocument();
  });
});
