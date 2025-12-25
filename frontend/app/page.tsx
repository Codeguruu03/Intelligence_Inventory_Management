'use client';

import { useState, useEffect } from 'react';
import {
  fetchProducts,
  fetchRefillDecisions,
  fetchTrends,
  Product,
  RefillDecision,
  TrendData
} from '@/lib/api';

// Stats Card Component
function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="card animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>{title}</p>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--card-foreground)' }}>{value}</p>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

// Decision Badge Component
function DecisionBadge({ decision }: { decision: 'REFILL_NOW' | 'HOLD' | 'STOP_REORDER' }) {
  const config = {
    REFILL_NOW: { class: 'badge-danger', label: '🔴 Refill Now' },
    HOLD: { class: 'badge-success', label: '🟢 Hold' },
    STOP_REORDER: { class: 'badge-warning', label: '🟡 Stop Reorder' },
  };

  return (
    <span className={`badge ${config[decision].class}`}>
      {config[decision].label}
    </span>
  );
}

// Stock Level Bar
function StockLevelBar({ current, minimum }: { current: number; minimum: number }) {
  const percentage = Math.min(100, (current / minimum) * 100);
  const color = percentage < 50 ? 'var(--danger)' : percentage < 100 ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="flex items-center gap-3">
      <div className="progress-bar flex-1">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
      <span className="text-sm font-medium" style={{ color, minWidth: '40px' }}>
        {current}/{minimum}
      </span>
    </div>
  );
}

// Loading Skeleton
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton h-14 w-full" />
      ))}
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [refillDecisions, setRefillDecisions] = useState<RefillDecision[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [productsData, refillData, trendsData] = await Promise.all([
          fetchProducts(),
          fetchRefillDecisions(),
          fetchTrends(),
        ]);
        setProducts(productsData);
        setRefillDecisions(refillData);
        setTrends(trendsData);
        setError(null);
      } catch (err) {
        setError('Failed to load data. Make sure the backend is running on port 5000.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate stats
  const totalProducts = products.length;
  const lowStockCount = refillDecisions.filter(d => d.decision.decision === 'REFILL_NOW').length;
  const healthyCount = refillDecisions.filter(d => d.decision.decision === 'HOLD').length;
  const deadStockCount = refillDecisions.filter(d => d.decision.decision === 'STOP_REORDER').length;
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--card-foreground)' }}>
                📦 Inventory Intelligence
              </h1>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Decision Support System for Material Businesses
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Last updated: {new Date().toLocaleTimeString('en-IN')}
              </span>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                ↻ Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error State */}
        {error && (
          <div className="card mb-6" style={{ borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
            <p style={{ color: 'var(--danger)' }}>⚠️ {error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Products"
            value={totalProducts}
            icon="📊"
            subtitle="Active SKUs"
          />
          <StatsCard
            title="Low Stock Alerts"
            value={lowStockCount}
            icon="🔴"
            subtitle="Need immediate refill"
          />
          <StatsCard
            title="Healthy Stock"
            value={healthyCount}
            icon="🟢"
            subtitle="Stock levels OK"
          />
          <StatsCard
            title="Inventory Value"
            value={`₹${totalInventoryValue.toLocaleString('en-IN')}`}
            icon="💰"
            subtitle="At cost price"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Refill Decisions Panel */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--card-foreground)' }}>
                  🎯 Refill Decisions
                </h2>
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {refillDecisions.length} products analyzed
                </span>
              </div>

              {loading ? (
                <TableSkeleton />
              ) : refillDecisions.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
                  <p className="text-4xl mb-2">📭</p>
                  <p>No products found. Add products to see refill decisions.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Stock Level</th>
                        <th>Decision</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refillDecisions.map((item, index) => {
                        const product = products.find(p => p._id === item.productId);
                        return (
                          <tr key={item.productId} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <td>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                {product && (
                                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                    SKU: {product.sku}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td style={{ minWidth: '180px' }}>
                              {product && (
                                <StockLevelBar
                                  current={product.stockQuantity}
                                  minimum={product.minStockLevel}
                                />
                              )}
                            </td>
                            <td>
                              <DecisionBadge decision={item.decision.decision} />
                            </td>
                            <td>
                              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                {item.decision.reason}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>
                ⚡ Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="btn btn-secondary w-full justify-start">
                  ➕ Add New Product
                </button>
                <button className="btn btn-secondary w-full justify-start">
                  📊 Export Report
                </button>
                <button className="btn btn-secondary w-full justify-start">
                  📈 View Full Analytics
                </button>
              </div>
            </div>

            {/* Decision Legend */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>
                📖 Decision Guide
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="badge badge-danger shrink-0">🔴 Refill Now</span>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Stock below minimum. Order immediately.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="badge badge-success shrink-0">🟢 Hold</span>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Stock level healthy. No action needed.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="badge badge-warning shrink-0">🟡 Stop Reorder</span>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    No recent sales. Consider discontinuing.
                  </p>
                </div>
              </div>
            </div>

            {/* Dead Stock Alert */}
            {deadStockCount > 0 && (
              <div className="card" style={{ borderColor: 'var(--warning)', borderWidth: '2px' }}>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--warning)' }}>
                  ⚠️ Dead Stock Alert
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {deadStockCount} product(s) have no recent sales. Consider clearance sale or discontinuing to free up capital.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="card mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--card-foreground)' }}>
              📦 All Products
            </h2>
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {products.length} total items
            </span>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : products.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
              <p className="text-4xl mb-2">📭</p>
              <p>No products in inventory yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Cost Price</th>
                    <th>Selling Price</th>
                    <th>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => {
                    const margin = ((product.sellingPrice - product.costPrice) / product.costPrice * 100).toFixed(1);
                    return (
                      <tr key={product._id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <td className="font-medium">{product.name}</td>
                        <td style={{ color: 'var(--muted-foreground)' }}>{product.sku}</td>
                        <td>
                          <span className="badge" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                            {product.category}
                          </span>
                        </td>
                        <td>
                          <span className={product.stockQuantity < product.minStockLevel ? '' : ''}
                            style={{
                              color: product.stockQuantity < product.minStockLevel ? 'var(--danger)' : 'var(--success)',
                              fontWeight: 600
                            }}>
                            {product.stockQuantity}
                          </span>
                          <span style={{ color: 'var(--muted-foreground)' }}> / {product.minStockLevel}</span>
                        </td>
                        <td>₹{product.costPrice.toLocaleString('en-IN')}</td>
                        <td>₹{product.sellingPrice.toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{ color: Number(margin) > 20 ? 'var(--success)' : 'var(--warning)' }}>
                            {margin}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sales Trends */}
        {trends.length > 0 && (
          <div className="card mt-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>
              📈 Top Selling Products (Last 7 Days)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trends.slice(0, 6).map((trend, index) => {
                const product = products.find(p => p._id === trend._id);
                return (
                  <div key={trend._id} className="p-4 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{product?.name || 'Unknown Product'}</p>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          {trend.totalSold} units sold
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Inventory Intelligence • Decision Support System for Indian Material Businesses
          </p>
        </div>
      </footer>
    </div>
  );
}
