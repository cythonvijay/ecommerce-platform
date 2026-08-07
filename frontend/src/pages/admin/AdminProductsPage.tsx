import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { productsApi } from "@/features/products/api/productsApi";
import type { ProductPayload } from "@/features/products/types/products.types";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/common/Spinner";
import { Pagination } from "@/components/common/Pagination";

const emptyForm: ProductPayload = {
  name: "", description: "", price: 0, compare_at_price: null, category_id: 0, brand: "", initial_quantity: 0,
  images: [{ url: "", is_primary: true }],
};

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProducts({ page, page_size: 10, sort: "newest" });
  const { data: categories } = useCategories();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  const openCreate = () => {
    setForm({ ...emptyForm, category_id: categories?.[0]?.id || 0 });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (id: number) => {
    const p = data?.items.find((x) => x.id === id);
    if (!p) return;
    setForm({
      name: p.name, description: p.description || "", price: p.price, compare_at_price: p.compare_at_price,
      category_id: p.category_id, brand: p.brand || "", images: [],
    });
    setEditingId(id);
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      if (editingId) {
        const { images, initial_quantity, ...updatePayload } = form;
        await productsApi.update(editingId, updatePayload);
      } else {
        await productsApi.create(form);
      }
      invalidate();
      setModalOpen(false);
    } catch {
      setError("Could not save product. Please check the fields.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await productsApi.remove(id);
    invalidate();
  };

  if (isLoading || !data) return <div className="flex justify-center py-24"><Spinner /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Products</h1>
        <Button onClick={openCreate}>Add product</Button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 text-left text-ink-500 dark:border-ink-800 dark:text-ink-400">
            <tr><th className="p-3">Name</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
            {data.items.map((p) => (
              <tr key={p.id}>
                <td className="p-3 font-medium text-ink-900 dark:text-white">{p.name}</td>
                <td className="p-3 text-ink-600 dark:text-ink-300">{formatCurrency(p.price)}</td>
                <td className="p-3 text-ink-600 dark:text-ink-300">{p.stock_quantity}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-ink-100 text-ink-600 dark:bg-ink-800"}`}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(p.id)} className="mr-3 font-medium text-amber-600 hover:underline dark:text-amber-400">Edit</button>
                  <button onClick={() => remove(p.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={data.page} pages={data.pages} onChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit product" : "Add product"}>
        <form onSubmit={submit} className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (₹)" type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <Input label="Compare-at price (optional)" type="number" step="0.01" value={form.compare_at_price ?? ""} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value ? Number(e.target.value) : null })} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input-field" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          {!editingId && (
            <>
              <Input label="Initial stock quantity" type="number" value={form.initial_quantity} onChange={(e) => setForm({ ...form, initial_quantity: Number(e.target.value) })} />
              <Input label="Image URL" placeholder="https://…" value={form.images?.[0]?.url || ""} onChange={(e) => setForm({ ...form, images: [{ url: e.target.value, is_primary: true }] })} />
            </>
          )}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Button type="submit" isLoading={saving} className="w-full">{editingId ? "Save changes" : "Add product"}</Button>
        </form>
      </Modal>
    </div>
  );
}
