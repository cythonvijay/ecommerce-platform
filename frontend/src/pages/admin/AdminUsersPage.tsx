import { useState } from "react";
import { useAdminUsers, useSetUserStatus } from "@/features/admin/hooks/useAdmin";
import { formatDate } from "@/lib/format";
import { Spinner } from "@/components/common/Spinner";
import { Pagination } from "@/components/common/Pagination";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUsers(page);
  const setStatus = useSetUserStatus();

  if (isLoading || !data) return <div className="flex justify-center py-24"><Spinner /></div>;

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold text-ink-900 dark:text-white">Users</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 text-left text-ink-500 dark:border-ink-800 dark:text-ink-400">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Joined</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
            {data.items.map((u) => (
              <tr key={u.id}>
                <td className="p-3 font-medium text-ink-900 dark:text-white">{u.full_name}</td>
                <td className="p-3 text-ink-500 dark:text-ink-400">{u.email}</td>
                <td className="p-3 capitalize text-ink-600 dark:text-ink-300">{u.role}</td>
                <td className="p-3 text-ink-500 dark:text-ink-400">{formatDate(u.created_at)}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>
                    {u.is_active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {u.role !== "admin" && (
                    <button
                      onClick={() => setStatus.mutate({ id: u.id, is_active: !u.is_active })}
                      className="font-medium text-amber-600 hover:underline dark:text-amber-400"
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
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
