import { Link } from "react-router-dom";
import type { Product } from "@/types/api";
import { formatCurrency } from "@/lib/format";
import { StarRating } from "@/components/common/StarRating";
import { useAuthStore } from "@/store/authStore";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { useCartStore } from "@/store/cartStore";

export function ProductCard({ product }: { product: Product }) {
  const { isAuthenticated } = useAuthStore();
  const { isInWishlist, add, remove, getItemId } = useWishlist();
  const { addItem } = useCartStore();
  const image = product.images.find((i) => i.is_primary) ?? product.images[0];
  const wished = isAuthenticated && isInWishlist(product.id);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (wished) {
      const id = getItemId(product.id);
      if (id) await remove(id);
    } else {
      await add(product.id);
    }
  };

  const quickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !product.in_stock) return;
    await addItem(product.id, 1);
  };

  return (
    <Link to={`/products/${product.slug}`} className="card group flex flex-col overflow-hidden transition hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-ink-50 dark:bg-ink-800">
        {image ? (
          <img
            src={image.url}
            alt={image.alt_text ?? product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-300">No image</div>
        )}
        {!product.in_stock && (
          <span className="absolute left-2 top-2 rounded-full bg-ink-900/80 px-2 py-0.5 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
        {isAuthenticated && (
          <button
            onClick={toggleWishlist}
            aria-label="Toggle wishlist"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-sm transition hover:scale-105 dark:bg-ink-900/90 dark:text-ink-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={wished ? "#e8891a" : "none"} stroke={wished ? "#e8891a" : "currentColor"} strokeWidth="2">
              <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {product.brand && <span className="text-xs font-medium uppercase tracking-wide text-ink-400">{product.brand}</span>}
        <h3 className="line-clamp-2 font-display text-sm font-semibold text-ink-900 dark:text-ink-50">{product.name}</h3>
        {product.rating_count > 0 && <StarRating value={product.rating_avg} count={product.rating_count} />}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-base font-bold text-ink-900 dark:text-white">{formatCurrency(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-xs text-ink-400 line-through">{formatCurrency(product.compare_at_price)}</span>
            )}
          </div>
          <button
            onClick={quickAdd}
            disabled={!product.in_stock}
            aria-label="Add to cart"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-white transition hover:bg-amber-500 disabled:opacity-30 dark:bg-amber-500 dark:text-ink-950"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
              <path d="M6 6L4 3H2" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
