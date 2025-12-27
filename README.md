# 📦 Inventory Intelligence

> **Decision-First Inventory Management System**  
> An AI-powered system that tells you *what to do*, not just *what the data says*.

## 🔗 Live Demo

- **Frontend**: [https://intelligence-inventory-management.vercel.app/](https://intelligence-inventory-management.vercel.app/)
- **Backend API**: [https://intelligence-inventory-management.onrender.com/](https://intelligence-inventory-management.onrender.com/)

---

## 🎯 Overview

Inventory Intelligence is a modern inventory management system designed for **Indian material and construction businesses**. Unlike traditional systems that overwhelm users with data, this focuses on **actionable decisions**:

| Decision | Meaning |
|----------|---------|
| 🔴 **REFILL NOW** | Stock critically low, order immediately |
| 🟢 **HOLD** | Stock levels healthy, no action needed |
| 🟡 **STOP REORDER** | Low demand, avoid overstocking |

---

## ✨ Features

### Core Functionality
| Feature | Description |
|---------|-------------|
| � **Sortable Table** | Click any header to sort inventory by Name, Stock, Days Left, etc. |
| 📄 **Pagination** | 15 products per page with navigation controls |
| � **Search & Filter** | Real-time search by name/SKU and category/decision filters |
| ➕ **Add Product** | Add new inventory items with full price and stock details |
| 🛒 **Record Sale** | Log sales to automatically update stock levels |
| 📥 **Export CSV** | Download professional inventory reports for Excel |
| 🖨️ **Print Report** | Professional printable layout with summary stats and inventory list |

### Advanced Analytics
| Feature | Description |
|---------|-------------|
| � **7-Day Sales Trend** | Time-series chart showing daily sales volume |
| 💰 **Financial Dashboard** | Profit margins, ROI, and category breakdown |
| 📦 **Dead Stock Report** | Products with no sales (30 days) - capital at risk |
| ⏰ **Stock-Out Prediction** | Days until stockout for each product |
| � **Health Bar Chart** | Visual breakdown of refill/healthy/stop items |
| 🏷️ **Category Breakdown** | Distribution across product categories |

### Alerts & Insights
| Feature | Description |
|---------|-------------|
| 🔴 **Low Stock Banner** | Persistent top alert when critical refills are needed |
| 📦 **Reorder Engine** | Suggestions for exact order quantities based on 14-day demand |
| 🏷️ **Filter Chips** | Visual chips for active filters with one-click clear (×) |
| ℹ️ **Info Tooltips** | Circular info icons explaining every metric on hover |
| 🌙 **Dark Mode** | Full theme support for dashboards and all modal forms |

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Architecture**: MVC with Service Layer
- **Hosting**: Render

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Premium design system with glassmorphism and animations)
- **Charts**: Zero-dependency CSS Charts (Custom implementation)
- **Hosting**: Vercel

---

## 📁 Project Structure

```
inventory-intelligence/
├── backend/
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose schemas (Product, Sale)
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   ├── refill.service.js
│   │   │   ├── trend.service.js
│   │   │   ├── financial.service.js
│   │   │   ├── deadstock.service.js
│   │   │   ├── stockout.service.js
│   │   │   └── damage.service.js
│   │   └── scripts/         # Seed data (65 products)
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── globals.css      # Design system
│   │   └── page.tsx         # Dashboard (all features)
│   ├── lib/
│   │   └── api.ts           # API client
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Setup Backend
```bash
git clone https://github.com/Codeguruu03/Intelligence_Inventory_Management.git
cd Intelligence_Inventory_Management/backend
npm install

# Create .env file
echo "PORT=5000" > .env
echo "MONGO_URI=mongodb://localhost:27017/inventory_db" >> .env

# Seed 65 sample products + sales data
npm run seed

# Start server
npm run dev
```

### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 3. Open Dashboard
Navigate to **http://localhost:3000**

---

## 🔌 API Endpoints

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory` | Get all products |
| `POST` | `/api/inventory` | Add new product |
| `PATCH` | `/api/inventory/:id/stock` | Update stock |
| `DELETE` | `/api/inventory/:id` | Delete product |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/refill` | Get refill decisions for all products |
| `GET` | `/api/analytics/trends` | Get weekly demand trends |
| `GET` | `/api/analytics/daily-trends` | Get 7-day sales data (for chart) |
| `GET` | `/api/analytics/financial` | Get profit margins & category breakdown |
| `GET` | `/api/analytics/dead-stock?days=30` | Get products with no sales |
| `GET` | `/api/analytics/stockout` | Get days-until-stockout predictions |

### Damaged Goods
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/damaged` | Get damaged inventory report |
| `POST` | `/api/analytics/mark-damaged` | Mark units as damaged with reason |
| `DELETE` | `/api/analytics/write-off-damaged/:id` | Write off/clear damaged stock |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/seed-sales` | Seed sample sales data |
| `DELETE` | `/api/admin/clear-sales` | Clear all sales data |

---

## 📊 Analytics Deep Dive

### 1. Financial Dashboard
```json
{
  "totals": {
    "totalProducts": 66,
    "totalStockValue": 2058290,
    "totalPotentialRevenue": 2604460,
    "totalPotentialProfit": 546170,
    "averageMargin": "24.0"
  },
  "topByMargin": [...],
  "topByProfit": [...],
  "byCategory": [...]
}
```

### 2. Stock-Out Prediction
| Status | Days Left | Action |
|--------|-----------|--------|
| 🔴 Critical | ≤3 days | Order immediately |
| 🟠 Warning | ≤7 days | Plan reorder |
| 🟡 Attention | ≤14 days | Monitor closely |
| 🟢 Safe | >14 days | No action needed |
| ⚪ N/A | No sales | Check demand |

### 3. Dead Stock Report
Products with **zero sales** in the last 30 days, sorted by capital at risk.

---

## 📊 Decision Engine Logic

```javascript
IF stock < minStock * 0.3 AND avgDailySales > 0
  → REFILL_NOW (Critical: Stock will run out soon)

ELSE IF stock < minStock
  → REFILL_NOW (Below minimum threshold)

ELSE IF avgDailySales === 0 AND stock > minStock * 2
  → STOP_REORDER (No demand, excess stock)

ELSE
  → HOLD (Stock levels healthy)
```

---

## 📦 Sample Data

The seed script creates **65 products** across **9 categories**:

| Category | Products |
|----------|----------|
| Cement | 8 |
| Steel | 10 |
| Bricks | 8 |
| Aggregates | 6 |
| Plumbing | 8 |
| Tiles | 8 |
| Chemicals | 6 |
| Electrical | 6 |
| Paint | 5 |

---

## 🎨 Design Highlights

- **Decision-First**: Actions are the most prominent element
- **Semantic Colors**: Red/Green/Yellow for instant understanding
- **Dark Mode**: Easy on the eyes for extended use
- **No Sidebar**: Clean, focused single-page layout
- **Pure CSS Charts**: Zero external chart library dependencies
- **Modal-Based UX**: Dead Stock report as on-demand modal
- **Info Tooltips**: ℹ️ icons on each card explain their purpose on hover

---

## 📋 Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/inventory_db
```

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 👨‍💻 Author

Built for **SDE Internship Assignment** — Demonstrating full-stack development with focus on practical business solutions and modern UI/UX.

**GitHub**: [Codeguruu03](https://github.com/Codeguruu03)

---

## 📄 License

MIT License
