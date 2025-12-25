// Seed script to populate database with sample data for demo
// Run with: node src/scripts/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Sale = require('../models/sales.model');

// Comprehensive list of 65 construction/building materials for Indian market
const sampleProducts = [
    // ═══════════════════ CEMENT (8 products) ═══════════════════
    { name: 'Portland Cement (50kg)', sku: 'CEM-001', category: 'Cement', stockQuantity: 45, costPrice: 350, sellingPrice: 420, minStockLevel: 100 },
    { name: 'White Cement 1kg', sku: 'CEM-002', category: 'Cement', stockQuantity: 120, costPrice: 45, sellingPrice: 65, minStockLevel: 50 },
    { name: 'PPC Cement (50kg)', sku: 'CEM-003', category: 'Cement', stockQuantity: 80, costPrice: 340, sellingPrice: 400, minStockLevel: 100 },
    { name: 'OPC 53 Grade Cement', sku: 'CEM-004', category: 'Cement', stockQuantity: 25, costPrice: 380, sellingPrice: 450, minStockLevel: 80 },
    { name: 'Rapid Setting Cement', sku: 'CEM-005', category: 'Cement', stockQuantity: 15, costPrice: 520, sellingPrice: 650, minStockLevel: 30 },
    { name: 'Sulphate Resistant Cement', sku: 'CEM-006', category: 'Cement', stockQuantity: 200, costPrice: 390, sellingPrice: 480, minStockLevel: 40 },
    { name: 'Low Heat Cement', sku: 'CEM-007', category: 'Cement', stockQuantity: 60, costPrice: 400, sellingPrice: 500, minStockLevel: 25 },
    { name: 'Blast Furnace Slag Cement', sku: 'CEM-008', category: 'Cement', stockQuantity: 35, costPrice: 360, sellingPrice: 430, minStockLevel: 50 },

    // ═══════════════════ STEEL (10 products) ═══════════════════
    { name: 'TMT Steel Bars 8mm', sku: 'STL-008', category: 'Steel', stockQuantity: 180, costPrice: 55, sellingPrice: 72, minStockLevel: 100 },
    { name: 'TMT Steel Bars 10mm', sku: 'STL-010', category: 'Steel', stockQuantity: 220, costPrice: 58, sellingPrice: 75, minStockLevel: 100 },
    { name: 'TMT Steel Bars 12mm', sku: 'STL-012', category: 'Steel', stockQuantity: 250, costPrice: 65, sellingPrice: 85, minStockLevel: 100 },
    { name: 'TMT Steel Bars 16mm', sku: 'STL-016', category: 'Steel', stockQuantity: 150, costPrice: 68, sellingPrice: 88, minStockLevel: 80 },
    { name: 'TMT Steel Bars 20mm', sku: 'STL-020', category: 'Steel', stockQuantity: 90, costPrice: 70, sellingPrice: 92, minStockLevel: 60 },
    { name: 'TMT Steel Bars 25mm', sku: 'STL-025', category: 'Steel', stockQuantity: 40, costPrice: 72, sellingPrice: 95, minStockLevel: 40 },
    { name: 'Steel Binding Wire 20G', sku: 'STL-BW1', category: 'Steel', stockQuantity: 300, costPrice: 85, sellingPrice: 110, minStockLevel: 150 },
    { name: 'MS Angle 50x50mm', sku: 'STL-ANG', category: 'Steel', stockQuantity: 65, costPrice: 4500, sellingPrice: 5200, minStockLevel: 30 },
    { name: 'MS Channel 100mm', sku: 'STL-CHN', category: 'Steel', stockQuantity: 8, costPrice: 6800, sellingPrice: 7800, minStockLevel: 15 },
    { name: 'Steel Mesh 6x6', sku: 'STL-MSH', category: 'Steel', stockQuantity: 25, costPrice: 1200, sellingPrice: 1500, minStockLevel: 20 },

    // ═══════════════════ BRICKS & BLOCKS (8 products) ═══════════════════
    { name: 'Red Bricks (1000 pcs)', sku: 'BRK-001', category: 'Bricks', stockQuantity: 15, costPrice: 6500, sellingPrice: 8000, minStockLevel: 20 },
    { name: 'Fly Ash Bricks (1000 pcs)', sku: 'BRK-002', category: 'Bricks', stockQuantity: 28, costPrice: 5500, sellingPrice: 7000, minStockLevel: 25 },
    { name: 'AAC Blocks 600x200x200', sku: 'BRK-003', category: 'Bricks', stockQuantity: 450, costPrice: 55, sellingPrice: 75, minStockLevel: 200 },
    { name: 'Concrete Blocks 400x200', sku: 'BRK-004', category: 'Bricks', stockQuantity: 320, costPrice: 40, sellingPrice: 55, minStockLevel: 150 },
    { name: 'Hollow Blocks 400x200', sku: 'BRK-005', category: 'Bricks', stockQuantity: 180, costPrice: 45, sellingPrice: 60, minStockLevel: 100 },
    { name: 'Interlocking Pavers', sku: 'BRK-006', category: 'Bricks', stockQuantity: 500, costPrice: 28, sellingPrice: 40, minStockLevel: 300 },
    { name: 'Fire Bricks', sku: 'BRK-007', category: 'Bricks', stockQuantity: 5, costPrice: 25, sellingPrice: 38, minStockLevel: 50 },
    { name: 'Ceramic Hollow Blocks', sku: 'BRK-008', category: 'Bricks', stockQuantity: 75, costPrice: 65, sellingPrice: 85, minStockLevel: 40 },

    // ═══════════════════ AGGREGATES (6 products) ═══════════════════
    { name: 'River Sand (per ton)', sku: 'SND-001', category: 'Aggregates', stockQuantity: 8, costPrice: 1800, sellingPrice: 2200, minStockLevel: 15 },
    { name: 'M-Sand (per ton)', sku: 'SND-002', category: 'Aggregates', stockQuantity: 22, costPrice: 1500, sellingPrice: 1900, minStockLevel: 20 },
    { name: 'Crushed Stone 20mm', sku: 'AGG-020', category: 'Aggregates', stockQuantity: 30, costPrice: 950, sellingPrice: 1200, minStockLevel: 25 },
    { name: 'Crushed Stone 40mm', sku: 'AGG-040', category: 'Aggregates', stockQuantity: 18, costPrice: 900, sellingPrice: 1150, minStockLevel: 20 },
    { name: 'Gravel (per ton)', sku: 'AGG-GRV', category: 'Aggregates', stockQuantity: 12, costPrice: 800, sellingPrice: 1000, minStockLevel: 15 },
    { name: 'Stone Dust', sku: 'AGG-DST', category: 'Aggregates', stockQuantity: 45, costPrice: 450, sellingPrice: 600, minStockLevel: 30 },

    // ═══════════════════ PLUMBING (8 products) ═══════════════════
    { name: 'PVC Pipes 2 inch', sku: 'PVC-002', category: 'Plumbing', stockQuantity: 120, costPrice: 180, sellingPrice: 240, minStockLevel: 50 },
    { name: 'PVC Pipes 3 inch', sku: 'PVC-003', category: 'Plumbing', stockQuantity: 95, costPrice: 240, sellingPrice: 310, minStockLevel: 40 },
    { name: 'PVC Pipes 4 inch', sku: 'PVC-004', category: 'Plumbing', stockQuantity: 80, costPrice: 280, sellingPrice: 350, minStockLevel: 40 },
    { name: 'CPVC Pipes 1 inch', sku: 'CPV-001', category: 'Plumbing', stockQuantity: 60, costPrice: 320, sellingPrice: 420, minStockLevel: 30 },
    { name: 'GI Pipes 2 inch', sku: 'GIP-002', category: 'Plumbing', stockQuantity: 35, costPrice: 850, sellingPrice: 1050, minStockLevel: 25 },
    { name: 'PVC Elbows 4 inch', sku: 'PVC-ELB', category: 'Plumbing', stockQuantity: 200, costPrice: 45, sellingPrice: 65, minStockLevel: 80 },
    { name: 'PVC Tee 4 inch', sku: 'PVC-TEE', category: 'Plumbing', stockQuantity: 150, costPrice: 55, sellingPrice: 75, minStockLevel: 60 },
    { name: 'Ball Valve 1 inch', sku: 'PLB-BV1', category: 'Plumbing', stockQuantity: 40, costPrice: 180, sellingPrice: 250, minStockLevel: 25 },

    // ═══════════════════ TILES & FLOORING (8 products) ═══════════════════
    { name: 'Ceramic Floor Tiles 2x2', sku: 'TIL-001', category: 'Tiles', stockQuantity: 350, costPrice: 35, sellingPrice: 55, minStockLevel: 200 },
    { name: 'Vitrified Tiles 2x2', sku: 'TIL-002', category: 'Tiles', stockQuantity: 280, costPrice: 65, sellingPrice: 95, minStockLevel: 150 },
    { name: 'Marble Tiles 2x2 ft', sku: 'TIL-003', category: 'Tiles', stockQuantity: 0, costPrice: 450, sellingPrice: 650, minStockLevel: 30 },
    { name: 'Granite Tiles 2x2', sku: 'TIL-004', category: 'Tiles', stockQuantity: 85, costPrice: 380, sellingPrice: 520, minStockLevel: 50 },
    { name: 'Wall Tiles 1x1 ft', sku: 'TIL-005', category: 'Tiles', stockQuantity: 420, costPrice: 28, sellingPrice: 42, minStockLevel: 250 },
    { name: 'Bathroom Tiles', sku: 'TIL-006', category: 'Tiles', stockQuantity: 180, costPrice: 45, sellingPrice: 68, minStockLevel: 100 },
    { name: 'Kitchen Tiles', sku: 'TIL-007', category: 'Tiles', stockQuantity: 95, costPrice: 52, sellingPrice: 78, minStockLevel: 60 },
    { name: 'Outdoor Tiles Anti-Skid', sku: 'TIL-008', category: 'Tiles', stockQuantity: 65, costPrice: 75, sellingPrice: 110, minStockLevel: 40 },

    // ═══════════════════ CHEMICALS & ADDITIVES (6 products) ═══════════════════
    { name: 'Waterproofing Chemical 20L', sku: 'CHM-001', category: 'Chemicals', stockQuantity: 25, costPrice: 2800, sellingPrice: 3500, minStockLevel: 10 },
    { name: 'Concrete Admixture 20L', sku: 'CHM-002', category: 'Chemicals', stockQuantity: 18, costPrice: 1800, sellingPrice: 2400, minStockLevel: 12 },
    { name: 'Bonding Agent 5L', sku: 'CHM-003', category: 'Chemicals', stockQuantity: 40, costPrice: 650, sellingPrice: 850, minStockLevel: 20 },
    { name: 'Tile Adhesive 20kg', sku: 'CHM-004', category: 'Chemicals', stockQuantity: 75, costPrice: 380, sellingPrice: 480, minStockLevel: 40 },
    { name: 'Epoxy Grout 1kg', sku: 'CHM-005', category: 'Chemicals', stockQuantity: 55, costPrice: 420, sellingPrice: 580, minStockLevel: 30 },
    { name: 'Curing Compound 20L', sku: 'CHM-006', category: 'Chemicals', stockQuantity: 12, costPrice: 1200, sellingPrice: 1550, minStockLevel: 15 },

    // ═══════════════════ ELECTRICAL (6 products) ═══════════════════
    { name: 'Electrical Conduit 25mm', sku: 'ELC-001', category: 'Electrical', stockQuantity: 180, costPrice: 85, sellingPrice: 120, minStockLevel: 100 },
    { name: 'Wire 2.5mm (90m)', sku: 'ELC-002', category: 'Electrical', stockQuantity: 45, costPrice: 2800, sellingPrice: 3400, minStockLevel: 25 },
    { name: 'Distribution Box 8-Way', sku: 'ELC-003', category: 'Electrical', stockQuantity: 20, costPrice: 850, sellingPrice: 1100, minStockLevel: 15 },
    { name: 'MCB 32A', sku: 'ELC-004', category: 'Electrical', stockQuantity: 60, costPrice: 180, sellingPrice: 250, minStockLevel: 30 },
    { name: 'Switch Board 6-Gang', sku: 'ELC-005', category: 'Electrical', stockQuantity: 85, costPrice: 120, sellingPrice: 180, minStockLevel: 40 },
    { name: 'LED Bulb 12W (Box of 10)', sku: 'ELC-006', category: 'Electrical', stockQuantity: 150, costPrice: 350, sellingPrice: 480, minStockLevel: 80 },

    // ═══════════════════ PAINT & FINISHING (5 products) ═══════════════════
    { name: 'Primer 20L', sku: 'PNT-001', category: 'Paint', stockQuantity: 32, costPrice: 1800, sellingPrice: 2300, minStockLevel: 20 },
    { name: 'Exterior Emulsion 20L', sku: 'PNT-002', category: 'Paint', stockQuantity: 28, costPrice: 3200, sellingPrice: 4000, minStockLevel: 15 },
    { name: 'Interior Emulsion 20L', sku: 'PNT-003', category: 'Paint', stockQuantity: 42, costPrice: 2400, sellingPrice: 3100, minStockLevel: 20 },
    { name: 'Putty 40kg', sku: 'PNT-004', category: 'Paint', stockQuantity: 55, costPrice: 850, sellingPrice: 1100, minStockLevel: 30 },
    { name: 'Distemper 20kg', sku: 'PNT-005', category: 'Paint', stockQuantity: 38, costPrice: 650, sellingPrice: 850, minStockLevel: 25 }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Product.deleteMany({});
        await Sale.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert products
        const products = await Product.insertMany(sampleProducts);
        console.log(`📦 Inserted ${products.length} products`);

        // Generate sample sales for last 14 days
        const sales = [];
        const now = new Date();

        for (const product of products) {
            // Random number of sales per product (0-15)
            const numSales = Math.floor(Math.random() * 16);

            for (let i = 0; i < numSales; i++) {
                const daysAgo = Math.floor(Math.random() * 14);
                const salesDate = new Date(now);
                salesDate.setDate(salesDate.getDate() - daysAgo);

                sales.push({
                    productId: product._id,
                    quantity: Math.floor(Math.random() * 15) + 1,
                    soldAt: salesDate
                });
            }
        }

        if (sales.length > 0) {
            await Sale.insertMany(sales);
            console.log(`📈 Inserted ${sales.length} sales records`);
        }

        console.log('\n✅ Seed completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   Products: ${products.length}`);
        console.log(`   Sales: ${sales.length}`);
        console.log(`   Categories: ${[...new Set(sampleProducts.map(p => p.category))].length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
}

seed();
