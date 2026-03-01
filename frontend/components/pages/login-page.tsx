"use client"

import { useState } from "react"
import { TrendingUp, ArrowRight } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginPage() {
  const { login } = useAppStore()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!username.trim()) {
      setError("Please enter a username.")
      return
    }
    const success = login(username.trim())
    if (!success) {
      setError("Invalid username. Try: admin_maria or staff_james")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">StockFlow</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-username" className="text-xs font-medium text-muted-foreground">
                Username
              </Label>
              <Input
                id="login-username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-password" className="text-xs font-medium text-muted-foreground">
                Password
              </Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="group mt-1 flex h-10 items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
            >
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-4 rounded-lg bg-muted px-4 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Demo Accounts</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Admin access</span>
                <code className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">admin_maria</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Staff access</span>
                <code className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">staff_james</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
