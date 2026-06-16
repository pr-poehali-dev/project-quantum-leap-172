
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(32) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'player',
  privilege VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id),
  author_name VARCHAR(32),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE site_settings (
  key VARCHAR(60) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO site_settings (key, value) VALUES
  ('site_title', 'MCFIRE.BOX'),
  ('hero_bg_color', '#071a0d'),
  ('accent_color', '#4ade80'),
  ('server_ip', 'mcfire.box'),
  ('server_version', '1.20.4'),
  ('online_count', '1257'),
  ('discord_url', ''),
  ('telegram_url', ''),
  ('vk_url', '');

INSERT INTO users (username, password_hash, role) VALUES
  ('Creator', 'pbkdf2:sha256:260000$mcfire$a5c8b3e1f2d4a6c8b3e1f2d4a6c8b3e1f2d4a6c8b3e1f2d4a6c8b3e1f2d4a6c8', 'creator');
