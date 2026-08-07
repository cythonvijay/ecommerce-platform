import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProductBySlug } from "@/features/products/hooks/useProducts";
import { useReviews } from "@/features/reviews/hooks/useReviews";
import { useCartStore } from "@/store/cartStore";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatDate, getApiErrorMessage } from "@/lib/format";
import { StarRating } from "@/components/common/StarRating";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const { data: product, isLoading } = useProductBySlug(slug);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { isInWishlist, add, remove, getItemId } = useWishlist();
  const { reviews, create: createReview } = useReviews(product?.id);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addMsg, setAddMsg] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [reviewError, setReviewError] = useState("");

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (!product) return <p className="py-16 text-center text-ink-500">Product not found.</p>;

  const wished = isAuthenticated && isInWishlist(product.id);
  const images = product.images.length ? product.images : [{ id: 0, url: "", alt_text: product.name, is_primary: true }];

  const handleAddToCart = async () => {
    await addItem(product.id, quantity);
    setAddMsg("Added to cart");
    setTimeout(() => setAddMsg(""), 2000);
  };

  const toggleWishlist = async () => {
    if (wished) {
      const id = getItemId(product.id);
      if (id) await remove(id);
    } else {
      await add(product.id);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    try {
      await createReview({ product_id: product.id, ...reviewForm });
      setReviewForm({ rating: 5, title: "", comment: "" });
    } catch (err) {
      setReviewError(getApiErrorMessage(err));
    }
  };

  return (
    <div>
      <nav className="mb-6 text-sm text-ink-400">
        <Link to="/products" className="hover:text-ink-600 dark:hover:text-ink-200">Products</Link> / {product.name}
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="card mb-3 aspect-square overflow-hidden">
            {images[activeImage]?.url ? (
              <img src={images[activeImage].url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-300">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${i === activeImage ? "border-amber-500" : "border-transparent"}`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.brand && <p className="mb-1 text-sm font-medium uppercase tracking-wide text-ink-400">{product.brand}</p>}
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">{product.name}</h1>
          {product.rating_count > 0 && (
            <div className="mt-2"><StarRating value={product.rating_avg} count={product.rating_count} size={16} /></div>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-ink-900 dark:text-white">{formatCurrency(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-lg text-ink-400 line-through">{formatCurrency(product.compare_at_price)}</span>
            )}
          </div>

          <p className={`mt-2 text-sm font-medium ${product.in_stock ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {product.in_stock ? `In stock (${product.stock_quantity} available)` : "Out of stock"}
          </p>

          {product.description && <p className="mt-5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{product.description}</p>}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-ink-200 dark:border-ink-700">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-ink-600 dark:text-ink-300">−</button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 1, q + 1))} className="px-3 py-2 text-ink-600 dark:text-ink-300">+</button>
            </div>
            <Button onClick={handleAddToCart} disabled={!product.in_stock || !isAuthenticated} className="flex-1">
              {isAuthenticated ? "Add to cart" : "Sign in to buy"}
            </Button>
            {isAuthenticated && (
              <button onClick={toggleWishlist} className="btn-secondary !px-3.5" aria-label="wishlist">
                {wished ? "♥" : "♡"}
              </button>
            )}
          </div>
          {addMsg && <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">{addMsg}</p>}
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-display mb-4 text-lg font-bold text-ink-900 dark:text-white">Reviews ({reviews.length})</h2>

        {isAuthenticated && (
          <form onSubmit={submitReview} className="card mb-6 space-y-3 p-5">
            <div className="flex items-center gap-2">
              <label className="label mb-0">Your rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                className="input-field !w-auto"
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
            <input
              placeholder="Title (optional)"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              className="input-field"
            />
            <textarea
              placeholder="Share your thoughts…"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              rows={3}
              className="input-field"
            />
            {reviewError && <p className="text-sm text-red-600 dark:text-red-400">{reviewError}</p>}
            <Button type="submit" variant="secondary">Submit review</Button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-ink-500 dark:text-ink-400">No reviews yet. Be the first to share your thoughts.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <StarRating value={r.rating} />
                  <span className="text-xs text-ink-400">{formatDate(r.created_at)}</span>
                </div>
                {r.title && <p className="mt-1.5 font-medium text-ink-900 dark:text-white">{r.title}</p>}
                {r.comment && <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
