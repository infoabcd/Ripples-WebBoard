import styles from "@/app/boards.module.css";

export default function TrustedNotice() {
  return (
    <div className={styles.notice} role="note">
      「受信會員」內容可直接被「普通用戶(註冊用戶)」看見，通過文章後「未註冊之遊客」才將可以看見
    </div>
  );
}
