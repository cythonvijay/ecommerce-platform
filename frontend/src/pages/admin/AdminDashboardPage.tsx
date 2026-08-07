import { useDashboardStats } from "@/features/admin/hooks/useAdmin";
import { formatCurrency } from "@/lib/format";
import { Spinner } from "@/components/common/Spinner";
import { ORDER_STATUS_LABELS } from "@/config/constants";

export default function AdminDashboardPage() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) return <div className="flex justify-center py-24"><Spinner /></div>;

  const cards = [
    { label: "Total revenue", value: formatCurrency(data.total_revenue) },
    { label: "Total orders", value: data.total_orders },
    { label: "Total products", value: data.total_products },
    { label: "Total users", value: data.total_users },
    { label: "Pending orders", value: data.pending_orders },
    { label: "Low stock products", value: data.low_stock_products },
  ];

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold text-ink-900 dark:text-white">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-ink-500 dark:text-ink-400">{c.label}</p>
            <p className="font-display mt-1 text-2xl font-bold text-ink-900 dark:text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-5">
        <h2 className="font-display mb-3 font-semibold text-ink-900 dark:text-white">Recent orders</h2>
        {data.recent_orders.length === 0 ? (
          <p className="text-sm text-ink-500 dark:text-ink-400">No orders yet.</p>
        ) : (
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {data.recent_orders.map((o) => (
              <div key={o.order_number} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium text-ink-800 dark:text-ink-100">{o.order_number}</span>
                <span className="text-ink-500 dark:text-ink-400">{ORDER_STATUS_LABELS[o.status] ?? o.status}</span>
                <span className="font-medium text-ink-900 dark:text-white">{formatCurrency(o.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
