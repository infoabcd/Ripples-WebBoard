import Link from "next/link";

import styles from "@/app/boards.module.css";
import LoginForm from "@/components/LoginForm";
import PageBackBar from "@/components/PageBackBar";
import TopBar from "@/components/TopBar";
import { ensureDatabase } from "@/lib/init";

export default async function LoginPage() {
  await ensureDatabase();

  return (
    <main className={styles.shell}>
      <TopBar />
      <div className={styles.pageHead}>
        <h1 className={styles.siteTitle} style={{ fontSize: 24 }}>
          登入
        </h1>
      </div>
      <PageBackBar />
      <LoginForm />
      <p className={styles.footer}>
        沒有帳號？ [<Link href="/register">註冊</Link>]
      </p>
    </main>
  );
}
