CREATE TABLE users (
  id text PRIMARY KEY,
  username text,
  twitter_access_token text,
  twitter_refresh_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
