/**
 * API client for StockFlow backend.
 * All methods use NEXT_PUBLIC_API_URL (e.g. http://localhost:5000).
 */

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (authToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${authToken}`;
  }
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || res.statusText || "Request failed");
  }
  return data as T;
}

// --- Auth ---
export interface LoginResponse {
  message: string;
  token: string;
  user: { id: number; username: string; role: string };
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export interface RegisterBody {
  username: string;
  password: string;
  role?: string;
}

export async function register(body: RegisterBody): Promise<{ message: string; user: { id: number; username: string; role: string } }> {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// --- Categories ---
export interface ApiCategory {
  id: number;
  name: string;
}

export async function getCategories(): Promise<ApiCategory[]> {
  return request<ApiCategory[]>("/api/categories");
}

export async function addCategory(name: string): Promise<{ category: ApiCategory }> {
  return request("/api/categories", {
    method: "POST",
    body: JSON.stringify({ name: name.trim() }),
  });
}

// --- Products (backend: id, name, description, price, stock_quantity, category_id, category_name, tax_rate) ---
export interface ApiProduct {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  stock_quantity: number;
  category_id: number | null;
  category_name?: string | null;
  tax_rate?: string | number;
}

export async function getProducts(): Promise<ApiProduct[]> {
  return request<ApiProduct[]>("/api/products");
}

export async function addProduct(body: {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category_id?: number | null;
  tax_rate?: number;
}): Promise<{ product: ApiProduct }> {
  return request("/api/products", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateProduct(
  id: string,
  body: { name?: string; description?: string; price?: number; tax_rate?: number; stock_quantity?: number; category_id?: number | null }
): Promise<{ product: ApiProduct }> {
  return request(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return request(`/api/products/${id}`, { method: "DELETE" });
}

export async function restockProduct(id: string, quantity: number): Promise<{ product: ApiProduct }> {
  return request(`/api/products/${id}/restock`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

// --- Users ---
export interface ApiUser {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export async function getUsers(): Promise<ApiUser[]> {
  return request<ApiUser[]>("/api/users");
}

export async function updateUserRole(id: string, role: string): Promise<void> {
  return request(`/api/users/${id}/role`, {
    method: "PUT",
    body: JSON.stringify({ role: role === "admin" ? "Admin" : "Staff" }),
  });
}

export async function deleteUser(id: string): Promise<void> {
  return request(`/api/users/${id}`, { method: "DELETE" });
}

export async function resetUserPassword(id: string, new_password: string): Promise<void> {
  return request(`/api/users/${id}/password`, {
    method: "PUT",
    body: JSON.stringify({ new_password }),
  });
}

// --- Sales ---
export async function processSale(items: { product_id: number; quantity: number }[]): Promise<{ sale_id: number; totalAmount: number }> {
  return request("/api/sales", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export interface ApiSaleItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ApiSale {
  id: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  change: number;
  cashier: string;
  timestamp: string;
  items: ApiSaleItem[];
}

export async function getSales(limit?: number): Promise<ApiSale[]> {
  const q = limit != null ? `?limit=${limit}` : "";
  return request<ApiSale[]>(`/api/sales${q}`);
}

// --- Dashboard ---
export interface ApiAdminSummary {
  totalProducts: number;
  totalInventoryValue: number;
  totalSalesToday: number;
  lowStockProducts: { id: number; name: string; stock_quantity: number; low_stock_threshold: number }[];
  recentMovements: {
    id: number;
    product_name: string;
    username: string;
    type: string;
    quantity_changed: number;
    timestamp: string;
  }[];
}

export async function getDashboardAdmin(): Promise<ApiAdminSummary> {
  return request<ApiAdminSummary>("/api/dashboard/admin");
}

export async function getDashboardStaff(): Promise<{ availableProducts: ApiProduct[] }> {
  return request("/api/dashboard/staff");
}
