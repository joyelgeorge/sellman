-- Sellman core schema
CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now());

-- Mirror of Taskman's brain -------------------------------------------------
CREATE TABLE IF NOT EXISTS capabilities (
  key            TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('planned','building','beta','verified','deprecated')),
  wedge          TEXT,
  summary        TEXT,
  integrations   JSONB NOT NULL DEFAULT '[]',
  limits         JSONB NOT NULL DEFAULT '[]',
  pricing_hint   JSONB,
  proof          JSONB NOT NULL DEFAULT '{}',
  synced_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brain_events (
  id          BIGSERIAL PRIMARY KEY,
  type        TEXT NOT NULL,
  capability_key TEXT NOT NULL,
  detail      JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revenue (
  id            BIGSERIAL PRIMARY KEY,
  account_ref   TEXT NOT NULL,          -- Taskman pseudonymous ref
  source_ref    TEXT,                   -- 'sellman:acct:<id>' when Sellman sourced it
  period        TEXT NOT NULL,          -- YYYY-MM
  verified_fee_cents BIGINT NOT NULL,
  currency      TEXT NOT NULL,
  synced_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_ref, period, currency)
);

CREATE TABLE IF NOT EXISTS signals_outbox (
  id          BIGSERIAL PRIMARY KEY,
  payload     JSONB NOT NULL,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Work queue --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id             BIGSERIAL PRIMARY KEY,
  kind           TEXT NOT NULL,        -- offer | content | listing | unpublish | refresh_proof | ...
  capability_key TEXT,
  reason         TEXT,
  priority       INT NOT NULL DEFAULT 5,
  status         TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','running','done','failed','skipped')),
  result         JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS tasks_open_unique ON tasks (kind, capability_key) WHERE status IN ('open','running');

-- Market ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS icps (
  key          TEXT PRIMARY KEY,
  definition   JSONB NOT NULL,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','retired')),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id              BIGSERIAL PRIMARY KEY,
  domain          TEXT UNIQUE NOT NULL,
  name            TEXT,
  icp_key         TEXT REFERENCES icps(key),
  jurisdiction    TEXT,
  evidence        JSONB NOT NULL DEFAULT '[]',
  disqualifiers   JSONB NOT NULL DEFAULT '[]',
  score           NUMERIC(6,4) NOT NULL DEFAULT 0,
  score_why       JSONB,
  stage           TEXT NOT NULL DEFAULT 'identified', -- identified | contacted | audit | installed | paying | lost
  source          TEXT,
  last_touched_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id            BIGSERIAL PRIMARY KEY,
  account_id    BIGINT REFERENCES accounts(id) ON DELETE CASCADE,
  email         TEXT UNIQUE,
  role          TEXT,
  jurisdiction  TEXT,
  lawful_basis  TEXT,     -- consent | legitimate_interest_b2b | contract
  consent_ref   TEXT,     -- pointer to stored consent record
  opted_in_lifecycle BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suppression (
  value       TEXT PRIMARY KEY,   -- email or '@domain'
  reason      TEXT NOT NULL,      -- unsubscribe | bounce | complaint | request | legal
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competitor_snapshots (
  competitor  TEXT PRIMARY KEY,
  snapshot    JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Selling -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS offers (
  id             BIGSERIAL PRIMARY KEY,
  capability_key TEXT NOT NULL REFERENCES capabilities(key),
  icp_key        TEXT,
  body           JSONB NOT NULL,
  guard_result   JSONB,
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','rejected_by_guard','pending_approval','approved','retired')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content (
  id            BIGSERIAL PRIMARY KEY,
  kind          TEXT NOT NULL,   -- page | calculator_brief | comparison | glossary | listing | community_reply | email_template | early_access_page
  slug          TEXT,
  market        TEXT,            -- global | IN
  title         TEXT,
  body          TEXT NOT NULL,
  meta          JSONB NOT NULL DEFAULT '{}',
  claims_used   JSONB NOT NULL DEFAULT '[]',
  numbers_used  JSONB NOT NULL DEFAULT '[]',
  guard_result  JSONB,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','rejected_by_guard','pending_approval','approved','published','unpublished')),
  published_url TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS channels (
  key         TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','disabled')),
  config      JSONB NOT NULL DEFAULT '{}',
  paused_reason TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id          BIGSERIAL PRIMARY KEY,
  channel_key TEXT NOT NULL REFERENCES channels(key),
  offer_id    BIGINT REFERENCES offers(id),
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval','approved','paused','done')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS touches (
  id           BIGSERIAL PRIMARY KEY,
  account_id   BIGINT REFERENCES accounts(id),
  contact_id   BIGINT REFERENCES contacts(id),
  campaign_id  BIGINT REFERENCES campaigns(id),
  channel_key  TEXT NOT NULL,
  arm_id       BIGINT,
  payload      JSONB NOT NULL DEFAULT '{}',
  status       TEXT NOT NULL DEFAULT 'queued', -- queued | held | sent | bounced | complained | replied | failed
  sent_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deliverability_daily (
  day         DATE NOT NULL,
  channel_key TEXT NOT NULL,
  sender      TEXT NOT NULL,
  sent        INT NOT NULL DEFAULT 0,
  bounced     INT NOT NULL DEFAULT 0,
  complaints  INT NOT NULL DEFAULT 0,
  PRIMARY KEY (day, channel_key, sender)
);

-- Funnel & experiments ------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id           BIGSERIAL PRIMARY KEY,
  type         TEXT NOT NULL,  -- visit | calculator_used | audit_started | audit_completed | install | paid | churned | early_access_signup | lost_install_reason
  account_id   BIGINT REFERENCES accounts(id),
  anon_id      TEXT,
  channel_key  TEXT,
  arm_id       BIGINT,
  utm          JSONB NOT NULL DEFAULT '{}',
  data         JSONB NOT NULL DEFAULT '{}',
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_type_time ON events (type, occurred_at);

CREATE TABLE IF NOT EXISTS experiments (
  id          BIGSERIAL PRIMARY KEY,
  card        JSONB NOT NULL,     -- hypothesis, primary metric, kill criterion, etc.
  conversion_event TEXT NOT NULL DEFAULT 'audit_completed',
  status      TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval','running','concluded','killed')),
  started_at  TIMESTAMPTZ,
  ended_at    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS arms (
  id            BIGSERIAL PRIMARY KEY,
  experiment_id BIGINT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  variant       JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused')),
  paused_reason TEXT
);

CREATE TABLE IF NOT EXISTS attribution_daily (
  day               DATE NOT NULL,
  channel_key       TEXT NOT NULL,
  model             TEXT NOT NULL,  -- first_touch | install_source
  visits            INT NOT NULL DEFAULT 0,
  audits_completed  INT NOT NULL DEFAULT 0,
  installs          INT NOT NULL DEFAULT 0,
  paying_accounts   INT NOT NULL DEFAULT 0,
  revenue_cents     JSONB NOT NULL DEFAULT '{}',  -- {"USD": 0, "INR": 0}
  PRIMARY KEY (day, channel_key, model)
);

-- Control plane -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approvals (
  id          BIGSERIAL PRIMARY KEY,
  kind        TEXT NOT NULL,       -- offer | content | campaign_first_send | icp_change | bet | template
  ref_table   TEXT,
  ref_id      BIGINT,
  summary     TEXT NOT NULL,
  payload     JSONB NOT NULL DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  note        TEXT,
  decided_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_state (
  agent        TEXT PRIMARY KEY,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused')),
  paused_reason TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id          BIGSERIAL PRIMARY KEY,
  agent       TEXT NOT NULL,
  worker      TEXT,
  status      TEXT NOT NULL,  -- ok | invalid_output | error | paused
  input_digest TEXT,
  output      JSONB,
  error       TEXT,
  cost_usd    NUMERIC(10,5) NOT NULL DEFAULT 0,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ai_calls (
  id          BIGSERIAL PRIMARY KEY,
  agent       TEXT,
  provider    TEXT NOT NULL,
  model       TEXT NOT NULL,
  ok          BOOLEAN NOT NULL,
  tokens_in   INT NOT NULL DEFAULT 0,
  tokens_out  INT NOT NULL DEFAULT 0,
  cost_usd    NUMERIC(10,5) NOT NULL DEFAULT 0,
  latency_ms  INT,
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insights (
  id          BIGSERIAL PRIMARY KEY,
  source      TEXT NOT NULL,     -- agent or worker name
  kind        TEXT NOT NULL,     -- finding | voc_phrase | competitor_change | community_question | kill_switch | report
  body        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS decisions (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  context     TEXT,
  decision    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
