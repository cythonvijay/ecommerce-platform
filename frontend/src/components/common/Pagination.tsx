interface PaginationProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="btn-secondary !px-3 !py-2 disabled:opacity-40"
      >
        ‹
      </button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center">
          {i > 0 && nums[i - 1] !== n - 1 && <span className="px-1 text-ink-400">…</span>}
          <button
            onClick={() => onChange(n)}
            className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
              n === page
                ? "bg-ink-900 text-white dark:bg-amber-500 dark:text-ink-950"
                : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            }`}
          >
            {n}
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="btn-secondary !px-3 !py-2 disabled:opacity-40"
      >
        ›
      </button>
    </nav>
  );
}
