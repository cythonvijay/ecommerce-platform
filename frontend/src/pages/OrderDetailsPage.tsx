import { useParams, Link } from "react-router-dom";
import { useOrder } from "@/features/orders/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/format";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/config/constants";
import { Spinner } from "@/components/common/Spinner";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { data: order, isLoading } = useOrder(id ? Number(id) : undefined);

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (!order) return <p className="py-16 text-center text-ink-500">Order not found.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/orders" className="mb-4 inline-block text-sm text-ink-500 hover:text-ink-800 dark:hover:text-ink-200">← Back to orders</Link>
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">{order.order_number}</h1>
            <p className="text-sm text-ink-500 dark:text-ink-400">{formatDate(order.created_at)}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>

        <div className="divide-y divide-ink-100 dark:divide-ink-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-ink-900 dark:text-white">{item.product_name}</p>
                <p className="text-sm text-ink-500 dark:text-ink-400">{formatCurrency(item.unit_price)} × {item.quantity}</p>
              </div>
              <p className="font-medium text-ink-900 dark:text-white">{formatCurrency(item.line_total)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-ink-100 pt-4 text-sm dark:border-ink-800">
          <div className="flex justify-between text-ink-600 dark:text-ink-300"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between text-ink-600 dark:text-ink-300"><span>Shipping</span><span>{order.shipping_fee === 0 ? "Free" : formatCurrency(order.shipping_fee)}</span></div>
          <div className="flex justify-between font-semibold text-ink-900 dark:text-white"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
        </div>
      </div>
    </div>
  );
}
