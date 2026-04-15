import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, MessageSquare, Star } from "lucide-react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    api.get("/products/" + id).then((res) => setProduct(res.data.product)).catch(() => navigate("/products"));
    api.get("/reviews/product/" + id).then((res) => setReviews(res.data.reviews)).catch(() => {});
  }, [id]);

  async function handleAddReview(e) {
    e.preventDefault();
    try {
      await api.post("/reviews", { product: id, ...reviewForm });
      toast.success("Review added");
      const res = await api.get("/reviews/product/" + id);
      setReviews(res.data.reviews);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  async function handleChatWithSeller() {
    if (!user) return navigate("/login");
    try {
      const res = await api.post("/chat/start", {
        sellerId: product.seller._id,
        productId: product._id,
      });
      navigate("/chat/" + res.data.chat._id);
    } catch {
      toast.error("Could not start chat");
    }
  }

  if (!product) return <p className="text-sm text-gray-400">Loading...</p>;

  const images = product.images?.length > 0 ? product.images : [{ url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='8'%3ENo img%3C/text%3E%3C/svg%3E" }];

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2">
            <img src={images[selectedImage].url} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={"w-16 h-16 rounded border overflow-hidden " + (i === selectedImage ? "border-gray-900" : "border-gray-200")}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
          <h1 className="text-xl font-bold mb-2">{product.name}</h1>
          <p className="text-lg font-semibold mb-3">Rs. {product.price}</p>

          {product.averageRating > 0 && (
            <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              {product.averageRating} ({product.totalReviews} reviews)
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{product.description}</p>

          <p className="text-sm mb-4">
            Stock: <span className={product.stock > 0 ? "text-green-600" : "text-red-500"}>{product.stock > 0 ? product.stock + " available" : "Out of stock"}</span>
          </p>

          <p className="text-xs text-gray-500 mb-4">
            Sold by: {product.seller?.name || "Unknown"}
          </p>

          <p className="text-xs text-gray-500 mb-4">
            Payment: Cash on Delivery
          </p>

          {user && user.role === "customer" && product.stock > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => { addToCart(product); toast.success("Added to cart"); }}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
              >
                <ShoppingCart size={16} /> Add to Cart
              </button>
              <button
                onClick={async () => {
                  try { await api.post("/wishlist", { product: product._id }); toast.success("Added to wishlist"); }
                  catch (err) { toast.error(err.response?.data?.message || "Failed"); }
                }}
                className="flex items-center gap-2 border px-4 py-2 rounded text-sm hover:bg-gray-50"
              >
                <Heart size={16} /> Wishlist
              </button>
              <button
                onClick={handleChatWithSeller}
                className="flex items-center gap-2 border px-4 py-2 rounded text-sm hover:bg-gray-50"
              >
                <MessageSquare size={16} /> Chat with Seller
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-bold mb-4">Reviews</h2>

        {user && user.role === "customer" && (
          <form onSubmit={handleAddReview} className="mb-6 p-4 border rounded">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm">Rating:</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                className="border rounded px-2 py-1 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Write a review..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm mb-2"
            />
            <button type="submit" className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm hover:bg-gray-800">
              Submit Review
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{r.user?.name}</span>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                  ))}
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
