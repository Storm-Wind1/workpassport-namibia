BEGIN;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (email = trim(email) AND email <> ''),
  password_hash text NOT NULL,
  display_name text NOT NULL CHECK (trim(display_name) <> ''),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_ci ON users (lower(email));

CREATE TABLE sessions (
  token_digest bytea PRIMARY KEY CHECK (octet_length(token_digest) = 32),
  user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL CHECK (expires_at > created_at)
);
CREATE INDEX sessions_by_user ON sessions (user_id);

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trading_name text NOT NULL CHECK (trim(trading_name) <> ''),
  business_status text NOT NULL CHECK (business_status IN ('informal', 'registered'))
);
CREATE TABLE memberships (
  organization_id uuid NOT NULL REFERENCES organizations ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'recruiter', 'member')),
  PRIMARY KEY (organization_id, user_id)
);
CREATE INDEX memberships_by_user ON memberships (user_id);

CREATE TABLE worker_profiles (
  user_id uuid PRIMARY KEY REFERENCES users ON DELETE CASCADE,
  headline text NOT NULL DEFAULT '',
  location text NOT NULL,
  bio text NOT NULL DEFAULT '',
  available boolean NOT NULL DEFAULT true,
  published boolean NOT NULL DEFAULT false
);
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (name = trim(name) AND name <> '')
);
CREATE UNIQUE INDEX skills_name_ci ON skills (lower(name));
CREATE TABLE worker_skills (
  worker_id uuid NOT NULL REFERENCES worker_profiles ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills,
  PRIMARY KEY (worker_id, skill_id)
);

CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by uuid NOT NULL REFERENCES users,
  organization_id uuid REFERENCES organizations,
  title text NOT NULL CHECK (trim(title) <> ''),
  description text NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  work_type text NOT NULL,
  pay_description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX jobs_by_org ON jobs (organization_id);
CREATE TABLE job_skills (
  job_id uuid NOT NULL REFERENCES jobs ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills,
  PRIMARY KEY (job_id, skill_id)
);
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs,
  applicant_id uuid NOT NULL REFERENCES users,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'withdrawn', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, applicant_id)
);
CREATE INDEX applications_by_applicant ON applications (applicant_id);
CREATE TABLE quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES users,
  organization_id uuid REFERENCES organizations,
  worker_id uuid NOT NULL REFERENCES worker_profiles,
  description text NOT NULL CHECK (trim(description) <> ''),
  budget_nad numeric(14,2) CHECK (budget_nad >= 0 AND budget_nad <> 'NaN'::numeric),
  offered_nad numeric(14,2) CHECK (offered_nad >= 0 AND offered_nad <> 'NaN'::numeric),
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'offered', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (worker_id <> requester_id),
  CHECK (status NOT IN ('offered', 'accepted') OR offered_nad IS NOT NULL)
);
CREATE INDEX quotations_by_requester ON quotations (requester_id);
CREATE INDEX quotations_by_worker ON quotations (worker_id);

COMMIT;
