
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import OrderStatusBadge from "../components/OrderStatusBadge";
import OrderStatusTracker from "../components/OrderStatusTracker";
import toast from "react-hot-toast";

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get("/orders/" + id).then((res) => setOrder(res.data.order)).catch(() => {});
  }, [id]);

  async function handleCancel() {
    if (!confirm("Cancel this order?")) return;
    try {
      const res = await api.put("/orders/" + id + "/cancel");
      setOrder(res.data.order);
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  async function handleUpdateStatus(newStatus) {
    try {
      const res = await api.put("/orders/" + id + "/status", { status: newStatus });
      setOrder(res.data.order);
      toast.success("Status updated to " + newStatus);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  if (!order) return <p className="text-sm text-gray-400">Loading...</p>;

  const statusFlow = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
  };

  const allowedNext = statusFlow[order.status] || [];
  const canManage = user?.role === "admin" || user?.role === "seller";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <OrderStatusTracker currentStatus={order.status} history={order.statusHistory} />

      <div className="border rounded p-4 mt-4 mb-4">
        <h2 className="font-medium text-sm mb-2">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
            <img src={item.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='8'%3ENo img%3C/text%3E%3C/svg%3E"} alt={item.name} className="w-12 h-12 object-cover rounded" />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity} × Rs. {item.price}</p>
            </div>
            <p className="text-sm font-medium">Rs. {item.price * item.quantity}</p>
          </div>
        ))}
        <div className="flex justify-between font-bold text-sm mt-3 pt-2 border-t">
          <span>Total</span>
          <span>Rs. {order.totalAmount}</span>
        </div>
      </div>

      <div className="border rounded p-4 mb-4 text-sm">
        <h2 className="font-medium mb-2">Shipping Address</h2>
        <p>{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
        <p>Phone: {order.shippingAddress.phone}</p>
      </div>

      <div className="border rounded p-4 mb-4 text-sm">
        <h2 className="font-medium mb-1">Payment</h2>
        <p className="text-gray-600">Cash on Delivery</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {user?.role === "customer" && order.status === "pending" && (
          <button onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600">
            Cancel Order
          </button>
        )}

        {canManage && allowedNext.map((s) => (
          <button
            key={s}
            onClick={() => handleUpdateStatus(s)}
            className={"px-4 py-2 rounded text-sm " + (s === "cancelled" ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-900 text-white hover:bg-gray-800")}
          >
            Mark as {s}
          </button>
        ))}
      </div>
    </div>
  );
}
