# Deployment Guide

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
