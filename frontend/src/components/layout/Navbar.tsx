import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
  const { itemCount } = useCartStore();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/products?search=${encodeURIComponent(query.trim())}` : "/products");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur dark:border-ink-800 dark:bg-ink-950/90">
      <div className="container-page flex h-16 items-center gap-4">
        <Link to="/" className="font-display shrink-0 text-lg font-bold tracking-tight text-ink-900 dark:text-white">
          Market<span className="text-amber-500">place</span>
        </Link>

        <form onSubmit={submitSearch} className="hidden flex-1 max-w-lg md:block">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="input-field"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Link to="/categories" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
            Categories
          </Link>
          {isAuthenticated && (
            <Link to="/wishlist" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
              Wishlist
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
              Admin
            </Link>
          )}
        </nav>

        <ThemeToggle />

        <Link to="/cart" className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6h15l-1.5 9h-12z" />
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
            <path d="M6 6L4 3H2" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-ink-950">
              {itemCount}
            </span>
          )}
        </Link>

        {isAuthenticated ? (
          <div className="group relative">
            <button className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white dark:bg-amber-500 dark:text-ink-950">
              {user?.full_name?.[0]?.toUpperCase()}
            </button>
            <div className="invisible absolute right-0 top-full mt-2 w-48 rounded-lg border border-ink-100 bg-white py-1.5 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 dark:border-ink-800 dark:bg-ink-900">
              <p className="truncate px-3 py-1.5 text-xs text-ink-400">{user?.email}</p>
              <Link to="/profile" className="block px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800">Profile</Link>
              <Link to="/orders" className="block px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800">Orders</Link>
              <Link to="/addresses" className="block px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800">Addresses</Link>
              <button onClick={logout} className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">Log out</button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="btn-primary !py-2 !px-3.5 text-sm">Sign in</Link>
        )}

        <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-ink-100 px-4 pb-4 md:hidden dark:border-ink-800">
          <form onSubmit={submitSearch} className="pt-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="input-field" />
          </form>
          <div className="flex flex-col pt-2">
            <Link to="/categories" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-ink-700 dark:text-ink-200">Categories</Link>
            {isAuthenticated && <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-ink-700 dark:text-ink-200">Wishlist</Link>}
            {isAdmin && <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-ink-700 dark:text-ink-200">Admin</Link>}
          </div>
        </div>
      )}
    </header>
  );
}
