import { Link } from "react-router-dom";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { Spinner } from "@/components/common/Spinner";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold text-ink-900 dark:text-white">All categories</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {categories?.map((c) => (
          <Link key={c.id} to={`/products?category_id=${c.id}`} className="card flex flex-col gap-1.5 p-5 transition hover:shadow-lg">
            <span className="font-display font-semibold text-ink-900 dark:text-white">{c.name}</span>
            {c.description && <span className="line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{c.description}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
