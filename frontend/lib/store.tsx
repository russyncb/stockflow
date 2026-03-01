"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  type Product, type User, type CartItem, type Transaction, type StockMovement,
  type Currency, type PaymentMethod,
  convertCurrency,
} from "@/lib/mock-data"
import * as api from "@/lib/api"

type View = "login" | "pos" | "dashboard" | "inventory" | "users"

function mapApiProduct(p: api.ApiProduct): Product {
  const taxRate = p.tax_rate != null
    ? (typeof p.tax_rate === "string" ? parseFloat(p.tax_rate) : p.tax_rate)
    : 0
  return {
    id: String(p.id),
    name: p.name,
    description: p.description ?? "",
    price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
    stock: p.stock_quantity,
    category: "",
    sku: "",
    taxRate: Number.isFinite(taxRate) ? taxRate : 0,
  }
}

function mapApiUser(u: api.ApiUser): User {
  return {
    id: String(u.id),
    username: u.username,
    role: (u.role === "Admin" ? "admin" : "staff") as "admin" | "staff",
    dateCreated: u.created_at?.slice(0, 10) ?? "",
  }
}

function mapApiMovement(m: api.ApiAdminSummary["recentMovements"][0]): StockMovement {
  const type = m.type === "SALE" ? "Sale" : m.type === "RESTOCK" ? "Restock" : "Adjustment"
  return {
    id: String(m.id),
    productName: m.product_name,
    user: m.username,
    type,
    quantity: m.quantity_changed,
    timestamp: m.timestamp ? new Date(m.timestamp).toISOString().replace("T", " ").slice(0, 16) : "",
  }
}

function mapApiSaleToTransaction(s: api.ApiSale): Transaction {
  return {
    id: s.id,
    items: s.items.map((i) => ({
      productName: i.productName,
      sku: "",
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal,
      tax: 0,
    })),
    subtotal: s.subtotal,
    taxTotal: s.taxTotal ?? 0,
    grandTotal: s.grandTotal,
    amountPaid: s.amountPaid,
    change: s.change ?? 0,
    currency: "USD",
    paymentMethod: "Cash",
    cashier: s.cashier,
    timestamp: s.timestamp,
  }
}

interface AppState {
  currentUser: User | null
  currentView: View
  products: Product[]
  users: User[]
  cart: CartItem[]
  transactions: Transaction[]
  stockMovements: StockMovement[]
  profileOpen: boolean
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  setView: (view: View) => void
  loadDashboardData: () => Promise<void>
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  processSale: (amountPaidInCurrency: number, currency?: Currency, paymentMethod?: PaymentMethod) => Promise<Transaction | null>
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  restockProduct: (id: string, quantity: number) => void
  addUser: (user: Omit<User, "id" | "dateCreated"> & { password: string }) => void
  deleteUser: (id: string) => void
  updateUserRole: (id: string, role: "admin" | "staff") => void
  resetUserPassword: (id: string, newPassword: string) => void
  setProfileOpen: (open: boolean) => void
  clearError: () => void
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
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [profileOpen, setProfileOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.getProducts()
      setProducts(data.map(mapApiProduct))
    } catch (e) {
      console.error("Failed to fetch products:", e)
      setError(e instanceof Error ? e.message : "Failed to load products")
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.getUsers()
      setUsers(data.map(mapApiUser))
    } catch (e) {
      console.error("Failed to fetch users:", e)
      setError(e instanceof Error ? e.message : "Failed to load users")
    }
  }, [])

  const loadDashboardData = useCallback(async () => {
    if (!currentUser || currentUser.role !== "admin") return
    try {
      const [adminData, salesData] = await Promise.all([
        api.getDashboardAdmin(),
        api.getSales(50),
      ])
      setStockMovements(adminData.recentMovements.map(mapApiMovement))
      setTransactions(salesData.map(mapApiSaleToTransaction))
    } catch (e) {
      console.error("Failed to fetch dashboard:", e)
      setError(e instanceof Error ? e.message : "Failed to load dashboard")
    }
  }, [currentUser])

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setError(null)
    setLoading(true)
    try {
      const res = await api.login(username, password)
      api.setAuthToken(res.token)
      const user = mapApiUser({
        id: res.user.id,
        username: res.user.username,
        role: res.user.role,
        created_at: new Date().toISOString(),
      })
      setCurrentUser(user)
      setCurrentView(user.role === "admin" ? "dashboard" : "pos")
      await fetchProducts()
      if (user.role === "admin") {
        await fetchUsers()
        const [adminData, salesData] = await Promise.all([
          api.getDashboardAdmin(),
          api.getSales(50),
        ])
        setStockMovements(adminData.recentMovements.map(mapApiMovement))
        setTransactions(salesData.map(mapApiSaleToTransaction))
      }
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid username or password")
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchProducts, fetchUsers])

  const logout = useCallback(() => {
    api.setAuthToken(null)
    setCurrentUser(null)
    setCurrentView("login")
    setCart([])
    setProducts([])
    setUsers([])
    setTransactions([])
    setStockMovements([])
    setError(null)
  }, [])

  const setView = useCallback((view: View) => {
    setCurrentView(view)
  }, [])

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

  const processSale = useCallback(
    async (
      amountPaidInCurrency: number,
      currency: Currency = "USD",
      paymentMethod: PaymentMethod = "Cash"
    ): Promise<Transaction | null> => {
      if (cart.length === 0 || !currentUser) return null
      setError(null)
      try {
        const items = cart.map((i) => ({
          product_id: Number(i.product.id),
          quantity: i.quantity,
        }))
        await api.processSale(items)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sale failed")
        return null
      }
      const now = new Date()
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      const itemsForReceipt = cart.map((i) => {
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
      const subtotal = itemsForReceipt.reduce((sum, i) => sum + i.lineTotal, 0)
      const taxTotal = itemsForReceipt.reduce((sum, i) => sum + i.tax, 0)
      const grandTotal = subtotal + taxTotal
      const grandTotalInCurrency = convertCurrency(grandTotal, currency)
      const change = amountPaidInCurrency - grandTotalInCurrency
      const transaction: Transaction = {
        id: String(Date.now()),
        items: itemsForReceipt,
        subtotal,
        taxTotal,
        grandTotal,
        amountPaid: amountPaidInCurrency,
        change,
        currency,
        paymentMethod,
        cashier: currentUser.username,
        timestamp,
      }
      setCart([])
      await fetchProducts()
      await loadDashboardData()
      setTransactions((prev) => [transaction, ...prev])
      return transaction
    },
    [cart, currentUser, fetchProducts, loadDashboardData]
  )

  const addProduct = useCallback(
    async (product: Omit<Product, "id">) => {
      setError(null)
      try {
        await api.addProduct({
          name: product.name,
          description: product.description || undefined,
          price: product.price,
          stock_quantity: product.stock,
          category_id: null,
          tax_rate: product.taxRate ?? 0,
        })
        await fetchProducts()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add product")
      }
    },
    [fetchProducts]
  )

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      setError(null)
      try {
        await api.updateProduct(id, {
          name: updates.name,
          description: updates.description,
          price: updates.price,
          tax_rate: updates.taxRate,
        })
        await fetchProducts()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update product")
      }
    },
    [fetchProducts]
  )

  const deleteProduct = useCallback(
    async (id: string) => {
      setError(null)
      try {
        await api.deleteProduct(id)
        await fetchProducts()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete product")
      }
    },
    [fetchProducts]
  )

  const restockProduct = useCallback(
    async (id: string, quantity: number) => {
      setError(null)
      try {
        await api.restockProduct(id, quantity)
        await fetchProducts()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to restock")
      }
    },
    [fetchProducts]
  )

  const addUser = useCallback(
    async (user: Omit<User, "id" | "dateCreated"> & { password: string }) => {
      setError(null)
      try {
        await api.register({
          username: user.username,
          password: user.password,
          role: user.role === "admin" ? "Admin" : "Staff",
        })
        await fetchUsers()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add user")
      }
    },
    [fetchUsers]
  )

  const deleteUser = useCallback(
    async (id: string) => {
      setError(null)
      try {
        await api.deleteUser(id)
        await fetchUsers()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete user")
      }
    },
    [fetchUsers]
  )

  const updateUserRole = useCallback(
    async (id: string, role: "admin" | "staff") => {
      setError(null)
      try {
        await api.updateUserRole(id, role)
        await fetchUsers()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update role")
      }
    },
    [fetchUsers]
  )

  const resetUserPassword = useCallback(
    async (id: string, newPassword: string) => {
      setError(null)
      try {
        await api.resetUserPassword(id, newPassword)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to reset password")
      }
    },
    []
  )

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentView,
        products,
        users,
        cart,
        transactions,
        stockMovements,
        profileOpen,
        loading,
        error,
        login,
        logout,
        setView,
        loadDashboardData,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        processSale,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        addUser,
        deleteUser,
        updateUserRole,
        resetUserPassword,
        setProfileOpen,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
