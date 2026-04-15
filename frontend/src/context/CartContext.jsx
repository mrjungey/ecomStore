import { createContext, useContext, useState, useEffect } from "react" 

const CartContext = createContext(null) 

function loadCart() {
  try {
    const saved = localStorage.getItem("cart") 
    if (!saved) return [] 
    const parsed = JSON.parse(saved) 
    // Filter out any corrupted items missing product data
    return Array.isArray(parsed)
      ? parsed.filter((i) => i && i.product && i.product._id && typeof i.product.price === "number")
      : [] 
  } catch {
    return [] 
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart) 

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items)) 
  }, [items]) 

  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product._id === product._id) 
      if (idx >= 0) {
        const updated = [...prev] 
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity } 
        return updated 
      }
      return [...prev, { product, quantity }] 
    }) 
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((i) => i.product._id !== productId)) 
  }

  function updateQuantity(productId, quantity) {
    if (quantity < 1) return removeFromCart(productId) 
    setItems((prev) =>
      prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i))
    ) 
  }

  function clearCart() {
    setItems([]) 
  }

  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0) 
  const totalPrice = items.reduce((sum, i) => sum + ((i.product?.price || 0) * (i.quantity || 0)), 0) 

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  ) 
}

export function useCart() {
  const ctx = useContext(CartContext) 
  if (!ctx) throw new Error("useCart must be inside CartProvider") 
  return ctx 
}
