import { Link, useNavigate } from "react-router-dom" 
import { ShoppingCart, Heart, MessageSquare } from "lucide-react" 
import { useCart } from "../context/CartContext" 
import { useAuth } from "../context/AuthContext" 
import api from "../services/api" 
import toast from "react-hot-toast" 

export default function ProductCard({ product }) {
  const { addToCart } = useCart() 
  const { user } = useAuth() 
  const navigate = useNavigate() 

  const image =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='8'%3ENo img%3C/text%3E%3C/svg%3E" 

  function handleAddToCart(e) {
    e.preventDefault() 
    addToCart(product) 
    toast.success("Added to cart") 
  }

  async function handleWishlist(e) {
    e.preventDefault() 
    if (!user) return navigate("/login") 
    try {
      await api.post("/wishlist", { product: product._id }) 
      toast.success("Added to wishlist") 
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed") 
    }
  }

  async function handleChat(e) {
    e.preventDefault() 
    if (!user) return navigate("/login") 
    try {
      const res = await api.post("/chat/start", {
        sellerId: product.seller._id || product.seller,
        productId: product._id,
      }) 
      navigate("/chat/" + res.data.chat._id) 
    } catch (err) {
      toast.error("Could not start chat") 
    }
  }

  return (
    <Link
      to={"/products/" + product._id}
      className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-gray-50">
        <img src={image} alt={product.name} className="w-full h-full object-cover" />
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-500 mb-1">
          {product.category?.name || "Uncategorized"}
        </p>
        <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
        <p className="font-semibold text-sm">Rs. {product.price}</p>

        {product.averageRating > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            ★ {product.averageRating} ({product.totalReviews})
          </p>
        )}

        {user && user.role === "customer" && (
          <div className="flex gap-1 mt-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1 bg-gray-900 text-white text-xs py-1.5 rounded hover:bg-gray-800"
            >
              <ShoppingCart size={14} /> Add
            </button>
            <button
              onClick={handleWishlist}
              className="p-1.5 border rounded hover:bg-gray-50"
              title="Add to wishlist"
            >
              <Heart size={14} />
            </button>
            <button
              onClick={handleChat}
              className="p-1.5 border rounded hover:bg-gray-50"
              title="Chat with seller"
            >
              <MessageSquare size={14} />
            </button>
          </div>
        )}
      </div>
    </Link>
  ) 
}
