-- Ripples WebBoard schema (from migrations)
-- 建議先執行遷移：npm run dev 啟動一次(程式碼帶了遷移功能)，會初始化資料庫結構
-- 或於空庫手動執行本檔

-- 001_init.sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  is_trusted INTEGER NOT NULL DEFAULT 0,
  trusted_at TEXT,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username);

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_boards_slug ON boards (slug);

CREATE TABLE IF NOT EXISTS threads (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_was_trusted INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reject_reason TEXT,
  created_at TEXT NOT NULL,
  approved_at TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (board_id) REFERENCES boards(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_threads_board ON threads (board_id);
CREATE INDEX IF NOT EXISTS idx_threads_author ON threads (author_id);
CREATE INDEX IF NOT EXISTS idx_threads_status ON threads (status);
CREATE INDEX IF NOT EXISTS idx_threads_created ON threads (created_at);

CREATE TABLE IF NOT EXISTS replies (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  body TEXT NOT NULL,
  quote_no INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_replies_thread ON replies (thread_id);

CREATE TABLE IF NOT EXISTS thread_likes (
  user_id TEXT NOT NULL,
  thread_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, thread_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS thread_favorites (
  user_id TEXT NOT NULL,
  thread_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, thread_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

-- 002_board_moderators.sql
CREATE TABLE IF NOT EXISTS board_moderators (
  user_id TEXT NOT NULL,
  board_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, board_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_board_moderators_board ON board_moderators (board_id);

-- 003_reply_image.sql
ALTER TABLE replies ADD COLUMN image_path TEXT;

-- 004_notifications_audit.sql
ALTER TABLE users ADD COLUMN email TEXT;

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id, read_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  summary TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at DESC);

-- 005_invite_codes.sql
CREATE TABLE IF NOT EXISTS invite_codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  note TEXT,
  max_uses INTEGER NOT NULL DEFAULT 1,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  created_by TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes (code);

-- 006_invite_code_uses.sql
CREATE TABLE IF NOT EXISTS invite_code_uses (
  id TEXT PRIMARY KEY,
  invite_code_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  used_at TEXT NOT NULL,
  FOREIGN KEY (invite_code_id) REFERENCES invite_codes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_invite_code_uses_invite ON invite_code_uses(invite_code_id);
CREATE INDEX IF NOT EXISTS idx_invite_code_uses_used_at ON invite_code_uses(used_at DESC);

-- 0 表示不限次数；将已有邀请码改为可重复使用
UPDATE invite_codes SET max_uses = 0;
