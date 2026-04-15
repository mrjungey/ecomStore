import { useState } from "react" 
import api from "../../services/api" 
import toast from "react-hot-toast" 

export default function AdminSellers() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" }) 
  const [submitting, setSubmitting] = useState(false) 

  async function handleSubmit(e) {
    e.preventDefault() 
    setSubmitting(true) 
    try {
      await api.post("/admin/sellers", form) 
      toast.success("Seller created") 
      setForm({ name: "", email: "", password: "", phone: "" }) 
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed") 
    } finally {
      setSubmitting(false) 
    }
  }

  return (
    <div className="max-w-sm">
      <h1 className="text-xl font-bold mb-4">Create Seller</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border rounded px-3 py-2 text-sm" />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full border rounded px-3 py-2 text-sm" />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} className="w-full border rounded px-3 py-2 text-sm" />
        <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
        <button type="submit" disabled={submitting} className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50">
          {submitting ? "Creating..." : "Create Seller"}
        </button>
      </form>
    </div>
  ) 
}
