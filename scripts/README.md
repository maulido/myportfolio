# Database Seeding Instructions

## Quick Start

1. **Make sure MongoDB is running**:
   ```powershell
   Get-Service MongoDB
   # Should show: Status = Running
   ```

2. **Run the seed script**:
   ```bash
   node scripts/seed.js
   ```

3. **Verify data**:
   - Open http://localhost:3000
   - Projects section should show 3 sample projects
   - Gallery should have 2 items
   - Testimonials should have 1 entry

## What Gets Seeded

### Projects (3 items):
1. Portfolio Website - Next.js, TypeScript, MongoDB
2. Network Monitoring Dashboard - React, Node.js, WebSocket
3. E-Commerce Platform - Next.js, Stripe, PostgreSQL

### Gallery (2 items):
1. Network Infrastructure Setup
2. Code Review Session

### Testimonials (1 item):
1. John Doe - CTO testimonial

## Customization

Edit `scripts/seed.js` to:
- Add more projects
- Change images (using Unsplash URLs)
- Update descriptions
- Modify tags and technologies

## Clear Database

To start fresh, uncomment these lines in `seed.js`:
```javascript
await Project.deleteMany({});
await Gallery.deleteMany({});
await Testimonial.deleteMany({});
```

## Troubleshooting

**Error: Cannot find module**
```bash
# Make sure you're in project root
cd d:\Apps\portfolio-website
node scripts/seed.js
```

**Error: Connection refused**
- Check MongoDB is running
- Verify MONGODB_URI in .env.local

**Error: Model not found**
- Ensure all model files exist in /models folder
