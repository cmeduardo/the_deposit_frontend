'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Cart, CartItemInput, ConfirmCartInput } from './types'
import { cart as cartApi } from './api'
import { useAuth } from './auth-context'

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  itemCount: number
  subtotal: number
  fetchCart: () => Promise<void>
  addItem: (data: CartItemInput) => Promise<void>
  updateItem: (id: number, data: Partial<CartItemInput>) => Promise<void>
  removeItem: (id: number) => Promise<void>
  clearCart: () => Promise<void>
  confirmCart: (data: ConfirmCartInput) => Promise<{ pedido_id: number; total_general: number }>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null)
      return
    }

    setIsLoading(true)
    try {
      const data = await cartApi.getCart()
      setCart(data)
    } catch {
      setCart(null)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const addItem = async (data: CartItemInput) => {
    const response = await cartApi.addItem(data)
    setCart(response.carrito)
  }

  const updateItem = async (id: number, data: Partial<CartItemInput>) => {
    const response = await cartApi.updateItem(id, data)
    setCart(response.carrito)
  }

  const removeItem = async (id: number) => {
    await cartApi.removeItem(id)
    await fetchCart()
  }

  const clearCart = async () => {
    await cartApi.clearCart()
    setCart(null)
  }

  const confirmCart = async (data: ConfirmCartInput) => {
    const response = await cartApi.confirm(data)
    setCart(null)
    return { pedido_id: response.pedido_id, total_general: response.total_general }
  }

  const itemCount = cart?.items?.reduce((acc, item) => acc + Number(item.cantidad_unidad_venta), 0) || 0
  const subtotal = cart?.items?.reduce((acc, item) => acc + Number(item.subtotal_linea), 0) || 0

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        subtotal,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        confirmCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
