# PathTech Academy - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd test_bolt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```

4. **Configure Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings > API
   - Update `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run Database Migrations**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link your project
   supabase link --project-ref your-project-ref

   # Run migrations
   supabase db push
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ | - |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ | - |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | ❌ | - |
| `VITE_APP_NAME` | Application name | ❌ | PathTech Academy |
| `VITE_APP_URL` | Application URL | ❌ | http://localhost:5173 |

### Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
6. Update `.env` with your client ID

## 🏗️ Build & Deploy

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Options

#### 1. Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard > Project Settings > Environment Variables
   - Add all required environment variables

3. **Deploy**
   ```bash
   vercel --prod
   ```

#### 2. Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: Add in Netlify dashboard

#### 3. GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

#### 4. Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and run**
   ```bash
   docker build -t pathtech-academy .
   docker run -p 80:80 pathtech-academy
   ```

## 🔒 Security Configuration

### Supabase Security

1. **Enable RLS (Row Level Security)**
   - Already configured in migrations
   - All tables have appropriate policies

2. **API Keys**
   - Use environment variables
   - Never commit keys to repository
   - Rotate keys regularly

3. **CORS Configuration**
   - Update Supabase CORS settings
   - Add your production domain

### Content Security Policy

Add to your deployment platform:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co;
  font-src 'self';
">
```

## 📊 Monitoring & Analytics

### Performance Monitoring

1. **Vercel Analytics** (if using Vercel)
   ```bash
   npm install @vercel/analytics
   ```

2. **Google Analytics**
   ```bash
   npm install gtag
   ```

### Error Tracking

1. **Sentry**
   ```bash
   npm install @sentry/react
   ```

2. **LogRocket**
   ```bash
   npm install logrocket
   ```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Check environment variables

2. **Supabase Connection Issues**
   - Verify URL and key
   - Check CORS settings
   - Ensure RLS policies are correct

3. **Dark Mode Not Working**
   - Check Tailwind CSS configuration
   - Verify theme context is properly wrapped

4. **Authentication Issues**
   - Check Supabase auth settings
   - Verify redirect URLs
   - Check browser console for errors

### Performance Optimization

1. **Bundle Analysis**
   ```bash
   npm install --save-dev vite-bundle-analyzer
   npx vite-bundle-analyzer
   ```

2. **Image Optimization**
   - Use WebP format
   - Implement lazy loading
   - Optimize image sizes

3. **Code Splitting**
   - Already configured in vite.config.ts
   - Routes are automatically split

## 📈 Scaling Considerations

### Database
- Monitor query performance
- Add indexes as needed
- Consider read replicas for high traffic

### CDN
- Use Vercel Edge Network
- Configure caching headers
- Optimize static assets

### Monitoring
- Set up alerts for errors
- Monitor performance metrics
- Track user engagement

## 🔐 Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] RLS policies tested
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] Dependencies updated
- [ ] Secrets rotated regularly

## 📞 Support

For deployment issues:
1. Check this documentation
2. Review error logs
3. Check Supabase dashboard
4. Contact support team

---

**Happy Deploying! 🚀**
