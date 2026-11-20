BEGIN;
CREATE TABLE work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES worker_profiles ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX history_by_worker ON work_history(worker_id);
CREATE TABLE reference_reviews (
  history_id uuid PRIMARY KEY REFERENCES work_history,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','declined')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewer_id uuid REFERENCES users,
  CHECK ((status='pending') = (reviewed_at IS NULL)),
  CHECK ((status='pending') = (reviewer_id IS NULL))
);
CREATE TABLE reference_reviewers (
  user_id uuid PRIMARY KEY REFERENCES users
);
COMMIT;
