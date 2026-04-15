import { useEffect, useState } from "react" 
import { Link } from "react-router-dom" 
import api from "../../services/api" 
import OrderStatusBadge from "../../components/OrderStatusBadge" 

export default function SellerOrders() {
  const [orders, setOrders] = useState([]) 
  const [loading, setLoading] = useState(true) 

  useEffect(() => {
    api.get("/orders/seller/list").then((res) => setOrders(res.data.orders)).catch(() => {}).finally(() => setLoading(false)) 
  }, []) 

  if (loading) return <p className="text-sm text-gray-400">Loading...</p> 

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Orders</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-400">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order._id} to={"/orders/" + order._id} className="block border rounded p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-gray-500">Customer: {order.customer?.name || "N/A"}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                <span>{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                <span>Rs. {order.totalAmount}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  ) 
}
