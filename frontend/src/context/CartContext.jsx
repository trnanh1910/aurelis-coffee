import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'aurelis-cart';
const readCart = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);
  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      add: (product) =>
        setItems((current) => {
          const key = String(product.id);
          const found = current.find((item) => item.key === key);
          return found
            ? current.map((item) =>
                item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
              )
            : [
                ...current,
                {
                  key,
                  id: product.id,
                  name: product.name,
                  image: product.image,
                  price: Number(product.price || 0),
                  quantity: 1,
                },
              ];
        }),
      setQuantity: (key, quantity) =>
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => item.key !== key)
            : current.map((item) =>
                item.key === key ? { ...item, quantity: Math.min(99, quantity) } : item,
              ),
        ),
      remove: (key) => setItems((current) => current.filter((item) => item.key !== key)),
      clear: () => setItems([]),
    }),
    [items],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
