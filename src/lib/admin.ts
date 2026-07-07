export type AdminStats = {
  boards: number;
  users: number;
  threads: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  replies: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

export function excerpt(text: string, max = 72): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max - 1)}…`;
}
