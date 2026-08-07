import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/format";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/config/constants";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import { Pagination } from "@/components/common/Pagination";

export default function OrderHistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders(page);

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>;

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Your order history will appear here once you check out."
        action={<Link to="/products" className="btn-primary mt-2">Start shopping</Link>}
      />
    );
  }

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold text-ink-900 dark:text-white">Order History</h1>
      <div className="space-y-3">
        {data.items.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:shadow-lg">
            <div>
              <p className="font-medium text-ink-900 dark:text-white">{o.order_number}</p>
              <p className="text-xs text-ink-400">{formatDate(o.created_at)} · {o.items.length} item(s)</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[o.status]}`}>
              {ORDER_STATUS_LABELS[o.status]}
            </span>
            <span className="font-display font-semibold text-ink-900 dark:text-white">{formatCurrency(o.total)}</span>
          </Link>
        ))}
      </div>
      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </div>
  );
}
