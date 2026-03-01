"use client"

import { useState, useMemo } from "react"
import { useEffect } from "react"
import { Package, DollarSign, ShoppingCart, AlertTriangle, ArrowUpRight, ArrowDownRight, Receipt, ArrowUpDown, Maximize2, Printer } from "lucide-react"
import { useAppStore } from "@/lib/store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function formatDateTime(isoOrDateStr: string): string {
  if (!isoOrDateStr) return "—"
  const d = new Date(isoOrDateStr.replace(" ", "T"))
  if (Number.isNaN(d.getTime())) return isoOrDateStr
  return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "medium" })
}

type TxnSort = "dateDesc" | "dateAsc" | "totalDesc" | "totalAsc" | "cashier"
type MovementSort = "dateDesc" | "dateAsc" | "product" | "type"

export function DashboardPage() {
  const { currentUser, products, transactions, stockMovements, loadDashboardData } = useAppStore()
  const [transactionsOpen, setTransactionsOpen] = useState(false)
  const [movementsOpen, setMovementsOpen] = useState(false)
  const [txnSort, setTxnSort] = useState<TxnSort>("dateDesc")
  const [movementSort, setMovementSort] = useState<MovementSort>("dateDesc")

  useEffect(() => {
    if (currentUser?.role === "admin") {
      loadDashboardData()
    }
  }, [currentUser?.role, loadDashboardData])

  const totalProducts = products.length
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const todayStr = new Date().toISOString().split("T")[0]
  const todaysTransactions = transactions.filter((t) => t.timestamp.startsWith(todayStr) || t.timestamp.includes(todayStr))
  const todaysSalesTotal = todaysTransactions.reduce((sum, t) => sum + t.subtotal, 0)
  const lowStockAlerts = products.filter((p) => p.stock <= 5).length

  const sortedTransactions = useMemo(() => {
    const list = [...transactions]
    switch (txnSort) {
      case "dateDesc": return list.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""))
      case "dateAsc": return list.sort((a, b) => (a.timestamp || "").localeCompare(b.timestamp || ""))
      case "totalDesc": return list.sort((a, b) => b.subtotal - a.subtotal)
      case "totalAsc": return list.sort((a, b) => a.subtotal - b.subtotal)
      case "cashier": return list.sort((a, b) => (a.cashier || "").localeCompare(b.cashier || ""))
      default: return list
    }
  }, [transactions, txnSort])

  const sortedMovements = useMemo(() => {
    const list = [...stockMovements]
    switch (movementSort) {
      case "dateDesc": return list.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""))
      case "dateAsc": return list.sort((a, b) => (a.timestamp || "").localeCompare(b.timestamp || ""))
      case "product": return list.sort((a, b) => (a.productName || "").localeCompare(b.productName || ""))
      case "type": return list.sort((a, b) => (a.type || "").localeCompare(b.type || ""))
      default: return list
    }
  }, [stockMovements, movementSort])

  const metrics = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
      trend: `${products.filter((p) => p.stock > 0).length} in stock`,
      trendUp: true,
    },
    {
      title: "Inventory Value",
      value: `$${inventoryValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: `${products.length} products`,
      trendUp: true,
    },
    {
      title: "Today's Revenue",
      value: `$${todaysSalesTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: ShoppingCart,
      trend: `${todaysTransactions.length} transactions`,
      trendUp: todaysTransactions.length > 0,
    },
    {
      title: "Low Stock Alerts",
      value: lowStockAlerts.toString(),
      icon: AlertTriangle,
      trend: lowStockAlerts > 0 ? "Needs attention" : "All stocked",
      trendUp: lowStockAlerts === 0,
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your business performance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${metric.trendUp ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {metric.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {metric.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">{metric.title}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-card-foreground">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Recent Transactions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{transactions.length} total</p>
            </div>
            <button
              type="button"
              onClick={() => setTransactionsOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Maximize2 className="h-4 w-4" />
              Full screen & sort
            </button>
          </div>
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Receipt className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No transactions yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Process a sale from POS to see them here</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cashier</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Items</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date / Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.slice(0, 10).map((txn) => (
                    <tr key={txn.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/50">
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{txn.id.slice(-6)}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{txn.cashier}</td>
                      <td className="px-5 py-3.5 text-sm text-card-foreground">{txn.items.length} item(s)</td>
                      <td className="px-5 py-3.5 text-right font-mono text-sm font-semibold text-success">${txn.subtotal.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">{formatDateTime(txn.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Stock Movements */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Stock Movements</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{stockMovements.length} records</p>
            </div>
            <button
              type="button"
              onClick={() => setMovementsOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Maximize2 className="h-4 w-4" />
              Full screen & sort
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Qty</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date / Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedMovements.slice(0, 10).map((movement) => (
                  <tr key={movement.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/50">
                    <td className="px-5 py-3.5 font-medium text-card-foreground text-sm">{movement.productName}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-sm">{movement.user}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        movement.type === "Sale" ? "bg-primary/10 text-primary" : movement.type === "Restock" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}>
                        {movement.type}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 text-right font-mono text-sm font-medium ${movement.type === "Sale" ? "text-destructive" : "text-success"}`}>
                      {movement.type === "Sale" ? `-${movement.quantity}` : `+${Math.abs(movement.quantity)}`}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{formatDateTime(movement.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transactions — large screen dialog */}
      <Dialog open={transactionsOpen} onOpenChange={setTransactionsOpen}>
        <DialogContent className="w-[95vw] max-w-[1200px] h-[90vh] max-h-[900px] overflow-hidden flex flex-col p-0 gap-0">
          <div className="shrink-0 px-6 py-5 border-b border-border bg-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sortedTransactions.length} transaction{sortedTransactions.length !== 1 ? "s" : ""}
                  {sortedTransactions.length > 0 && (
                    <> · Total ${sortedTransactions.reduce((s, t) => s + t.subtotal, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  Sort by
                  <select
                    value={txnSort}
                    onChange={(e) => setTxnSort(e.target.value as TxnSort)}
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground"
                  >
                    <option value="dateDesc">Date (newest first)</option>
                    <option value="dateAsc">Date (oldest first)</option>
                    <option value="totalDesc">Total (high → low)</option>
                    <option value="totalAsc">Total (low → high)</option>
                    <option value="cashier">Cashier (A–Z)</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground print:hidden"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            {sortedTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Receipt className="h-14 w-14 text-muted-foreground/50 mb-4" />
                <p className="text-base font-medium text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Process a sale from Point of Sale to see them here.</p>
              </div>
            ) : (
              <table className="w-full text-base">
                <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-backdrop-filter:bg-muted/80">
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cashier</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date / Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-muted-foreground">#{txn.id.slice(-6)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{txn.cashier}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{txn.items.length} item(s)</td>
                      <td className="px-6 py-4 text-right font-mono text-base font-semibold text-success">${txn.subtotal.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDateTime(txn.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Movements — large screen dialog */}
      <Dialog open={movementsOpen} onOpenChange={setMovementsOpen}>
        <DialogContent className="w-[95vw] max-w-[1200px] h-[90vh] max-h-[900px] overflow-hidden flex flex-col p-0 gap-0">
          <div className="shrink-0 px-6 py-5 border-b border-border bg-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Stock Movements</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sortedMovements.length} record{sortedMovements.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  Sort by
                  <select
                    value={movementSort}
                    onChange={(e) => setMovementSort(e.target.value as MovementSort)}
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground"
                  >
                    <option value="dateDesc">Date (newest first)</option>
                    <option value="dateAsc">Date (oldest first)</option>
                    <option value="product">Product (A–Z)</option>
                    <option value="type">Type</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground print:hidden"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            {sortedMovements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="h-14 w-14 text-muted-foreground/50 mb-4" />
                <p className="text-base font-medium text-muted-foreground">No stock movements yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Sales and restocks will appear here.</p>
              </div>
            ) : (
              <table className="w-full text-base">
                <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-backdrop-filter:bg-muted/80">
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Qty</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date / Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMovements.map((movement) => (
                    <tr key={movement.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{movement.productName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{movement.user}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          movement.type === "Sale" ? "bg-primary/10 text-primary" : movement.type === "Restock" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                        }`}>
                          {movement.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-base font-medium">{movement.type === "Sale" ? `-${movement.quantity}` : `+${Math.abs(movement.quantity)}`}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDateTime(movement.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
