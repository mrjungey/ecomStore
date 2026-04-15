import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page") || "1");
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", "12");
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);

    api.get("/products?" + params.toString())
      .then((res) => {
        setProducts(res.data.products);
        setTotal(res.data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, category, search, sort]);

  function updateParam(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    setSearchParams(params);
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Products</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          defaultValue={search}
          onKeyDown={(e) => { if (e.key === "Enter") updateParam("search", e.target.value); }}
          className="border rounded px-3 py-1.5 text-sm w-48"
        />
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="border rounded px-2 py-1.5 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border rounded px-2 py-1.5 text-sm"
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-400">No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>

          {total > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: total }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", i + 1);
                    setSearchParams(params);
                  }}
                  className={"px-3 py-1 rounded text-sm " + (page === i + 1 ? "bg-gray-900 text-white" : "border")}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
