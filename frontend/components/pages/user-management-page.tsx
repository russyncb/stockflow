"use client"

import { useState } from "react"
import { Plus, Pencil, KeyRound, Trash2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { User } from "@/lib/mock-data"

type ModalType = "add" | "editRole" | "resetPassword" | "delete" | null

export function UserManagementPage() {
  const { users, addUser, deleteUser, updateUserRole, resetUserPassword } = useAppStore()
  const [modal, setModal] = useState<ModalType>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [formUsername, setFormUsername] = useState("")
  const [formRole, setFormRole] = useState<"admin" | "staff">("staff")
  const [formPassword, setFormPassword] = useState("")

  const resetForm = () => { setFormUsername(""); setFormRole("staff"); setFormPassword(""); setSelectedUser(null); setModal(null) }

  const handleAdd = () => {
    if (!formPassword || formPassword.length < 6) return
    addUser({ username: formUsername, role: formRole, password: formPassword })
    resetForm()
  }
  const handleEditRole = () => { if (!selectedUser) return; updateUserRole(selectedUser.id, formRole); resetForm() }
  const handleResetPassword = () => {
    if (!selectedUser || !formPassword || formPassword.length < 6) return
    resetUserPassword(selectedUser.id, formPassword)
    resetForm()
  }
  const handleDelete = () => { if (!selectedUser) return; deleteUser(selectedUser.id); resetForm() }

  const openEditRole = (user: User) => { setSelectedUser(user); setFormRole(user.role); setModal("editRole") }
  const openResetPassword = (user: User) => { setSelectedUser(user); setFormPassword(""); setModal("resetPassword") }
  const openDelete = (user: User) => { setSelectedUser(user); setModal("delete") }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">User Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage system users and their roles</p>
        </div>
        <button
          onClick={() => { resetForm(); setModal("add") }}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-card-foreground">All Users ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Username</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Created</th>
                <th className="px-5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-card-foreground">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      user.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{user.dateCreated}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditRole(user)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" aria-label={`Edit role for ${user.username}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => openResetPassword(user)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" aria-label={`Reset password for ${user.username}`}>
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => openDelete(user)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${user.username}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={modal === "add"} onOpenChange={() => resetForm()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new staff or admin account.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-username">Username</Label>
              <Input id="add-username" value={formUsername} onChange={(e) => setFormUsername(e.target.value)} placeholder="Enter username" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Role</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormRole("staff")}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${formRole === "staff" ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
                >
                  Staff
                </button>
                <button
                  onClick={() => setFormRole("admin")}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${formRole === "admin" ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
                >
                  Admin
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-password">Password</Label>
              <Input id="add-password" type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Set a password" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={resetForm} className="h-9 rounded-lg border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">Cancel</button>
            <button onClick={handleAdd} disabled={!formUsername.trim() || !formPassword || formPassword.length < 6} className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40">Add User</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={modal === "editRole"} onOpenChange={() => resetForm()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Change the role for <span className="font-semibold text-foreground">{selectedUser?.username}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label>Role</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormRole("staff")}
                className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${formRole === "staff" ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
              >
                Staff
              </button>
              <button
                onClick={() => setFormRole("admin")}
                className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${formRole === "admin" ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
              >
                Admin
              </button>
            </div>
          </div>
          <DialogFooter>
            <button onClick={resetForm} className="h-9 rounded-lg border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">Cancel</button>
            <button onClick={handleEditRole} className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Save Role</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={modal === "resetPassword"} onOpenChange={() => resetForm()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for <span className="font-semibold text-foreground">{selectedUser?.username}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="reset-password">New Password</Label>
            <Input id="reset-password" type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Enter new password" />
          </div>
          <DialogFooter>
            <button onClick={resetForm} className="h-9 rounded-lg border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">Cancel</button>
            <button onClick={handleResetPassword} disabled={!formPassword.trim() || formPassword.length < 6} className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40">Reset Password</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={modal === "delete"} onOpenChange={() => resetForm()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{selectedUser?.username}</span>?
              This will permanently remove their account and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={resetForm} className="h-9 rounded-lg border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">Cancel</button>
            <button onClick={handleDelete} className="h-9 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90">Delete User</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
