
CREATE TABLE IF NOT EXISTS t_p80389626_project_quantum_leap.balance (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES t_p80389626_project_quantum_leap.users(id),
  amount     INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS balance_user_id_idx ON t_p80389626_project_quantum_leap.balance(user_id);

CREATE TABLE IF NOT EXISTS t_p80389626_project_quantum_leap.balance_transactions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES t_p80389626_project_quantum_leap.users(id),
  delta      INTEGER NOT NULL,
  reason     TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS t_p80389626_project_quantum_leap.inventory (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES t_p80389626_project_quantum_leap.users(id),
  item_name   TEXT NOT NULL,
  item_rarity TEXT NOT NULL DEFAULT 'common',
  item_color  TEXT NOT NULL DEFAULT '#9ca3af',
  item_image  TEXT NOT NULL DEFAULT '',
  case_name   TEXT NOT NULL DEFAULT '',
  obtained_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS t_p80389626_project_quantum_leap.case_items (
  id      SERIAL PRIMARY KEY,
  case_id TEXT NOT NULL,
  name    TEXT NOT NULL,
  rarity  TEXT NOT NULL DEFAULT 'common',
  color   TEXT NOT NULL DEFAULT '#9ca3af',
  image   TEXT NOT NULL DEFAULT '',
  weight  INTEGER NOT NULL DEFAULT 10
);
