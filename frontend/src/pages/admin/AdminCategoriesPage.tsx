import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { categoriesApi } from "@/features/categories/api/categoriesApi";
import type { CategoryPayload } from "@/features/categories/types/categories.types";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/common/Spinner";

const emptyForm: CategoryPayload = { name: "", description: "" };

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryPayload>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (id: number) => {
    const c = categories?.find((x) => x.id === id);
    if (!c) return;
    setForm({ name: c.name, description: c.description || "" });
    setEditingId(id);
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      if (editingId) await categoriesApi.update(editingId, form);
      else await categoriesApi.create(form);
      invalidate();
      setModalOpen(false);
    } catch {
      setError("Could not save category. Name may already exist.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await categoriesApi.remove(id);
    invalidate();
  };

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Categories</h1>
        <Button onClick={openCreate}>Add category</Button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 text-left text-ink-500 dark:border-ink-800 dark:text-ink-400">
            <tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
            {categories?.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-medium text-ink-900 dark:text-white">{c.name}</td>
                <td className="p-3 text-ink-500 dark:text-ink-400">{c.slug}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-ink-100 text-ink-600 dark:bg-ink-800"}`}>
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(c.id)} className="mr-3 font-medium text-amber-600 hover:underline dark:text-amber-400">Edit</button>
                  <button onClick={() => remove(c.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit category" : "Add category"}>
        <form onSubmit={submit} className="space-y-3">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field" />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Button type="submit" isLoading={saving} className="w-full">{editingId ? "Save changes" : "Add category"}</Button>
        </form>
      </Modal>
    </div>
  );
}
