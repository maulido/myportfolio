// Seed script to populate skills database with initial data
// Run with: node --loader ts-node/esm scripts/seedSkills.ts
// Note: Next.js automatically loads .env.local, no need for dotenv

import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
    name: String,
    level: String,
    years: Number,
    category: String,
    icon: String,
    color: String,
    order: Number
}, { timestamps: true });

const Skill = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);

const seedSkills = [
    // Frontend Development
    { name: "Next.js", level: "Expert", years: 3, category: "Frontend Development", icon: "SiNextdotjs", order: 1 },
    { name: "React", level: "Expert", years: 4, category: "Frontend Development", icon: "SiReact", color: "text-blue-400", order: 2 },
    { name: "TypeScript", level: "Advanced", years: 3, category: "Frontend Development", icon: "SiTypescript", color: "text-blue-600", order: 3 },
    { name: "JavaScript", level: "Expert", years: 5, category: "Frontend Development", icon: "SiJavascript", color: "text-yellow-400", order: 4 },
    { name: "Tailwind CSS", level: "Expert", years: 3, category: "Frontend Development", icon: "SiTailwindcss", color: "text-cyan-400", order: 5 },

    // Backend & Database
    { name: "Node.js", level: "Advanced", years: 3, category: "Backend & Database", icon: "SiNodedotjs", color: "text-green-500", order: 1 },
    { name: "MongoDB", level: "Advanced", years: 3, category: "Backend & Database", icon: "SiMongodb", color: "text-green-600", order: 2 },
    { name: "PostgreSQL", level: "Intermediate", years: 2, category: "Backend & Database", icon: "SiPostgresql", color: "text-blue-500", order: 3 },
    { name: "Python", level: "Intermediate", years: 2, category: "Backend & Database", icon: "SiPython", color: "text-yellow-500", order: 4 },

    // Network & DevOps
    { name: "Cisco Networking", level: "Expert", years: 5, category: "Network & DevOps", icon: "SiCisco", color: "text-blue-700", order: 1 },
    { name: "Docker", level: "Advanced", years: 2, category: "Network & DevOps", icon: "SiDocker", color: "text-blue-400", order: 2 },
    { name: "Linux", level: "Advanced", years: 4, category: "Network & DevOps", icon: "SiLinux", order: 3 },
    { name: "AWS", level: "Intermediate", years: 2, category: "Network & DevOps", icon: "SiAmazonwebservices", color: "text-orange-500", order: 4 },
    { name: "Git", level: "Advanced", years: 4, category: "Network & DevOps", icon: "SiGit", color: "text-orange-600", order: 5 },
];

async function seedDatabase() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing skills
        console.log('🗑️  Clearing existing skills...');
        await Skill.deleteMany({});
        console.log('✅ Cleared existing skills');

        // Insert seed data
        console.log('🌱 Seeding skills...');
        const result = await Skill.insertMany(seedSkills);
        console.log(`✅ Successfully seeded ${result.length} skills`);

        // Display summary
        const categories = [...new Set(seedSkills.map(s => s.category))];
        console.log('\n📊 Summary:');
        for (const category of categories) {
            const count = seedSkills.filter(s => s.category === category).length;
            console.log(`   ${category}: ${count} skills`);
        }

        console.log('\n✨ Seeding complete!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

seedDatabase();
