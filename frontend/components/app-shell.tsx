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
  const { currentUser, currentView } = useAppStore()

  if (!currentUser || currentView === "login") {
    return <LoginPage />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        {currentView === "dashboard" && <DashboardPage />}
        {currentView === "pos" && <POSPage />}
        {currentView === "inventory" && <InventoryPage />}
        {currentView === "users" && <UserManagementPage />}
      </main>
      <ProfileModal />
    </div>
  )
}

export default function AppShell() {
  return <AppContent />
}
