export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-100 py-10 dark:border-ink-800">
      <div className="container-page flex flex-col items-center justify-between gap-3 text-sm text-ink-500 sm:flex-row dark:text-ink-400">
        <p className="font-display font-semibold text-ink-700 dark:text-ink-200">Marketplace</p>
        <p>&copy; {new Date().getFullYear()} Marketplace. Built for local development.</p>
      </div>
    </footer>
  );
}
