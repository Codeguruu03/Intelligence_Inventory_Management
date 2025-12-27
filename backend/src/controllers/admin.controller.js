const Product = require("../models/product.model");
const Sale = require("../models/sales.model");

// Seed sales data - creates sample sales for demo/testing
exports.seedSales = async (req, res) => {
    try {
        // Clear existing sales
        await Sale.deleteMany({});

        // Fetch all products
        const products = await Product.find({});

        if (products.length === 0) {
            return res.status(400).json({ error: "No products found. Add products first." });
        }

        // Generate sales records for last 7 days
        const now = new Date();
        const sales = [];

        for (const product of products) {
            // Random number of sales per product (5-15)
            const numSales = Math.floor(Math.random() * 11) + 5;

            for (let i = 0; i < numSales; i++) {
                // Keep all dates within last 7 days
                const daysAgo = Math.floor(Math.random() * 7);
                const salesDate = new Date(now);
                salesDate.setDate(salesDate.getDate() - daysAgo);

                sales.push({
                    productId: product._id,
                    quantity: Math.floor(Math.random() * 15) + 1,
                    soldAt: salesDate
                });
            }
        }

        // Insert sales
        const insertedSales = await Sale.insertMany(sales);

        // Get summary stats
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

        res.json({
            success: true,
            message: `Seeded ${insertedSales.length} sales records`,
            products: products.length,
            salesInserted: insertedSales.length,
            dailyTrends
        });
    } catch (error) {
        console.error("Seed sales error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Clear all sales
exports.clearSales = async (req, res) => {
    try {
        const result = await Sale.deleteMany({});
        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} sales records`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
