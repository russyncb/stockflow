"use client"

import { useAppStore } from "@/lib/store"
import { Sidebar } from "@/components/sidebar"
import { ProfileModal } from "@/components/profile-modal"
import { LoginPage } from "@/components/pages/login-page"
import { DashboardPage } from "@/components/pages/dashboard-page"
import { POSPage } from "@/components/pages/pos-page"
import { InventoryPage } from "@/components/pages/inventory-page"
import { UserManagementPage } from "@/components/pages/user-management-page"

function AppContent() {
  const { currentUser, currentView, error, clearError } = useAppStore()

  if (!currentUser || currentView === "login") {
    return <LoginPage />
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {error && (
        <div className="flex items-center justify-between gap-4 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="shrink-0 rounded px-2 py-1 font-medium hover:bg-destructive/20"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {currentView === "dashboard" && <DashboardPage />}
          {currentView === "pos" && <POSPage />}
          {currentView === "inventory" && <InventoryPage />}
          {currentView === "users" && <UserManagementPage />}
        </main>
        <ProfileModal />
      </div>
    </div>
  )
}

export default function AppShell() {
  return <AppContent />
}
