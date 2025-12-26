// Quick verification script to check production database contents
require('dotenv').config();
const mongoose = require('mongoose');

const PRODUCTION_MONGO_URI = 'mongodb+srv://namanmaheshgoyal:gfHMW9EnBEaTtnX8@inventoryapi.d4cxnlf.mongodb.net/inventory_db?retryWrites=true&w=majority';

const saleSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    soldAt: { type: Date, default: Date.now }
});

async function verify() {
    console.log('🔍 Verifying production database...\n');

    await mongoose.connect(PRODUCTION_MONGO_URI);
    console.log('✅ Connected to production MongoDB\n');

    const Sale = mongoose.model('Sale', saleSchema);

    // Count total sales
    const totalSales = await Sale.countDocuments({});
    console.log('📊 Total sales in database: ' + totalSales);

    // Get last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    console.log('📅 Checking sales since: ' + last7Days.toISOString());

    const recentSales = await Sale.countDocuments({ soldAt: { $gte: last7Days } });
    console.log('📅 Sales in last 7 days: ' + recentSales);

    // Aggregate like the API does
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

    console.log('\n📈 Daily trends aggregation result:');
    console.log(JSON.stringify(dailyTrends, null, 2));

    await mongoose.disconnect();
    process.exit(0);
}

verify();
