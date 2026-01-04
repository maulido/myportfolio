/**
 * Script to update About Me content in database (FIXED VERSION)
 * This script updates the Settings collection with key 'aboutMe'
 * Run with: node scripts/updateAboutMe.js
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_db';

// Settings schema (matches the API model)
const settingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
    aboutMe: {
        paragraph1: String,
        paragraph2: String,
        profilePhotoUrl: String,
        name: String,
        title: String,
        location: String,
        email: String,
        phone: String,
        socialLinks: {
            github: String,
            linkedin: String,
            twitter: String,
            website: String,
            instagram: String
        },
        stats: {
            yearsExperience: Number,
            projectsCompleted: Number,
            technologiesMastered: Number,
            certificationsEarned: Number
        }
    }
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

async function updateAboutMe() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Professional content to replace placeholders
        const professionalContent = {
            paragraph1: "I am a passionate Network & Software Engineer with extensive experience in building scalable web applications and network infrastructure. My expertise spans across full-stack development, cloud technologies, and network architecture.",
            paragraph2: "With a strong foundation in both software engineering and network systems, I specialize in creating robust, secure, and high-performance solutions. I'm constantly learning and adapting to new technologies to deliver cutting-edge solutions that meet modern business needs."
        };

        // Update Settings document with key 'aboutMe'
        const result = await Settings.findOneAndUpdate(
            { key: 'aboutMe' },
            {
                $set: {
                    key: 'aboutMe',
                    value: true,
                    'aboutMe.paragraph1': professionalContent.paragraph1,
                    'aboutMe.paragraph2': professionalContent.paragraph2
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        console.log('✅ About Me content updated successfully in Settings collection!');
        console.log('📄 Document ID:', result._id);
        console.log('🔑 Key:', result.key);
        console.log('📝 Paragraph 1:', result.aboutMe?.paragraph1?.substring(0, 60) + '...');
        console.log('📝 Paragraph 2:', result.aboutMe?.paragraph2?.substring(0, 60) + '...');

    } catch (error) {
        console.error('❌ Error updating About Me:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    }
}

// Run the update
updateAboutMe();
