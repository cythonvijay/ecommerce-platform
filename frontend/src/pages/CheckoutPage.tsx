import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { useAddresses } from "@/features/addresses/hooks/useAddresses";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";
import { formatCurrency, getApiErrorMessage } from "@/lib/format";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";

const SHIPPING_FEE = 49;
const FREE_SHIPPING_THRESHOLD = 999;

export default function CheckoutPage() {
  const { cart, isLoading: cartLoading } = useCartStore();
  const { addresses, isLoading: addressesLoading } = useAddresses();
  const checkout = useCheckout();
  const navigate = useNavigate();

  const [addressId, setAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "upi">("cod");
  const [error, setError] = useState("");

  const selectedAddressId = addressId ?? addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? null;

  if (cartLoading || addressesLoading) return <div className="flex justify-center py-24"><Spinner /></div>;

  if (!cart || cart.items.length === 0) {
    return <p className="py-16 text-center text-ink-500 dark:text-ink-400">Your cart is empty. <Link to="/products" className="text-amber-600 hover:underline">Go shopping</Link></p>;
  }

  const shipping = cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = cart.subtotal + shipping;

  const placeOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select or add a shipping address.");
      return;
    }
    setError("");
    try {
      const order = await checkout.mutateAsync({ address_id: selectedAddressId, payment_method: paymentMethod });
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Checkout</h1>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display font-semibold text-ink-900 dark:text-white">Shipping address</h2>
            <Link to="/addresses" className="text-sm text-amber-600 hover:underline dark:text-amber-400">Manage addresses</Link>
          </div>
          {addresses.length === 0 ? (
            <p className="text-sm text-ink-500 dark:text-ink-400">
              No addresses saved. <Link to="/addresses" className="text-amber-600 hover:underline">Add one</Link> to continue.
            </p>
          ) : (
            <div className="space-y-2">
              {addresses.map((a) => (
                <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${selectedAddressId === a.id ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10" : "border-ink-200 dark:border-ink-700"}`}>
                  <input type="radio" name="address" checked={selectedAddressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1" />
                  <div className="text-sm">
                    <p className="font-medium text-ink-900 dark:text-white">{a.full_name} · {a.phone}</p>
                    <p className="text-ink-500 dark:text-ink-400">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postal_code}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-display mb-3 font-semibold text-ink-900 dark:text-white">Payment method</h2>
          <div className="space-y-2">
            {[
              { id: "cod", label: "Cash on Delivery" },
              { id: "card", label: "Credit / Debit Card" },
              { id: "upi", label: "UPI" },
            ].map((m) => (
              <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${paymentMethod === m.id ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10" : "border-ink-200 dark:border-ink-700"}`}>
                <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id as typeof paymentMethod)} />
                <span className="text-sm font-medium text-ink-800 dark:text-ink-100">{m.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="card h-fit p-5">
        <h2 className="font-display mb-4 font-semibold text-ink-900 dark:text-white">Order Summary</h2>
        <div className="space-y-2 text-sm text-ink-600 dark:text-ink-300">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span></div>
          <div className="flex justify-between border-t border-ink-100 pt-2 font-semibold text-ink-900 dark:border-ink-800 dark:text-white">
            <span>Total</span><span>{formatCurrency(total)}</span>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <Button onClick={placeOrder} isLoading={checkout.isPending} className="mt-4 w-full">Place order</Button>
      </div>
    </div>
  );
}
