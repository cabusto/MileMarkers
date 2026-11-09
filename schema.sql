create table if not exists athletes (
  id bigint primary key,            -- Strava athlete ID
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,       -- unix seconds
  created_at timestamptz not null default now()
);
