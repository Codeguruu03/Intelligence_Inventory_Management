const Product = require("../models/product.model");
const Sale = require("../models/sales.model");

// Get financial insights
exports.getFinancialInsights = async () => {
    const products = await Product.find({});

    // Calculate financial metrics
    const insights = products.map(product => {
        const profit = product.sellingPrice - product.costPrice;
        const margin = product.costPrice > 0
            ? ((profit / product.sellingPrice) * 100).toFixed(1)
            : 0;
        const stockValue = product.stockQuantity * product.costPrice;
        const potentialRevenue = product.stockQuantity * product.sellingPrice;
        const potentialProfit = product.stockQuantity * profit;

        return {
            productId: product._id,
            name: product.name,
            category: product.category,
            costPrice: product.costPrice,
            sellingPrice: product.sellingPrice,
            profit,
            margin: parseFloat(margin),
            stockQuantity: product.stockQuantity,
            stockValue,
            potentialRevenue,
            potentialProfit
        };
    });

    // Aggregate totals
    const totals = {
        totalProducts: products.length,
        totalStockValue: insights.reduce((sum, p) => sum + p.stockValue, 0),
        totalPotentialRevenue: insights.reduce((sum, p) => sum + p.potentialRevenue, 0),
        totalPotentialProfit: insights.reduce((sum, p) => sum + p.potentialProfit, 0),
        averageMargin: insights.length > 0
            ? (insights.reduce((sum, p) => sum + p.margin, 0) / insights.length).toFixed(1)
            : 0
    };

    // Top 5 by profit margin
    const topByMargin = [...insights]
        .sort((a, b) => b.margin - a.margin)
        .slice(0, 5);

    // Top 5 by potential profit
    const topByProfit = [...insights]
        .sort((a, b) => b.potentialProfit - a.potentialProfit)
        .slice(0, 5);

    // Category breakdown
    const categoryMap = {};
    insights.forEach(p => {
        if (!categoryMap[p.category]) {
            categoryMap[p.category] = { revenue: 0, profit: 0, count: 0 };
        }
        categoryMap[p.category].revenue += p.potentialRevenue;
        categoryMap[p.category].profit += p.potentialProfit;
        categoryMap[p.category].count += 1;
    });

    const byCategory = Object.entries(categoryMap).map(([name, data]) => ({
        name,
        ...data,
        margin: data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0
    })).sort((a, b) => b.profit - a.profit);

    return {
        totals,
        topByMargin,
        topByProfit,
        byCategory
    };
};
