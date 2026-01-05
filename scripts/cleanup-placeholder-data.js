/**
 * Cleanup Script: Remove Placeholder/Test Data
 * 
 * Usage: node scripts/cleanup-placeholder-data.js
 */

const mongoose = require('mongoose');

async function cleanupPlaceholderData() {
    try {
        console.log('🧹 Starting cleanup of placeholder data...\n');

        // Connect to MongoDB - read from env or use default
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_db';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Define schemas inline
        const GallerySchema = new mongoose.Schema({}, { strict: false, collection: 'galleryitems' });
        const CertificationSchema = new mongoose.Schema({}, { strict: false, collection: 'certifications' });

        const Gallery = mongoose.models.GalleryItem || mongoose.model('GalleryItem', GallerySchema);
        const Certification = mongoose.models.Certification || mongoose.model('Certification', CertificationSchema);

        // 1. Remove test gallery items
        console.log('📸 Cleaning up Gallery...');
        const galleryResult = await Gallery.deleteMany({
            $or: [
                { title: { $regex: /^test/i } },
                { title: 'Test Gallery Item' },
                { title: 'test2' }
            ]
        });
        console.log(`   Removed ${galleryResult.deletedCount} test gallery items\n`);

        // 2. Remove test certifications
        console.log('🏆 Cleaning up Certifications...');
        const certResult = await Certification.deleteMany({
            $or: [
                { title: { $regex: /^test/i } },
                { issuer: { $regex: /test/i } }
            ]
        });
        console.log(`   Removed ${certResult.deletedCount} test certifications\n`);

        // 3. Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ Cleanup Summary:');
        console.log(`   Gallery items removed: ${galleryResult.deletedCount}`);
        console.log(`   Certifications removed: ${certResult.deletedCount}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('✅ Cleanup completed successfully!');
        console.log('💡 Next steps:');
        console.log('   1. Update About Me via Admin Panel (/admin)');
        console.log('   2. Upload real gallery images');
        console.log('   3. Add real certifications\n');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Run cleanup
cleanupPlaceholderData();
