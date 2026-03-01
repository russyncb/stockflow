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
  price: number
  stock: number
  category: string
  sku: string
  taxRate: number
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
