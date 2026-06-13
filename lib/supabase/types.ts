export type ExamType = "NEET" | "JEE" | "CUET" | "CAT" | "GATE" | "UPSC";

export interface Profile {
  id: string;
  exam_type: ExamType;
  consent_at: string | null;
  onboarding_complete: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  encrypted_body: string;
  mood_score: number;
  created_at: string;
}

export interface Insight {
  id: string;
  user_id: string;
  triggers: Array<{
    label: string;
    description: string;
    evidence: string;
    confidence: string;
  }>;
  patterns: Array<{
    label: string;
    description: string;
    frequency: string;
  }>;
  burnout_score: number;
  coping_action: string;
  encouragement: string;
  generated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  encrypted_content: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          exam_type?: ExamType;
          consent_at?: string | null;
          onboarding_complete?: boolean;
          created_at?: string;
        };
        Update: {
          exam_type?: ExamType;
          consent_at?: string | null;
          onboarding_complete?: boolean;
        };
        Relationships: [];
      };
      journal_entries: {
        Row: JournalEntry;
        Insert: {
          id?: string;
          user_id: string;
          encrypted_body: string;
          mood_score: number;
          created_at?: string;
        };
        Update: {
          encrypted_body?: string;
          mood_score?: number;
        };
        Relationships: [];
      };
      insights: {
        Row: Insight;
        Insert: {
          id?: string;
          user_id: string;
          triggers: Insight["triggers"];
          patterns: Insight["patterns"];
          burnout_score: number;
          coping_action: string;
          encouragement?: string;
          generated_at?: string;
        };
        Update: Partial<Insight>;
        Relationships: [];
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: {
          id?: string;
          user_id: string;
          role: "user" | "assistant";
          encrypted_content: string;
          created_at?: string;
        };
        Update: Partial<ChatMessage>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      exam_type: ExamType;
    };
    CompositeTypes: Record<string, never>;
  };
}
