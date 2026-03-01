"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { ProductListItem } from "@/components/product-card"
import { Cart } from "@/components/cart"

export function POSPage() {
  const { products, addToCart } = useAppStore()
  const [search, setSearch] = useState("")

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh)] overflow-hidden">
      {/* Product List */}
      <div className="flex flex-1 flex-col">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">Point of Sale</h2>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search products or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            {filteredProducts.map((product) => (
              <ProductListItem key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-muted-foreground">No products found.</p>
            </div>
          )}
        </div>
      </div>
      {/* Cart */}
      <div className="hidden w-[380px] md:block">
        <Cart />
      </div>
    </div>
  )
}
