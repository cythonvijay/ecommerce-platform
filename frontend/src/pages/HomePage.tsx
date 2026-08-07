import { Link } from "react-router-dom";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { ProductCard } from "@/components/product/ProductCard";
import { Spinner } from "@/components/common/Spinner";

export default function HomePage() {
  const { data: newest, isLoading: loadingNewest } = useProducts({ page: 1, page_size: 8, sort: "newest" });
  const { data: categories } = useCategories();

  return (
    <div className="space-y-14">
      <section className="overflow-hidden rounded-2xl bg-ink-900 dark:bg-ink-900">
        <div className="grid gap-8 px-8 py-14 sm:px-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">New arrivals weekly</p>
            <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Everything you need, curated in one place.
            </h1>
            <p className="mt-4 max-w-md text-ink-300">
              Browse electronics, fashion, home essentials and more — with fast checkout and easy order tracking.
            </p>
            <Link to="/products" className="btn-primary mt-6 inline-flex !bg-amber-500 !text-ink-950 hover:!bg-amber-400">
              Shop all products
            </Link>
          </div>
          <div className="hidden justify-center md:flex">
            <div className="grid grid-cols-2 gap-3">
              {["🎧", "👟", "📱", "🛋️"].map((emoji) => (
                <div key={emoji} className="flex h-24 w-24 items-center justify-center rounded-xl bg-white/5 text-4xl">
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section>
          <h2 className="font-display mb-4 text-lg font-bold text-ink-900 dark:text-white">Shop by category</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/products?category_id=${c.id}`}
                className="card flex flex-col items-center justify-center gap-2 p-5 text-center transition hover:shadow-lg"
              >
                <span className="font-display text-sm font-semibold text-ink-800 dark:text-ink-100">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Newest products</h2>
          <Link to="/products" className="text-sm font-medium text-amber-600 hover:underline dark:text-amber-400">View all →</Link>
        </div>
        {loadingNewest ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newest?.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
