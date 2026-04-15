import { useEffect, useState } from "react" 
import api from "../../services/api" 

export default function AdminDashboard() {
  const [stats, setStats] = useState(null) 

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data)).catch(() => {}) 
  }, []) 

  if (!stats) return <p className="text-sm text-gray-400">Loading...</p> 

  const cards = [
    { label: "Users", value: stats.totalUsers },
    { label: "Products", value: stats.totalProducts },
    { label: "Orders", value: stats.totalOrders },
    { label: "Revenue", value: "Rs. " + stats.totalRevenue },
  ] 

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border rounded p-4">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  ) 
}
