import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      toast.success("Account created");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-xl font-bold mb-4">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => update("name", e.target.value)} required className="w-full border rounded px-3 py-2 text-sm" />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="w-full border rounded px-3 py-2 text-sm" />
        <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} className="w-full border rounded px-3 py-2 text-sm" />
        <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        <input type="text" placeholder="Address" value={form.address} onChange={(e) => update("address", e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        <button type="submit" disabled={submitting} className="w-full bg-gray-900 text-white py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50">
          {submitting ? "Creating..." : "Register"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-3">
        Already have an account? <Link to="/login" className="underline">Login</Link>
      </p>
    </div>
  );
}
