// Push sales data directly to production MongoDB database
// This script fetches products from production API and inserts sales into MongoDB Atlas
// Run with: node src/scripts/push-sales-to-production.js

require('dotenv').config();
const mongoose = require('mongoose');

// Production MongoDB URI (from Render environment)
const PRODUCTION_MONGO_URI = 'mongodb+srv://namanmaheshgoyal:gfHMW9EnBEaTtnX8@inventoryapi.d4cxnlf.mongodb.net/inventory_db?retryWrites=true&w=majority';
const PRODUCTION_API = 'https://intelligence-inventory-management.onrender.com';

// Sales schema (matches the existing sales.model.js)
const saleSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    soldAt: { type: Date, default: Date.now }
});

async function pushSales() {
    console.log('🚀 Starting to push sales data to production MongoDB...\n');

    try {
        // Step 1: Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(PRODUCTION_MONGO_URI);
        console.log('   ✅ Connected!\n');

        const Sale = mongoose.model('Sale', saleSchema);

        // Step 2: Clear existing sales (optional - comment out if you want to keep existing)
        console.log('🗑️  Clearing existing sales...');
        const deleteResult = await Sale.deleteMany({});
        console.log(`   Deleted ${deleteResult.deletedCount} existing sales\n`);

        // Step 3: Fetch all products from production API
        console.log('📦 Fetching products from production API...');
        const productsRes = await fetch(`${PRODUCTION_API}/api/inventory`);
        const products = await productsRes.json();
        console.log(`   Found ${products.length} products\n`);

        // Step 4: Generate sales records for last 14 days
        console.log('📊 Generating sales records...');
        const now = new Date();
        const sales = [];

        for (const product of products) {
            // Random number of sales per product (5-15)
            const numSales = Math.floor(Math.random() * 11) + 5;

            for (let i = 0; i < numSales; i++) {
                const daysAgo = Math.floor(Math.random() * 14);
                const salesDate = new Date(now);
                salesDate.setDate(salesDate.getDate() - daysAgo);

                sales.push({
                    productId: new mongoose.Types.ObjectId(product._id),
                    quantity: Math.floor(Math.random() * 15) + 1,
                    soldAt: salesDate
                });
            }
        }
        console.log(`   Generated ${sales.length} sales records\n`);

        // Step 5: Insert sales records
        console.log('📤 Inserting sales into MongoDB...');
        const insertResult = await Sale.insertMany(sales);
        console.log(`   ✅ Inserted ${insertResult.length} sales records!\n`);

        // Step 6: Verify by querying trends
        console.log('📈 Verifying inserted sales...');
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const dailyTrends = await Sale.aggregate([
            { $match: { soldAt: { $gte: last7Days } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$soldAt" } },
                    totalSold: { $sum: "$quantity" },
                    salesCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log('   Daily trends from production:');
        dailyTrends.forEach(day => {
            console.log(`   ${day._id}: ${day.totalSold} units (${day.salesCount} transactions)`);
        });

        console.log('\n✅ Sales push completed successfully!');
        console.log(`   Total sales inserted: ${insertResult.length}`);

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

pushSales();
