import { useState } from "react";
import { useAdminInventory, useAdjustInventory } from "@/features/admin/hooks/useAdmin";
import { Spinner } from "@/components/common/Spinner";
import { Button } from "@/components/common/Button";

export default function AdminInventoryPage() {
  const { data: inventory, isLoading } = useAdminInventory();
  const adjust = useAdjustInventory();
  const [edits, setEdits] = useState<Record<number, number>>({});

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>;

  const save = async (productId: number) => {
    const quantity = edits[productId];
    if (quantity === undefined) return;
    await adjust.mutateAsync({ productId, quantity });
    setEdits((e) => { const next = { ...e }; delete next[productId]; return next; });
  };

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold text-ink-900 dark:text-white">Inventory</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 text-left text-ink-500 dark:border-ink-800 dark:text-ink-400">
            <tr><th className="p-3">Product ID</th><th className="p-3">On hand</th><th className="p-3">Reserved</th><th className="p-3">Low stock at</th><th className="p-3">Update quantity</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
            {inventory?.map((inv) => (
              <tr key={inv.id} className={inv.available <= inv.low_stock_threshold ? "bg-red-50 dark:bg-red-950/20" : ""}>
                <td className="p-3 text-ink-600 dark:text-ink-300">#{inv.product_id}</td>
                <td className="p-3 font-medium text-ink-900 dark:text-white">{inv.quantity}</td>
                <td className="p-3 text-ink-600 dark:text-ink-300">{inv.reserved_quantity}</td>
                <td className="p-3 text-ink-600 dark:text-ink-300">{inv.low_stock_threshold}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      defaultValue={inv.quantity}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [inv.product_id]: Number(e.target.value) }))}
                      className="input-field !w-24 !py-1.5"
                    />
                    <Button onClick={() => save(inv.product_id)} variant="secondary" className="!py-1.5 !px-3 text-xs">Save</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
