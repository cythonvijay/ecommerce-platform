import { Link } from "react-router-dom";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";

export default function WishlistPage() {
  const { items, isLoading } = useWishlist();

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save products you love for later."
        action={<Link to="/products" className="btn-primary mt-2">Browse products</Link>}
      />
    );
  }

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold text-ink-900 dark:text-white">Wishlist</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => <ProductCard key={item.id} product={item.product} />)}
      </div>
    </div>
  );
}
