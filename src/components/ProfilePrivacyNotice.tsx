import styles from "@/app/boards.module.css";

export default function ProfilePrivacyNotice() {
  return (
    <div className={styles.notice} role="note">
      你的點讚是公開的，唯有收藏誰也看不見。
    </div>
  );
}
