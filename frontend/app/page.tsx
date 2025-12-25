'use client';

import { useState, useEffect } from 'react';
import {
  fetchProducts,
  fetchRefillDecisions,
  fetchTrends,
  addProduct,
  updateStock,
  Product,
  RefillDecision,
  TrendData
} from '@/lib/api';

// Modal
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="card animate" style={{ maxWidth: '420px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999' }}>×</button>
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

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [refillDecisions, setRefillDecisions] = useState<RefillDecision[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({ name: '', sku: '', category: '', stockQuantity: 0, costPrice: 0, sellingPrice: 0, minStockLevel: 10 });
  const [newQty, setNewQty] = useState(0);

  async function load() {
    try {
      setLoading(true);
      const [p, r, t] = await Promise.all([fetchProducts(), fetchRefillDecisions(), fetchTrends()]);
      setProducts(p); setRefillDecisions(r); setTrends(t); setError(null);
    } catch { setError('Unable to connect'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setFormLoading(true);
    try { await addProduct(form); setShowAdd(false); setForm({ name: '', sku: '', category: '', stockQuantity: 0, costPrice: 0, sellingPrice: 0, minStockLevel: 10 }); await load(); }
    catch { alert('Failed'); } finally { setFormLoading(false); }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault(); if (!selected) return; setFormLoading(true);
    try { await updateStock(selected._id, newQty); setShowUpdate(false); await load(); }
    catch { alert('Failed'); } finally { setFormLoading(false); }
  }

  const refillNow = refillDecisions.filter(d => d.decision.decision === 'REFILL_NOW');
  const holdItems = refillDecisions.filter(d => d.decision.decision === 'HOLD');
  const stopReorder = refillDecisions.filter(d => d.decision.decision === 'STOP_REORDER');
  const totalValue = products.reduce((s, p) => s + (p.stockQuantity * p.costPrice), 0);
  const atRisk = stopReorder.reduce((s, i) => { const p = products.find(x => x._id === i.productId); return s + (p ? p.stockQuantity * p.costPrice : 0); }, 0);

  const lvl = (c: number, m: number) => { const p = (c / m) * 100; return p < 50 ? 'red' : p < 100 ? 'yellow' : 'green'; };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f4f3ef' }}><p className="text-muted">Loading...</p></div>;

  return (
    <div style={{ background: '#f4f3ef', minHeight: '100vh' }}>
      {/* MAIN */}
      <main className="main-no-sidebar">
        {/* Header */}
        <div className="header">
          <h1 className="title">Here's what needs your attention today</h1>
          <div className="header-right">
            <button className="btn btn-dark" onClick={() => setShowAdd(true)}>+ Add Product</button>
            <button className="btn btn-light" onClick={load}>↻ Refresh</button>
          </div>
        </div>

        {error && <div className="card" style={{ background: '#fdf2f2', marginBottom: '20px' }}><p style={{ color: '#e74c3c' }}>{error}</p></div>}

        {/* TOP GRID - Match reference layout */}
        <div className="grid-top">
          {/* Left: Actions */}
          <div className="card animate">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <div className="card-title">Today's Inventory Actions</div>
                <div className="card-subtitle">{refillNow.length + stopReorder.length} items need attention</div>
              </div>
            </div>

            {refillNow.length === 0 && stopReorder.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: '#f8fdf8', borderRadius: '12px' }}>
                <p style={{ color: '#27ae60', fontWeight: 500 }}>✓ All inventory healthy</p>
              </div>
            ) : (
              <div>
                {refillNow.map(item => (
                  <div key={item.productId} className="action-row">
                    <div className="action-dot red"></div>
                    <div className="action-content">
                      <div className="action-name">{item.name}</div>
                      <div className="action-detail">Stock: {item.stock} — {item.decision.reason}</div>
                    </div>
                    <span className="action-badge red">Refill Now</span>
                  </div>
                ))}
                {stopReorder.map(item => (
                  <div key={item.productId} className="action-row">
                    <div className="action-dot yellow"></div>
                    <div className="action-content">
                      <div className="action-name">{item.name}</div>
                      <div className="action-detail">{item.decision.reason}</div>
                    </div>
                    <span className="action-badge yellow">Stop Reorder</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Stats stacked */}
          <div className="grid-right">
            <div className="card card-sm animate">
              <div className="card-title">Inventory Value</div>
              <div className="big-number" style={{ marginTop: '8px' }}>₹{totalValue.toLocaleString('en-IN')}</div>
              <div className="number-label">{products.length} products total</div>
            </div>
            <div className="card card-sm animate">
              <div className="card-title">Capital at Risk</div>
              <div className="big-number yellow" style={{ marginTop: '8px' }}>₹{atRisk.toLocaleString('en-IN')}</div>
              <div className="number-label">{stopReorder.length} slow-moving items</div>
            </div>
          </div>
        </div>

        {/* BOTTOM GRID - Charts */}
        <div className="grid-bottom">
          {/* Left: Bar Chart - Inventory Status */}
          <div className="card animate">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div className="card-title">Inventory Health Overview</div>
                <div className="card-subtitle">Stock status by category</div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bar-chart">
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div className="bar-chart-bar red" style={{ height: `${Math.max(20, refillNow.length * 25)}px`, margin: '0 auto', width: '40px' }}></div>
                <div className="bar-chart-label">Refill<br />{refillNow.length}</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div className="bar-chart-bar green" style={{ height: `${Math.max(20, holdItems.length * 25)}px`, margin: '0 auto', width: '40px' }}></div>
                <div className="bar-chart-label">Healthy<br />{holdItems.length}</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div className="bar-chart-bar yellow" style={{ height: `${Math.max(20, stopReorder.length * 25)}px`, margin: '0 auto', width: '40px' }}></div>
                <div className="bar-chart-label">Stop<br />{stopReorder.length}</div>
              </div>
            </div>

            <div className="chart-legend">
              <div className="legend-item"><div className="legend-dot red"></div> Needs Refill</div>
              <div className="legend-item"><div className="legend-dot green"></div> Healthy</div>
              <div className="legend-item"><div className="legend-dot yellow"></div> Stop Reorder</div>
            </div>
          </div>

          {/* Right: Donut Chart */}
          <div className="card card-sm animate">
            <div className="card-title" style={{ marginBottom: '20px' }}>Inventory Distribution</div>

            {/* Donut Chart using conic-gradient */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
              <div
                className="donut-chart"
                style={{
                  background: `conic-gradient(
                    #e74c3c 0deg ${refillNow.length / refillDecisions.length * 360 || 0}deg,
                    #27ae60 ${refillNow.length / refillDecisions.length * 360 || 0}deg ${(refillNow.length + holdItems.length) / refillDecisions.length * 360 || 0}deg,
                    #f1c40f ${(refillNow.length + holdItems.length) / refillDecisions.length * 360 || 0}deg 360deg
                  )`
                }}
              >
                <div className="donut-center">
                  <div className="donut-value">{refillDecisions.length}</div>
                  <div className="donut-label">Total</div>
                </div>
              </div>

              <div>
                <div className="legend-item" style={{ marginBottom: '8px' }}>
                  <div className="legend-dot red"></div>
                  <span>Refill ({refillNow.length})</span>
                </div>
                <div className="legend-item" style={{ marginBottom: '8px' }}>
                  <div className="legend-dot green"></div>
                  <span>Healthy ({holdItems.length})</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot yellow"></div>
                  <span>Stop ({stopReorder.length})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card animate" style={{ padding: 0, marginTop: '20px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e9e8e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title">All Products</div>
              <div className="card-subtitle">{products.length} items in inventory</div>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock Level</th>
                <th>Decision</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {refillDecisions.map(item => {
                const p = products.find(x => x._id === item.productId);
                const level = p ? lvl(p.stockQuantity, p.minStockLevel) : 'green';
                const pct = p ? Math.min(100, (p.stockQuantity / p.minStockLevel) * 100) : 0;

                return (
                  <tr key={item.productId}>
                    <td><span style={{ fontWeight: 500 }}>{item.name}</span></td>
                    <td><span className="font-mono text-muted">{p?.sku}</span></td>
                    <td>
                      <div className="stock-bar"><div className={`stock-fill ${level}`} style={{ width: `${pct}%` }}></div></div>
                      <span className="text-muted text-sm">{p?.stockQuantity}/{p?.minStockLevel}</span>
                    </td>
                    <td>
                      <span className={`action-badge ${item.decision.decision === 'REFILL_NOW' ? 'red' : item.decision.decision === 'HOLD' ? 'green' : 'yellow'}`}>
                        {item.decision.decision === 'REFILL_NOW' ? 'Refill Now' : item.decision.decision === 'HOLD' ? 'Healthy' : 'Stop Reorder'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-light btn-sm" onClick={() => { setSelected(p!); setNewQty(p!.stockQuantity); setShowUpdate(true); }}>Update</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODALS */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Product">
        <form onSubmit={handleAdd}>
          <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g., Portland Cement 50kg" />
          <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required placeholder="e.g., CEM-001" />
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

      <Modal isOpen={showUpdate} onClose={() => setShowUpdate(false)} title="Update Stock">
        <form onSubmit={handleUpdate}>
          <p className="text-muted" style={{ marginBottom: '14px' }}>Updating: <strong style={{ color: '#1a1a1a' }}>{selected?.name}</strong></p>
          <Input label="New Stock Quantity" type="number" value={newQty} onChange={(e) => setNewQty(+e.target.value)} min={0} autoFocus />
          <button type="submit" className="btn btn-dark" style={{ width: '100%', marginTop: '14px' }} disabled={formLoading}>{formLoading ? 'Updating...' : 'Update Stock'}</button>
        </form>
      </Modal>
    </div>
  );
}
