import { useEffect, useState } from "react" 
import api from "../services/api" 
import ProductCard from "../components/ProductCard" 

export default function Home() {
  const [products, setProducts] = useState([]) 
  const [loading, setLoading] = useState(true) 

  useEffect(() => {
    api.get("/products?limit=8&sort=rating")
      .then((res) => setProducts(res.data.products))
      .catch(() => {})
      .finally(() => setLoading(false)) 
  }, []) 

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Welcome to our Store</h1>
        <p className="text-gray-500 text-sm">Browse our top-rated products</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-400">No products yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  ) 
}
