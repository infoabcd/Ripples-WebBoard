import styles from "@/app/boards.module.css";
import QuoteRefLink from "@/components/QuoteRefLink";

const QUOTE_REF = /(>>\d+)/g;

export default function PostBody({ body }: { body: string }) {
  const lines = body.split("\n");

  return (
    <div className={styles.postBody}>
      {lines.map((line, lineIndex) => {
        const parts = line.split(QUOTE_REF);
        return (
          <span key={lineIndex}>
            {lineIndex > 0 ? "\n" : null}
            {parts.map((part, partIndex) =>
              /^>>\d+$/.test(part) ? (
                <QuoteRefLink key={partIndex} text={part} />
              ) : (
                <span key={partIndex}>{part}</span>
              ),
            )}
          </span>
        );
      })}
    </div>
  );
}
