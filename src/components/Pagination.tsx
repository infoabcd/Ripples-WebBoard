import Link from "next/link";

import styles from "@/app/boards.module.css";

function buildPageUrl(
  basePath: string,
  page: number,
  params: Record<string, string | undefined>,
): string {
  const [path, existing] = basePath.split("?");
  const search = new URLSearchParams(existing);
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
    else search.delete(key);
  }
  search.set("page", String(page));
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export default function Pagination({
  basePath,
  page,
  totalPages,
  sort,
  query,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  sort?: string;
  query?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const params = { ...query, ...(sort ? { sort } : {}) };
  const mk = (p: number) => buildPageUrl(basePath, p, params);

  return (
    <nav className={styles.pagination} aria-label="分頁">
      {page > 1 ? (
        <>
          [<Link href={mk(1)}>首頁</Link>] <span className={styles.topBarSep} />
          [<Link href={mk(page - 1)}>上一頁</Link>]
        </>
      ) : null}
      <span className={styles.topBarSep} />
      <span>
        第 {page} / {totalPages} 页
      </span>
      {page < totalPages ? (
        <>
          <span className={styles.topBarSep} />
          [<Link href={mk(page + 1)}>下一頁</Link>] <span className={styles.topBarSep} />
          [<Link href={mk(totalPages)}>末頁</Link>]
        </>
      ) : null}
    </nav>
  );
}
