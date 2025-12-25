# 📦 Inventory Intelligence

> **Decision-First Inventory Management System**  
> An AI-powered system that tells you *what to do*, not just *what the data says*.

![Dashboard Screenshot](frontend/public/screenshot.png)

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
| 🔍 **Search & Filter** | Search by name, filter by category/decision |
| ➕ **Add Product** | Add new inventory items |
| 📝 **Update Stock** | Modify stock quantities |
| 🗑️ **Delete Product** | Remove items from inventory |
| 🛒 **Record Sale** | Log sales to update stock |
| 📥 **Export CSV** | Download inventory report |
| 🌙 **Dark Mode** | Toggle light/dark themes |

### Analytics & Insights
| Feature | Description |
|---------|-------------|
| 📊 **Health Bar Chart** | Visual breakdown of refill/healthy/stop items |
| 🏷️ **Category Breakdown** | Distribution across product categories |
| 🍩 **Donut Chart** | Inventory status distribution |
| 📈 **Turnover Rate** | Monthly inventory turnover calculation |

### Alerts & Notifications
| Feature | Description |
|---------|-------------|
| ⚠️ **Low Stock Alert** | Red banner when items need refill |
| 📦 **Reorder Suggestions** | AI-calculated order quantities (14-day supply) |

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Architecture**: MVC with Service Layer

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Custom CSS
- **Charts**: Pure CSS (zero dependencies)

---

## 📁 Project Structure

```
inventory-intelligence/
├── backend/
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
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
git clone <repository-url>
cd inventory-intelligence/backend
npm install

# Create .env file
echo "PORT=5000" > .env
echo "MONGO_URI=mongodb://localhost:27017/inventory_db" >> .env

# Seed 65 sample products
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory` | Get all products |
| `POST` | `/api/inventory` | Add new product |
| `PATCH` | `/api/inventory/:id/stock` | Update stock |
| `DELETE` | `/api/inventory/:id` | Delete product |
| `GET` | `/api/refill` | Get refill decisions |
| `GET` | `/api/analytics/trends` | Get demand trends |

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

## � Sample Data

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

---

## 📄 License

MIT License
