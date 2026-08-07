import { useState } from "react";
import { useAddresses } from "@/features/addresses/hooks/useAddresses";
import type { AddressPayload } from "@/features/addresses/types/addresses.types";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";

const emptyForm: AddressPayload = {
  full_name: "", phone: "", line1: "", line2: "", city: "", state: "", postal_code: "", country: "India", is_default: false,
};

export default function AddressesPage() {
  const { addresses, isLoading, create, update, remove } = useAddresses();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressPayload>(emptyForm);
  const [error, setError] = useState("");

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (id: number) => {
    const a = addresses.find((x) => x.id === id);
    if (!a) return;
    setForm({ full_name: a.full_name, phone: a.phone, line1: a.line1, line2: a.line2 || "", city: a.city, state: a.state, postal_code: a.postal_code, country: a.country, is_default: a.is_default });
    setEditingId(id);
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) await update({ id: editingId, payload: form });
      else await create(form);
      setModalOpen(false);
    } catch {
      setError("Could not save address. Please check the details.");
    }
  };

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Addresses</h1>
        <Button onClick={openCreate}>Add address</Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState title="No addresses yet" description="Add a shipping address to speed up checkout." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-ink-900 dark:text-white">{a.full_name}</p>
                {a.is_default && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Default</span>}
              </div>
              <p className="text-sm text-ink-500 dark:text-ink-400">{a.phone}</p>
              <p className="text-sm text-ink-500 dark:text-ink-400">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postal_code}, {a.country}</p>
              <div className="mt-3 flex gap-3 text-sm">
                <button onClick={() => openEdit(a.id)} className="font-medium text-amber-600 hover:underline dark:text-amber-400">Edit</button>
                <button onClick={() => remove(a.id)} className="font-medium text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit address" : "Add address"}>
        <form onSubmit={submit} className="space-y-3">
          <Input label="Full name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Address line 1" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
          <Input label="Address line 2 (optional)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input label="State" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Postal code" required value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
            <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
            Set as default address
          </label>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Button type="submit" className="w-full">{editingId ? "Save changes" : "Add address"}</Button>
        </form>
      </Modal>
    </div>
  );
}
