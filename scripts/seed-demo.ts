/**
 * Seed 7 days of realistic demo journal entries for hackathon judges.
 * Run: npm run seed:demo -- demo@mindmirror.app password123
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

/** Load .env.local for standalone script execution (Next.js does this automatically). */
function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DEMO_ENTRIES = [
  {
    mood: 3,
    body: "Studied organic chemistry for 5 hours. Felt productive but kept comparing myself to batchmates who scored higher in today's mock. Told mom I'm fine.",
    daysAgo: 6,
  },
  {
    mood: 4,
    body: "Good day overall. Physics numericals clicked finally. Still a bit nervous about the full syllabus mock this weekend but trying to stay positive.",
    daysAgo: 5,
  },
  {
    mood: 2,
    body: "Couldn't sleep last night thinking about tomorrow's ALLEN mock test. Heart racing. Kept imagining forgetting everything on exam day. Woke up exhausted.",
    daysAgo: 4,
  },
  {
    mood: 3,
    body: "Mock test day. Actually felt calmer during the test than I expected. The anxiety was worse yesterday evening. Scored 580/720 — disappointed but not devastated.",
    daysAgo: 3,
  },
  {
    mood: 2,
    body: "Dad asked about rank improvement. Felt like a failure. Couldn't eat dinner. Everyone in coaching seems so far ahead. Maybe I'm not cut out for NEET.",
    daysAgo: 2,
  },
  {
    mood: 3,
    body: "Tried to study but kept zoning out. Watched toppers' strategy videos and felt worse. Need to stop scrolling before bed — that's when the spiral starts.",
    daysAgo: 1,
  },
  {
    mood: 2,
    body: "Another mock scheduled for tomorrow. Already feeling the dread building. Why does the night BEFORE always feel worse than the actual test? Can't focus on biology revision.",
    daysAgo: 0,
  },
];

function demoEncrypt(plaintext: string): string {
  return `demo:${Buffer.from(plaintext, "utf-8").toString("base64")}`;
}

async function main() {
  const email = process.argv[2] ?? "demo@mindmirror.app";
  const password = process.argv[3] ?? "demo123456";

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let userId: string;

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  if (existing) {
    userId = existing.id;
    console.log(`Using existing user: ${email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      console.error("Failed to create user:", error?.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`Created user: ${email}`);
  }

  await supabase
    .from("profiles")
    .upsert({
      id: userId,
      exam_type: "NEET",
      consent_at: new Date().toISOString(),
      onboarding_complete: true,
    });

  await supabase.from("journal_entries").delete().eq("user_id", userId);
  await supabase.from("insights").delete().eq("user_id", userId);

  for (const entry of DEMO_ENTRIES) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - entry.daysAgo);

    await supabase.from("journal_entries").insert({
      user_id: userId,
      encrypted_body: demoEncrypt(entry.body),
      mood_score: entry.mood,
      created_at: createdAt.toISOString(),
    });
  }

  console.log(`Seeded ${DEMO_ENTRIES.length} journal entries for ${email}`);
  console.log(`Login: ${email} / ${password}`);
}

main().catch(console.error);
