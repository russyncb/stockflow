"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, ShoppingCart, Receipt, ArrowLeft, CheckCircle2, Banknote, Printer } from "lucide-react"
import { useAppStore } from "@/lib/store"
import type { Transaction } from "@/lib/mock-data"

type CheckoutStep = "cart" | "payment" | "receipt"

export function Cart() {
  const { cart, removeFromCart, updateCartQuantity, clearCart, processSale } = useAppStore()
  const [step, setStep] = useState<CheckoutStep>("cart")
  const [paymentInput, setPaymentInput] = useState("")
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null)

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const paymentAmount = parseFloat(paymentInput) || 0
  const change = paymentAmount - total
  const isPaymentValid = paymentAmount >= total && paymentInput.trim() !== ""

  function handleProceedToPayment() {
    setPaymentInput("")
    setStep("payment")
  }

  function handleConfirmSale() {
    const txn = processSale(paymentAmount)
    setCompletedTransaction(txn)
    setStep("receipt")
  }

  function handleNewSale() {
    setCompletedTransaction(null)
    setPaymentInput("")
    setStep("cart")
  }

  function handleBackToCart() {
    setPaymentInput("")
    setStep("cart")
  }

  function handlePrintReceipt() {
    if (!completedTransaction) return
    const txn = completedTransaction
    const itemsHtml = txn.items
      .map(
        (item) =>
          `<tr>
            <td style="text-align:left;padding:2px 0;">${item.quantity}x ${item.productName}</td>
            <td style="text-align:right;padding:2px 0;">$${item.lineTotal.toFixed(2)}</td>
          </tr>`
      )
      .join("")

    const receiptWindow = window.open("", "_blank", "width=320,height=600")
    if (!receiptWindow) return

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${txn.id.slice(-6)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; padding: 16px; color: #000; width: 280px; margin: 0 auto; }
          .center { text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          .bold { font-weight: bold; }
          .total-row td { padding-top: 4px; font-size: 14px; font-weight: bold; }
          @media print {
            body { width: 100%; padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="center">
          <p class="bold" style="font-size:16px;">STOCKFLOW</p>
          <p style="font-size:10px;margin-top:4px;">Inventory & Sales Management</p>
        </div>
        <div class="divider"></div>
        <p style="font-size:10px;">Receipt #${txn.id.slice(-6)}</p>
        <p style="font-size:10px;">${txn.timestamp}</p>
        <p style="font-size:10px;">Cashier: ${txn.cashier}</p>
        <div class="divider"></div>
        <table>
          ${itemsHtml}
        </table>
        <div class="divider"></div>
        <table>
          <tr>
            <td style="text-align:left;padding:2px 0;">Subtotal</td>
            <td style="text-align:right;padding:2px 0;">$${txn.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align:left;padding:2px 0;">Amount Paid</td>
            <td style="text-align:right;padding:2px 0;">$${txn.amountPaid.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td style="text-align:left;">Change</td>
            <td style="text-align:right;">$${txn.change.toFixed(2)}</td>
          </tr>
        </table>
        <div class="divider"></div>
        <div class="center" style="margin-top:8px;">
          <p style="font-size:10px;">Thank you for your purchase!</p>
        </div>
        <div class="center no-print" style="margin-top:16px;">
          <button onclick="window.print()" style="padding:8px 24px;font-size:12px;cursor:pointer;border:1px solid #000;background:#fff;">Print</button>
        </div>
      </body>
      </html>
    `)
    receiptWindow.document.close()
    receiptWindow.focus()
    receiptWindow.print()
  }

  // --- Receipt view ---
  if (step === "receipt" && completedTransaction) {
    return (
      <div className="flex h-full flex-col border-l border-border bg-card">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>

          <h3 className="text-lg font-semibold text-card-foreground">Sale Complete</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Transaction #{completedTransaction.id.slice(-6)}
          </p>

          {/* Mini receipt */}
          <div className="mt-5 w-full rounded-lg border border-border bg-muted/50 p-4 text-left">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Receipt</span>
            </div>

            <ul className="flex flex-col gap-1.5">
              {completedTransaction.items.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-mono text-card-foreground">${item.lineTotal.toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-semibold text-card-foreground">
                  ${completedTransaction.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-mono text-card-foreground">
                  ${completedTransaction.amountPaid.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-success">Change</span>
                <span className="font-mono text-success">
                  ${completedTransaction.change.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground">
              <p>Cashier: {completedTransaction.cashier}</p>
              <p>{completedTransaction.timestamp}</p>
            </div>
          </div>

          <div className="mt-5 flex w-full flex-col gap-2">
            <button
              onClick={handlePrintReceipt}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted font-medium text-foreground transition-colors hover:bg-accent active:scale-[0.98]"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </button>
            <button
              onClick={handleNewSale}
              className="flex h-10 w-full items-center justify-center rounded-lg bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
            >
              Start New Sale
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- Payment / confirmation view ---
  if (step === "payment") {
    return (
      <div className="flex h-full flex-col border-l border-border bg-card">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border">
          <button
            onClick={handleBackToCart}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to cart
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Banknote className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Checkout</h3>
              <p className="text-[11px] text-muted-foreground">{cart.length} item(s)</p>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4 mb-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-3">
              Order Summary
            </p>
            <ul className="flex flex-col gap-2">
              {cart.map((item) => (
                <li key={item.product.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-mono text-card-foreground">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-card-foreground">Total Due</span>
              <span className="text-lg font-bold text-primary font-mono">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment input */}
          <div className="mb-4">
            <label htmlFor="payment-amount" className="block text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
              Customer Payment
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">$</span>
              <input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0"
                value={paymentInput}
                onChange={(e) => setPaymentInput(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="h-11 w-full rounded-lg border border-input bg-background pl-8 pr-4 text-lg font-mono font-bold text-foreground placeholder:text-muted-foreground/40 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>
          </div>

          {/* Quick amount buttons */}
          <div className="mb-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Quick Amounts</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                Math.ceil(total),
                Math.ceil(total / 5) * 5,
                Math.ceil(total / 10) * 10,
                Math.ceil(total / 20) * 20,
                50,
                100,
              ]
                .filter((v, i, arr) => arr.indexOf(v) === i && v >= total)
                .slice(0, 6)
                .map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setPaymentInput(amount.toFixed(2))}
                    className={`flex h-9 items-center justify-center rounded-lg text-xs font-mono font-medium transition-colors border ${
                      paymentInput === amount.toFixed(2)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    ${amount.toFixed(2)}
                  </button>
                ))}
            </div>
          </div>

          {/* Change display */}
          <div
            className={`rounded-lg border p-4 transition-colors ${
              paymentInput.trim() === ""
                ? "border-border bg-muted/50"
                : isPaymentValid
                  ? "border-success/30 bg-success/5"
                  : "border-destructive/30 bg-destructive/5"
            }`}
          >
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Change Due
            </p>
            <p
              className={`text-2xl font-bold font-mono ${
                paymentInput.trim() === ""
                  ? "text-muted-foreground/40"
                  : isPaymentValid
                    ? "text-success"
                    : "text-destructive"
              }`}
            >
              {paymentInput.trim() === ""
                ? "$0.00"
                : isPaymentValid
                  ? `$${change.toFixed(2)}`
                  : `-$${Math.abs(change).toFixed(2)}`}
            </p>
            {paymentInput.trim() !== "" && !isPaymentValid && (
              <p className="text-[11px] text-destructive mt-1">
                Insufficient payment. Need ${Math.abs(change).toFixed(2)} more.
              </p>
            )}
          </div>
        </div>

        {/* Confirm button */}
        <div className="border-t border-border px-5 py-4">
          <button
            onClick={handleConfirmSale}
            disabled={!isPaymentValid}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm Sale
          </button>
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            This will deduct stock and record the transaction
          </p>
        </div>
      </div>
    )
  }

  // --- Default cart view ---
  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">Current Sale</h3>
            <p className="text-[11px] text-muted-foreground">{cart.length} item(s) in cart</p>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Cart is empty</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Click products to add them</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {cart.map((item) => (
              <li key={item.product.id} className="rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      ${item.product.price.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent disabled:opacity-30"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-card-foreground font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-primary font-mono">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Checkout Footer */}
      {cart.length > 0 && (
        <div className="border-t border-border px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Subtotal</span>
            <span className="text-sm text-muted-foreground font-mono">${total.toFixed(2)}</span>
          </div>
          <div className="mb-4 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold text-card-foreground">Total</span>
            <span className="text-xl font-bold text-primary font-mono">${total.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleProceedToPayment}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
            >
              <Banknote className="h-4 w-4" />
              Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="flex h-8 items-center justify-center rounded-lg border border-border text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
