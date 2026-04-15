import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-3">Your cart is empty</p>
        <Link to="/products" className="text-sm underline">Browse products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Cart</h1>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.product._id} className="flex items-center gap-4 border rounded p-3">
            <img
              src={item.product.images?.[0]?.url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='8'%3ENo img%3C/text%3E%3C/svg%3E"}
              alt={item.product.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.product.name}</p>
              <p className="text-sm text-gray-500">Rs. {item.product.price}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-1 border rounded">
                <Minus size={14} />
              </button>
              <span className="text-sm w-8 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-1 border rounded">
                <Plus size={14} />
              </button>
            </div>
            <p className="text-sm font-medium w-20 text-right">Rs. {item.product.price * item.quantity}</p>
            <button onClick={() => removeFromCart(item.product._id)} className="text-red-500 p-1">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <p className="font-bold">Total: Rs. {totalPrice}</p>
        <Link to="/checkout" className="bg-gray-900 text-white px-6 py-2 rounded text-sm hover:bg-gray-800">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
