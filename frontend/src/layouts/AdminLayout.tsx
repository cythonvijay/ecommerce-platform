import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Link } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/users", label: "Users" },
];

export function AdminLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-100 bg-white p-4 dark:border-ink-800 dark:bg-ink-900 md:flex">
        <Link to="/" className="font-display mb-6 px-2 text-lg font-bold text-ink-900 dark:text-white">
          Market<span className="text-amber-500">place</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-ink-900 text-white dark:bg-amber-500 dark:text-ink-950"
                    : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-2 border-t border-ink-100 pt-4 dark:border-ink-800">
          <p className="truncate px-2 text-xs text-ink-400">{user?.email}</p>
          <button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
            Log out
          </button>
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-ink-100 px-6 dark:border-ink-800">
          <p className="font-display font-semibold text-ink-800 dark:text-ink-100">Admin Panel</p>
          <ThemeToggle />
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
