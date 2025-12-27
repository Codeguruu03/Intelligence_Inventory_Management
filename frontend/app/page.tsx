'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  fetchProducts,
  fetchRefillDecisions,
  fetchTrends,
  fetchDailyTrends,
  fetchFinancialInsights,
  fetchDeadStock,
  fetchStockoutPredictions,
  addProduct,
  updateStock,
  deleteProduct,
  Product,
  RefillDecision,
  TrendData,
  DailyTrend,
  FinancialInsights,
  DeadStockReport,
  StockoutData,
  StockoutPrediction
} from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="card animate" style={{ maxWidth: '480px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', position: 'sticky', top: 0, background: 'white', padding: '4px 0' }}>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 500 }}>{label}</label>
      <input {...props} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e9e8e4', borderRadius: '8px', fontSize: '13px' }} />
    </div>
  );
}

function Select({ label, options, ...props }: { label: string; options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 500 }}>{label}</label>
      <select {...props} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e9e8e4', borderRadius: '8px', fontSize: '13px', background: 'white' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

export default function Dashboard() {
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [refillDecisions, setRefillDecisions] = useState<RefillDecision[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [financial, setFinancial] = useState<FinancialInsights | null>(null);
  const [stockout, setStockout] = useState<StockoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [decisionFilter, setDecisionFilter] = useState('all');

  // Modal State
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showSale, setShowSale] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [showDeadStock, setShowDeadStock] = useState(false);
  const [deadStockData, setDeadStockData] = useState<DeadStockReport | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({ name: '', sku: '', category: '', stockQuantity: 0, costPrice: 0, sellingPrice: 0, minStockLevel: 10 });
  const [newQty, setNewQty] = useState(0);
  const [saleQty, setSaleQty] = useState(1);

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════════════════════

  async function load() {
    try {
      setLoading(true);
      const [p, r, t, d, f, s] = await Promise.all([
        fetchProducts(),
        fetchRefillDecisions(),
        fetchTrends(),
        fetchDailyTrends(),
        fetchFinancialInsights(),
        fetchStockoutPredictions()
      ]);
      setProducts(p); setRefillDecisions(r); setTrends(t); setDailyTrends(d); setFinancial(f); setStockout(s); setError(null);
    } catch { setError('Unable to connect to server'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════════════

  const categories = useMemo(() => [...new Set(products.map(p => p.category))].filter(Boolean), [products]);

  const refillNow = useMemo(() => refillDecisions.filter(d => d.decision.decision === 'REFILL_NOW'), [refillDecisions]);
  const holdItems = useMemo(() => refillDecisions.filter(d => d.decision.decision === 'HOLD'), [refillDecisions]);
  const stopReorder = useMemo(() => refillDecisions.filter(d => d.decision.decision === 'STOP_REORDER'), [refillDecisions]);

  const totalValue = useMemo(() => products.reduce((s, p) => s + (p.stockQuantity * p.costPrice), 0), [products]);
  const atRisk = useMemo(() => stopReorder.reduce((s, i) => { const p = products.find(x => x._id === i.productId); return s + (p ? p.stockQuantity * p.costPrice : 0); }, 0), [stopReorder, products]);

  // Category breakdown for pie chart
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [products]);

  // Inventory turnover (simplified: total sales / avg inventory)
  const turnoverRate = useMemo(() => {
    const totalSales = trends.reduce((s, t) => s + t.avgDailySales * 30, 0);
    const avgInventory = products.reduce((s, p) => s + p.stockQuantity, 0) / (products.length || 1);
    return avgInventory > 0 ? (totalSales / avgInventory).toFixed(2) : '0';
  }, [trends, products]);

  // Filtered products for table
  const filteredDecisions = useMemo(() => {
    return refillDecisions.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const p = products.find(x => x._id === item.productId);
      const matchCategory = categoryFilter === 'all' || p?.category === categoryFilter;
      const matchDecision = decisionFilter === 'all' || item.decision.decision === decisionFilter;
      return matchSearch && matchCategory && matchDecision;
    });
  }, [refillDecisions, products, searchTerm, categoryFilter, decisionFilter]);

  // Reorder suggestions (items needing refill with suggested quantities)
  const reorderSuggestions = useMemo(() => {
    return refillNow.map(item => {
      const p = products.find(x => x._id === item.productId);
      const avgDaily = trends.find(t => t.productId === item.productId)?.avgDailySales || 0;
      const suggestedQty = Math.max(p?.minStockLevel || 0, Math.ceil(avgDaily * 14)); // 2 weeks supply
      return { ...item, product: p, suggestedQty, avgDaily };
    });
  }, [refillNow, products, trends]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setFormLoading(true);
    try { await addProduct(form); setShowAdd(false); setForm({ name: '', sku: '', category: '', stockQuantity: 0, costPrice: 0, sellingPrice: 0, minStockLevel: 10 }); await load(); }
    catch { alert('Failed to add product'); } finally { setFormLoading(false); }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault(); if (!selected) return; setFormLoading(true);
    try { await updateStock(selected._id, newQty); setShowUpdate(false); await load(); }
    catch { alert('Failed to update stock'); } finally { setFormLoading(false); }
  }

  async function handleRecordSale(e: React.FormEvent) {
    e.preventDefault(); if (!selected) return; setFormLoading(true);
    try {
      const newStock = Math.max(0, selected.stockQuantity - saleQty);
      await updateStock(selected._id, newStock);
      setShowSale(false);
      setSaleQty(1);
      await load();
    }
    catch { alert('Failed to record sale'); } finally { setFormLoading(false); }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try { await deleteProduct(product._id); await load(); }
    catch { alert('Failed to delete product'); }
  }

  function openUpdateModal(p: Product) {
    setSelected(p); setNewQty(p.stockQuantity); setShowUpdate(true);
  }

  function openSaleModal(p: Product) {
    setSelected(p); setSaleQty(1); setShowSale(true);
  }

  async function handleDeadStock() {
    try {
      const data = await fetchDeadStock(30);
      setDeadStockData(data);
      setShowDeadStock(true);
    } catch {
      alert('Failed to fetch dead stock report');
    }
  }

  // Export to CSV
  function exportCSV() {
    const headers = ['Name', 'SKU', 'Category', 'Stock', 'Min Stock', 'Cost Price', 'Selling Price', 'Decision'];
    const rows = refillDecisions.map(item => {
      const p = products.find(x => x._id === item.productId);
      return [item.name, p?.sku || '', p?.category || '', p?.stockQuantity || 0, p?.minStockLevel || 0, p?.costPrice || 0, p?.sellingPrice || 0, item.decision.decision];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  }

  const lvl = (c: number, m: number) => { const p = (c / m) * 100; return p < 50 ? 'red' : p < 100 ? 'yellow' : 'green'; };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: darkMode ? '#1a1d21' : '#f4f3ef' }}><p style={{ color: '#999' }}>Loading inventory data...</p></div>;

  const bgColor = darkMode ? '#1a1d21' : '#f4f3ef';
  const cardBg = darkMode ? '#2a2d32' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1a1a1a';
  const mutedColor = darkMode ? '#888' : '#666';

  return (
    <div style={{ background: bgColor, minHeight: '100vh', color: textColor, transition: 'all 0.3s' }}>
      <main className="main-no-sidebar">

        {/* ═══════════════════ LOW STOCK ALERT BANNER ═══════════════════ */}
        {refillNow.length > 0 && (
          <div style={{ background: 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)', color: 'white', padding: '12px 20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                <strong>Low Stock Alert!</strong>
                <span style={{ marginLeft: '8px', opacity: 0.9 }}>{refillNow.length} products need immediate refill</span>
              </div>
            </div>
            <button onClick={() => setShowReorder(true)} style={{ background: 'white', color: '#e74c3c', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
              View Reorder Suggestions
            </button>
          </div>
        )}

        {/* ═══════════════════ HEADER ═══════════════════ */}
        <div className="header" style={{ marginBottom: '24px' }}>
          <h1 className="title" style={{ color: textColor }}>Here's what needs your attention today</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-light" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="btn btn-light" onClick={exportCSV} title="Export CSV">📥 Export</button>
            <button className="btn btn-light" onClick={handleDeadStock} title="Dead Stock Report">📦 Dead Stock</button>
            <button className="btn btn-dark" onClick={() => setShowAdd(true)}>+ Add Product</button>
            <button className="btn btn-light" onClick={load}>↻ Refresh</button>
          </div>
        </div>

        {error && <div className="card" style={{ background: '#fdf2f2', marginBottom: '20px' }}><p style={{ color: '#e74c3c' }}>{error}</p></div>}

        {/* ═══════════════════ TOP GRID ═══════════════════ */}
        <div className="grid-top">
          {/* Left: Actions */}
          <div className="card animate" style={{ background: cardBg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <div className="card-title" style={{ color: textColor }}>Today's Inventory Actions</div>
                <div className="card-subtitle">{refillNow.length + stopReorder.length} items need attention</div>
              </div>
            </div>

            {refillNow.length === 0 && stopReorder.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: darkMode ? '#1e3a2f' : '#f8fdf8', borderRadius: '12px' }}>
                <p style={{ color: '#27ae60', fontWeight: 500 }}>✓ All inventory healthy</p>
              </div>
            ) : (
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                {refillNow.map(item => {
                  const p = products.find(x => x._id === item.productId);
                  return (
                    <div key={item.productId} className="action-row">
                      <div className="action-dot red"></div>
                      <div className="action-content">
                        <div className="action-name" style={{ color: textColor }}>{item.name}</div>
                        <div className="action-detail">Stock: {item.stock} — {item.decision.reason}</div>
                      </div>
                      <button className="btn btn-light btn-sm" onClick={() => p && openUpdateModal(p)}>Update</button>
                      <span className="action-badge red">Refill Now</span>
                    </div>
                  );
                })}
                {stopReorder.map(item => {
                  const p = products.find(x => x._id === item.productId);
                  return (
                    <div key={item.productId} className="action-row">
                      <div className="action-dot yellow"></div>
                      <div className="action-content">
                        <div className="action-name" style={{ color: textColor }}>{item.name}</div>
                        <div className="action-detail">{item.decision.reason}</div>
                      </div>
                      <button className="btn btn-light btn-sm" onClick={() => p && openUpdateModal(p)}>Update</button>
                      <span className="action-badge yellow">Stop Reorder</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Stats stacked */}
          <div className="grid-right">
            <div className="card card-sm animate" style={{ background: cardBg }}>
              <div className="card-title" style={{ color: textColor }}>Inventory Value</div>
              <div className="big-number" style={{ marginTop: '8px', color: textColor }}>₹{totalValue.toLocaleString('en-IN')}</div>
              <div className="number-label">{products.length} products total</div>
            </div>
            <div className="card card-sm animate" style={{ background: cardBg }}>
              <div className="card-title" style={{ color: textColor }}>Capital at Risk</div>
              <div className="big-number yellow" style={{ marginTop: '8px' }}>₹{atRisk.toLocaleString('en-IN')}</div>
              <div className="number-label">{stopReorder.length} slow-moving items</div>
            </div>
            <div className="card card-sm animate" style={{ background: cardBg }}>
              <div className="card-title" style={{ color: textColor }}>Inventory Turnover</div>
              <div className="big-number" style={{ marginTop: '8px', color: '#27ae60' }}>{turnoverRate}x</div>
              <div className="number-label">Monthly rate</div>
            </div>
          </div>
        </div>

        {/* ═══════════════════ ANALYTICS SECTION ═══════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
          {/* Bar Chart */}
          <div className="card animate" style={{ background: cardBg }}>
            <div className="card-title" style={{ color: textColor, marginBottom: '16px' }}>Inventory Health</div>
            {(() => {
              const maxCount = Math.max(refillNow.length, holdItems.length, stopReorder.length, 1);
              const maxHeight = 80;
              const getHeight = (count: number) => Math.max(15, (count / maxCount) * maxHeight);
              return (
                <div className="bar-chart" style={{ height: 'auto' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div className="bar-chart-bar red" style={{ height: `${getHeight(refillNow.length)}px`, margin: '0 auto', width: '36px' }}></div>
                    <div className="bar-chart-label">Refill<br />{refillNow.length}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div className="bar-chart-bar green" style={{ height: `${getHeight(holdItems.length)}px`, margin: '0 auto', width: '36px' }}></div>
                    <div className="bar-chart-label">OK<br />{holdItems.length}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div className="bar-chart-bar yellow" style={{ height: `${getHeight(stopReorder.length)}px`, margin: '0 auto', width: '36px' }}></div>
                    <div className="bar-chart-label">Stop<br />{stopReorder.length}</div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Category Breakdown */}
          <div className="card animate" style={{ background: cardBg }}>
            <div className="card-title" style={{ color: textColor, marginBottom: '16px' }}>Category Breakdown</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categoryBreakdown.slice(0, 6).map((cat, i) => {
                const colors = ['#e74c3c', '#27ae60', '#f1c40f', '#3498db', '#9b59b6', '#1abc9c'];
                return (
                  <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: darkMode ? '#3a3d42' : '#f5f5f5', borderRadius: '20px', fontSize: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[i % colors.length] }}></div>
                    <span style={{ color: textColor }}>{cat.name}</span>
                    <span style={{ color: mutedColor }}>({cat.count})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Donut Chart */}
          <div className="card animate" style={{ background: cardBg }}>
            <div className="card-title" style={{ color: textColor, marginBottom: '16px' }}>Distribution</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div className="donut-chart" style={{
                width: '100px', height: '100px',
                background: `conic-gradient(
                  #e74c3c 0deg ${refillNow.length / (refillDecisions.length || 1) * 360}deg,
                  #27ae60 ${refillNow.length / (refillDecisions.length || 1) * 360}deg ${(refillNow.length + holdItems.length) / (refillDecisions.length || 1) * 360}deg,
                  #f1c40f ${(refillNow.length + holdItems.length) / (refillDecisions.length || 1) * 360}deg 360deg
                )`
              }}>
                <div className="donut-center" style={{ width: '60px', height: '60px', background: cardBg }}>
                  <div className="donut-value" style={{ fontSize: '18px', color: textColor }}>{refillDecisions.length}</div>
                </div>
              </div>
              <div style={{ fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e74c3c' }}></div><span style={{ color: mutedColor }}>Refill ({refillNow.length})</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27ae60' }}></div><span style={{ color: mutedColor }}>OK ({holdItems.length})</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f1c40f' }}></div><span style={{ color: mutedColor }}>Stop ({stopReorder.length})</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════ 7-DAY SALES TREND ═══════════════════ */}
        <div className="card animate" style={{ background: cardBg, marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div className="card-title" style={{ color: textColor }}>📈 7-Day Sales Trend</div>
              <div className="card-subtitle">Daily sales volume over the past week</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#27ae60', whiteSpace: 'nowrap' }}>
              {dailyTrends.reduce((s, d) => s + d.totalSold, 0)} units
            </div>
          </div>

          {dailyTrends.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: mutedColor }}>No sales data available for the past 7 days</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '140px', paddingTop: '20px' }}>
              {(() => {
                const maxSales = Math.max(...dailyTrends.map(d => d.totalSold), 1);
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                return dailyTrends.map((day, i) => {
                  const height = Math.max(20, (day.totalSold / maxSales) * 80);
                  const date = new Date(day._id);
                  const dayName = days[date.getDay()];
                  const dayNum = date.getDate();

                  return (
                    <div key={day._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: textColor, marginBottom: '6px' }}>{day.totalSold}</div>
                      <div style={{
                        width: '80%',
                        maxWidth: '45px',
                        height: `${height}px`,
                        background: 'linear-gradient(180deg, #3498db 0%, #2980b9 100%)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s ease'
                      }}></div>
                      <div style={{ fontSize: '11px', color: mutedColor, marginTop: '6px' }}>{dayName}</div>
                      <div style={{ fontSize: '10px', color: mutedColor }}>{dayNum}</div>
                    </div>
                  );
                });
              })()}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', padding: '12px', background: darkMode ? '#3a3d42' : '#f8f9fa', borderRadius: '8px', fontSize: '13px' }}>
            <div><span style={{ color: mutedColor }}>Total Sales:</span> <strong style={{ color: textColor }}>{dailyTrends.reduce((s, d) => s + d.totalSold, 0)} units</strong></div>
            <div><span style={{ color: mutedColor }}>Transactions:</span> <strong style={{ color: textColor }}>{dailyTrends.reduce((s, d) => s + d.salesCount, 0)}</strong></div>
            <div><span style={{ color: mutedColor }}>Avg/Day:</span> <strong style={{ color: textColor }}>{dailyTrends.length > 0 ? Math.round(dailyTrends.reduce((s, d) => s + d.totalSold, 0) / dailyTrends.length) : 0} units</strong></div>
          </div>
        </div>

        {/* ═══════════════════ FINANCIAL INSIGHTS ═══════════════════ */}
        {financial && (
          <div className="card animate" style={{ background: cardBg, marginTop: '20px' }}>
            <div className="card-title" style={{ color: textColor, marginBottom: '20px' }}>💰 Financial Insights</div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: darkMode ? '#3a3d42' : '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>Stock Value</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#3498db' }}>₹{financial.totals.totalStockValue.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ padding: '16px', background: darkMode ? '#3a3d42' : '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>Potential Revenue</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#27ae60' }}>₹{financial.totals.totalPotentialRevenue.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ padding: '16px', background: darkMode ? '#3a3d42' : '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>Potential Profit</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#9b59b6' }}>₹{financial.totals.totalPotentialProfit.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ padding: '16px', background: darkMode ? '#3a3d42' : '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: mutedColor, marginBottom: '4px' }}>Avg Margin</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#e67e22' }}>{financial.totals.averageMargin}%</div>
              </div>
            </div>

            {/* Top Products */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: textColor, marginBottom: '12px' }}>🏆 Top by Profit Margin</div>
                {financial.topByMargin.slice(0, 5).map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${darkMode ? '#3a3d42' : '#f0f0f0'}` }}>
                    <span style={{ color: textColor, fontSize: '12px' }}>{p.name}</span>
                    <span style={{ color: '#27ae60', fontWeight: 600, fontSize: '12px' }}>{p.margin}%</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: textColor, marginBottom: '12px' }}>💎 Top by Potential Profit</div>
                {financial.topByProfit.slice(0, 5).map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${darkMode ? '#3a3d42' : '#f0f0f0'}` }}>
                    <span style={{ color: textColor, fontSize: '12px' }}>{p.name}</span>
                    <span style={{ color: '#9b59b6', fontWeight: 600, fontSize: '12px' }}>₹{p.potentialProfit.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: textColor, marginBottom: '12px' }}>📊 Category Profitability</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {financial.byCategory.map((cat, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    background: darkMode ? '#3a3d42' : '#f8f9fa',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '12px', color: textColor }}>{cat.name}</span>
                    <span style={{ fontSize: '11px', color: '#27ae60', fontWeight: 600 }}>{cat.margin}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════ SEARCH & FILTER ═══════════════════ */}
        <div className="card animate" style={{ background: cardBg, marginTop: '20px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '10px 14px', border: '1px solid #e9e8e4', borderRadius: '8px', fontSize: '13px', background: darkMode ? '#3a3d42' : 'white', color: textColor }}
            />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #e9e8e4', borderRadius: '8px', fontSize: '13px', background: darkMode ? '#3a3d42' : 'white', color: textColor }}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={decisionFilter} onChange={(e) => setDecisionFilter(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #e9e8e4', borderRadius: '8px', fontSize: '13px', background: darkMode ? '#3a3d42' : 'white', color: textColor }}>
              <option value="all">All Decisions</option>
              <option value="REFILL_NOW">Refill Now</option>
              <option value="HOLD">Healthy</option>
              <option value="STOP_REORDER">Stop Reorder</option>
            </select>
            <span style={{ color: mutedColor, fontSize: '13px' }}>{filteredDecisions.length} of {refillDecisions.length} products</span>
          </div>
        </div>

        {/* ═══════════════════ TABLE ═══════════════════ */}
        <div className="card animate" style={{ padding: 0, marginTop: '20px', background: cardBg }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e9e8e4' }}>
            <div className="card-title" style={{ color: textColor }}>All Products</div>
            <div className="card-subtitle">{filteredDecisions.length} items</div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th style={{ color: mutedColor }}>Product</th>
                <th style={{ color: mutedColor }}>Category</th>
                <th style={{ color: mutedColor }}>Stock</th>
                <th style={{ color: mutedColor }}>Days Left</th>
                <th style={{ color: mutedColor }}>Decision</th>
                <th style={{ color: mutedColor }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDecisions.slice(0, 20).map(item => {
                const p = products.find(x => x._id === item.productId);
                const level = p ? lvl(p.stockQuantity, p.minStockLevel) : 'green';
                const pct = p ? Math.min(100, (p.stockQuantity / p.minStockLevel) * 100) : 0;
                return (
                  <tr key={item.productId} style={{ background: darkMode ? '#2a2d32' : 'white' }}>
                    <td>
                      <span style={{ fontWeight: 500, color: textColor }}>{item.name}</span>
                      <br /><span className="font-mono" style={{ color: mutedColor, fontSize: '11px' }}>{p?.sku}</span>
                    </td>
                    <td><span style={{ color: mutedColor }}>{p?.category}</span></td>
                    <td>
                      <div className="stock-bar"><div className={`stock-fill ${level}`} style={{ width: `${pct}%` }}></div></div>
                      <span style={{ color: mutedColor, fontSize: '12px' }}>{p?.stockQuantity}/{p?.minStockLevel}</span>
                    </td>
                    <td>
                      {(() => {
                        const pred = stockout?.predictions.find(s => s._id === item.productId);
                        if (!pred) return <span style={{ color: mutedColor }}>-</span>;
                        const colors: Record<string, string> = {
                          critical: '#e74c3c',
                          warning: '#f39c12',
                          attention: '#f1c40f',
                          safe: '#27ae60',
                          out: '#c0392b',
                          'no-sales': '#95a5a6'
                        };
                        const labels: Record<string, string> = {
                          critical: `${pred.daysUntilStockout}d ⚠️`,
                          warning: `${pred.daysUntilStockout}d`,
                          attention: `${pred.daysUntilStockout}d`,
                          safe: `${pred.daysUntilStockout}d`,
                          out: 'Out!',
                          'no-sales': 'N/A'
                        };
                        return (
                          <span style={{
                            background: colors[pred.status] + '20',
                            color: colors[pred.status],
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}>
                            {labels[pred.status]}
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <span className={`action-badge ${item.decision.decision === 'REFILL_NOW' ? 'red' : item.decision.decision === 'HOLD' ? 'green' : 'yellow'}`}>
                        {item.decision.decision === 'REFILL_NOW' ? 'Refill' : item.decision.decision === 'HOLD' ? 'OK' : 'Stop'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-light btn-sm" onClick={() => p && openUpdateModal(p)} title="Update stock">📝</button>
                        <button className="btn btn-light btn-sm" onClick={() => p && openSaleModal(p)} title="Record sale">🛒</button>
                        <button className="btn btn-light btn-sm" onClick={() => p && handleDelete(p)} title="Delete" style={{ color: '#e74c3c' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredDecisions.length > 20 && (
            <div style={{ padding: '16px', textAlign: 'center', color: mutedColor, fontSize: '13px' }}>
              Showing 20 of {filteredDecisions.length} products. Use search/filter to narrow down.
            </div>
          )}
        </div>
      </main>

      {/* ═══════════════════ MODALS ═══════════════════ */}

      {/* Add Product */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Product">
        <form onSubmit={handleAdd}>
          <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g., Portland Cement 50kg" />
          <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required placeholder="e.g., CEM-001" />
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Cement" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input label="Stock Qty" type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: +e.target.value })} min={0} />
            <Input label="Min Stock" type="number" value={form.minStockLevel} onChange={(e) => setForm({ ...form, minStockLevel: +e.target.value })} min={1} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input label="Cost (₹)" type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: +e.target.value })} min={0} />
            <Input label="Sell (₹)" type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: +e.target.value })} min={0} />
          </div>
          <button type="submit" className="btn btn-dark" style={{ width: '100%', marginTop: '14px' }} disabled={formLoading}>{formLoading ? 'Adding...' : 'Add Product'}</button>
        </form>
      </Modal>

      {/* Update Stock */}
      <Modal isOpen={showUpdate} onClose={() => setShowUpdate(false)} title="Update Stock">
        <form onSubmit={handleUpdate}>
          <p style={{ color: mutedColor, marginBottom: '14px' }}>Updating: <strong style={{ color: textColor }}>{selected?.name}</strong></p>
          <Input label="New Stock Quantity" type="number" value={newQty} onChange={(e) => setNewQty(+e.target.value)} min={0} autoFocus />
          <button type="submit" className="btn btn-dark" style={{ width: '100%', marginTop: '14px' }} disabled={formLoading}>{formLoading ? 'Updating...' : 'Update Stock'}</button>
        </form>
      </Modal>

      {/* Record Sale */}
      <Modal isOpen={showSale} onClose={() => setShowSale(false)} title="Record Sale">
        <form onSubmit={handleRecordSale}>
          <p style={{ color: mutedColor, marginBottom: '14px' }}>Product: <strong style={{ color: textColor }}>{selected?.name}</strong></p>
          <p style={{ color: mutedColor, marginBottom: '14px', fontSize: '13px' }}>Current Stock: {selected?.stockQuantity}</p>
          <Input label="Quantity Sold" type="number" value={saleQty} onChange={(e) => setSaleQty(+e.target.value)} min={1} max={selected?.stockQuantity} autoFocus />
          <button type="submit" className="btn btn-dark" style={{ width: '100%', marginTop: '14px' }} disabled={formLoading || saleQty > (selected?.stockQuantity || 0)}>
            {formLoading ? 'Recording...' : `Record Sale (New Stock: ${(selected?.stockQuantity || 0) - saleQty})`}
          </button>
        </form>
      </Modal>

      {/* Reorder Suggestions */}
      <Modal isOpen={showReorder} onClose={() => setShowReorder(false)} title="📦 Reorder Suggestions">
        <p style={{ color: mutedColor, marginBottom: '16px', fontSize: '13px' }}>Based on 14-day demand forecast</p>
        {reorderSuggestions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#27ae60', padding: '20px' }}>✓ No reorders needed</p>
        ) : (
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {reorderSuggestions.map(item => (
              <div key={item.productId} style={{ padding: '12px', background: '#fdf2f2', borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ color: textColor }}>{item.name}</strong>
                  <span className="action-badge red">Refill Now</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
                  <div><span style={{ color: mutedColor }}>Current:</span> <strong>{item.stock}</strong></div>
                  <div><span style={{ color: mutedColor }}>Min:</span> <strong>{item.product?.minStockLevel}</strong></div>
                  <div><span style={{ color: mutedColor }}>Daily Sales:</span> <strong>{item.avgDaily.toFixed(1)}</strong></div>
                </div>
                <div style={{ marginTop: '10px', padding: '10px', background: 'white', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: mutedColor }}>Suggested Order:</span>
                  <strong style={{ color: '#e74c3c', fontSize: '18px' }}>{item.suggestedQty} units</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Dead Stock Report */}
      <Modal isOpen={showDeadStock} onClose={() => setShowDeadStock(false)} title="📦 Dead Stock Report">
        <p style={{ color: mutedColor, marginBottom: '16px', fontSize: '13px' }}>
          Products with no sales in the last {deadStockData?.daysThreshold || 30} days
        </p>

        {/* Summary Stats */}
        {deadStockData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '12px', background: darkMode ? '#3a3d42' : '#fdf2f2', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: mutedColor }}>Products</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#e74c3c' }}>{deadStockData.totalProducts}</div>
            </div>
            <div style={{ padding: '12px', background: darkMode ? '#3a3d42' : '#fdf2f2', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: mutedColor }}>Capital at Risk</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#e74c3c' }}>₹{deadStockData.totalDeadStockValue.toLocaleString('en-IN')}</div>
            </div>
            <div style={{ padding: '12px', background: darkMode ? '#3a3d42' : '#fdf2f2', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: mutedColor }}>Unsold Units</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#e74c3c' }}>{deadStockData.totalDeadStockUnits.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Product List */}
        {(!deadStockData || deadStockData.products.length === 0) ? (
          <p style={{ textAlign: 'center', color: '#27ae60', padding: '20px' }}>✓ No dead stock detected</p>
        ) : (
          <div style={{ maxHeight: '350px', overflow: 'auto' }}>
            {deadStockData.products.map((item) => (
              <div key={item._id} style={{
                padding: '12px',
                background: darkMode ? '#3a3d42' : '#fef9e7',
                borderRadius: '8px',
                marginBottom: '10px',
                borderLeft: '4px solid #e74c3c'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ color: textColor }}>{item.name}</strong>
                  <span style={{
                    background: '#e74c3c',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 600
                  }}>No Sales</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                  <div><span style={{ color: mutedColor }}>Stock:</span> <strong>{item.stockQuantity}</strong></div>
                  <div><span style={{ color: mutedColor }}>Category:</span> <strong>{item.category}</strong></div>
                  <div><span style={{ color: mutedColor }}>Value:</span> <strong style={{ color: '#e74c3c' }}>₹{item.stockValue.toLocaleString('en-IN')}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
