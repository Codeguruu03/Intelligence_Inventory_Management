const Product = require('../models/product.model');

/**
 * Mark product units as damaged
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to mark as damaged
 * @param {string} reason - Reason for damage (broken, expired, defective, other)
 */
async function markAsDamaged(productId, quantity, reason) {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    if (quantity > product.stockQuantity) {
        throw new Error('Cannot mark more items as damaged than available in stock');
    }

    // Move items from stock to damaged
    product.stockQuantity -= quantity;
    product.damagedQuantity = (product.damagedQuantity || 0) + quantity;

    // Add to damage history
    product.damageHistory = product.damageHistory || [];
    product.damageHistory.push({
        quantity,
        reason,
        date: new Date()
    });

    await product.save();
    return product;
}

/**
 * Get damaged inventory report
 * Returns all products with damaged items
 */
async function getDamagedReport() {
    const products = await Product.find({ damagedQuantity: { $gt: 0 } });

    let totalDamagedUnits = 0;
    let totalDamagedValue = 0;

    const items = products.map(p => {
        const value = p.damagedQuantity * p.costPrice;
        totalDamagedUnits += p.damagedQuantity;
        totalDamagedValue += value;

        // Get most recent damage reason
        const lastDamage = p.damageHistory && p.damageHistory.length > 0
            ? p.damageHistory[p.damageHistory.length - 1]
            : null;

        return {
            _id: p._id,
            name: p.name,
            sku: p.sku,
            category: p.category,
            damagedQuantity: p.damagedQuantity,
            damagedValue: value,
            costPrice: p.costPrice,
            lastReason: lastDamage?.reason || 'Unknown',
            lastDate: lastDamage?.date || null,
            damageHistory: p.damageHistory || []
        };
    });

    // Group by reason
    const reasonBreakdown = {};
    products.forEach(p => {
        (p.damageHistory || []).forEach(h => {
            if (!reasonBreakdown[h.reason]) {
                reasonBreakdown[h.reason] = { count: 0, value: 0 };
            }
            reasonBreakdown[h.reason].count += h.quantity;
            reasonBreakdown[h.reason].value += h.quantity * p.costPrice;
        });
    });

    return {
        totalDamagedProducts: products.length,
        totalDamagedUnits,
        totalDamagedValue,
        reasonBreakdown,
        items
    };
}

/**
 * Write off damaged inventory (remove from system)
 */
async function writeOffDamaged(productId) {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    const writtenOff = product.damagedQuantity;
    product.damagedQuantity = 0;
    product.damageHistory = [];

    await product.save();
    return { productId, writtenOff };
}

module.exports = {
    markAsDamaged,
    getDamagedReport,
    writeOffDamaged
};
