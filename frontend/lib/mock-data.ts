export type Currency = "USD" | "ZAR" | "ZiG"
export type PaymentMethod = "Cash" | "Swipe" | "EcoCash"

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  ZAR: "R",
  ZiG: "ZiG ",
}

export const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1,
  ZAR: 20,
  ZiG: 40,
}

export function convertCurrency(amountUsd: number, to: Currency): number {
  return amountUsd * CURRENCY_RATES[to]
}

export function formatCurrency(amount: number, currency: Currency): string {
  const sym = CURRENCY_SYMBOLS[currency]
  return `${sym}${amount.toFixed(2)}`
}

export interface Product {
  id: string
  name: string
  description: string
  price: number // always stored in USD
  stock: number
  category: string
  sku: string
  taxRate: number // 0 = no tax, e.g. 0.15 = 15% VAT
}

export interface User {
  id: string
  username: string
  role: "admin" | "staff"
  dateCreated: string
}

export interface StockMovement {
  id: string
  productName: string
  user: string
  type: "Sale" | "Restock" | "Adjustment"
  quantity: number
  timestamp: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Transaction {
  id: string
  items: {
    productName: string
    sku: string
    quantity: number
    unitPrice: number
    lineTotal: number
    tax: number
  }[]
  subtotal: number
  taxTotal: number
  grandTotal: number
  amountPaid: number
  change: number
  currency: Currency
  paymentMethod: PaymentMethod
  cashier: string
  timestamp: string
}

export const mockProducts: Product[] = [
  { id: "1", name: "Wireless Earbuds", description: "Bluetooth 5.3 with noise cancellation", price: 49.99, stock: 85, category: "Electronics", sku: "WE-001", taxRate: 0.15 },
  { id: "2", name: "Phone Charger Cable", description: "USB-C fast charging cable, 6ft", price: 12.99, stock: 200, category: "Accessories", sku: "PC-002", taxRate: 0.15 },
  { id: "3", name: "Laptop Stand", description: "Adjustable aluminum laptop stand", price: 34.99, stock: 45, category: "Accessories", sku: "LS-003", taxRate: 0.15 },
  { id: "4", name: "Desk Lamp", description: "LED desk lamp with dimmer", price: 29.99, stock: 60, category: "Home Office", sku: "DL-004", taxRate: 0.15 },
  { id: "5", name: "Webcam HD", description: "1080p HD webcam with microphone", price: 59.99, stock: 30, category: "Electronics", sku: "WC-005", taxRate: 0.15 },
  { id: "6", name: "Keyboard Wireless", description: "Compact wireless mechanical keyboard", price: 79.99, stock: 3, category: "Electronics", sku: "KW-006", taxRate: 0.15 },
  { id: "7", name: "Mouse Pad XL", description: "Extended gaming mouse pad", price: 19.99, stock: 120, category: "Accessories", sku: "MP-007", taxRate: 0 },
  { id: "8", name: "USB Hub", description: "7-port USB 3.0 hub", price: 24.99, stock: 75, category: "Accessories", sku: "UH-008", taxRate: 0.15 },
  { id: "9", name: "Monitor Arm", description: "Single monitor arm mount", price: 44.99, stock: 2, category: "Home Office", sku: "MA-009", taxRate: 0.15 },
  { id: "10", name: "Headphone Stand", description: "Wooden headphone stand", price: 22.99, stock: 55, category: "Accessories", sku: "HS-010", taxRate: 0 },
  { id: "11", name: "Screen Protector", description: "Tempered glass screen protector", price: 9.99, stock: 300, category: "Accessories", sku: "SP-011", taxRate: 0 },
  { id: "12", name: "Portable Speaker", description: "Waterproof Bluetooth speaker", price: 39.99, stock: 40, category: "Electronics", sku: "PS-012", taxRate: 0.15 },
]

export const mockUsers: User[] = [
  { id: "1", username: "admin_maria", role: "admin", dateCreated: "2024-01-15" },
  { id: "2", username: "staff_james", role: "staff", dateCreated: "2024-03-22" },
  { id: "3", username: "staff_ana", role: "staff", dateCreated: "2024-06-10" },
  { id: "4", username: "admin_carlos", role: "admin", dateCreated: "2024-02-01" },
  { id: "5", username: "staff_lin", role: "staff", dateCreated: "2025-01-08" },
]

export const mockStockMovements: StockMovement[] = [
  { id: "1", productName: "Wireless Earbuds", user: "staff_james", type: "Sale", quantity: 2, timestamp: "2026-02-26 09:15" },
  { id: "2", productName: "Phone Charger Cable", user: "staff_ana", type: "Sale", quantity: 5, timestamp: "2026-02-26 09:42" },
  { id: "3", productName: "Laptop Stand", user: "admin_maria", type: "Restock", quantity: 20, timestamp: "2026-02-26 10:05" },
  { id: "4", productName: "Keyboard Wireless", user: "admin_maria", type: "Restock", quantity: 15, timestamp: "2026-02-25 16:30" },
  { id: "5", productName: "Webcam HD", user: "staff_james", type: "Sale", quantity: 1, timestamp: "2026-02-25 14:20" },
  { id: "6", productName: "USB Hub", user: "staff_lin", type: "Sale", quantity: 3, timestamp: "2026-02-25 12:45" },
  { id: "7", productName: "Monitor Arm", user: "admin_carlos", type: "Adjustment", quantity: -1, timestamp: "2026-02-25 11:00" },
  { id: "8", productName: "Desk Lamp", user: "staff_ana", type: "Sale", quantity: 2, timestamp: "2026-02-25 09:30" },
]
