-- Ripples WebBoard data snapshot
-- Generated: 2026-07-07T14:20:23.008Z
-- Dialect source: sqlite
--
-- 匯入前請先建立 schema（見 schema.sql 或啟動應用自動遷移）
-- SQLite:  sqlite3 data/boards.sqlite < scripts/snapshots/dev-data.sql
-- MariaDB: mysql -u USER -p DBNAME < scripts/snapshots/dev-data.sql

PRAGMA foreign_keys = OFF;

DELETE FROM invite_code_uses;
DELETE FROM audit_logs;
DELETE FROM notifications;
DELETE FROM thread_favorites;
DELETE FROM thread_likes;
DELETE FROM replies;
DELETE FROM threads;
DELETE FROM invite_codes;
DELETE FROM board_moderators;
DELETE FROM boards;
DELETE FROM users;
DELETE FROM schema_migrations;

-- schema_migrations (6 rows)
INSERT INTO schema_migrations ("version", "applied_at") VALUES ('001_init', '2026-07-06T06:01:49.033Z');
INSERT INTO schema_migrations ("version", "applied_at") VALUES ('002_board_moderators', '2026-07-06T06:01:49.033Z');
INSERT INTO schema_migrations ("version", "applied_at") VALUES ('003_reply_image', '2026-07-06T06:10:28.881Z');
INSERT INTO schema_migrations ("version", "applied_at") VALUES ('004_notifications_audit', '2026-07-06T12:13:12.304Z');
INSERT INTO schema_migrations ("version", "applied_at") VALUES ('005_invite_codes', '2026-07-06T13:44:46.637Z');
INSERT INTO schema_migrations ("version", "applied_at") VALUES ('006_invite_code_uses', '2026-07-07T05:00:05.434Z');

-- users (5 rows)
INSERT INTO users ("id", "username", "password_hash", "display_name", "role", "is_trusted", "trusted_at", "created_at", "email") VALUES ('11111111-1111-4111-8111-111111111111', 'admin', '$2b$10$GVeGdt7hOgxckBt535i/0.y/vt4n6S2YZzgMN5a8t3UIHt8AHuK9i', '站長', 'admin', 1, '2026-06-07T04:00:00.000Z', '2026-05-08T04:00:00.000Z', NULL);
INSERT INTO users ("id", "username", "password_hash", "display_name", "role", "is_trusted", "trusted_at", "created_at", "email") VALUES ('22222222-2222-4222-8222-222222222222', 'trusted', '$2b$10$Y5EY7LBh.eVfnwX3OIl.7.rEyf5GBAJh6O4iAq3eILs2Pm7xFIb.q', '受信會員', 'member', 1, '2026-06-17T04:00:00.000Z', '2026-06-12T04:00:00.000Z', 'trusted@example.com');
INSERT INTO users ("id", "username", "password_hash", "display_name", "role", "is_trusted", "trusted_at", "created_at", "email") VALUES ('33333333-3333-4333-8333-333333333333', 'newbie', '$2b$10$A9/GgOQTa7j86ZFqMRRh4evHHU9lOm0yixfDQN4uvLmOyL.D5i2dW', '新用戶', 'member', 0, NULL, '2026-07-04T04:00:00.000Z', 'newbie@example.com');
INSERT INTO users ("id", "username", "password_hash", "display_name", "role", "is_trusted", "trusted_at", "created_at", "email") VALUES ('44444444-4444-4444-8444-444444444444', 'lurker', '$2b$10$5BUWLysIzybFozbn2/Vb.epeYA.Z4ktF1tNXmJSlMV20SKcTPBwC2', '潛水員', 'member', 0, NULL, '2026-06-27T04:00:00.000Z', NULL);
INSERT INTO users ("id", "username", "password_hash", "display_name", "role", "is_trusted", "trusted_at", "created_at", "email") VALUES ('55555555-5555-4555-8555-555555555555', 'modtech', '$2b$10$FpNzfqaqSPAzdUa/9MqMV.uO2fu6LfpnkfxntKwU9Tof.KVzp9rqC', '技術版主', 'moderator', 1, '2026-06-22T04:00:00.000Z', '2026-06-17T04:00:00.000Z', NULL);

-- boards (3 rows)
INSERT INTO boards ("id", "slug", "name", "description", "sort_order", "created_at") VALUES ('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'random', '雜談', '什麼都可以聊', 1, '2026-04-08T04:00:00.000Z');
INSERT INTO boards ("id", "slug", "name", "description", "sort_order", "created_at") VALUES ('aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'tech', '技術', '開發、運維與工具。', 2, '2026-04-08T04:00:00.000Z');
INSERT INTO boards ("id", "slug", "name", "description", "sort_order", "created_at") VALUES ('aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'notice', '公告', '站務通知與規則更新。', 3, '2026-04-08T04:00:00.000Z');

-- board_moderators (1 rows)
INSERT INTO board_moderators ("user_id", "board_id", "created_at") VALUES ('55555555-5555-4555-8555-555555555555', 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '2026-07-07T11:57:53.749Z');

-- invite_codes (1 rows)
INSERT INTO invite_codes ("id", "code", "note", "max_uses", "use_count", "created_at", "expires_at", "created_by") VALUES ('610fea6d-8261-4c9f-9c91-cda3088bfe46', 'DEMO-INVITE', '示範邀請碼，不限次數', 0, 0, '2026-07-07T11:57:53.751Z', NULL, '11111111-1111-4111-8111-111111111111');

-- threads (6 rows)
INSERT INTO threads ("id", "board_id", "author_id", "author_was_trusted", "title", "body", "image_path", "status", "reject_reason", "created_at", "approved_at", "view_count") VALUES ('bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '22222222-2222-4222-8222-222222222222', 1, '有人試過在 Debian 上跑 btop 嗎', '無桌面環境也能安裝，就是依賴有點多。
順便問下大家終端配色都怎麼調的？', NULL, 'approved', NULL, '2026-07-02T01:15:00.000Z', '2026-07-02T01:20:00.000Z', 128);
INSERT INTO threads ("id", "board_id", "author_id", "author_was_trusted", "title", "body", "image_path", "status", "reject_reason", "created_at", "approved_at", "view_count") VALUES ('bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', 1, '板區已迁移到 SQLite 資料庫', '資料儲存在 data/boards.sqlite，支援 SQLite / PostgreSQL / MariaDB。
後端按 Repository + Service 分層。', NULL, 'approved', NULL, '2026-07-03T06:00:00.000Z', '2026-07-03T06:05:00.000Z', 86);
INSERT INTO threads ("id", "board_id", "author_id", "author_was_trusted", "title", "body", "image_path", "status", "reject_reason", "created_at", "approved_at", "view_count") VALUES ('bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '22222222-2222-4222-8222-222222222222', 1, '【待審·受信】註冊會員應該能看到這條', '這是一條受信用戶發的待審帖。
訪客看不到，但 trusted / lurker 登入後能在 /random/ 目錄裡看到。', NULL, 'pending', NULL, '2026-07-07T02:30:00.000Z', NULL, 12);
INSERT INTO threads ("id", "board_id", "author_id", "author_was_trusted", "title", "body", "image_path", "status", "reject_reason", "created_at", "approved_at", "view_count") VALUES ('bbbbbbb4-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '33333333-3333-4333-8333-333333333333', 0, '【待審·不受信】只有管理員能看到', '不受信新號發的帖，pending 期間只有作者本人和站長能在後台/詳情看到。', NULL, 'pending', NULL, '2026-07-07T03:00:00.000Z', NULL, 3);
INSERT INTO threads ("id", "board_id", "author_id", "author_was_trusted", "title", "body", "image_path", "status", "reject_reason", "created_at", "approved_at", "view_count") VALUES ('bbbbbbb5-bbbb-4bbb-8bbb-bbbbbbbbbbb5', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '33333333-3333-4333-8333-333333333333', 0, '【已駁回】廣告測試帖', '這條應該已被駁回，訪客和註冊會員都看不到（作者和管理員除外）。', NULL, 'rejected', '疑似廣告，請勿在板區發布推廣內容。', '2026-07-05T08:00:00.000Z', NULL, 1);
INSERT INTO threads ("id", "board_id", "author_id", "author_was_trusted", "title", "body", "image_path", "status", "reject_reason", "created_at", "approved_at", "view_count") VALUES ('bbbbbbb6-bbbb-4bbb-8bbb-bbbbbbbbbbb6', 'aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '22222222-2222-4222-8222-222222222222', 1, '【待審】板區審核規則試運行通知', '受信帳號待審內容註冊會員可見；不受信帳號僅管理員可見。審核通過後對訪客公開。', NULL, 'pending', NULL, '2026-07-06T01:00:00.000Z', NULL, 5);

-- replies (5 rows)
INSERT INTO replies ("id", "thread_id", "author_id", "body", "quote_no", "status", "created_at", "image_path") VALUES ('ccccccc1-cccc-4ccc-8ccc-ccccccccccc1', 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '44444444-4444-4444-8444-444444444444', 'btop 好看，但無頭伺服器上裝 X11 依賴有點折磨。', NULL, 'approved', '2026-07-03T02:00:00.000Z', NULL);
INSERT INTO replies ("id", "thread_id", "author_id", "body", "quote_no", "status", "created_at", "image_path") VALUES ('ccccccc2-cccc-4ccc-8ccc-ccccccccccc2', 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '33333333-3333-4333-8333-333333333333', '終端配色我直接預設，懶得折騰（這條回覆本身已過審）。', 1, 'approved', '2026-07-03T03:30:00.000Z', NULL);
INSERT INTO replies ("id", "thread_id", "author_id", "body", "quote_no", "status", "created_at", "image_path") VALUES ('ccccccc3-cccc-4ccc-8ccc-ccccccccccc3', 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '33333333-3333-4333-8333-333333333333', '【待審回覆】這條回覆還在審核佇列裡，但繼承主帖可見性，能看帖的人也能看到。', 2, 'pending', '2026-07-07T04:00:00.000Z', NULL);
INSERT INTO replies ("id", "thread_id", "author_id", "body", "quote_no", "status", "created_at", "image_path") VALUES ('ccccccc4-cccc-4ccc-8ccc-ccccccccccc4', 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '22222222-2222-4222-8222-222222222222', '分層架構比單一檔案 store 好維護多了。', 1, 'approved', '2026-07-04T07:00:00.000Z', NULL);
INSERT INTO replies ("id", "thread_id", "author_id", "body", "quote_no", "status", "created_at", "image_path") VALUES ('ccccccc5-cccc-4ccc-8ccc-ccccccccccc5', 'bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3', '44444444-4444-4444-8444-444444444444', '【待審回覆】挂在待審主帖下的回覆。', 1, 'pending', '2026-07-07T02:45:00.000Z', NULL);

-- thread_likes (3 rows)
INSERT INTO thread_likes ("user_id", "thread_id", "created_at") VALUES ('44444444-4444-4444-8444-444444444444', 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '2026-07-04T00:00:00.000Z');
INSERT INTO thread_likes ("user_id", "thread_id", "created_at") VALUES ('22222222-2222-4222-8222-222222222222', 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '2026-07-04T01:00:00.000Z');
INSERT INTO thread_likes ("user_id", "thread_id", "created_at") VALUES ('33333333-3333-4333-8333-333333333333', 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '2026-07-05T02:00:00.000Z');

-- thread_favorites (2 rows)
INSERT INTO thread_favorites ("user_id", "thread_id", "created_at") VALUES ('22222222-2222-4222-8222-222222222222', 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '2026-07-05T03:00:00.000Z');
INSERT INTO thread_favorites ("user_id", "thread_id", "created_at") VALUES ('44444444-4444-4444-8444-444444444444', 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '2026-07-06T07:00:00.000Z');

-- audit_logs (1 rows)
INSERT INTO audit_logs ("id", "actor_id", "actor_name", "action", "target_type", "target_id", "summary", "metadata", "created_at") VALUES ('1e6aaabf-3dbd-476b-8ec3-9ec993701c43', '11111111-1111-4111-8111-111111111111', '站長', 'system.reseed', NULL, NULL, '重設示範資料', NULL, '2026-07-07T11:57:53.751Z');

PRAGMA foreign_keys = ON;

-- Total rows: 33