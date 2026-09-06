# Environment Variables Configuration Template
# Copy this file to .env.local and fill in your actual values

# Database (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/portfolio_db

# Authentication (REQUIRED)
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (Optional - for contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_EMAIL=contact@yourdomain.com

# Telegram Notifications (Optional - can also be configured via Admin Settings)
# Create bot via @BotFather to get token, and find your chat ID via @userinfobot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
TELEGRAM_CHAT_ID=123456789

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# AI Chat (Optional)
GEMINI_API_KEY=your-gemini-api-key-here

# GitHub Activity (Optional - increases rate limit from 60 to 5000/hour)
NEXT_PUBLIC_GITHUB_TOKEN=your-github-personal-access-token

# Base URL (for OG images and absolute URLs)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# UploadThing (Optional - for file uploads)
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id

# Node Environment
NODE_ENV=development
