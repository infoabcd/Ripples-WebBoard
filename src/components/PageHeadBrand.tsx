import Image from "next/image";
import type { CSSProperties } from "react";

import styles from "@/app/boards.module.css";

export default function PageHeadBrand({
  title,
  subtitle,
  titleStyle,
}: {
  title: string;
  subtitle: string;
  titleStyle?: CSSProperties;
}) {
  return (
    <div className={styles.pageHeadBrand}>
      <Image
        src="/logo.png"
        alt="Ripples WebBoard"
        width={72}
        height={72}
        className={styles.pageHeadLogo}
        priority
      />
      <div className={styles.pageHead}>
        <h1 className={styles.siteTitle} style={titleStyle}>
          {title}
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}
