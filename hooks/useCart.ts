    import { useState, useEffect } from "react"

    export interface CartItem {
    product_id: string
    qty: number
    selected: boolean
    }

    export function useCart() {
    const [cartItems, setCartItems] = useState<CartItem[]>([])

    // Load cart on mount
    useEffect(() => {
        const saved = localStorage.getItem("barling_cart")
        if (saved) {
        try {
            setCartItems(JSON.parse(saved))
        } catch (e) {
            console.error("Failed to parse cart items", e)
        }
        }
    }, [])

    // Save cart changes
    const saveCart = (items: CartItem[]) => {
        setCartItems(items)
        localStorage.setItem("barling_cart", JSON.stringify(items))
        // Dispatch custom event to sync across components (e.g. Header badge)
        window.dispatchEvent(new Event("cart-updated"))
    }

    // Add Item to Cart
    const addToCart = (productId: string, qty: number = 1) => {
        const existingIndex = cartItems.findIndex(item => item.product_id === productId)
        let updated: CartItem[] = []

        if (existingIndex >= 0) {
        updated = [...cartItems]
        updated[existingIndex].qty += qty
        } else {
        updated = [...cartItems, { product_id: productId, qty, selected: true }]
        }
        
        saveCart(updated)
    }

    // Remove Item from Cart
    const removeFromCart = (productId: string) => {
        const updated = cartItems.filter(item => item.product_id !== productId)
        saveCart(updated)
    }

    // Update Item Quantity
    const updateQty = (productId: string, qty: number) => {
        if (qty < 1) return
        const updated = cartItems.map(item => 
        item.product_id === productId ? { ...item, qty } : item
        )
        saveCart(updated)
    }

    // Toggle selection for checkout
    const toggleSelect = (productId: string) => {
        const updated = cartItems.map(item => 
        item.product_id === productId ? { ...item, selected: !item.selected } : item
        )
        saveCart(updated)
    }

    // Clear entire cart
    const clearCart = () => {
        saveCart([])
    }

    const totalQty = cartItems.reduce((acc, item) => acc + item.qty, 0)
    const selectedQty = cartItems.filter(i => i.selected).reduce((acc, item) => acc + item.qty, 0)

    return {
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        toggleSelect,
        clearCart,
        totalQty,
        selectedQty
    }
    }
