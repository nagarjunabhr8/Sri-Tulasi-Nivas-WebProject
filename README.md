# Sri Tulasi Nivas - Professional Apartment Management Platform

A modern, secure, full-stack web application for managing apartment communities with built-in payment processing, user authentication, and event management.

## 🏗️ Architecture

### Client-Server Architecture
- **Frontend**: React.js single-page application (SPA)
- **Backend**: Java Spring Boot REST API
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Processing**: Stripe integration

### MVC Pattern Implementation
```
Backend:
  ├── Controllers (REST endpoints)
  ├── Services (Business logic)
  ├── Repositories (Data access)
  └── Entities (Data models)

Frontend:
  ├── Components (Reusable UI)
  ├── Pages (Page components)
  ├── Store (State management - Zustand)
  └── Utils (HTTP client, helpers)
```

## 🔐 Security Features

✅ **JWT Authentication**: Secure token-based authentication
✅ **Password Encryption**: BCrypt with 12 salt rounds
✅ **CORS Protection**: Configured for specific domains only
✅ **Role-Based Access Control**: ADMIN, OWNER, TENANT, GUEST roles
✅ **CSRF Protection**: Built into Spring Security
✅ **Data Encryption**: Sensitive data encrypted at rest
✅ **API Rate Limiting**: Prevent abuse and DDoS attacks
✅ **Input Validation**: All endpoints validate input

## 📋 Features

### User Management
- User registration with role selection
- Secure login with JWT tokens
- User profile management
- Role-based dashboard

### Apartment Management
- Browse available apartments
- View apartment details
- Owner can manage their listings
- Filter and pagination

### Event Management
- View upcoming community events
- Event details and descriptions
- Fundraising progress tracking
- Event contribution features

### Payment Processing
- Stripe integration for secure payments
- Event contribution payment handling
- Payment status tracking
- Transaction history

## 🚀 Getting Started

### Backend Setup

1. **Prerequisites**
   - Java 17+
   - Maven 3.8+
   - PostgreSQL 13+

2. **Database Setup**
   ```bash
   createdb sri_tulasi_nivas
   psql -d sri_tulasi_nivas < docs/DATABASE_SETUP.md
   ```

3. **Configuration**
   ```bash
   cp backend/.env.example backend/.env
   # Update .env with your values
   ```

4. **Build & Run**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend Setup

1. **Prerequisites**
   - Node.js 18+
   - npm or yarn

2. **Installation**
   ```bash
   cd frontend
   npm install
   ```

3. **Configuration**
   ```bash
   cp frontend/.env.example frontend/.env
   # Update .env with your API URL and Stripe key
   ```

4. **Development Server**
   ```bash
   npm start
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 📝 API Documentation

### Authentication Endpoints
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
GET  /api/auth/health - Health check
```

### Apartment Endpoints
```
GET  /api/apartments/public                - Browse available apartments
GET  /api/apartments/owner/{ownerId}       - Get owner's apartments
POST /api/apartments                       - Create apartment (Auth required)
PUT  /api/apartments/{id}                  - Update apartment (Auth required)
DELETE /api/apartments/{id}                - Delete apartment (Auth required)
```

### Event Endpoints
```
GET  /api/events/public/upcoming           - Get upcoming events
GET  /api/events/{id}                      - Get event details
POST /api/events                           - Create event (Admin only)
PUT  /api/events/{id}                      - Update event (Admin only)
```

### Payment Endpoints
```
POST /api/payments/create-intent           - Create payment intent
POST /api/payments/confirm                 - Confirm payment
```

## 🌐 Deployment

### To Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### To Production (Backend)
See [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 📊 Database Schema

The application uses 5 main tables:
- **users**: User accounts and roles
- **apartments**: Apartment listings
- **tenant_apartments**: Tenant-apartment relationships
- **events**: Community events
- **event_contributions**: Event contribution tracking

See [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) for full schema

## 🛠️ Environment Variables

### Backend (.env)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=sri_tulasi_nivas
DATABASE_USER=postgres
DATABASE_PASSWORD=password
JWT_SECRET=your-secret-key
STRIPE_API_KEY=sk_test_xxx
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## 📱 Responsive Design

The frontend is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📞 Support & Contact

For issues or questions:
- 📧 support@qualitycrafted.live
- 🌐 https://qualitycrafted.live

## 📄 License

This project is proprietary to Sri Tulasi Nivas Community Management.

---

**Version**: 1.0.0  
**Last Updated**: March 20, 2026  
**Maintainer**: Sri Tulasi Nivas Development Team
