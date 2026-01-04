/**
 * Script to update About Me content in database
 * Run with: node scripts/updateAboutMe.js
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_db';

// About Me schema (simplified)
const aboutMeSchema = new mongoose.Schema({
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
}, { timestamps: true });

const AboutMe = mongoose.models.AboutMe || mongoose.model('AboutMe', aboutMeSchema);

async function updateAboutMe() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Professional content to replace placeholders
        const professionalContent = {
            paragraph1: "I am a passionate Network & Software Engineer with extensive experience in building scalable web applications and network infrastructure. My expertise spans across full-stack development, cloud technologies, and network architecture.",
            paragraph2: "With a strong foundation in both software engineering and network systems, I specialize in creating robust, secure, and high-performance solutions. I'm constantly learning and adapting to new technologies to deliver cutting-edge solutions that meet modern business needs."
        };

        // Update or create About Me entry
        const result = await AboutMe.findOneAndUpdate(
            {}, // Find any document
            professionalContent,
            {
                new: true,
                upsert: true, // Create if doesn't exist
                setDefaultsOnInsert: true
            }
        );

        console.log('✅ About Me content updated successfully!');
        console.log('Updated content:', result);

    } catch (error) {
        console.error('❌ Error updating About Me:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    }
}

// Run the update
updateAboutMe();
