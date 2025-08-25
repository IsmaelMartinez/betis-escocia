# Database Options for Peña Bética Escocesa - Vercel Deployment

## Overview

Currently using JSON files for data storage. Need to migrate to a proper database for:
- RSVP responses
- Contact form submissions  
- Admin analytics

## Top Database Options for Vercel

### 1. 🟡 **Supabase** (RECOMMENDED FOR FREE TIER)

#### ✅ **Pros:**
- **Full PostgreSQL**: Complete Postgres with all features
- **Real-time Features**: Live subscriptions, real-time updates
- **Built-in Auth**: User authentication system included
- **Row Level Security**: Fine-grained permissions, requiring correct JWT configuration (e.g., Clerk JWKS URL in Supabase settings) for proper enforcement.
- **Admin Dashboard**: Excellent web interface for data management
- **API Auto-generation**: REST and GraphQL APIs generated automatically
- **Storage**: Built-in file storage for images/documents
- **Generous Free Tier**: Up to 500MB database, 2GB bandwidth

#### ❌ **Cons:**
- **Learning Curve**: More complex setup and concepts
- **Overkill**: Many features we don't need (auth, storage, etc.)
- **Performance**: Slight latency compared to Vercel-native options
- **Configuration**: Requires more setup for optimal performance

#### 💰 **Pricing:**
- **Free**: 500MB database, 2GB bandwidth, 50MB file storage
- **Pro**: $25/month (8GB database, 250GB bandwidth, 100GB storage)
- **Team**: $599/month (multiple projects)

#### 🏗️ **Best For:**
- Need real-time features
- Want built-in authentication
- Planning to scale significantly
- Want comprehensive admin tools
- **Need a free tier for RSVP/PII data**

#### 🛡️ **GDPR/PII Handling:**
- You can schedule a function (Edge Function or cron) to wipe or anonymize PII (name/email) every 3 months, keeping only RSVP counts for analytics.

---

### 2. 🔵 **Turso** (ALSO FREE, SIMPLE USE CASES)

#### ✅ **Pros:**
- **Edge Distribution**: SQLite databases replicated to edge locations
- **Fast Performance**: Local-like performance with edge replication
- **Generous Free Tier**: 500 databases, 1GB storage, 1B row reads
- **Simple SQL**: Standard SQLite, familiar to developers
- **Low Latency**: Data close to users worldwide
- **Cost Effective**: Very affordable scaling

#### ❌ **Cons:**
- **SQLite Limitations**: No complex joins, limited concurrent writes
- **Newer Technology**: Less mature than PostgreSQL solutions
- **Limited Ecosystem**: Fewer tools and integrations
- **Write Conflicts**: Potential issues with simultaneous writes

#### 💰 **Pricing:**
- **Starter**: Free (500 databases, 1GB storage, 1B row reads)
- **Scaler**: $29/month (10K databases, 500GB storage, 1B row reads)

#### 🏗️ **Best For:**
- Global applications needing low latency
- Simple data models (like RSVP table)
- Read-heavy workloads
- Budget optimization
- **Need a free tier for RSVP/PII data**

#### 🛡️ **GDPR/PII Handling:**
- You can run a scheduled job (using Vercel Cron or similar) to delete or anonymize PII every 3 months, keeping only RSVP counts.

---

### 3. 🟢 **Vercel Postgres** (NOT RECOMMENDED FOR FREE TIER)

#### ✅ **Pros:**
- **Native Integration**: Built specifically for Vercel, zero-config setup
- **Edge-Optimized**: Built on Neon, designed for serverless/edge functions
- **Simple Pricing**: $20/month for 0.5 GB, includes connection pooling
- **Automatic Scaling**: Handles traffic spikes automatically
- **Built-in Security**: Row Level Security (RLS), encryption at rest
- **Easy Migrations**: Simple SQL-based schema management
- **Connection Pooling**: Built-in, no additional configuration needed

#### ❌ **Cons:**
- **Cost**: No free production tier, only development/testing allowance
- **Vendor Lock-in**: Tied to Vercel ecosystem
- **Limited Free Tier**: Only development/testing allowance

#### 💰 **Pricing:**
- **Hobby**: Free for development (limited)
- **Pro**: $20/month (0.5 GB storage, 1M rows, 1k concurrent connections)
- **Enterprise**: Custom pricing

#### 🏗️ **Best For:**
- Projects already on Vercel
- Need zero-config setup
- Want built-in optimizations
- Priority on simplicity
- **Not suitable for free production use**

---

### 4. 🟠 **PlanetScale** (MySQL ALTERNATIVE)

#### ✅ **Pros:**
- **Branching**: Git-like database branching for safe schema changes
- **MySQL Compatibility**: If team prefers MySQL over PostgreSQL
- **Generous Free Tier**: 1GB storage, 10GB bandwidth
- **Vitess Technology**: Battle-tested at scale (used by YouTube)
- **Zero-downtime Migrations**: Safe schema changes in production
- **Excellent CLI**: Great developer experience

#### ❌ **Cons:**
- **MySQL Limitations**: No foreign keys, some PostgreSQL features missing
- **Complex for Simple Projects**: Branching overhead for basic needs
- **Less Integration**: Not as tightly integrated with Vercel as Postgres
- **Learning Curve**: Branching workflow requires understanding

#### 💰 **Pricing:**
- **Hobby**: Free (1GB storage, 10GB bandwidth)
- **Scaler**: $39/month (10GB storage, 100GB bandwidth)
- **Scaler Pro**: $99/month (100GB storage, 1TB bandwidth)

#### 🏗️ **Best For:**
- Teams familiar with MySQL
- Need branching for complex schema changes
- Want zero-downtime deployments
- Budget-conscious projects

---

### 5. 🟣 **Railway** (FULL-STACK PLATFORM)

#### ✅ **Pros:**
- **PostgreSQL + MySQL**: Choice of database engines
- **Simple Deployment**: Git-based deployments
- **Reasonable Pricing**: $5/month for hobby projects
- **Built-in Metrics**: Monitoring and analytics included
- **Easy Scaling**: Simple resource adjustments

#### ❌ **Cons:**
- **Platform Lock-in**: Not just database, full platform commitment
- **Less Vercel Integration**: Additional configuration needed
- **Smaller Community**: Less documentation and support

#### 💰 **Pricing:**
- **Trial**: $5 credit to start
- **Hobby**: $5/month per service
- **Pro**: $20/month per service

---

## 🎯 **RECOMMENDATION FOR PEÑA BÉTICA ESCOCESA**

### **Primary Choice: Supabase (Free Tier)**

**Why it's perfect for this project:**

1. **Generous Free Tier**: 500MB database, 2GB bandwidth—ample for RSVP and basic community data
2. **GDPR Compliance**: Supports scheduled jobs (via Postgres cron or Supabase Edge Functions) to regularly wipe PII (e.g., every 3 months), while keeping anonymized counts/statistics
3. **Easy Migration**: Standard Postgres, easy to import/export data
4. **Admin Dashboard**: Simple web interface for managing and reviewing data
5. **No Vendor Lock-in**: Can export data and migrate elsewhere if needed
6. **No Cost**: Free for your current and foreseeable usage

### **Alternative Choice: Turso (Free Tier, SQLite on the Edge)**

**Consider if you want:**
- Simpler, ultra-fast edge database for basic RSVP storage
- Very generous free tier (500 DBs, 1GB storage)
- Simple SQL, easy to set up
- Fewer features, but great for simple, read-heavy workloads

---

## 📋 **IMPLEMENTATION PLAN (FREE/GDPR-FOCUSED)**

### Phase 1: Setup (T24.1)
```bash
# Supabase Setup (Free Tier)
npx supabase init
# Or use the Supabase web dashboard to create a new project
```

### Phase 2: Schema Design (T24.2)
```sql
-- RSVPs table
CREATE TABLE rsvps (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT,
  match_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  anonymized BOOLEAN DEFAULT FALSE
);

-- (Optional) Add a scheduled job to anonymize or delete PII every 3 months
-- Example: Use pg_cron or Supabase Edge Functions
-- UPDATE rsvps SET name = NULL, email = NULL, message = NULL, anonymized = TRUE WHERE created_at < NOW() - INTERVAL '3 months';
```

### Phase 3: Migration Strategy (T24.3)
1. **Parallel Implementation**: Keep JSON files while building database functionality
2. **API Route Updates**: Modify existing routes to use database
3. **Data Migration**: Scripts to move existing JSON data to database
4. **Testing**: Verify all functionality works with database
5. **Cleanup**: Remove JSON files and old code

### Phase 4: Enhanced Features (T24.4)
- Admin dashboard for José Mari
- Email notifications
- Analytics and reporting
- Data export functionality

---

## 💡 **NEXT STEPS**

1. **Confirm Choice**: Supabase (free tier) fits all requirements
2. **Environment Setup**: Create database and configure environment variables
3. **Schema Implementation**: Create tables and test connections
4. **Migrate RSVP System**: Start with simplest table (RSVPs)
5. **Build Admin Interface**: Create simple dashboard for data management
6. **Schedule GDPR Cleanup**: Set up a scheduled job to anonymize or delete PII every 3 months

**Estimated Timeline**: 1-2 weeks for complete migration

**Budget Impact**: $0/month for Supabase (free tier)

---

*Note: Turso is a great alternative if you want a lightweight, edge-optimized, and free solution for simple RSVP storage. Supabase is recommended for its admin tools, flexibility, and robust free tier.*
