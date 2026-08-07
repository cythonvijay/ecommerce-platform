import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-200 py-16 text-center dark:border-ink-800">
      <h3 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-500 dark:text-ink-400">{description}</p>}
      {action}
    </div>
  );
}
