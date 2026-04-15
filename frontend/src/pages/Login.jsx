import { useState } from "react" 
import { Link, useNavigate } from "react-router-dom" 
import { useAuth } from "../context/AuthContext" 
import toast from "react-hot-toast" 

export default function Login() {
  const [email, setEmail] = useState("") 
  const [password, setPassword] = useState("") 
  const [submitting, setSubmitting] = useState(false) 
  const { login } = useAuth() 
  const navigate = useNavigate() 

  async function handleSubmit(e) {
    e.preventDefault() 
    setSubmitting(true) 
    try {
      const user = await login(email, password) 
      toast.success("Logged in") 
      if (user.role === "admin") navigate("/admin") 
      else if (user.role === "seller") navigate("/seller/products") 
      else navigate("/") 
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed") 
    } finally {
      setSubmitting(false) 
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gray-900 text-white py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-3">
        No account? <Link to="/register" className="underline">Register</Link>
      </p>
    </div>
  ) 
}
