# PostgreSQL Database Setup

## Creating Database Schema

```sql
-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'GUEST',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create apartments table
CREATE TABLE apartments (
    id BIGSERIAL PRIMARY KEY,
    unit_number VARCHAR(50) NOT NULL,
    floor INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    maintenance_fee DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    owner_id BIGINT NOT NULL REFERENCES users(id),
    description TEXT,
    amenities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tenant_apartments table
CREATE TABLE tenant_apartments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES users(id),
    apartment_id BIGINT NOT NULL REFERENCES apartments(id),
    lease_start_date TIMESTAMP,
    lease_end_date TIMESTAMP,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    estimated_budget DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PLANNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create event_contributions table
CREATE TABLE event_contributions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    event_id BIGINT NOT NULL REFERENCES events(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50),
    payment_intent_id VARCHAR(255),
    contributed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_apartments_owner ON apartments(owner_id);
CREATE INDEX idx_apartments_status ON apartments(status);
CREATE INDEX idx_tenant_apartments_tenant ON tenant_apartments(tenant_id);
CREATE INDEX idx_tenant_apartments_apartment ON tenant_apartments(apartment_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_contributions_user ON event_contributions(user_id);
CREATE INDEX idx_contributions_event ON event_contributions(event_id);
CREATE INDEX idx_contributions_payment ON event_contributions(payment_intent_id);
```

## Connecting to Database

Update your `.env` file with:
```
DATABASE_HOST=your_postgres_host
DATABASE_PORT=5432
DATABASE_NAME=sri_tulasi_nivas
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
```
