"use client"

import { useState } from "react"
import { Plus, RotateCcw, Pencil, Trash2, Search } from "lucide-react"
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
import type { Product } from "@/lib/mock-data"

type ModalType = "add" | "edit" | "restock" | "delete" | null

export function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct, restockProduct } = useAppStore()
  const [modal, setModal] = useState<ModalType>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState("")

  const [formName, setFormName] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formStock, setFormStock] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formSku, setFormSku] = useState("")
  const [formTaxRate, setFormTaxRate] = useState("0")
  const [restockQty, setRestockQty] = useState("")

  const resetForm = () => {
    setFormName(""); setFormPrice(""); setFormStock(""); setFormDescription("")
    setFormCategory(""); setFormSku(""); setFormTaxRate("0"); setRestockQty("")
    setSelectedProduct(null); setModal(null)
  }

  const openEdit = (product: Product) => {
    setSelectedProduct(product); setFormName(product.name); setFormPrice(product.price.toString())
    setFormDescription(product.description); setFormCategory(product.category); setFormSku(product.sku)
    setFormTaxRate(String(Math.round((product.taxRate ?? 0) * 100)))
    setModal("edit")
  }

  const openRestock = (product: Product) => { setSelectedProduct(product); setRestockQty(""); setModal("restock") }
  const openDelete = (product: Product) => { setSelectedProduct(product); setModal("delete") }

  const taxRateDecimal = (parseFloat(formTaxRate) || 0) / 100

  const handleAdd = () => {
    addProduct({
      name: formName,
      price: parseFloat(formPrice) || 0,
      stock: parseInt(formStock) || 0,
      description: formDescription,
      category: formCategory,
      sku: formSku,
      taxRate: taxRateDecimal,
    })
    resetForm()
  }

  const handleEdit = () => {
    if (!selectedProduct) return
    updateProduct(selectedProduct.id, {
      name: formName,
      price: parseFloat(formPrice) || 0,
      description: formDescription,
      category: formCategory,
      sku: formSku,
      taxRate: taxRateDecimal,
    })
    resetForm()
  }

  const handleRestock = () => { if (!selectedProduct) return; restockProduct(selectedProduct.id, parseInt(restockQty) || 0); resetForm() }
  const handleDelete = () => { if (!selectedProduct) return; deleteProduct(selectedProduct.id); resetForm() }

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Inventory</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage your product catalog</p>
        </div>
        <button
          onClick={() => { resetForm(); setModal("add") }}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-card-foreground">All Products ({filteredProducts.length})</h3>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">SKU</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Price</th>
                <th className="px-5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Stock</th>
                <th className="px-5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/50">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{product.sku}</td>
                  <td className="px-5 py-3 font-medium text-card-foreground">{product.name}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-card-foreground">${product.price.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-mono font-semibold ${product.stock <= 5 ? "text-destructive" : "text-success"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openRestock(product)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-success/10 hover:text-success" aria-label={`Restock ${product.name}`}>
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => openEdit(product)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" aria-label={`Edit ${product.name}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => openDelete(product)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${product.name}`}>
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

      {/* Add Product Modal */}
      <Dialog open={modal === "add"} onOpenChange={() => resetForm()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Fill in the details for the new product.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="add-name">Product Name</Label>
              <Input id="add-name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Product name" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-sku">SKU</Label>
              <Input id="add-sku" value={formSku} onChange={(e) => setFormSku(e.target.value)} placeholder="XX-000" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-category">Category</Label>
              <Input id="add-category" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="Category" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-price">{'Price ($)'}</Label>
              <Input id="add-price" type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-stock">Initial Stock</Label>
              <Input id="add-stock" type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} placeholder="0" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-tax">Tax (%)</Label>
              <Input id="add-tax" type="number" min={0} max={100} step={0.5} value={formTaxRate} onChange={(e) => setFormTaxRate(e.target.value)} placeholder="0 or 15" />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="add-desc">Description</Label>
              <Input id="add-desc" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Short description" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={resetForm} className="h-9 rounded-lg border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">Cancel</button>
            <button onClick={handleAdd} disabled={!formName.trim()} className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40">Add Product</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={modal === "edit"} onOpenChange={() => resetForm()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details below.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input id="edit-name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-sku">SKU</Label>
              <Input id="edit-sku" value={formSku} onChange={(e) => setFormSku(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input id="edit-category" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-price">{'Price ($)'}</Label>
              <Input id="edit-price" type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-tax">Tax (%)</Label>
              <Input id="edit-tax" type="number" min={0} max={100} step={0.5} value={formTaxRate} onChange={(e) => setFormTaxRate(e.target.value)} placeholder="0 or 15" />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Input id="edit-desc" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={resetForm} className="h-9 rounded-lg border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">Cancel</button>
            <button onClick={handleEdit} className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Save Changes</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Modal */}
      <Dialog open={modal === "restock"} onOpenChange={() => resetForm()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock Product</DialogTitle>
            <DialogDescription>
              Add stock to <span className="font-semibold text-foreground">{selectedProduct?.name}</span>.
              Current stock: <span className="font-mono text-success">{selectedProduct?.stock}</span> units.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="restock-qty">Quantity to Add</Label>
            <Input id="restock-qty" type="number" min="1" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} placeholder="Enter quantity" />
          </div>
          <DialogFooter>
            <button onClick={resetForm} className="h-9 rounded-lg border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">Cancel</button>
            <button onClick={handleRestock} disabled={!restockQty || parseInt(restockQty) <= 0} className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40">Restock</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={modal === "delete"} onOpenChange={() => resetForm()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{selectedProduct?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={resetForm} className="h-9 rounded-lg border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">Cancel</button>
            <button onClick={handleDelete} className="h-9 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90">Delete</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
