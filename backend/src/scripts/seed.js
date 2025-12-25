// Seed script to populate database with sample data for demo
// Run with: node src/scripts/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Sale = require('../models/sales.model');

const sampleProducts = [
    {
        name: 'Portland Cement (50kg)',
        sku: 'CEM-001',
        category: 'Cement',
        stockQuantity: 45,
        costPrice: 350,
        sellingPrice: 420,
        minStockLevel: 100
    },
    {
        name: 'TMT Steel Bars 12mm',
        sku: 'STL-012',
        category: 'Steel',
        stockQuantity: 250,
        costPrice: 65,
        sellingPrice: 85,
        minStockLevel: 100
    },
    {
        name: 'Red Bricks (1000 pcs)',
        sku: 'BRK-001',
        category: 'Bricks',
        stockQuantity: 15,
        costPrice: 6500,
        sellingPrice: 8000,
        minStockLevel: 20
    },
    {
        name: 'River Sand (per ton)',
        sku: 'SND-001',
        category: 'Aggregates',
        stockQuantity: 8,
        costPrice: 1800,
        sellingPrice: 2200,
        minStockLevel: 15
    },
    {
        name: 'White Cement 1kg',
        sku: 'CEM-002',
        category: 'Cement',
        stockQuantity: 120,
        costPrice: 45,
        sellingPrice: 65,
        minStockLevel: 50
    },
    {
        name: 'PVC Pipes 4 inch',
        sku: 'PVC-004',
        category: 'Plumbing',
        stockQuantity: 80,
        costPrice: 280,
        sellingPrice: 350,
        minStockLevel: 40
    },
    {
        name: 'Marble Tiles 2x2 ft',
        sku: 'TIL-001',
        category: 'Tiles',
        stockQuantity: 0,
        costPrice: 450,
        sellingPrice: 650,
        minStockLevel: 30
    },
    {
        name: 'Waterproofing Chemical 20L',
        sku: 'CHM-001',
        category: 'Chemicals',
        stockQuantity: 25,
        costPrice: 2800,
        sellingPrice: 3500,
        minStockLevel: 10
    }
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
            // Random number of sales per product (0-10)
            const numSales = Math.floor(Math.random() * 11);

            for (let i = 0; i < numSales; i++) {
                const daysAgo = Math.floor(Math.random() * 14);
                const salesDate = new Date(now);
                salesDate.setDate(salesDate.getDate() - daysAgo);

                sales.push({
                    productId: product._id,
                    quantity: Math.floor(Math.random() * 10) + 1,
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

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
}

seed();
