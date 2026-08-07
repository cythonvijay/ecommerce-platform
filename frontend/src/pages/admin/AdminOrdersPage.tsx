import { useState } from "react";
import { useAdminOrders } from "@/features/orders/hooks/useOrders";
import { ordersApi } from "@/features/orders/api/ordersApi";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/config/constants";
import { Spinner } from "@/components/common/Spinner";
import { Pagination } from "@/components/common/Pagination";

const NEXT_STATUS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useAdminOrders(page, 20, statusFilter || undefined);
  const queryClient = useQueryClient();

  const updateStatus = async (id: number, status: string) => {
    await ordersApi.adminUpdateStatus(id, status);
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  if (isLoading || !data) return <div className="flex justify-center py-24"><Spinner /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Orders</h1>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field !w-auto">
          <option value="">All statuses</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 text-left text-ink-500 dark:border-ink-800 dark:text-ink-400">
            <tr><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3 text-right">Update</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
            {data.items.map((o) => (
              <tr key={o.id}>
                <td className="p-3 font-medium text-ink-900 dark:text-white">{o.order_number}</td>
                <td className="p-3 text-ink-500 dark:text-ink-400">{formatDate(o.created_at)}</td>
                <td className="p-3 text-ink-600 dark:text-ink-300">{formatCurrency(o.total)}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                </td>
                <td className="p-3 text-right">
                  {NEXT_STATUS[o.status]?.length ? (
                    <select
                      defaultValue=""
                      onChange={(e) => e.target.value && updateStatus(o.id, e.target.value)}
                      className="input-field !w-auto !py-1.5 text-xs"
                    >
                      <option value="" disabled>Move to…</option>
                      {NEXT_STATUS[o.status].map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
                    </select>
                  ) : (
                    <span className="text-xs text-ink-400">Final</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </div>
  );
}
