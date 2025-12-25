// API configuration and client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Product {
    _id: string;
    name: string;
    sku: string;
    category: string;
    stockQuantity: number;
    costPrice: number;
    sellingPrice: number;
    minStockLevel: number;
    createdAt: string;
    updatedAt: string;
}

export interface RefillDecision {
    productId: string;
    name: string;
    stock: number;
    decision: {
        decision: 'REFILL_NOW' | 'HOLD' | 'STOP_REORDER';
        reason: string;
    };
}

export interface TrendData {
    _id: string;
    productId: string;
    totalSold: number;
    avgDailySales: number;
}

// Fetch all products
export async function fetchProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE_URL}/api/inventory`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
}

// Fetch refill decisions
export async function fetchRefillDecisions(): Promise<RefillDecision[]> {
    const res = await fetch(`${API_BASE_URL}/api/refill`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch refill decisions');
    return res.json();
}

// Fetch sales trends
export async function fetchTrends(): Promise<TrendData[]> {
    const res = await fetch(`${API_BASE_URL}/api/analytics/trends`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch trends');
    return res.json();
}

// Add a new product
export async function addProduct(product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/api/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to add product');
    return res.json();
}

// Update stock quantity
export async function updateStock(productId: string, stockQuantity: number): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/api/inventory/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity }),
    });
    if (!res.ok) throw new Error('Failed to update stock');
    return res.json();
}

// Delete a product
export async function deleteProduct(productId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/inventory/${productId}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
}
