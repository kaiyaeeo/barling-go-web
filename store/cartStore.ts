    import { create } from "zustand"
    import { persist } from "zustand/middleware"

    export type CartItem = {
    id: string
    name: string
    price: number
    image: string
    stock: number
    qty: number
    }

    type CartStore = {
    items: CartItem[]
    addItem: (product: Omit<CartItem, "qty">, qty?: number) => void
    removeItem: (id: string) => void
    updateQty: (id: string, qty: number) => void
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
    }

    export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
        items: [],

        addItem: (product, qty = 1) => {
            set((state) => {
            const existing = state.items.find((i) => i.id === product.id)
            if (existing) {
                return {
                items: state.items.map((i) =>
                    i.id === product.id
                    ? { ...i, qty: Math.min(i.qty + qty, i.stock) }
                    : i
                ),
                }
            }
            return { items: [...state.items, { ...product, qty }] }
            })
        },

        removeItem: (id) =>
            set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

        updateQty: (id, qty) =>
            set((state) => ({
            items: state.items.map((i) =>
                i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i
            ),
            })),

        clearCart: () => set({ items: [] }),

        totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

        totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
        }),
        {
        name: "cart-storage",
        }
    )
    )