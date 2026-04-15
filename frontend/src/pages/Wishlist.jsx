import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { Trash2, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='10'%3ENo img%3C/text%3E%3C/svg%3E";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  function fetchWishlist() {
    api
      .get("/wishlist")
      .then((res) => {
        const valid = (res.data.items || []).filter((i) => i && i.product);
        setItems(valid);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function handleRemove(productId) {
    try {
      await api.delete("/wishlist/" + productId);
      setItems((prev) => prev.filter((i) => i.product && i.product._id !== productId));
      toast.success("Removed");
    } catch {
      toast.error("Failed");
    }
  }

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Your wishlist is empty.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-4 border rounded p-3">
              <Link to={"/products/" + item.product._id}>
                <img
                  src={item.product.images?.[0]?.url || PLACEHOLDER}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={"/products/" + item.product._id} className="text-sm font-medium hover:underline">
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-500">Rs. {item.product.price}</p>
              </div>
              <button
                onClick={() => {
                  addToCart(item.product);
                  toast.success("Added to cart");
                }}
                className="p-2 border rounded hover:bg-gray-50"
                title="Add to cart"
              >
                <ShoppingCart size={16} />
              </button>
              <button onClick={() => handleRemove(item.product._id)} className="p-2 text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
