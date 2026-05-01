/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem("cart_items");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((x) => x.product_id === product.product_id);
      if (existing) {
        return current.map((x) =>
          x.product_id === product.product_id
            ? { ...x, quantity: Math.min(99, x.quantity + quantity) }
            : x,
        );
      }
      return [...current, { ...product, quantity }];
    });
  };

  const updateQuantity = (product_id, quantity) => {
    if (quantity <= 0) return removeItem(product_id);
    setItems((current) => current.map((x) => (x.product_id === product_id ? { ...x, quantity } : x)));
  };

  const removeItem = (product_id) => {
    setItems((current) => current.filter((x) => x.product_id !== product_id));
  };

  const clearCart = () => setItems([]);

  const total = useMemo(() => items.reduce((sum, item) => sum + (Number(item.price || item.variant_price || 0) * item.quantity), 0), [items]);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, total, count, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};