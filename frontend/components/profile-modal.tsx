"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProfileModal() {
  const { currentUser, profileOpen, setProfileOpen } = useAppStore()
  const [username, setUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  if (!currentUser) return null

  return (
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>
            Update your username or reset your password.
          </DialogDescription>
        </DialogHeader>

        {/* Avatar */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{currentUser.username}</p>
            <p className="text-xs capitalize text-muted-foreground">{currentUser.role} account</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-username">Username</Label>
            <Input
              id="profile-username"
              placeholder={currentUser.username}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-new-password">New Password</Label>
            <Input
              id="profile-new-password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-confirm-password">Confirm Password</Label>
            <Input
              id="profile-confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <button
            onClick={() => setProfileOpen(false)}
            className="h-9 rounded-lg border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setProfileOpen(false); setUsername(""); setNewPassword(""); setConfirmPassword("")
            }}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Save Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
