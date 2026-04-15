import { Link, useNavigate } from "react-router-dom" 
import { useAuth } from "../context/AuthContext" 
import { useCart } from "../context/CartContext" 
import { ShoppingCart, User, LogOut, MessageSquare, Menu, X } from "lucide-react" 
import { useState } from "react" 

export default function Navbar() {
  const { user, logout } = useAuth() 
  const { totalItems } = useCart() 
  const navigate = useNavigate() 
  const [menuOpen, setMenuOpen] = useState(false) 

  function handleLogout() {
    logout() 
    navigate("/login") 
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Store
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/products" className="hover:text-gray-600">Products</Link>

          {user && user.role === "customer" && (
            <>
              <Link to="/orders" className="hover:text-gray-600">Orders</Link>
              <Link to="/wishlist" className="hover:text-gray-600">Wishlist</Link>
              <Link to="/chat" className="hover:text-gray-600 flex items-center gap-1">
                <MessageSquare size={16} /> Chat
              </Link>
            </>
          )}

          {user && user.role === "seller" && (
            <>
              <Link to="/seller/products" className="hover:text-gray-600">My Products</Link>
              <Link to="/seller/orders" className="hover:text-gray-600">Orders</Link>
              <Link to="/chat" className="hover:text-gray-600 flex items-center gap-1">
                <MessageSquare size={16} /> Chat
              </Link>
            </>
          )}

          {user && user.role === "admin" && (
            <>
              <Link to="/admin" className="hover:text-gray-600">Dashboard</Link>
              <Link to="/admin/sellers" className="hover:text-gray-600">Sellers</Link>
              <Link to="/admin/products" className="hover:text-gray-600">Products</Link>
              <Link to="/admin/orders" className="hover:text-gray-600">Orders</Link>
              <Link to="/admin/users" className="hover:text-gray-600">Users</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && user.role === "customer" && (
            <Link to="/cart" className="relative p-1">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="p-1"><User size={20} /></Link>
              <button onClick={handleLogout} className="p-1 text-gray-500 hover:text-gray-700">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link to="/login" className="hover:text-gray-600">Login</Link>
              <Link
                to="/register"
                className="bg-gray-900 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-800"
              >
                Register
              </Link>
            </div>
          )}

          <button className="md:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-2 text-sm bg-white">
          <Link to="/products" className="block py-1" onClick={() => setMenuOpen(false)}>Products</Link>
          {user && user.role === "customer" && (
            <>
              <Link to="/orders" className="block py-1" onClick={() => setMenuOpen(false)}>Orders</Link>
              <Link to="/wishlist" className="block py-1" onClick={() => setMenuOpen(false)}>Wishlist</Link>
              <Link to="/chat" className="block py-1" onClick={() => setMenuOpen(false)}>Chat</Link>
            </>
          )}
          {user && user.role === "seller" && (
            <>
              <Link to="/seller/products" className="block py-1" onClick={() => setMenuOpen(false)}>My Products</Link>
              <Link to="/seller/orders" className="block py-1" onClick={() => setMenuOpen(false)}>Orders</Link>
              <Link to="/chat" className="block py-1" onClick={() => setMenuOpen(false)}>Chat</Link>
            </>
          )}
          {user && user.role === "admin" && (
            <>
              <Link to="/admin" className="block py-1" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/admin/sellers" className="block py-1" onClick={() => setMenuOpen(false)}>Sellers</Link>
              <Link to="/admin/orders" className="block py-1" onClick={() => setMenuOpen(false)}>Orders</Link>
              <Link to="/admin/users" className="block py-1" onClick={() => setMenuOpen(false)}>Users</Link>
            </>
          )}
        </div>
      )}
    </nav>
  ) 
}
