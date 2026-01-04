// Migration script to fix About Me database structure
// This script will update the existing aboutMe document to include all new fields

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

async function migrateAboutMe() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const Settings = mongoose.connection.collection('settings');

        // Find existing aboutMe document
        const existing = await Settings.findOne({ key: 'aboutMe' });

        if (!existing) {
            console.log('❌ No aboutMe document found. Please create one first via the admin panel.');
            return;
        }

        console.log('📄 Current aboutMe structure:', JSON.stringify(existing.aboutMe, null, 2));

        // Prepare updated structure with all fields
        const updatedAboutMe = {
            paragraph1: existing.aboutMe?.paragraph1 || '',
            paragraph2: existing.aboutMe?.paragraph2 || '',
            profilePhotoUrl: existing.aboutMe?.profilePhotoUrl || '',
            name: existing.aboutMe?.name || '',
            title: existing.aboutMe?.title || '',
            location: existing.aboutMe?.location || '',
            email: existing.aboutMe?.email || '',
            phone: existing.aboutMe?.phone || '',
            socialLinks: {
                github: existing.aboutMe?.socialLinks?.github || '',
                linkedin: existing.aboutMe?.socialLinks?.linkedin || '',
                twitter: existing.aboutMe?.socialLinks?.twitter || '',
                website: existing.aboutMe?.socialLinks?.website || '',
                instagram: existing.aboutMe?.socialLinks?.instagram || ''
            },
            stats: {
                yearsExperience: existing.aboutMe?.stats?.yearsExperience || 0,
                projectsCompleted: existing.aboutMe?.stats?.projectsCompleted || 0,
                technologiesMastered: existing.aboutMe?.stats?.technologiesMastered || 0,
                certificationsEarned: existing.aboutMe?.stats?.certificationsEarned || 0
            }
        };

        console.log('🔧 Updating document with new structure...');

        // Update the document
        const result = await Settings.updateOne(
            { key: 'aboutMe' },
            { $set: { aboutMe: updatedAboutMe } }
        );

        console.log('✅ Migration complete!');
        console.log('📊 Modified count:', result.modifiedCount);

        // Verify the update
        const updated = await Settings.findOne({ key: 'aboutMe' });
        console.log('📄 Updated aboutMe structure:', JSON.stringify(updated.aboutMe, null, 2));

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

migrateAboutMe()
    .then(() => {
        console.log('✅ Migration script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration script failed:', error);
        process.exit(1);
    });
