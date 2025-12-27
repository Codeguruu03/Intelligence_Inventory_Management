const Product = require("../models/product.model");
const Sale = require("../models/sales.model");

// Calculate days until stockout for each product based on avg daily sales
exports.getStockoutPredictions = async () => {
    // Get last 14 days for better average
    const last14Days = new Date();
    last14Days.setDate(last14Days.getDate() - 14);

    // Get all products
    const products = await Product.find({});

    // Get sales data aggregated by product for last 14 days
    const salesData = await Sale.aggregate([
        { $match: { soldAt: { $gte: last14Days } } },
        {
            $group: {
                _id: "$productId",
                totalSold: { $sum: "$quantity" },
                salesCount: { $sum: 1 }
            }
        }
    ]);

    // Create a map for quick lookup
    const salesMap = new Map();
    salesData.forEach(s => salesMap.set(s._id.toString(), s));

    // Calculate days until stockout for each product
    const predictions = products.map(product => {
        const sales = salesMap.get(product._id.toString());

        // Calculate average daily sales (over 14 days)
        const avgDailySales = sales ? sales.totalSold / 14 : 0;

        // Calculate days until stockout
        let daysUntilStockout = null;
        let status = 'safe';

        if (avgDailySales > 0) {
            daysUntilStockout = Math.round(product.stockQuantity / avgDailySales);

            if (daysUntilStockout <= 3) {
                status = 'critical'; // Will run out in 3 days or less
            } else if (daysUntilStockout <= 7) {
                status = 'warning'; // Will run out in a week
            } else if (daysUntilStockout <= 14) {
                status = 'attention'; // Will run out in 2 weeks
            }
        } else {
            // No sales - either dead stock or new product
            daysUntilStockout = product.stockQuantity > 0 ? 999 : 0;
            status = product.stockQuantity === 0 ? 'out' : 'no-sales';
        }

        return {
            _id: product._id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            stockQuantity: product.stockQuantity,
            avgDailySales: Math.round(avgDailySales * 10) / 10,
            daysUntilStockout,
            status
        };
    });

    // Sort by urgency - critical first, then warning, etc.
    const statusOrder = { 'out': 0, 'critical': 1, 'warning': 2, 'attention': 3, 'safe': 4, 'no-sales': 5 };
    predictions.sort((a, b) => {
        const orderDiff = statusOrder[a.status] - statusOrder[b.status];
        if (orderDiff !== 0) return orderDiff;
        // Within same status, sort by days until stockout
        return (a.daysUntilStockout || 999) - (b.daysUntilStockout || 999);
    });

    // Summary stats
    const critical = predictions.filter(p => p.status === 'critical').length;
    const warning = predictions.filter(p => p.status === 'warning').length;
    const attention = predictions.filter(p => p.status === 'attention').length;
    const outOfStock = predictions.filter(p => p.status === 'out').length;

    return {
        summary: { critical, warning, attention, outOfStock },
        predictions
    };
};
