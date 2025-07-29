# ADR-003: Supabase Database Selection

## Status
- **Status**: Accepted
- **Date**: 2025-07-01
- **Authors**: Development Team
- **Decision Maker**: Technical Lead

## Context
The Peña Bética Escocesa website needed to migrate from JSON file storage to a proper database solution. The requirements included:
- Store RSVP responses, merchandise orders, and contact form submissions
- GDPR compliance with data retention policies
- Free tier availability for small-scale community website
- Easy integration with existing Next.js/Vercel architecture
- Admin dashboard for data management
- Scalability for future growth

## Decision
**Supabase** was selected as the database solution, utilizing its free PostgreSQL tier.

## Consequences
### Positive
- **Generous free tier**: 500MB database, 2GB bandwidth - ample for current needs
- **Full PostgreSQL**: Complete feature set with relational database capabilities
- **GDPR compliance**: Built-in support for data deletion and retention policies
- **Admin dashboard**: Excellent web interface for data management
- **Real-time features**: Built-in subscriptions and live updates
- **Auto-generated APIs**: REST and GraphQL endpoints created automatically
- **Zero cost**: Free tier covers all current and foreseeable usage

### Negative
- **Learning curve**: More complex than simple JSON storage
- **Overkill**: Many features not needed for current use case
- **Performance**: Slight latency compared to Vercel-native options

### Neutral
- **PostgreSQL standard**: Industry-standard database, easy migration path
- **Supabase ecosystem**: Growing platform with active development

## Alternatives Considered
### Option 1: Vercel Postgres
- **Pros**: Native Vercel integration, zero-config setup
- **Cons**: No free production tier, $20/month minimum cost
- **Reason for rejection**: Budget constraints for small community site

### Option 2: Turso (SQLite)
- **Pros**: Edge distribution, very fast, generous free tier
- **Cons**: SQLite limitations, newer technology, less mature ecosystem
- **Reason for rejection**: Preferred full SQL features for future growth

### Option 3: PlanetScale (MySQL)
- **Pros**: Database branching, good free tier, Vitess technology
- **Cons**: MySQL limitations (no foreign keys), complex for simple needs
- **Reason for rejection**: PostgreSQL preferred for full SQL feature set

## Implementation Notes
- Database schema includes tables for RSVPs, contact forms, and merchandise orders
- Scheduled functions implemented for GDPR compliance (3-month data retention)
- Integration with Next.js via Supabase client library
- Admin dashboard access through Supabase web interface
- Row Level Security (RLS) implemented for data protection

## References
- [Database Comparison](../../database-comparison.md)
- [Supabase Documentation](https://supabase.com/docs)
- [GDPR Implementation Notes](../../security/SECURITY.md)

## Review
- **Next review date**: 2026-01-01 (6-month review)
- **Review criteria**: Usage growth, cost changes, performance issues, or GDPR requirements
