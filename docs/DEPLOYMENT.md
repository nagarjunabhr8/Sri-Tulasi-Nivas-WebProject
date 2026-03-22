# Deployment Guide

## Recommended Architecture

| Layer    | Platform              | Cost  |
|----------|-----------------------|-------|
| Frontend | **Vercel**            | Free  |
| Backend  | **Render**            | Free  |
| Database | **Neon (PostgreSQL)** | Free  |

---

## Step 1 — Set up Neon Database (Free PostgreSQL)

1. Go to [neon.tech](https://neon.tech) → **Sign up** (GitHub login is fastest)
2. **New Project** → Name it `sri-tulasi-nivas` → Region: **Asia Pacific (Singapore)**
3. On the dashboard, click **Connection Details** → copy the **Connection string**, it looks like:
   ```
   postgresql://neondb_owner:<password>@ep-xxx-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Note the individual parts you will need for Render env vars:
   - `DATABASE_HOST` = `ep-xxx-xxx.ap-southeast-1.aws.neon.tech`
   - `DATABASE_PORT` = `5432`
   - `DATABASE_NAME` = `neondb`
   - `DATABASE_USER` = `neondb_owner`
   - `DATABASE_PASSWORD` = `<the password from the connection string>`

---

## Step 2 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → **Sign up** (GitHub login)
2. **New** → **Web Service** → **Connect GitHub repo** → select `Sri-Tulasi-Nivas-WebProject`
3. Settings:
   - **Name**: `sri-tulasi-nivas-api`
   - **Root Directory**: `backend`
   - **Environment**: **Docker** (Render will detect the `Dockerfile` automatically)
   - **Branch**: `main`
   - **Plan**: Free
4. Under **Environment Variables**, add all of these:

   | Key | Value |
   |-----|-------|
   | `DATABASE_HOST` | `ep-xxx.ap-southeast-1.aws.neon.tech` |
   | `DATABASE_PORT` | `5432` |
   | `DATABASE_NAME` | `neondb` |
   | `DATABASE_USER` | `neondb_owner` |
   | `DATABASE_PASSWORD` | `<neon password>` |
   | `JWT_SECRET` | Generate: a 64+ character random string |
   | `JWT_EXPIRATION` | `86400000` |
   | `JWT_REFRESH_EXPIRATION` | `604800000` |
   | `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
   | `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
   | `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` |
   | `CORS_ALLOWED_ORIGINS` | (set after Vercel gives you a URL, see Step 3) |
   | `STRIPE_API_KEY` | Your Stripe secret key (or leave empty) |

5. Click **Create Web Service** — Render will build and deploy.
6. Your backend URL will be: `https://sri-tulasi-nivas-api.onrender.com`
   - Health check: `https://sri-tulasi-nivas-api.onrender.com/api/auth/login` (should return 400/405, not 404)

> **Note**: Free tier services sleep after 15 minutes of inactivity. First request after idle takes ~30 seconds to wake up. Upgrade to the $7/month Starter plan to disable sleep.

---

## Step 3 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. **Add New Project** → Import `Sri-Tulasi-Nivas-WebProject`
3. Settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`  ← **Important: must be `frontend`, not root**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
4. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_BASE_URL` | `https://sri-tulasi-nivas-api.onrender.com/api` |
   | `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key (or leave empty) |

5. Click **Deploy**.
6. Your frontend URL will be: `https://sri-tulasi-nivas-xxx.vercel.app`

---

## Step 4 — Wire CORS (backend must allow frontend URL)

1. Go back to **Render** → your backend service → **Environment**
2. Update `CORS_ALLOWED_ORIGINS`:
   ```
   https://sri-tulasi-nivas-xxx.vercel.app
   ```
   If you also have a custom domain, add both comma-separated:
   ```
   https://sri-tulasi-nivas-xxx.vercel.app,https://qualitycrafted.live
   ```
3. Render will auto-redeploy. Frontend can now call the backend without CORS errors.

---

## Step 5 — Custom Domain (Optional)

### Frontend (Vercel)
1. Vercel → Project Settings → Domains → Add `qualitycrafted.live`
2. Add a CNAME record at your DNS provider pointing to `cname.vercel-dns.com`

### Backend (Render)
1. Render → Service Settings → Custom Domains → Add `api.qualitycrafted.live`
2. Add a CNAME record pointing to your Render service URL
3. Update `CORS_ALLOWED_ORIGINS` and `REACT_APP_API_BASE_URL` accordingly

---

## Env Var Quick Reference

### Render (Backend) must have:
```
DATABASE_HOST=<neon host>
DATABASE_PORT=5432
DATABASE_NAME=neondb
DATABASE_USER=neondb_owner
DATABASE_PASSWORD=<neon password>
JWT_SECRET=<64+ char random string>
TWILIO_ACCOUNT_SID=<your sid>
TWILIO_AUTH_TOKEN=<your token>
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Vercel (Frontend) must have:
```
REACT_APP_API_BASE_URL=https://sri-tulasi-nivas-api.onrender.com/api
```

---



## Backend Deployment (Java Spring Boot)

### Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL database
- Stripe account for payment processing

### Steps

1. **Build the application:**
   ```bash
   cd backend
   mvn clean package
   ```

2. **Create `.env` file with production values:**
   ```
   DATABASE_HOST=your-db-host
   DATABASE_PORT=5432
   DATABASE_NAME=sri_tulasi_nivas
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your-secure-password
   JWT_SECRET=your-long-secure-jwt-secret-min-32-chars
   STRIPE_API_KEY=sk_live_your_stripe_key
   CORS_ALLOWED_ORIGINS=https://qualitycrafted.live
   ENVIRONMENT=production
   ```

3. **Run the application:**
   ```bash
   java -jar target/apartment-management-system-1.0.0.jar
   ```

4. **Deploy to production:**
   - Use Railways, Render, or Heroku
   - Set environment variables in the platform
   - Enable HTTPS

## Frontend Deployment (React to Vercel)

### Steps

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Set environment variables in Vercel:**
   ```
   REACT_APP_API_BASE_URL=https://your-backend-api.com/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
   ```

4. **Deploy:**
   ```bash
   cd frontend
   vercel --prod
   ```

5. **Configure custom domain:**
   - In Vercel dashboard, go to Settings > Domains
   - Add `qualitycrafted.live` as custom domain
   - Update DNS records with Vercel nameservers

## Security Checklist

✅ JWT tokens properly secured
✅ CORS configured for your domain only
✅ Database connection encrypted
✅ Environment variables never committed to Git
✅ API endpoints require authentication where needed
✅ HTTPS enforced
✅ Rate limiting enabled
✅ CSRF tokens implemented
✅ Input validation on all endpoints
✅ SQL injection prevention via JPA

## Monitoring & Maintenance

- Set up error tracking (Sentry)
- Enable database backups
- Monitor API performance
- Track Stripe webhook events
- Update dependencies regularly
