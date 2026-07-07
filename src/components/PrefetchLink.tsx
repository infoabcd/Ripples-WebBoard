import Link from "next/link";

export default function PrefetchLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} prefetch={false} className={className}>
      {children}
    </Link>
  );
}
