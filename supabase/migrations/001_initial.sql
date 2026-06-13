-- MindMirror initial schema
CREATE TYPE exam_type AS ENUM ('NEET', 'JEE', 'CUET', 'CAT', 'GATE', 'UPSC');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type exam_type NOT NULL DEFAULT 'NEET',
  consent_at TIMESTAMPTZ,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_body TEXT NOT NULL,
  mood_score SMALLINT NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  triggers JSONB NOT NULL DEFAULT '[]',
  patterns JSONB NOT NULL DEFAULT '[]',
  burnout_score SMALLINT NOT NULL CHECK (burnout_score BETWEEN 0 AND 100),
  coping_action TEXT NOT NULL,
  encouragement TEXT NOT NULL DEFAULT '',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  encrypted_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journal_entries_user_created ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_insights_user_generated ON insights(user_id, generated_at DESC);
CREATE INDEX idx_chat_messages_user_created ON chat_messages(user_id, created_at DESC);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users delete own profile" ON profiles FOR DELETE USING (auth.uid() = id);

CREATE POLICY "Users read own journal" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own journal" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own journal" ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own journal" ON journal_entries FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own insights" ON insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own insights" ON insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own insights" ON insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own insights" ON insights FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own chat" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own chat" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own chat" ON chat_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own chat" ON chat_messages FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
