create table if not exists athletes (
  id bigint primary key,            -- Strava athlete ID
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,       -- unix seconds
  created_at timestamptz not null default now(),
  next_name integer not null default 0 -- index into NAMES for this athlete's next rename
);

-- Existing databases:
alter table athletes add column if not exists next_name integer not null default 0;
