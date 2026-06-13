export const EXAM_TYPES = ["NEET", "JEE", "CUET", "CAT", "GATE", "UPSC"] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

export const MOOD_LABELS = [
  { score: 1, label: "Struggling", emoji: "😔" },
  { score: 2, label: "Low", emoji: "😟" },
  { score: 3, label: "Okay", emoji: "😐" },
  { score: 4, label: "Good", emoji: "🙂" },
  { score: 5, label: "Great", emoji: "😊" },
] as const;

export const APP_NAME = "MindMirror";
