import Link from "next/link";
import { redirect } from "next/navigation";

import styles from "@/app/boards.module.css";
import PageBackBar from "@/components/PageBackBar";
import RegisterForm from "@/components/RegisterForm";
import TopBar from "@/components/TopBar";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { getRegistrationConfig } from "@/lib/registration";

export default async function RegisterPage() {
  await ensureDatabase();
  const user = await getSessionUser();
  if (user) redirect("/me");

  const registration = getRegistrationConfig();

  return (
    <main className={styles.shell}>
      <TopBar />
      <div className={styles.pageHead}>
        <h1 className={styles.siteTitle} style={{ fontSize: 24 }}>
          註冊
        </h1>
        {registration.inviteRequired ? (
          <p className={styles.subtitle}>
            本站實行邀請註冊。
            {registration.contactEmail ? (
              <>
                {" "}
                需要邀請碼請電郵聯繫{" "}
                <a href={`mailto:${registration.contactEmail}`}>{registration.contactEmail}</a>
              </>
            ) : (
              " 請聯繫管理員獲取邀請碼。"
            )}
          </p>
        ) : null}
      </div>
      <PageBackBar />
      <RegisterForm
        inviteRequired={registration.inviteRequired}
        contactEmail={registration.contactEmail}
      />
      <p className={styles.footer}>
        已有帳號？ [<Link href="/login">登入</Link>]
      </p>
    </main>
  );
}
