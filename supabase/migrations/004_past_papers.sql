CREATE TABLE past_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  board TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  year INTEGER NOT NULL,
  subject TEXT,
  description TEXT,
  file_url TEXT,
  file_size INTEGER,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_past_papers_board ON past_papers(board);
CREATE INDEX idx_past_papers_exam_type ON past_papers(exam_type);
CREATE INDEX idx_past_papers_year ON past_papers(year);
CREATE INDEX idx_past_papers_is_active ON past_papers(is_active);

ALTER TABLE past_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active past papers"
  ON past_papers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can do everything on past papers"
  ON past_papers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE TRIGGER past_papers_updated_at
  BEFORE UPDATE ON past_papers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
