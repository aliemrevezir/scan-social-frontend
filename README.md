# ScanSocial Frontend

TikTok Influencer Analyzer platform - A Next.js application for brands to discover influencers, analyze content, and manage marketing campaigns.

## 🚀 Features

- **Influencer Discovery**: Search and discover TikTok influencers based on keywords
- **Content Analysis**: AI-powered transcript analysis and labeling
- **Campaign Management**: Create, manage, and track influencer campaigns
- **Analytics Dashboard**: Comprehensive analytics and performance metrics
- **Role-Based Access**: Separate dashboards for brands and influencers
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, Headless UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Heroicons, Lucide React

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd scan-social-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-here

# External APIs
NEXT_PUBLIC_RAPIDAPI_KEY=your-rapidapi-key
NEXT_PUBLIC_APIFY_TOKEN=your-apify-token

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
```

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

## 🎨 Design System

### Brand Colors

- **Primary Green**: `#147951` - Main brand color for CTAs and highlights
- **Accent Turquoise**: `#6DD5DE` - Secondary accents and hover states
- **Dark Grey**: `#3C4042` - Text and headlines
- **Soft Grey**: `#EFEFEF` - Borders and backgrounds
- **White**: `#FFFFFF` - Main background

### Typography

- **Headings**: Montserrat (Bold, Semi-Bold, Medium)
- **Body Text**: Inter (Regular, 14-16px)
- **Captions**: Inter Medium (12px)

### Usage

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Button variants
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="accent">Accent Action</Button>

// Status badges
<Badge variant="published">Published</Badge>
<Badge variant="pending">Pending</Badge>
<Badge variant="approved">Approved</Badge>
```

## 📁 Project Structure

```
scan-social-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── badge.tsx
│   └── lib/
│       └── utils.ts           # Utility functions
├── public/                     # Static assets
├── .env.example               # Environment variables example
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## 🔐 Authentication

The application uses JWT-based authentication with access and refresh tokens:

- Login/Register endpoints via backend API
- Token storage in HTTP-only cookies (recommended) or localStorage
- Automatic token refresh on expiry
- Role-based routing (Brand vs Influencer)

## 📱 Key Pages

### Brand Dashboard
- Campaign creation and management
- Influencer discovery and search
- Application review and approval
- Analytics and reporting

### Influencer Dashboard
- Campaign browsing
- Application submission
- Content submission tracking
- Profile management

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build Docker image
docker build -t scan-social-frontend .

# Run container
docker run -p 3000:3000 scan-social-frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For questions or issues, please contact the development team.

---

Built with ❤️ using Next.js and Tailwind CSS
