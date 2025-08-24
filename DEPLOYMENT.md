# Vercel Deployment Guide

## Prerequisites
- Vercel account
- Git repository connected to Vercel
- Backend API deployed (for production)

## Quick Deploy to Vercel

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Follow the prompts
```

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set root directory to `frontend/`
5. Configure environment variables (see below)
6. Deploy!

## Environment Variables

### Required Environment Variables in Vercel:
- `NEXT_PUBLIC_API_URL` - Your backend API URL (e.g., `https://your-api.vercel.app`)

### Setting Environment Variables:
1. In Vercel Dashboard → Project → Settings → Environment Variables
2. Add:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-backend-api-url.com
   Environment: Production, Preview, Development
   ```

## Configuration Files
- `vercel.json` - Vercel deployment configuration
- `.vercelignore` - Files to ignore during deployment
- `.env.example` - Environment variables template

## Build Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`
- **Root Directory**: `frontend/`

## Project Structure
```
frontend/
├── vercel.json          # Vercel configuration
├── .vercelignore        # Deployment ignore file
├── .env.example         # Environment template
├── package.json         # Build scripts and dependencies
└── src/                 # Application source
```

## Deployment Scripts
- `npm run build` - Production build
- `npm run preview` - Local preview of production build
- `npm run type-check` - TypeScript validation
- `npm run lint` - ESLint validation

## Production Checklist
- [ ] Backend API deployed and accessible
- [ ] Environment variables configured in Vercel
- [ ] Build passes without errors
- [ ] TypeScript checks pass
- [ ] Linting passes
- [ ] API endpoints responding correctly

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run type-check`
- Check linting errors: `npm run lint`
- Verify all dependencies are installed

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Ensure backend is deployed and accessible
- Check CORS configuration on backend

### Performance Optimization
- Images are optimized using Next.js Image component
- Static pages are pre-rendered where possible
- Code splitting is handled automatically by Next.js

## Support
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Project Repository](https://github.com/your-repo)