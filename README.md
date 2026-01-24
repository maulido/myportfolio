# 🚀 Professional Portfolio Website

A modern, full-featured portfolio website built with Next.js 14, featuring a powerful admin panel, AI-powered chat, blog system, and comprehensive content management.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## ✨ Features

### 🎨 Frontend
- **Modern UI/UX** - Responsive design with dark mode support
- **Smooth Animations** - Framer Motion for fluid transitions
- **SEO Optimized** - Meta tags, sitemap, and structured data
- **PWA Ready** - Installable progressive web app
- **Internationalization** - Multi-language support with next-intl
- **Analytics** - Google Analytics integration

### 📝 Content Management
- **Blog System** - Full-featured blog with rich text editor
- **Project Showcase** - Portfolio projects with case studies
- **Gallery** - Image gallery with categories
- **Certifications** - Display professional certifications
- **Testimonials** - Client testimonials management
- **Career Timeline** - Professional journey visualization
- **Technical Skills** - Skills showcase with endorsements
- **Uses Page** - Tools and software recommendations
- **Guestbook** - Interactive visitor messages

### 🔐 Admin Panel
- **Secure Authentication** - NextAuth with bcrypt password hashing
- **Profile Management** - Update username, email, and password
- **Content CRUD** - Create, read, update, delete all content types
- **Media Library** - File upload with UploadThing
- **Analytics Dashboard** - Traffic and performance metrics
- **Modern UI** - Beautiful admin interface with gradient designs

### 🤖 AI Features
- **AI Chat Widget** - Google Gemini AI integration
- **Smart Responses** - Context-aware conversations
- **Customizable** - Configurable AI personality

### 📧 Communication
- **Contact Form** - Email integration with SendGrid/Nodemailer
- **Email Notifications** - Automated email alerts
- **Form Validation** - Client and server-side validation

## 🛠️ Tech Stack

### Core
- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion

### Backend
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js
- **Password Hashing:** bcryptjs
- **File Upload:** UploadThing

### AI & Analytics
- **AI:** Google Generative AI (Gemini)
- **Analytics:** Google Analytics
- **Email:** SendGrid / Nodemailer

### Content
- **Rich Text Editor:** TipTap
- **Code Highlighting:** Lowlight
- **Icons:** Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/maulido/myportfolio.git
cd myportfolio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env.local` file in root directory:

```env
# Database (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/portfolio_db
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio_db

# Authentication (REQUIRED)
NEXTAUTH_SECRET=your-secret-key-here-min-32-characters
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Public URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AI Integration (Optional)
GEMINI_API_KEY=your-gemini-api-key

# File Upload (Optional)
UPLOADTHING_TOKEN=your-uploadthing-token

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Environment
NODE_ENV=development
```

### 4. Generate NextAuth Secret
```bash
# Generate a secure random string
openssl rand -base64 32
```

### 5. Create Admin User
```bash
# Run the setup script
node scripts/create-admin.js

# Or visit after starting the server:
# http://localhost:3000/api/admin/setup
```

Default credentials:
- Username: `admin`
- Password: `admin123`

**⚠️ Change these credentials immediately after first login!**

### 6. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (see `.env.local` above)
   - Deploy!

3. **Configure MongoDB Atlas**
   - Login to [MongoDB Atlas](https://cloud.mongodb.com)
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (Allow from anywhere)
   - Or add Vercel's IP ranges

4. **Update Environment Variables**
   - Set `NEXTAUTH_URL` to your production domain
   - Set `NEXT_PUBLIC_BASE_URL` to your production domain

5. **Create Admin User**
   - Visit: `https://yourdomain.com/api/admin/setup`
   - Login at: `https://yourdomain.com/login`

### Custom Domain Setup

1. **Add Domain in Vercel**
   - Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**
```env
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

3. **Redeploy**
   - Trigger a new deployment for changes to take effect

## 📖 Usage

### Admin Panel

Access the admin panel at `/login`:

**Dashboard** (`/admin`)
- System overview
- Traffic analytics
- Quick actions

**Content Management**
- **Blog Posts** (`/admin/posts`) - Create and manage blog articles
- **Projects** (`/admin/projects`) - Showcase portfolio projects
- **Gallery** (`/admin/gallery`) - Upload and organize images
- **Certifications** (`/admin/certifications`) - Add professional certificates
- **Testimonials** (`/admin/testimonials`) - Manage client reviews
- **Career Journey** (`/admin/career`) - Timeline of professional experience
- **Technical Skills** (`/admin/skills`) - List technical competencies
- **Uses Page** (`/admin/uses`) - Tools and software you use
- **Guestbook** (`/admin/guestbook`) - Moderate visitor messages

**Admin Tools**
- **Media Library** (`/admin/media`) - File management
- **Analytics** (`/admin/analytics`) - Traffic insights
- **Profile** (`/admin/profile`) - Update account settings

### Profile Management

Update your admin profile at `/admin/profile`:

**Profile Information**
- Change username
- Update full name
- Modify email address

**Security Settings**
- Change password
- Requires current password verification
- Minimum 8 characters

**Account Details**
- View account creation date
- Check last modification time
- Account status

### API Endpoints

#### Public APIs
- `GET /api/posts` - Get all blog posts
- `GET /api/posts/[slug]` - Get single post
- `GET /api/projects` - Get all projects
- `GET /api/gallery` - Get gallery images
- `POST /api/contact` - Submit contact form
- `POST /api/guestbook` - Add guestbook entry

#### Admin APIs (Protected)
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update profile
- `POST /api/admin/change-password` - Change password
- `POST /api/admin/posts` - Create post
- `PUT /api/admin/posts/[id]` - Update post
- `DELETE /api/admin/posts/[id]` - Delete post

## 🔧 Configuration

### Email Setup

**Option 1: Gmail**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

Generate App Password:
1. Google Account → Security
2. 2-Step Verification → App passwords
3. Generate password for "Mail"

**Option 2: SendGrid**
```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=verified-sender@yourdomain.com
```

### AI Chat Configuration

Get Gemini API Key:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env.local`:
```env
GEMINI_API_KEY=your-api-key-here
```

### File Upload Configuration

Setup UploadThing:
1. Visit [uploadthing.com](https://uploadthing.com)
2. Create account and get token
3. Add to `.env.local`:
```env
UPLOADTHING_TOKEN=your-token-here
```

### Analytics Configuration

Setup Google Analytics:
1. Create GA4 property
2. Get Measurement ID
3. Add to `.env.local`:
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 📁 Project Structure

```
portfolio-website/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin panel pages
│   │   ├── profile/        # Profile settings
│   │   ├── posts/          # Blog management
│   │   ├── projects/       # Project management
│   │   └── ...
│   ├── api/                # API routes
│   │   ├── admin/          # Protected admin APIs
│   │   ├── auth/           # NextAuth endpoints
│   │   └── ...
│   ├── blog/               # Public blog pages
│   ├── projects/           # Public project pages
│   └── ...
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   ├── blog/               # Blog components
│   └── ...
├── lib/                    # Utility functions
│   ├── db.ts              # Database connection
│   ├── auth-helpers.ts    # Auth utilities
│   └── ...
├── models/                 # Mongoose models
│   ├── Admin.ts           # Admin user model
│   ├── Post.ts            # Blog post model
│   └── ...
├── public/                 # Static assets
├── scripts/                # Utility scripts
│   └── create-admin.js    # Admin creation script
├── .env.local             # Environment variables
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS config
└── package.json           # Dependencies
```

## 🔒 Security

### Authentication
- **Password Hashing:** bcrypt with 10 salt rounds
- **Session Management:** NextAuth JWT tokens
- **Protected Routes:** Middleware-based auth checks
- **CSRF Protection:** Built-in NextAuth CSRF tokens

### Best Practices
- ✅ Environment variables for sensitive data
- ✅ Input validation on client and server
- ✅ SQL injection prevention (Mongoose)
- ✅ XSS protection (React escaping)
- ✅ Rate limiting (recommended for production)

### Security Checklist
- [ ] Change default admin password
- [ ] Use strong NEXTAUTH_SECRET (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up MongoDB IP whitelist
- [ ] Use environment-specific configs
- [ ] Regular dependency updates

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Adding New Features

1. **Create Model** (if needed)
```typescript
// models/NewModel.ts
import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  // fields
});

export default mongoose.models.NewModel || mongoose.model('NewModel', schema);
```

2. **Create API Route**
```typescript
// app/api/new-feature/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // logic
  return NextResponse.json({ data });
}
```

3. **Create Admin Page**
```typescript
// app/admin/new-feature/page.tsx
export default function NewFeaturePage() {
  return <div>Admin UI</div>;
}
```

4. **Add to Sidebar**
```typescript
// components/admin/AdminSidebar.tsx
<Link href="/admin/new-feature">
  <button>New Feature</button>
</Link>
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Error: connect ECONNREFUSED
```
Solution: Check MongoDB is running and MONGODB_URI is correct

**NextAuth Error**
```
[next-auth][error][NO_SECRET]
```
Solution: Set NEXTAUTH_SECRET in `.env.local`

**Build Errors**
```
Type error: Cannot find module
```
Solution: Run `npm install` and restart dev server

**Admin Login Not Working**
```
Error: Admin not found
```
Solution: Run `node scripts/create-admin.js` or visit `/api/admin/setup`

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Maulido Syahbani**
- Website: [syoverly.my.id](https://syoverly.my.id)
- GitHub: [@maulido](https://github.com/maulido)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Hosting platform
- [MongoDB](https://www.mongodb.com/) - Database
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Google Gemini](https://ai.google.dev/) - AI integration

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact via website contact form
- Email: maulido.syahbani01@gmail.com

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ using Next.js and TypeScript**
# Test auto-sync
