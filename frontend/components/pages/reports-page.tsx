"use client"

import { useState, useEffect } from "react"
import { FileText, Download, Calendar } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function formatDateForInput(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function ReportsPage() {
  const { currentUser, transactions, products, loadDashboardData } = useAppStore()
  const [fromDate, setFromDate] = useState(formatDateForInput(new Date()))
  const [toDate, setToDate] = useState(formatDateForInput(new Date()))

  useEffect(() => {
    if (currentUser?.role === "admin") {
      loadDashboardData()
    }
  }, [currentUser?.role, loadDashboardData])

  const salesInRange = transactions.filter((t) => {
    const tDate = t.timestamp.slice(0, 10)
    return tDate >= fromDate && tDate <= toDate
  })

  const totalSalesInRange = salesInRange.reduce((sum, t) => sum + t.subtotal, 0)

  function exportSalesCsv() {
    const headers = ["Date/Time", "ID", "Cashier", "Items Count", "Subtotal", "Payment Method"]
    const rows = salesInRange.map((t) => [
      t.timestamp,
      t.id,
      t.cashier,
      t.items.length,
      t.subtotal.toFixed(2),
      t.paymentMethod || "",
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${fromDate}-to-${toDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportInventoryCsv() {
    const headers = ["Name", "Category", "Price (USD)", "Stock", "Value (USD)"]
    const rows = products.map((p) => [
      p.name,
      p.category || "",
      p.price.toFixed(2),
      p.stock,
      (p.price * p.stock).toFixed(2),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `inventory-report-${formatDateForInput(new Date())}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Reports</h2>
        <p className="mt-1 text-sm text-muted-foreground">Generate and export sales and inventory reports</p>
      </div>

      {/* Sales Report */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-card-foreground">Sales Report</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="from-date" className="text-xs text-muted-foreground whitespace-nowrap">From</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-8 w-36"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="to-date" className="text-xs text-muted-foreground whitespace-nowrap">To</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-8 w-36"
              />
            </div>
            <button
              type="button"
              onClick={exportSalesCsv}
              className="flex h-8 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{salesInRange.length}</span> transactions from {fromDate} to {toDate}.
            Total sales: <span className="font-semibold text-success">${totalSalesInRange.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
      </div>

      {/* Inventory Report */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-card-foreground">Inventory Report</h3>
          </div>
          <button
            type="button"
            onClick={exportInventoryCsv}
            className="flex h-8 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{products.length}</span> products.
            Total inventory value: <span className="font-semibold text-success">${products.reduce((s, p) => s + p.price * p.stock, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
