-- ─────────────────────────────────────────────────────────────────
-- Riyaz Ibrahim Shaikh Portfolio – Database Schema
-- Run this entire file once in the Neon SQL Editor to create tables.
-- ─────────────────────────────────────────────────────────────────

-- Personal info stored as a flexible key-value store
-- so any field can be added/changed without schema migrations.
CREATE TABLE IF NOT EXISTS personal_info (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stats (
  id         SERIAL PRIMARY KEY,
  value      TEXT        NOT NULL,
  label      TEXT        NOT NULL,
  sort_order INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experience (
  id          SERIAL PRIMARY KEY,
  year        TEXT        NOT NULL DEFAULT '',
  company     TEXT        NOT NULL DEFAULT '',
  location    TEXT        NOT NULL DEFAULT '',
  role        TEXT        NOT NULL DEFAULT '',
  description TEXT        NOT NULL DEFAULT '',
  sort_order  INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  title       TEXT        NOT NULL DEFAULT '',
  category    TEXT        NOT NULL DEFAULT '',
  client      TEXT        NOT NULL DEFAULT '',
  description TEXT        NOT NULL DEFAULT '',
  image_url   TEXT        NOT NULL DEFAULT '',
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  sort_order  INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS education (
  id          SERIAL PRIMARY KEY,
  degree      TEXT        NOT NULL DEFAULT '',
  institution TEXT        NOT NULL DEFAULT '',
  year_detail TEXT        NOT NULL DEFAULT '',
  type        TEXT        NOT NULL DEFAULT 'degree'  -- 'degree' | 'certification'
              CHECK (type IN ('degree','certification')),
  sort_order  INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL DEFAULT '',
  detail     TEXT        NOT NULL DEFAULT '',
  sort_order INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery (
  id         SERIAL PRIMARY KEY,
  image_url  TEXT        NOT NULL DEFAULT '',
  caption    TEXT        NOT NULL DEFAULT '',
  sort_order INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS standards (
  id   SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
