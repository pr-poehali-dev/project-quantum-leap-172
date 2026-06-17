-- Система наказаний
CREATE TABLE punishments (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(32) NOT NULL,
  reason VARCHAR(200) NOT NULL,
  punishment_type VARCHAR(20) NOT NULL,  -- ban | mute
  issued_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,                   -- NULL = перманентно
  admin_name VARCHAR(32) NOT NULL,
  proof_url TEXT DEFAULT '',
  active BOOLEAN DEFAULT TRUE,
  removed_by VARCHAR(32),
  removed_at TIMESTAMP
);
CREATE INDEX idx_punishments_player ON punishments(player_name);
CREATE INDEX idx_punishments_active ON punishments(active);

-- Жалобы и обжалования
CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  kind VARCHAR(30) NOT NULL,              -- player_report | appeal | staff_report
  author_name VARCHAR(32) NOT NULL,
  target_name VARCHAR(32) DEFAULT '',     -- на кого жалоба / какой админ
  text TEXT NOT NULL,
  proof_url TEXT DEFAULT '',
  punishment_id INTEGER REFERENCES punishments(id),
  status VARCHAR(20) DEFAULT 'open',      -- open | accepted | rejected
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_by VARCHAR(32),
  reviewed_at TIMESTAMP
);
CREATE INDEX idx_complaints_status ON complaints(status);

-- Журнал действий персонала
CREATE TABLE action_logs (
  id SERIAL PRIMARY KEY,
  actor_name VARCHAR(32) NOT NULL,
  actor_role VARCHAR(20) NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Дополнительные настройки сайта (аватар, слайд-шоу, JSON-блоки)
INSERT INTO site_settings (key, value) VALUES
  ('logo_url', 'https://cdn.poehali.dev/projects/2e83ccfa-ea22-4097-88e8-31abba7dbd2b/bucket/c9bc29d5-607e-4f60-aca7-ff80bcb975a6.png'),
  ('bg_image_url', ''),
  ('slideshow_interval', '12'),
  ('slideshow_images', '["https://cdn.poehali.dev/projects/2e83ccfa-ea22-4097-88e8-31abba7dbd2b/files/367989cc-e289-4e27-996f-13dd62749b4a.jpg"]'),
  ('privileges_json', '[{"id":"vip","name":"VIP","color":"#4ade80","price":149,"desc":"Доступ к базовым возможностям /kit vip, префикс"},{"id":"premium","name":"PREMIUM","color":"#22d3ee","price":299,"desc":"Увеличенные лимиты /kit premium, префикс и многое другое"},{"id":"elite","name":"ELITE","color":"#a78bfa","price":499,"desc":"Отличные возможности /kit elite, префикс, эффекты"},{"id":"legend","name":"LEGEND","color":"#fbbf24","price":999,"desc":"Максимум возможностей /kit legend, префикс, полёт"},{"id":"dragon","name":"DRAGON","color":"#f87171","price":1999,"desc":"Только для настоящих легенд /kit dragon, префикс, частички"}]'),
  ('coins_json', '[{"id":"c1","name":"1000 коинов","desc":"Стартовый пакет","price":99,"image":""},{"id":"c2","name":"5000 коинов","desc":"Популярный выбор","price":399,"image":""}]'),
  ('cases_json', '[{"id":"k1","name":"Обычный кейс","desc":"Базовые награды","chance":"60%","price":49,"image":""},{"id":"k2","name":"Легендарный кейс","desc":"Редкие предметы","chance":"5%","price":199,"image":""}]'),
  ('battlepass_json', '{"price":569,"levels":[{"level":1,"reward":"500 коинов"},{"level":2,"reward":"Набор ресурсов"},{"level":3,"reward":"Эксклюзивный скин"}]}'),
  ('menu_buttons_json', '[{"label":"Главная","link":"/","visible":true},{"label":"Новости","link":"#news","visible":true},{"label":"Донат","link":"#donate","visible":true},{"label":"Тикеты","link":"#tickets","visible":true}]')
ON CONFLICT (key) DO NOTHING;
