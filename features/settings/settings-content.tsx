"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearEncryptionKey } from "@/lib/crypto/journal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { HELPLINES, CRISIS_DISCLAIMER, THERAPY_DISCLAIMER } from "@/features/crisis/helplines";

interface DeleteDataProps {
  userId: string;
}

/** Delete all user data and sign out. */
export function DeleteAllData({ userId }: DeleteDataProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();

    await supabase.from("chat_messages").delete().eq("user_id", userId);
    await supabase.from("insights").delete().eq("user_id", userId);
    await supabase.from("journal_entries").delete().eq("user_id", userId);
    await supabase.from("profiles").delete().eq("id", userId);

    clearEncryptionKey();
    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <h2 className="text-base font-semibold tracking-tight text-rose-400">Delete All My Data</h2>
        <CardDescription>
          Permanently remove all journal entries, insights, chat history, and your profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!confirming ? (
          <Button variant="destructive" onClick={() => setConfirming(true)} aria-label="Delete all my data">
            Delete Everything
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-destructive" role="alert">
              This cannot be undone. Are you absolutely sure?
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                aria-label="Confirm delete all data"
              >
                {loading ? "Deleting…" : "Yes, delete all data"}
              </Button>
              <Button variant="outline" onClick={() => setConfirming(false)} aria-label="Cancel data deletion">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SettingsContent({ userId, examType }: { userId: string; examType: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    clearEncryptionKey();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Privacy, safety, and account</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold tracking-tight">Your Profile</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Preparing for: <strong>{examType}</strong>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold tracking-tight">Disclaimers</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{THERAPY_DISCLAIMER}</p>
          <p>{CRISIS_DISCLAIMER}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold tracking-tight">Crisis Helplines</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2" role="list">
            {HELPLINES.map((h) => (
              <li key={h.name} className="text-sm">
                <strong>{h.name}</strong>:{" "}
                <a
                  href={`tel:${h.number}`}
                  className="text-primary underline"
                  aria-label={`Call ${h.name} at ${h.number}`}
                >
                  {h.number}
                </a>{" "}
                — {h.hours}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <DeleteAllData userId={userId} />

      <Button variant="outline" onClick={handleSignOut} aria-label="Sign out of MindMirror">
        Sign Out
      </Button>
    </div>
  );
}
