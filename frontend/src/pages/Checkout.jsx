import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Checkout() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });

  const [placing, setPlacing] = useState(false);

  async function handlePlaceOrder(e) {
    e.preventDefault();

    if (items.length === 0) {
      return toast.error("Cart is empty");
    }

    // ✅ Validate address
    if (!address.fullName || !address.phone || !address.address || !address.city) {
      return toast.error("Fill all address fields");
    }

    setPlacing(true);

    try {
      // ✅ Prepare order items
      const orderItems = items.map((i) => ({
        product: i.product?._id,
        quantity: i.quantity,
        price: i.product?.price,
      }));

      // ✅ Calculate total
      const calculatedTotal = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      // 🔍 Debug (optional)
      console.log("ORDER DATA:", {
        items: orderItems,
        totalPrice: calculatedTotal,
        shippingAddress: address,
      });

      // ✅ FIX: send "items" instead of "orderItems"
      const res = await api.post("/orders", {
        items: orderItems, // 🔥 IMPORTANT FIX
        totalPrice: calculatedTotal,
        shippingAddress: address,
      });

      clearCart();
      toast.success("Order placed!");
      navigate("/orders/" + res.data.order._id);

    } catch (err) {
      console.error("ORDER ERROR:", err.response?.data);
      toast.error(err.response?.data?.message || "Order failed");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Checkout</h1>

      {/* Order Summary */}
      <div className="border rounded p-4 mb-4">
        <h2 className="font-medium mb-2 text-sm">Order Summary</h2>

        {items.map((item) => (
          <div
            key={item.product._id}
            className="flex justify-between text-sm py-1"
          >
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>Rs. {item.product.price * item.quantity}</span>
          </div>
        ))}

        <div className="flex justify-between font-bold text-sm border-t mt-2 pt-2">
          <span>Total</span>
          <span>
            Rs.{" "}
            {items.reduce(
              (sum, item) =>
                sum + item.product.price * item.quantity,
              0
            )}
          </span>
        </div>
      </div>

      {/* Payment */}
      <div className="border rounded p-4 mb-4 text-sm">
        <p className="font-medium mb-1">Payment Method</p>
        <p className="text-gray-600">Cash on Delivery (COD)</p>
      </div>

      {/* Form */}
      <form onSubmit={handlePlaceOrder} className="space-y-3">
        <h2 className="font-medium text-sm">Shipping Address</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={address.fullName}
          onChange={(e) =>
            setAddress({ ...address, fullName: e.target.value })
          }
          required
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Phone"
          value={address.phone}
          onChange={(e) =>
            setAddress({ ...address, phone: e.target.value })
          }
          required
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Address"
          value={address.address}
          onChange={(e) =>
            setAddress({ ...address, address: e.target.value })
          }
          required
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="City"
          value={address.city}
          onChange={(e) =>
            setAddress({ ...address, city: e.target.value })
          }
          required
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <button
          type="submit"
          disabled={placing}
          className="w-full bg-gray-900 text-white py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {placing ? "Placing Order..." : "Place Order (COD)"}
        </button>
      </form>
    </div>
  );
}