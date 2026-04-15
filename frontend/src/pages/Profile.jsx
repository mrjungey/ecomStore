import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/auth/profile", form);
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      <p className="text-sm text-gray-500 mb-4">Role: {user?.role}</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
        <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
        <input type="text" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
        <button type="submit" disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
