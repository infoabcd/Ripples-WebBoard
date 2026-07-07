import Link from "next/link";

import styles from "@/app/boards.module.css";
import BackLink from "@/components/BackLink";
import PageHeadBrand from "@/components/PageHeadBrand";
import TopBar from "@/components/TopBar";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { getRegistrationConfig } from "@/lib/registration";
import { listBoards } from "@/server/services/board.service";

export default async function AboutPage() {
  await ensureDatabase();
  const boards = await listBoards();
  const user = await getSessionUser();
  const registration = getRegistrationConfig();

  return (
    <main className={styles.shell}>
      <TopBar />

      <PageHeadBrand
        title="關於 Ripples WebBoard"
        subtitle="漣漪看板 · Dontalk(.org) Team"
        titleStyle={{ fontSize: 26 }}
      />

      <p className={styles.aboutLead}>
      知識應該被傳遞，工具應該能被使用，痛苦應該能被聽見，人應該重新連結。
      <br />
      而不是一個本來可以更自由、更共享、更有愛的網路世界，被重新圈起來、賣回給使用者。
      <br />
      我對現在的網路感到失望，甚至乎是淡淡的絕望。
      <br /><br />
      「计算机网路发展史是一部贡献，共享和爱的史诗，但却总有人希望它回归私有化。」</p>

      <section className={styles.aboutSection}>
        <h2>這是什麼</h2>
        <h4><strong>這是一個多元，NSFW的討論板。</strong></h4>
        <p>
          本站參考經典 imageboard / 文字看板的使用習慣(如 2/4chan、PTT 等)。
          你可以註冊一個帳號，加入到這個BBS不同分區的討論中。
        </p>
        <p>
          此項目是一個開源項目，由 <a href="https://dontalk.org" target="_blank" rel="noopener noreferrer">Dontalk(.org)</a>{" "}
          實驗沙盒中獨立出來，Github倉庫：<a href="https://github.com/infoabcd/Ripples-WebBoard.git" target="_blank" rel="noopener noreferrer">https://github.com/infoabcd/Ripples-WebBoard.git</a>
          <br />
          ** * <strong>代碼使用 MIT 許可證，並使用 AI 生成部分程式碼，如果你想要部署/二次開發該項目，你最不應該去掉 Dontalk(.org) 的署名。</strong>
        </p>
      </section>

      <section className={styles.aboutSection}>
        <h2>怎麼加入討論</h2>
        <ul className={styles.aboutList}>
          <li>
            首頁選擇分區（目前共 <strong>{boards.length}</strong> 個），進入目錄瀏覽主題。
          </li>
          <li>
            每帖配圖一次至多只能上傳一張(程式設計)，如果你想上傳更多，只好跟貼自己。
          </li>
          <li>
            點進主題可閱讀回覆；登入後可發帖、回覆、點讚與收藏。(你的點贊是公開的，唯有收藏誰也看不見)
          </li>
          <li>
            回覆支援 <code>&gt;&gt;N</code> 引用樓層，點擊可跳轉到對應帖子。
          </li>
          <li>
            使用頂欄「搜尋」可在可見主題與回覆正文中搜尋關鍵字。
          </li>
          <li>
            個人中心 <Link href="/me">/me</Link> 可查看自己的主題、點讚、收藏與通知
          </li>
        </ul>
      </section>

      <section className={styles.aboutSection}>
        <h2>審核與可見性</h2>
        <p>新帳號預設<strong>不受信</strong>。發帖與回覆需經版主或站長審核後公開。</p>
        <ul className={styles.aboutList}>
          <li>
            <strong>不受信用戶</strong>的待審主題/回覆：僅作者本人、版主、站長可見。
          </li>
          <li>
            <strong>受信用戶</strong>的待審內容：註冊會員即可見（仍待審核，但社群可參與討論）。
          </li>
          <li>已通過的內容對訪客與會員公開；被駁回的內容僅作者與管理可見。</li>
        </ul>
        <p>受信狀態由站長在管理後台授予，用於認可長期友善、有貢獻的成員。</p>
      </section>

      <section className={styles.aboutSection}>
        <h2>註冊</h2>
        {registration.inviteRequired ? (
          <>
            <p>本站實行<strong>邀請碼註冊</strong>，沒有邀請碼無法完成註冊。</p>
            {registration.contactEmail ? (
              <p>
                需要邀請碼請電郵聯繫{" "}
                <a href={`mailto:${registration.contactEmail}`}>{registration.contactEmail}</a>。
              </p>
            ) : (
              <p>請聯繫管理員獲取邀請碼。</p>
            )}
          </>
        ) : (
          <p>目前開放註冊，訪客可直接 <Link href="/register">註冊帳號</Link>。</p>
        )}
        {user ? (
          <p>
            你已登入為 <strong>{user.displayName}</strong>
            {user.isTrusted ? "（受信會員）" : "（普通會員）"}。
          </p>
        ) : (
          <p>
            已有帳號可 <Link href="/login">登入</Link>，新用戶請 <Link href="/register">註冊</Link>。
          </p>
        )}
      </section>

      <section className={styles.aboutSection}>
        <h2>社群約定</h2>
        <ul className={styles.aboutList}>
          <li>
            1.尊重他人，禁止騷擾、人肉、惡意灌水。
          </li>
          <li>
            2.發帖請選對分區；標題清楚，正文可讀。
          </li>
          <li>
            3.如果你想開通新板塊，請聯繫{" "}
          <a href={`mailto:${registration.contactEmail}`}>{registration.contactEmail}</a>。
          <br />
          請願者大於「7」個人就考慮開通新板塊。
          </li>
          <li>
            4.站內不允許發表 宗教政治、暴力仇恨、歧視造謠 等不理性、不中立且違反法律法規的內容
          </li>
          <li>
            5.色情內容(NSFW)被允許，但 兒童色情、虐待動物、違反人類倫理道德 的內容被嚴格禁止。
          </li>
          <li>
            6.你不應該在論壇輕易與人交易(如買賣、交換、贈送等)，網站不承擔任何你被欺騙的責任。
          <br />
          站長/版主 不會向你索要任何 密碼、驗證碼、錢財。
          <br />
          站長/版主 出售任何東西都會走 Dontalk(.org) 商店/擔保、eBay、閒魚等平台，如果你有出售物品的需求，請聯繫站長/版主。
          </li>
          <li>
            7.你應該知道，網站不會分享你的任何數據，包括你的密碼(已被加密)、郵箱、IP地址、Cookie等。
          </li>
        </ul>
      </section>

      <section className={styles.aboutSection}>
        <h2>說明</h2>
        <p>
          此項目是一個開源項目，由 <a href="https://dontalk.org" target="_blank" rel="noopener noreferrer">Dontalk(.org)</a>{" "}
          實驗沙盒中獨立出來，Github倉庫：<a href="https://github.com/infoabcd/Ripples-WebBoard.git" target="_blank" rel="noopener noreferrer">https://github.com/infoabcd/Ripples-WebBoard.git</a>
          <br />
          ** * <strong>代碼使用 MIT 許可證，並使用 AI 生成部分程式碼，如果你想要部署/二次開發該項目，你最不應該去掉 Dontalk(.org) 的署名。</strong>
        </p>
        <p>如果你想要部署/二次開發該項目，你最不應該去掉「項目地址」與「Dontalk(.org)」的署名。</p>
        <p>如果你想要部署/二次開發該項目，你最不應該去掉「項目地址」與「Dontalk(.org)」的署名。</p>
        <p>如果你想要部署/二次開發該項目，你最不應該去掉「項目地址」與「Dontalk(.org)」的署名。</p>
      </section>

      <div className={styles.aboutActions}>
        [<BackLink />]
        <span className={styles.topBarSep} />
        [<Link href="/">返回首頁</Link>]
        <span className={styles.topBarSep} />
        [<Link href="/search">搜尋</Link>]
        {!user ? (
          <>
            <span className={styles.topBarSep} />
            [<Link href="/register">註冊</Link>]
            <span className={styles.topBarSep} />
            [<Link href="/login">登入</Link>]
          </>
        ) : null}
      </div>

      <footer className={styles.footer}>
        Ripples WebBoard 漣漪看板 · {new Date().getFullYear()} ·{" "}
        <a href="https://dontalk.org" target="_blank" rel="noopener noreferrer">
          Dontalk(.org)
        </a>
      </footer>
    </main>
  );
}
