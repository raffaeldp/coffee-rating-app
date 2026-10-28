import Link from "next/link";

// Pencil link to a Coffee's edit page; `back` is where saving returns to.
export function EditLink({ token, coffeeId, back, label }: { token: string; coffeeId: number; back: string; label: string }) {
  return (
    <Link className="edit" href={`/m/${token}/coffee/${coffeeId}?back=${back}`} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    </Link>
  );
}
