"use client"

import { Package, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/mock-data"

interface ProductListItemProps {
  product: Product
  onAdd: (product: Product) => void
}

export function ProductListItem({ product, onAdd }: ProductListItemProps) {
  const isLowStock = product.stock <= 5
  const isOutOfStock = product.stock === 0

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors",
        isOutOfStock
          ? "opacity-50"
          : "hover:bg-accent"
      )}
    >
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Package className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Name + Category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-card-foreground truncate">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.category}</p>
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-card-foreground font-mono">${product.price.toFixed(2)}</p>
      </div>

      {/* Stock badge */}
      <div className="shrink-0">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
            isOutOfStock
              ? "bg-destructive/10 text-destructive"
              : isLowStock
                ? "bg-warning/10 text-warning"
                : "bg-success/10 text-success"
          )}
        >
          {isOutOfStock ? "Out" : `${product.stock} left`}
        </span>
      </div>

      {/* Add button */}
      <button
        onClick={() => !isOutOfStock && onAdd(product)}
        disabled={isOutOfStock}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          isOutOfStock
            ? "cursor-not-allowed text-muted-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
        )}
        aria-label={`Add ${product.name} to cart`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
