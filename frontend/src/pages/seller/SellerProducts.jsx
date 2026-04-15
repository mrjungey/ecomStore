import { useEffect, useState } from "react" 
import api from "../../services/api" 
import { useAuth } from "../../context/AuthContext" 
import { Pencil, Trash2, Plus } from "lucide-react" 
import toast from "react-hot-toast" 

export default function SellerProducts() {
  const { user } = useAuth() 

  const [products, setProducts] = useState([]) 
  const [categories, setCategories] = useState([]) 
  const [showForm, setShowForm] = useState(false) 
  const [editing, setEditing] = useState(null) 

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  }) 

  const [files, setFiles] = useState([]) 
  const [submitting, setSubmitting] = useState(false) 

  useEffect(() => {
    fetchProducts() 

    api
      .get("/categories")
      .then((res) => setCategories(res.data.categories))
      .catch(() => {}) 
  }, []) 

  function fetchProducts() {
    if (!user?.id) return 

    api
      .get(`/products?seller=${user._id}&limit=100`)
      .then((res) => setProducts(res.data.products))
      .catch((err) => {
        console.error("FETCH ERROR:", err) 
      }) 
  }

  function openCreate() {
    setEditing(null) 
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    }) 
    setFiles([]) 
    setShowForm(true) 
  }

  function openEdit(product) {
    setEditing(product._id) 

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      category: product.category?._id || "",
    }) 

    setFiles([]) 
    setShowForm(true) 
  }

  async function handleSubmit(e) {
    e.preventDefault() 

    if (!form.name || !form.price || !form.stock || !form.category) {
      return toast.error("Please fill all required fields") 
    }

    setSubmitting(true) 

    try {
      const formData = new FormData() 

      formData.append("name", form.name) 
      formData.append("description", form.description) 
      formData.append("price", form.price) 
      formData.append("stock", form.stock) 
      formData.append("category", form.category) 

      // ✅ append images safely
      if (files && files.length > 0) {
        for (let i = 0  i < files.length  i++) {
          formData.append("images", files[i]) 
        }
      }

      if (editing) {
        await api.put(`/products/${editing}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }) 

        toast.success("Product updated") 
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }) 

        toast.success("Product created") 
      }

      setShowForm(false) 
      fetchProducts() 
    } catch (err) {
      console.error("CREATE/UPDATE ERROR:", err) 
      toast.error(err.response?.data?.message || "Something went wrong") 
    } finally {
      setSubmitting(false) 
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return 

    try {
      await api.delete(`/products/${id}`) 
      toast.success("Deleted") 
      fetchProducts() 
    } catch (err) {
      console.error("DELETE ERROR:", err) 
      toast.error("Failed to delete") 
    }
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Products</h1>

        <button
          onClick={openCreate}
          className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-800"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border rounded p-4 mb-4 space-y-3"
        >
          <input
            type="text"
            placeholder="Product Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={3}
            className="w-full border rounded px-3 py-2 text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              required
              className="border rounded px-3 py-2 text-sm"
            />

            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: e.target.value })
              }
              required
              className="border rounded px-3 py-2 text-sm"
            />
          </div>

          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
            required
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="text-sm"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : editing
                ? "Update"
                : "Create"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* PRODUCT LIST */}
      {products.length === 0 ? (
        <p className="text-sm text-gray-400">
          No products yet. Create your first product.
        </p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p._id}
              className="flex items-center gap-3 border rounded p-3"
            >
              <img
                src={
                  p.images?.[0]?.url ||
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3C/svg%3E"
                }
                alt={p.name}
                className="w-12 h-12 object-cover rounded"
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {p.name}
                </p>
                <p className="text-xs text-gray-500">
                  Rs. {p.price} · Stock: {p.stock}
                </p>
              </div>

              <button
                onClick={() => openEdit(p)}
                className="p-1.5 border rounded hover:bg-gray-50"
              >
                <Pencil size={14} />
              </button>

              <button
                onClick={() => handleDelete(p._id)}
                className="p-1.5 text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  ) 
}