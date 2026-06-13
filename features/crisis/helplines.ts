export interface Helpline {
  name: string;
  number: string;
  description: string;
  hours: string;
}

/** Verified Indian mental health helplines for crisis support. */
export const HELPLINES: Helpline[] = [
  {
    name: "Tele-MANAS",
    number: "14416",
    description: "National tele-mental health helpline (Government of India)",
    hours: "24/7",
  },
  {
    name: "iCall",
    number: "9152987821",
    description: "Psychosocial helpline by TISS",
    hours: "Mon–Sat, 8 AM – 10 PM",
  },
  {
    name: "AASRA",
    number: "9820466726",
    description: "Crisis intervention and suicide prevention",
    hours: "24/7",
  },
];

export const CRISIS_DISCLAIMER =
  "MindMirror is not a therapist or emergency service. If you are in crisis, please reach out to a professional helpline immediately.";

export const THERAPY_DISCLAIMER =
  "I am an AI companion, not a licensed therapist. I can listen and suggest coping strategies, but I cannot provide medical or clinical advice.";

/**
 * Formats helpline numbers for crisis response messages.
 *
 * @returns Bullet list of helpline name and number pairs.
 */
export function formatHelplineList(): string {
  return HELPLINES.map((h) => `- ${h.name}: ${h.number}`).join("\n");
}
