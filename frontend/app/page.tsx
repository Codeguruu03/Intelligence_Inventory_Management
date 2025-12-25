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

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [refillDecisions, setRefillDecisions] = useState<RefillDecision[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

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
        setError('Unable to connect to server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    }));
  }, [loading]);

  // Categorize decisions
  const refillNow = refillDecisions.filter(d => d.decision.decision === 'REFILL_NOW');
  const holdItems = refillDecisions.filter(d => d.decision.decision === 'HOLD');
  const stopReorder = refillDecisions.filter(d => d.decision.decision === 'STOP_REORDER');

  // Calculate values
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);
  const capitalAtRisk = stopReorder.reduce((sum, item) => {
    const product = products.find(p => p._id === item.productId);
    return sum + (product ? product.stockQuantity * product.costPrice : 0);
  }, 0);

  // Get stock level class
  const getStockLevel = (current: number, min: number) => {
    const pct = (current / min) * 100;
    if (pct < 50) return 'low';
    if (pct < 100) return 'medium';
    return 'healthy';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Loading inventory data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--glass-border)',
        background: 'var(--background)'
      }}>
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 600,
                color: 'var(--foreground)',
                letterSpacing: '-0.02em'
              }}>
                Inventory Intelligence
              </h1>
              <p className="text-muted" style={{ fontSize: 'var(--text-sm)', marginTop: '2px' }}>
                {currentTime}
              </p>
            </div>
            <button className="btn btn-ghost" onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">

        {/* Error */}
        {error && (
          <div className="glass-card animate-in" style={{
            marginBottom: 'var(--space-xl)',
            borderColor: 'var(--danger-border)',
            background: 'var(--danger-subtle)'
          }}>
            <p className="text-danger">{error}</p>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TODAY'S ACTIONS
            ════════════════════════════════════════════════════════════ */}
        <section className="animate-in" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="section-header">
            <h2>Today's Actions</h2>
          </div>

          {refillNow.length === 0 && stopReorder.length === 0 ? (
            <div className="glass-card">
              <p className="summary-text">
                <span className="success">✓ All clear.</span> No immediate actions required.
                Your inventory is healthy.
              </p>
            </div>
          ) : (
            <div className="glass-card">
              <p className="summary-text" style={{ marginBottom: 'var(--space-lg)' }}>
                {refillNow.length > 0 && (
                  <>
                    <strong className="danger">{refillNow.length} product{refillNow.length > 1 ? 's' : ''}</strong>
                    {' '}need reordering.
                  </>
                )}
                {refillNow.length > 0 && stopReorder.length > 0 && ' '}
                {stopReorder.length > 0 && (
                  <>
                    <strong className="warning">{stopReorder.length} product{stopReorder.length > 1 ? 's' : ''}</strong>
                    {' '}should stop being reordered
                    {capitalAtRisk > 0 && (
                      <> — <span className="warning">₹{capitalAtRisk.toLocaleString('en-IN')}</span> capital at risk</>
                    )}.
                  </>
                )}
              </p>

              {/* Action Cards */}
              <div style={{ display: 'grid', gap: 'var(--space-sm)' }} className="stagger-children">
                {refillNow.map((item) => {
                  const product = products.find(p => p._id === item.productId);
                  return (
                    <div
                      key={item.productId}
                      className="animate-in hover-lift"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-md) var(--space-lg)',
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
                        <span className="decision-pill pill-refill status-pulse">
                          Refill Now
                        </span>
                        <div>
                          <p style={{ fontWeight: 500, color: 'var(--foreground)' }}>{item.name}</p>
                          <p className="text-subtle" style={{ fontSize: 'var(--text-xs)' }}>
                            {item.stock} in stock • Min: {product?.minStockLevel || '-'}
                          </p>
                        </div>
                      </div>
                      <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                        {item.decision.reason}
                      </p>
                    </div>
                  );
                })}

                {stopReorder.map((item) => {
                  const product = products.find(p => p._id === item.productId);
                  const value = product ? product.stockQuantity * product.costPrice : 0;
                  return (
                    <div
                      key={item.productId}
                      className="animate-in hover-lift"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-md) var(--space-lg)',
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
                        <span className="decision-pill pill-stop">
                          Stop Reorder
                        </span>
                        <div>
                          <p style={{ fontWeight: 500, color: 'var(--foreground)' }}>{item.name}</p>
                          <p className="text-subtle" style={{ fontSize: 'var(--text-xs)' }}>
                            {item.stock} in stock {value > 0 && `• ₹${value.toLocaleString('en-IN')} value`}
                          </p>
                        </div>
                      </div>
                      <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                        {item.decision.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════════════════════════
            INVENTORY HEALTH SNAPSHOT
            ════════════════════════════════════════════════════════════ */}
        <section className="animate-in" style={{ marginBottom: 'var(--space-2xl)', animationDelay: '100ms' }}>
          <div className="section-header">
            <h2>Inventory Health</h2>
          </div>

          <div className="glass-card">
            <p className="summary-text">
              You have <strong>{products.length} products</strong> worth{' '}
              <strong>₹{totalInventoryValue.toLocaleString('en-IN')}</strong> in inventory.{' '}
              <span className="success">{holdItems.length}</span> are at healthy levels
              {refillNow.length > 0 && (
                <>, <span className="danger">{refillNow.length}</span> need restocking</>
              )}
              {stopReorder.length > 0 && (
                <>, and <span className="warning">{stopReorder.length}</span> are not moving</>
              )}.
              {trends.length > 0 && (
                <> Your top seller this week is <strong>{
                  products.find(p => p._id === trends[0]?._id)?.name || 'Unknown'
                }</strong>.</>
              )}
            </p>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            PRODUCTS TABLE
            ════════════════════════════════════════════════════════════ */}
        <section className="animate-in" style={{ animationDelay: '200ms' }}>
          <div className="section-header">
            <h2>All Products</h2>
            <span className="count">{products.length}</span>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Decision</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody className="stagger-children">
                {refillDecisions.map((item) => {
                  const product = products.find(p => p._id === item.productId);
                  const stockLevel = product ? getStockLevel(product.stockQuantity, product.minStockLevel) : 'healthy';
                  const stockPct = product ? Math.min(100, (product.stockQuantity / product.minStockLevel) * 100) : 0;

                  return (
                    <tr key={item.productId} className="animate-in">
                      <td>
                        <div>
                          <p style={{ fontWeight: 500, color: 'var(--foreground)' }}>{item.name}</p>
                          <p className="text-subtle font-mono" style={{ fontSize: 'var(--text-xs)' }}>
                            {product?.sku || '-'}
                          </p>
                        </div>
                      </td>
                      <td style={{ width: '160px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          <div className="stock-bar" style={{ flex: 1 }}>
                            <div
                              className={`stock-bar-fill ${stockLevel}`}
                              style={{ width: `${stockPct}%` }}
                            />
                          </div>
                          <span className="text-muted font-mono" style={{ fontSize: 'var(--text-xs)', minWidth: '50px' }}>
                            {product?.stockQuantity || 0}/{product?.minStockLevel || '-'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`decision-pill ${item.decision.decision === 'REFILL_NOW' ? 'pill-refill' :
                            item.decision.decision === 'HOLD' ? 'pill-hold' : 'pill-stop'
                          }`}>
                          {item.decision.decision === 'REFILL_NOW' ? 'Refill Now' :
                            item.decision.decision === 'HOLD' ? 'Hold' : 'Stop Reorder'}
                        </span>
                      </td>
                      <td>
                        <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                          {item.decision.reason}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--glass-border)',
        marginTop: 'var(--space-2xl)'
      }}>
        <div className="max-w-5xl mx-auto px-8 py-6">
          <p className="text-subtle" style={{ fontSize: 'var(--text-xs)', textAlign: 'center' }}>
            Inventory Intelligence • Decision Support System
          </p>
        </div>
      </footer>
    </div>
  );
}
