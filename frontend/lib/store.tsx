"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  mockProducts, mockUsers, mockStockMovements,
  type Product, type User, type CartItem, type Transaction, type StockMovement,
  type Currency, type PaymentMethod,
  convertCurrency,
} from "@/lib/mock-data"

type View = "login" | "pos" | "dashboard" | "inventory" | "users"

interface AppState {
  currentUser: User | null
  currentView: View
  products: Product[]
  users: User[]
  cart: CartItem[]
  transactions: Transaction[]
  stockMovements: StockMovement[]
  profileOpen: boolean
  login: (username: string) => boolean
  logout: () => void
  setView: (view: View) => void
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  processSale: (amountPaidInCurrency: number, currency: Currency, paymentMethod: PaymentMethod) => Transaction
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  restockProduct: (id: string, quantity: number) => void
  addUser: (user: Omit<User, "id" | "dateCreated">) => void
  deleteUser: (id: string) => void
  updateUserRole: (id: string, role: "admin" | "staff") => void
  setProfileOpen: (open: boolean) => void
}

const AppContext = createContext<AppState | null>(null)

export function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppStore must be used within AppProvider")
  return ctx
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<View>("login")
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [cart, setCart] = useState<CartItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockStockMovements)
  const [profileOpen, setProfileOpen] = useState(false)

  const login = useCallback((username: string) => {
    const found = users.find((u) => u.username === username)
    if (found) {
      setCurrentUser(found)
      setCurrentView(found.role === "admin" ? "dashboard" : "pos")
      return true
    }
    return false
  }, [users])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setCurrentView("login")
    setCart([])
  }, [])

  const setView = useCallback((view: View) => setCurrentView(view), [])

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: Math.max(1, quantity) } : i
      )
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const processSale = useCallback((amountPaidInCurrency: number, currency: Currency, paymentMethod: PaymentMethod): Transaction => {
    const now = new Date()
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

    const items = cart.map((i) => {
      const lineTotal = i.product.price * i.quantity
      const tax = lineTotal * i.product.taxRate
      return {
        productName: i.product.name,
        sku: i.product.sku,
        quantity: i.quantity,
        unitPrice: i.product.price,
        lineTotal,
        tax,
      }
    })

    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)
    const taxTotal = items.reduce((sum, i) => sum + i.tax, 0)
    const grandTotal = subtotal + taxTotal

    // Convert amounts to display currency for storage
    const grandTotalInCurrency = convertCurrency(grandTotal, currency)
    const change = amountPaidInCurrency - grandTotalInCurrency

    const transaction: Transaction = {
      id: String(Date.now()),
      items,
      subtotal,
      taxTotal,
      grandTotal,
      amountPaid: amountPaidInCurrency,
      change,
      currency,
      paymentMethod,
      cashier: currentUser?.username ?? "unknown",
      timestamp,
    }

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((i) => i.product.id === p.id)
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) }
        }
        return p
      })
    )

    // Add stock movements for each item sold
    const newMovements: StockMovement[] = cart.map((item, idx) => ({
      id: String(Date.now() + idx),
      productName: item.product.name,
      user: currentUser?.username ?? "unknown",
      type: "Sale" as const,
      quantity: item.quantity,
      timestamp,
    }))

    setStockMovements((prev) => [...newMovements, ...prev])
    setTransactions((prev) => [transaction, ...prev])
    setCart([])

    return transaction
  }, [cart, currentUser])

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const id = String(Date.now())
    setProducts((prev) => [...prev, { ...product, id }])
  }, [])

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const restockProduct = useCallback((id: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: p.stock + quantity } : p))
    )
  }, [])

  const addUser = useCallback((user: Omit<User, "id" | "dateCreated">) => {
    const id = String(Date.now())
    const dateCreated = new Date().toISOString().split("T")[0]
    setUsers((prev) => [...prev, { ...user, id, dateCreated }])
  }, [])

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const updateUserRole = useCallback((id: string, role: "admin" | "staff") => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
  }, [])

  return (
    <AppContext.Provider
      value={{
        currentUser, currentView, products, users, cart, transactions, stockMovements, profileOpen,
        login, logout, setView, addToCart, removeFromCart, updateCartQuantity,
        clearCart, processSale, addProduct, updateProduct, deleteProduct,
        restockProduct, addUser, deleteUser, updateUserRole, setProfileOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
