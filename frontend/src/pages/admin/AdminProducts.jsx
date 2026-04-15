import { useEffect, useState } from "react";
import api from "../../services/api";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  function fetchProducts() {
    api.get("/products?limit=100").then((res) => setProducts(res.data.products)).catch(() => {});
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete("/products/" + id);
      toast.success("Deleted");
      fetchProducts();
    } catch {
      toast.error("Failed");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">All Products</h1>
      {products.length === 0 ? (
        <p className="text-sm text-gray-400">No products.</p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p._id} className="flex items-center gap-3 border rounded p-3">
              <img src={p.images?.[0]?.url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='8'%3ENo img%3C/text%3E%3C/svg%3E"} alt={p.name} className="w-12 h-12 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-gray-500">Rs. {p.price} · Seller: {p.seller?.name || "N/A"}</p>
              </div>
              <button onClick={() => handleDelete(p._id)} className="p-1.5 text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
