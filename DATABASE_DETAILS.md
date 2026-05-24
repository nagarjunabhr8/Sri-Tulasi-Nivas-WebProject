# Database Configuration & Access Details

## Current Environment: LOCAL DEVELOPMENT

### Database Type: H2 (Embedded In-Memory)

```
Type: H2 Database (Embedded)
Mode: In-memory with PostgreSQL compatibility
Scope: Development & Testing
Data Persistence: None (lost on restart)
```

---

## Connection Details - LOCAL PROFILE

```yaml
Driver: org.h2.Driver
URL: jdbc:h2:mem:sri_tulasi_nivas
Username: sa
Password: (empty)
```

**URL Parameters:**
- `mem:` - In-memory database
- `sri_tulasi_nivas` - Database name
- `DB_CLOSE_DELAY=-1` - Don't close immediately
- `MODE=PostgreSQL` - PostgreSQL compatibility

### H2 Console Access

**URL**: http://localhost:8080/h2-console

**Login Credentials:**
- Driver: `org.h2.Driver`
- JDBC URL: `jdbc:h2:mem:sri_tulasi_nivas`
- User: `sa`
- Password: (empty)

---

## Connection Details - PRODUCTION PROFILE

```yaml
Driver: org.postgresql.Driver
URL: jdbc:postgresql://${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}
Username: ${AZURE_MI_NAME}
Password: Managed by Azure
Port: 5432
```

**Required Environment Variables:**
```
DATABASE_HOST=your-host.postgres.database.azure.com
DATABASE_PORT=5432
DATABASE_NAME=sri_tulasi_nivas
AZURE_MI_NAME=your-managed-identity
```

---

## Database Tables

| Table | Purpose | Status |
|-------|---------|--------|
| users | User accounts & authentication | ✅ Active |
| apartments | Apartment listings | ✅ Active |
| events | Community events | ✅ Active |
| tenant_apartments | Tenant-apartment relationships | ✅ Active |
| event_contributions | Event payments tracking | ✅ Active |

---

## Database Status Check

| Check | Status | Details |
|-------|--------|---------|
| Backend Connectivity | ✅ | Responsive on port 8080 |
| Users Table | ✅ | 4+ test records |
| Authentication | ✅ | Login working |
| Password Storage | ✅ | BCrypt(12) hashing |
| JWT Generation | ✅ | Tokens created |
| Auto-DDL | ✅ | Tables created automatically |

---

## Test Data in Database

```
User 1:
  Email: newuser@example.com
  Password: Test@12345
  Role: TENANT
  Status: Active

User 2:
  Email: authtest1@example.com
  Password: SecurePass123!
  Role: OWNER
  Status: Active

User 3:
  Email: logintest@example.com
  Password: TestPass123!
  Role: TENANT
  Status: Active
```

---

## Known Issues & Solutions

### Issue: Data Lost on Restart

**Cause**: H2 in-memory database by design
**Solution**: This is expected for local dev. Use PostgreSQL for persistence.

### Issue: H2 Console 404 Error

**Cause**: Backend not running
**Solution**: Start backend with: `mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"`

### Issue: "User not found" on Login

**Cause**: Database tables not initialized
**Solution**: Register a new user first, then login

### Issue: Connection Refused

**Cause**: Backend not started or wrong profile
**Solution**: Verify Spring profile is set to "local"

---

## Configuration Files

### Local Profile: `/backend/application-local.yml`

**Current Settings:**
- Database: H2 in-memory
- Hibernate DDL: update (auto-creates tables)
- Show SQL: true (logs queries)
- H2 Console: enabled at /h2-console

### Production Profile: `/backend/application.yml`

**Current Settings:**
- Database: PostgreSQL
- Hibernate DDL: validate (checks schema)
- Show SQL: false (no query logs)
- Authentication: Azure Managed Identity

---

## How to Switch Profiles

### Run with Local Profile (Current)

```bash
export JAVA_HOME="/c/Program Files/Java/jdk-17"
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
```

### Run with Production Profile

```bash
# Set environment variables first
export DATABASE_HOST=your-postgres-server.postgres.database.azure.com
export DATABASE_PORT=5432
export DATABASE_NAME=sri_tulasi_nivas
export AZURE_MI_NAME=your-managed-identity

# Run with production profile
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=production"
```

---

## Hibernate Configuration

### Local Profile (H2)

```yaml
jpa:
  database-platform: org.hibernate.dialect.H2Dialect
  hibernate:
    ddl-auto: update  # Auto-create/update tables
  show-sql: true      # Log all SQL queries
```

### Production Profile (PostgreSQL)

```yaml
jpa:
  database-platform: org.hibernate.dialect.PostgreSQLDialect
  hibernate:
    ddl-auto: validate  # Don't modify schema
  show-sql: false       # Don't log queries
```

---

## Security Considerations

### Local (Development)
- ✅ BCrypt password hashing (12 rounds)
- ✅ JWT token authentication
- ⚠️ No password on H2 (intentional)
- ⚠️ No SSL/TLS (local only)

### Production Requirements
- ✅ Strong database password
- ✅ Azure Managed Identity
- ✅ SSL/TLS connection
- ✅ Network isolation
- ✅ Regular backups
- ✅ Audit logging

---

## Common SQL Queries for Inspection

```sql
-- View all users
SELECT id, email, first_name, last_name, role, is_active FROM users;

-- Count users by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Check verified emails
SELECT email, email_verified, created_at FROM users ORDER BY created_at DESC;

-- View active users
SELECT email, role FROM users WHERE is_active = true;

-- Check password hashes (first 20 chars)
SELECT email, SUBSTRING(password, 1, 20) as hash_start FROM users;
```

---

## Access Issues Checklist

- [ ] Backend is running on port 8080
- [ ] Active profile is set to "local"
- [ ] Tables are created (check Hibernate logs)
- [ ] At least one user is registered
- [ ] JDBC driver is available (H2 in Maven dependencies)
- [ ] No connection timeout errors in logs
- [ ] Memory is not exhausted (in-memory DB size)

---

## Summary

| Aspect | Value |
|--------|-------|
| Current DB Type | H2 In-Memory |
| Connection Status | ✅ Working |
| Test Data | ✅ Present |
| Authentication | ✅ Functional |
| Password Security | ✅ BCrypt(12) |
| Data Persistence | ❌ No (in-memory only) |
| Multi-Instance | ❌ Single JVM only |
| Console Access | ✅ At /h2-console |

**Overall Status**: ✅ Database running and fully functional

For production, migrate to PostgreSQL using the production profile configuration.
