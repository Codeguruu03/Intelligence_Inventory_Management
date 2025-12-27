const Product = require("../models/product.model");
const Sale = require("../models/sales.model");

// Get dead stock - products with no sales in X days
exports.getDeadStock = async (daysThreshold = 30) => {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    // Get all products
    const products = await Product.find({});

    // Get products that have had sales in the threshold period
    const productsWithRecentSales = await Sale.distinct('productId', {
        soldAt: { $gte: thresholdDate }
    });

    // Convert ObjectIds to strings for comparison
    const recentSaleProductIds = productsWithRecentSales.map(id => id.toString());

    // Filter products that have NO recent sales and have stock > 0
    const deadStock = products
        .filter(product => {
            const hasRecentSales = recentSaleProductIds.includes(product._id.toString());
            return !hasRecentSales && product.stockQuantity > 0;
        })
        .map(product => ({
            _id: product._id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            stockQuantity: product.stockQuantity,
            costPrice: product.costPrice,
            sellingPrice: product.sellingPrice,
            stockValue: product.stockQuantity * product.costPrice,
            potentialLoss: product.stockQuantity * product.costPrice, // Capital tied up
            daysWithoutSale: daysThreshold // At least this many days
        }))
        .sort((a, b) => b.stockValue - a.stockValue); // Sort by capital at risk

    // Calculate summary stats
    const totalDeadStockValue = deadStock.reduce((sum, p) => sum + p.stockValue, 0);
    const totalDeadStockUnits = deadStock.reduce((sum, p) => sum + p.stockQuantity, 0);

    return {
        daysThreshold,
        totalProducts: deadStock.length,
        totalDeadStockValue,
        totalDeadStockUnits,
        products: deadStock
    };
};
