// Check what collections exist in MongoDB
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.PRODUCTION_MONGO_URI || process.env.MONGO_URI;

async function checkCollections() {
    console.log('🔍 Checking MongoDB collections...\n');

    const uriMasked = MONGO_URI.replace(/:([^:@]+)@/, ':****@');
    console.log('📍 Connected to:', uriMasked);

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📦 Collections in database:');
    collections.forEach(col => console.log('   -', col.name));

    // Check sales collection specifically
    console.log('\n📊 Sales collection stats:');
    const salesCollection = mongoose.connection.db.collection('sales');
    const salesCount = await salesCollection.countDocuments({});
    console.log('   Total documents:', salesCount);

    // Get a sample document
    const sampleSale = await salesCollection.findOne({});
    console.log('   Sample document:', JSON.stringify(sampleSale, null, 2));

    await mongoose.disconnect();
    process.exit(0);
}

checkCollections();
