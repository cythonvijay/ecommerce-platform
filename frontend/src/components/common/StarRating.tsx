export function StarRating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex" style={{ fontSize: size }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= Math.round(value) ? "text-amber-500" : "text-ink-200 dark:text-ink-700"}>
            ★
          </span>
        ))}
      </div>
      {typeof count === "number" && <span className="text-xs text-ink-500 dark:text-ink-400">({count})</span>}
    </div>
  );
}
