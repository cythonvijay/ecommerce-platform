import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { ProductCard } from "@/components/product/ProductCard";
import { Spinner } from "@/components/common/Spinner";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import type { ProductListParams } from "@/types/api";

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();

  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("category_id");
  const sort = (searchParams.get("sort") as ProductListParams["sort"]) || "newest";
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);

  const params: ProductListParams = useMemo(
    () => ({
      page,
      page_size: 12,
      search: debouncedSearch || undefined,
      category_id: categoryId ? Number(categoryId) : undefined,
      sort,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    }),
    [page, debouncedSearch, categoryId, sort, minPrice, maxPrice]
  );

  const { data, isLoading, isFetching } = useProducts(params);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-6">
        <div>
          <label className="label">Search</label>
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              updateParam("search", e.target.value || null);
            }}
            placeholder="Search products…"
            className="input-field"
          />
        </div>
        <div>
          <p className="label">Category</p>
          <div className="space-y-1">
            <button
              onClick={() => updateParam("category_id", null)}
              className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm ${!categoryId ? "bg-ink-100 font-medium dark:bg-ink-800" : "text-ink-600 dark:text-ink-400"}`}
            >
              All
            </button>
            {categories?.map((c) => (
              <button
                key={c.id}
                onClick={() => updateParam("category_id", String(c.id))}
                className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm ${
                  categoryId === String(c.id) ? "bg-ink-100 font-medium dark:bg-ink-800" : "text-ink-600 dark:text-ink-400"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Price range (₹)</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              defaultValue={minPrice || ""}
              onBlur={(e) => updateParam("min_price", e.target.value || null)}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Max"
              defaultValue={maxPrice || ""}
              onBlur={(e) => updateParam("max_price", e.target.value || null)}
              className="input-field"
            />
          </div>
        </div>
      </aside>

      <div>
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-ink-500 dark:text-ink-400">{data ? `${data.total} products` : ""}</p>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="input-field !w-auto"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No products found" description="Try adjusting your filters or search terms." />
        ) : (
          <>
            <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 ${isFetching ? "opacity-60" : ""}`}>
              {data.items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={(p) => updateParam("page", String(p))} />
          </>
        )}
      </div>
    </div>
  );
}
