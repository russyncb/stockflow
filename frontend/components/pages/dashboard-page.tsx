"use client"

import { useEffect } from "react"
import { Package, DollarSign, ShoppingCart, AlertTriangle, ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react"
import { useAppStore } from "@/lib/store"

export function DashboardPage() {
  const { currentUser, products, transactions, stockMovements, loadDashboardData } = useAppStore()

  useEffect(() => {
    if (currentUser?.role === "admin") {
      loadDashboardData()
    }
  }, [currentUser?.role, loadDashboardData])

  const totalProducts = products.length
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const todayStr = new Date().toISOString().split("T")[0]
  const todaysTransactions = transactions.filter((t) => t.timestamp.startsWith(todayStr))
  const todaysSalesTotal = todaysTransactions.reduce((sum, t) => sum + t.subtotal, 0)
  const lowStockAlerts = products.filter((p) => p.stock <= 5).length

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
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your business performance</p>
      </div>

      {/* Metric Cards */}
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
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${metric.trendUp ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
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

      {/* Two column layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Recent Transactions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{transactions.length} total</p>
            </div>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted mb-3">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No transactions yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Process a sale from POS to see them here
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cashier</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Items</th>
                    <th className="px-5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                    <th className="px-5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Paid</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((txn) => (
                    <tr key={txn.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/50">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        #{txn.id.slice(-6)}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {txn.cashier}
                      </td>
                      <td className="px-5 py-3 text-xs text-card-foreground">
                        {txn.items.length} item(s)
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-sm font-semibold text-success">
                        ${txn.subtotal.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-sm text-card-foreground">
                        ${txn.amountPaid.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {txn.timestamp}
                      </td>
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
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="px-5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Qty</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements.slice(0, 10).map((movement) => (
                  <tr key={movement.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/50">
                    <td className="px-5 py-3 font-medium text-card-foreground text-xs">{movement.productName}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{movement.user}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        movement.type === "Sale"
                          ? "bg-primary/10 text-primary"
                          : movement.type === "Restock"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {movement.type}
                      </span>
                    </td>
                    <td className={`px-5 py-3 text-right font-mono text-sm font-medium ${
                      movement.type === "Sale" ? "text-destructive" : "text-success"
                    }`}>
                      {movement.type === "Sale" ? `-${movement.quantity}` : `+${Math.abs(movement.quantity)}`}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{movement.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
