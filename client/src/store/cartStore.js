import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i._id === product._id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i._id === product._id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.images?.[0]?.url || '',
                stock: product.stock,
                slug: product.slug,
                quantity,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i._id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i._id === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      // Computed values
      get itemCount() {
        return get().items.reduce((acc, i) => acc + i.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce((acc, i) => acc + i.price * i.quantity, 0);
      },

      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
