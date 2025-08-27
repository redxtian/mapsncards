# Negotiation Cards Frontend

A Next.js application for managing negotiation cards with Firebase authentication and Firestore data storage.

## 🚨 Important: Deployment Configuration

**This project has recurring 404 deployment issues.** Before making any deployment changes, read [DEPLOYMENT.md](./DEPLOYMENT.md) - especially the section about the correct `vercel.json` configuration.

## Features

- 🔐 **Firebase Authentication** (Email/Password + Google Sign-in)
- 🛡️ **Protected Routes** - All card/map functionality requires login  
- 🎴 **Card Management** - Create, view, and organize negotiation cards
- 🗺️ **Network Visualization** - Interactive card relationship graphs
- 📱 **Responsive Design** - Works on desktop and mobile
- 🚫 **SEO Prevention** - No search engine crawling

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase configuration

# Run development server
npm run dev

# Open http://localhost:3000
```

## Environment Variables

Create `.env.local` with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Authentication Setup

1. **Enable Authentication** in Firebase Console:
   - Go to Authentication > Sign-in methods
   - Enable Email/Password and Google
   
2. **Update Firestore Rules** to require authentication:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## Development

```bash
# Development server
npm run dev

# Production build  
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Troubleshooting

### 404 Errors on Deployment
See the **"Recurring 404 Issue Prevention"** section in [DEPLOYMENT.md](./DEPLOYMENT.md).

### Authentication Issues  
1. Check Firebase configuration in `.env.local`
2. Verify Authentication is enabled in Firebase Console
3. Ensure Firestore rules require authentication

### Build Errors
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues  
npm run lint

# Clear Next.js cache
rm -rf .next && npm run build
```

## Technologies

- **Framework**: Next.js 15 with App Router
- **Authentication**: Firebase Auth  
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Deployment**: Vercel
