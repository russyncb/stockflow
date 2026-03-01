"use client"

import { useState, useEffect } from "react"
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  LogOut,
  User,
  TrendingUp,
  Sun,
  Moon,
  FileText,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"

const adminNav = [
  { id: "dashboard" as const, label: "Analytics", icon: BarChart3 },
  { id: "pos" as const, label: "Point of Sale", icon: ShoppingCart },
  { id: "inventory" as const, label: "Inventory", icon: Package },
  { id: "users" as const, label: "Users", icon: Users },
  { id: "reports" as const, label: "Reports", icon: FileText },
]

const staffNav = [
  { id: "pos" as const, label: "Point of Sale", icon: ShoppingCart },
]

export function Sidebar() {
  const { currentUser, currentView, setView, logout, setProfileOpen } = useAppStore()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!currentUser) return null

  const navItems = currentUser.role === "admin" ? adminNav : staffNav
  const isDark = resolvedTheme === "dark"

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-sidebar-accent-foreground">StockFlow</h1>
          <p className="text-[11px] text-sidebar-foreground/60">Inventory Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-2">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Menu
        </p>
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = currentView === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => setView(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Theme toggle */}
      <div className="px-3 pb-2">
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        )}
      </div>

      {/* User section */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-accent-foreground">{currentUser.username}</p>
            <p className="text-[11px] capitalize text-sidebar-foreground/60">{currentUser.role}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sidebar-accent px-3 py-1.5 text-xs font-medium text-sidebar-foreground transition-colors hover:text-sidebar-accent-foreground"
          >
            <User className="h-3.5 w-3.5" />
            Profile
          </button>
          <button
            onClick={logout}
            className="flex items-center justify-center rounded-lg bg-sidebar-accent px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:text-destructive"
            aria-label="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
