# EU4 Space Wiki - Deployment Guide

## Quick Deploy to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Framework Preset: **Vite** (auto-detected)

3. **Configure Environment Variables**
   In Vercel Dashboard → Project Settings → Environment Variables, add:
   
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://xyagurflukbuawgbcuil.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
   
   *(Copy values from `.env.example`)*

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy

---

### Option 2: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
4. **Set Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## Local Testing Before Deploy

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

Visit `http://localhost:4173` to test the production build locally.

---

## Troubleshooting

### Build Failures
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify environment variables are set in Vercel

### Runtime Errors
- Check browser console for missing environment variables
- Verify Supabase URL and keys are correct
- Ensure RLS policies allow public access where needed

---

## Post-Deployment

1. **Configure Custom Domain** (Optional)
   - Vercel Dashboard → Project → Settings → Domains
   - Add your custom domain

2. **Enable Analytics** (Optional)
   - Vercel Dashboard → Project → Analytics

3. **Set up CI/CD**
   - Automatic deployments on push to `main` branch
   - Preview deployments for pull requests

---

## Project Structure

```
dist/           # Build output (generated)
components/     # React components
lib/            # Utilities (Supabase client)
.env.example    # Environment variables template
vercel.json     # Vercel configuration
```
