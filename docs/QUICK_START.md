# Quick Start Guide - Sri Tulasi Nivas

## 📦 Project Structure

```
Sri-Tulasi-Nivas-00/
├── backend/                    # Spring Boot Application
│   ├── src/main/java/
│   │   └── com/sritulasinivas/
│   │       ├── config/         # Security & CORS configuration
│   │       ├── controller/     # REST API endpoints
│   │       ├── dto/            # Data Transfer Objects
│   │       ├── entity/         # JPA Entities (Model layer)
│   │       ├── repository/     # Data Access layer
│   │       ├── security/       # JWT & authentication
│   │       ├── service/        # Business Logic layer
│   │       └── SriTulasiNivasApplication.java
│   ├── pom.xml
│   ├── application.yml
│   └── .env.example
│
├── frontend/                   # React Application
│   ├── public/                 # Static files
│   │   └── index.html          # Landing page
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── store/              # Zustand state store
│   │   ├── utils/              # HTTP client & helpers
│   │   ├── App.jsx             # Main app component
│   │   ├── index.jsx           # Entry point
│   │   └── index.css           # Global styles
│   ├── package.json
│   ├── vercel.json             # Vercel deployment config
│   └── .env.example
│
├── docs/                       # Documentation
│   ├── DATABASE_SETUP.md       # Database schema
│   ├── DEPLOYMENT.md           # Production deployment guide
│   └── QUICK_START.md
│
├── README.md                   # Main documentation
└── index (9).html             # Original landing page

```

## 🔧 Installation Steps

### Step 1: Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create .env file
cp .env.example .env

# 3. Edit .env with your local/staging values:
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_NAME=sri_tulasi_nivas
# DATABASE_USER=postgres
# DATABASE_PASSWORD=your_password
# JWT_SECRET=your-secret-jwt-key-min-32-chars
# STRIPE_API_KEY=sk_test_your_key
# CORS_ALLOWED_ORIGINS=http://localhost:3000

# 4. Ensure PostgreSQL is running

# 5. Create database (first time only)
createdb sri_tulasi_nivas

# 6. Build the project
mvn clean install

# 7. Run the application
mvn spring-boot:run
# Backend will start on http://localhost:8080
```

### Step 2: Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Create .env file
cp .env.example .env

# 3. Edit .env with:
# REACT_APP_API_BASE_URL=http://localhost:8080/api
# REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# 4. Install dependencies
npm install

# 5. Start development server
npm start
# Frontend will start on http://localhost:3000
```

## 📚 API Testing

### Using Postman/Thunder Client

1. **Register a new user:**
   ```
   POST http://localhost:8080/api/auth/register
   Content-Type: application/json

   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john@example.com",
     "phone": "+1234567890",
     "password": "SecurePass123!",
     "role": "tenant"
   }
   ```

2. **Login:**
   ```
   POST http://localhost:8080/api/auth/login
   Content-Type: application/json

   {
     "email": "john@example.com",
     "password": "SecurePass123!"
   }
   ```

3. **Get available apartments:**
   ```
   GET http://localhost:8080/api/apartments/public?page=0&size=10
   ```

4. **Get upcoming events:**
   ```
   GET http://localhost:8080/api/events/public/upcoming?page=0&size=10
   ```

## 🐳 Docker Deployment (Optional)

### Docker Compose Setup

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: sri_tulasi_nivas
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: sri_tulasi_nivas
      DATABASE_USER: postgres
      DATABASE_PASSWORD: postgres
      JWT_SECRET: your-secret-key
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_BASE_URL: http://localhost:8080/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

Run with: `docker-compose up`

## 🚀 Production Deployment

### Vercel (Frontend)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy frontend
cd frontend
vercel --prod

# 4. Set environment variables in Vercel dashboard
# REACT_APP_API_BASE_URL=https://your-api-domain/api
# REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_key

# 5. Add custom domain: qualitycrafted.live
```

### Railway/Render (Backend)

1. Push backend code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables:
   - DATABASE_URL (PostgreSQL connection string)
   - JWT_SECRET
   - STRIPE_API_KEY
   - CORS_ALLOWED_ORIGINS=https://qualitycrafted.live
4. Deploy will happen automatically on push

### Custom Domain Setup

1. Update CORS configuration to point to `https://qualitycrafted.live`
2. Update Stripe webhook URLs
3. Configure SSL certificates (automatically handled by Vercel/Railway)

## 🔒 Security Best Practices

✅ **Environment Variables**: Never commit `.env` files
✅ **JWT Tokens**: Store only in httpOnly cookies or localStorage
✅ **CORS**: Restrict to known domains only
✅ **Database**: Use strong passwords, enable SSL
✅ **API Keys**: Rotate Stripe keys regularly
✅ **Input Validation**: All inputs validated server-side
✅ **HTTPS**: Always use HTTPS in production

## 🐛 Troubleshooting

### Backend issues:
- **Port 8080 in use**: `lsof -i :8080` and kill process
- **Database connection failed**: Check PostgreSQL is running
- **Maven build failed**: Run `mvn clean` first

### Frontend issues:
- **Port 3000 in use**: `lsof -i :3000` and kill process
- **Module not found**: Run `npm install` again
- **API errors**: Check backend is running and CORS is configured

## 📞 Database Commands

```bash
# Connect to PostgreSQL
psql -U postgres -d sri_tulasi_nivas

# Common queries
\dt                    # List all tables
SELECT * FROM users;   # View all users
\q                     # Exit
```

## 🎯 Next Steps

1. **Customize Branding**: Update colors and logo
2. **Add More Features**: Dashboard analytics, user profiles
3. **Set Up CI/CD**: GitHub Actions for automated deployment
4. **Monitor Performance**: Set up Datadog or New Relic
5. **Enable Analytics**: Google Analytics integration
6. **Backup Strategy**: Automated database backups

## 📖 Useful Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe Integration Guide](https://stripe.com/docs/stripe-js)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

For detailed documentation, see:
- [README.md](./README.md) - Full project overview
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Production deployment
- [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) - Database schema
