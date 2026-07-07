# 開發用資料庫快照

## 產生快照

```bash
npm run db:export              # 僅資料（dev-data.sql）
npm run db:export -- --with-schema   # 另附 schema.sql（合併所有 migration）
# -- 建議先執行遷移：npm run dev 啟動一次(程式碼帶了遷移功能)，會初始化資料庫結構
# -- 或於空庫手動執行schema.sql
```

## 匯入 SQLite（預設）

```bash
cp .env.example .env
npm install
npm run dev

sqlite3 data/boards.sqlite < scripts/snapshots/dev-data.sql
npm run dev
```

## 手動建立站長帳號

空庫遷移後，可用 CLI 直接寫入 `role=admin` 用戶（繞過註冊與邀請碼）：

```bash
npm run db:create-super_users -- --username admin --password 'your-secure-password' --display-name 站長
```

僅產生 bcrypt 雜湊、不寫庫：

```bash
npm run db:create-super_users -- --password 'your-secure-password' --hash-only
```

密碼也可經環境變數 `ADMIN_PASSWORD` 傳入，避免出現在 shell 歷史。

## 匯入 MariaDB

1. 建立空資料庫，在 `.env` 設定 `DATABASE_DIALECT=mariadb` 與連線字串。
2. 啟動應用一次以執行遷移（或執行 `schema.sql` 並依需要調整語法）。
3. 匯入資料：

```bash
mysql -u USER -p DBNAME < scripts/snapshots/dev-data.sql
```

True/False欄位以 `0`/`1` 儲存，與本專案 migration 一致。

## 注意

- 快照含密碼雜湊與示範內容，僅供開發環境使用。
- 重新匯入會先 `DELETE` 各表再 `INSERT`，請勿在生產環境執行。
- 上傳圖片在 `public/uploads/`，不在 SQL 內；需另備或重新上傳。
