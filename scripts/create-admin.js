// Create Admin User Script
// Run this to create an admin user for the portfolio website
// Usage: node scripts/create-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_db';
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Import Admin model
        const Admin = require('../models/Admin');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('Username: admin');
            process.exit(0);
        }

        // Get password from environment or use default
        const password = process.env.ADMIN_PASSWORD || 'admin123';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        const admin = await Admin.create({
            username: 'admin',
            password: hashedPassword,
            name: 'Administrator',
            email: 'admin@portfolio.com'
        });

        console.log('✅ Admin user created successfully!');
        console.log('\nLogin Credentials:');
        console.log('Username: admin');
        console.log('Password:', password);
        console.log('\n🔐 You can now login at http://localhost:3000/login');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

// Run the function
createAdmin();
