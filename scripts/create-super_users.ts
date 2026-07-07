import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";

import { validateEnv } from "@/lib/env";
import type { User } from "@/lib/types";
import { closeDb } from "@/server/db/client";
import { runMigrations } from "@/server/db/migrate";
import { getRepositories } from "@/server/repositories";

type CliOptions = {
  username?: string;
  password?: string;
  displayName?: string;
  email?: string;
  hashOnly: boolean;
};

function printUsage(): void {
  console.log(`建立站長（超級用戶）帳號，或僅產生密碼雜湊。

用法：
  npm run db:create-super_users -- --username <用戶名> --password <密碼> [選項]
  npm run db:create-super_users -- --password <密碼> --hash-only

選項：
  --username       用戶名（3-20 位小寫字母/數字/底線）
  --password       明文密碼（至少 6 位）；亦可設環境變數 ADMIN_PASSWORD
  --display-name   顯示名稱（預設同用戶名）
  --email          電郵（可選）
  --hash-only      僅輸出 bcrypt 雜湊，不寫入資料庫
  -h, --help       顯示說明

示例：
  npm run db:create-super_users -- --username admin --password 'your-secure-password' --display-name 站長
  ADMIN_PASSWORD='secret' npm run db:create-super_users -- --username admin
`);
}

function parseCli(argv: string[]): CliOptions {
  const opts: CliOptions = { hashOnly: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--hash-only") {
      opts.hashOnly = true;
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      printUsage();
      process.exit(0);
    }
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const value = argv[++i];
    if (!value || value.startsWith("--")) {
      console.error(`缺少 ${arg} 的值`);
      printUsage();
      process.exit(1);
    }

    switch (key) {
      case "username":
        opts.username = value;
        break;
      case "password":
        opts.password = value;
        break;
      case "display-name":
        opts.displayName = value;
        break;
      case "email":
        opts.email = value;
        break;
      default:
        console.error(`未知選項：${arg}`);
        printUsage();
        process.exit(1);
    }
  }

  return opts;
}

function validateUsername(username: string): string | null {
  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
    return "用戶名須為 3-20 位小寫字母、數字或底線";
  }
  return null;
}

async function main() {
  const opts = parseCli(process.argv.slice(2));
  const password = opts.password ?? process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error("請提供 --password 或環境變數 ADMIN_PASSWORD");
    printUsage();
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("密碼至少 6 位");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  console.log("bcrypt 雜湊（password_hash）：");
  console.log(passwordHash);

  if (opts.hashOnly) {
    return;
  }

  if (!opts.username) {
    console.error("寫入資料庫時必須提供 --username");
    printUsage();
    process.exit(1);
  }

  const username = opts.username.trim().toLowerCase();
  const usernameError = validateUsername(username);
  if (usernameError) {
    console.error(usernameError);
    process.exit(1);
  }

  const displayName = (opts.displayName ?? username).trim();
  if (displayName.length < 2 || displayName.length > 24) {
    console.error("顯示名稱須為 2-24 字");
    process.exit(1);
  }

  validateEnv();
  await runMigrations();

  const repos = getRepositories();
  const existing = await repos.users.findByUsername(username);
  if (existing) {
    console.error(`用戶名「${username}」已存在（id: ${existing.id}）`);
    process.exit(1);
  }

  const now = new Date().toISOString();
  const user: User = {
    id: randomUUID(),
    username,
    passwordHash,
    displayName,
    email: opts.email?.trim().toLowerCase() || null,
    role: "admin",
    isTrusted: true,
    trustedAt: now,
    createdAt: now,
  };

  await repos.users.insert(user);

  console.log("");
  console.log("已寫入站長帳號：");
  console.log(`  id:           ${user.id}`);
  console.log(`  username:     ${user.username}`);
  console.log(`  display_name: ${user.displayName}`);
  console.log(`  role:         admin`);
  console.log(`  is_trusted:   true`);
  if (user.email) console.log(`  email:        ${user.email}`);
  console.log("");
  console.log("請使用上述用戶名與密碼登入，並訪問 /dashboard");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await closeDb();
  });
