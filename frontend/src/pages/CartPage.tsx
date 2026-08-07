import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem } = useCartStore();

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>;

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse products and add something you like."
        action={<Link to="/products" className="btn-primary mt-2">Browse products</Link>}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Your Cart</h1>
        {cart.items.map((item) => {
          const image = item.product.images.find((i) => i.is_primary) ?? item.product.images[0];
          return (
            <div key={item.id} className="card flex gap-4 p-4">
              <Link to={`/products/${item.product.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-50 dark:bg-ink-800">
                {image && <img src={image.url} alt={item.product.name} className="h-full w-full object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/products/${item.product.slug}`} className="font-medium text-ink-900 hover:underline dark:text-white">
                    {item.product.name}
                  </Link>
                  <button onClick={() => removeItem(item.id)} className="text-xs text-ink-400 hover:text-red-600">Remove</button>
                </div>
                <p className="text-sm text-ink-500 dark:text-ink-400">{formatCurrency(item.product.price)} each</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-lg border border-ink-200 dark:border-ink-700">
                    <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))} className="px-2.5 py-1 text-ink-600 dark:text-ink-300">−</button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)} className="px-2.5 py-1 text-ink-600 dark:text-ink-300">+</button>
                  </div>
                  <span className="font-display font-semibold text-ink-900 dark:text-white">{formatCurrency(item.line_total)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card h-fit p-5">
        <h2 className="font-display mb-4 font-semibold text-ink-900 dark:text-white">Order Summary</h2>
        <div className="flex justify-between text-sm text-ink-600 dark:text-ink-300">
          <span>Subtotal ({cart.item_count} items)</span>
          <span>{formatCurrency(cart.subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-400">Shipping and totals calculated at checkout.</p>
        <Link to="/checkout"><Button className="mt-4 w-full">Proceed to checkout</Button></Link>
      </div>
    </div>
  );
}
