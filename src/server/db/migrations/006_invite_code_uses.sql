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
