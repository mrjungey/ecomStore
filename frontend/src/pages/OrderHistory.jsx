import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import OrderStatusBadge from "../components/OrderStatusBadge";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my").then((res) => setOrders(res.data.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-400">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order._id} to={"/orders/" + order._id} className="block border rounded p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                <span>Rs. {order.totalAmount}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
