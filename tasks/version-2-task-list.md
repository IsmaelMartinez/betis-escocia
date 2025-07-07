# Version 2 Task List: Peña Bética Escoces

## 🚀 **Planned Features for Version 2**

### 🗄️ **Database Migration**

- Migrate Orders System to Supabase
  - Create `orders` table with customer info, product details, status tracking
  - Implement order status workflow and fulfillment tracking
  - Update `/api/orders` route to use Supabase instead of `data/orders.json`

- Migrate Merchandise Catalog to Supabase
  - Create `merchandise` table for product catalog with inventory tracking
  - Add support for categories, sizes, colors, stock levels
  - Update `/api/merchandise` route to use Supabase instead of `data/merchandise.json`

- Migrate Voting System to Supabase
  - Create `voting_campaigns`, `votes`, and `pre_orders` tables
  - Implement voting logic with duplicate prevention
  - Update `/api/camiseta-voting` route to use Supabase instead of `data/camiseta-voting.json`

- Update Supabase schema with core tables and RLS policies
  - Design database schema for Contact, Orders, Merchandise, and Voting systems
  - Implement Row Level Security for data protection
  - Add indexes for performance optimization

- Data migration scripts for existing JSON data to Supabase
  - Create scripts to migrate existing data from JSON files
  - Ensure data integrity during migration process
  - Backup and validate migrated data

- Remove file system dependencies for migrated systems
  - Remove `fs`, `path`, and file system imports from migrated APIs
  - Delete unused JSON data files
  - Clean up data directory and file handling utilities

### ⚽ **Static Partidos Section**

- Implement static partidos section
  - Display incoming games only (no results or dynamic updates)
  - Ensure responsive design and accessibility

### 🎨 **UI/UX Enhancements**

- Improve visual design and brand consistency
- Add loading states and error messages consistency across all forms
- Enhance form validation and user feedback

### 📊 **Admin Features**

- Develop admin dashboard for RSVP management and statistics
- Add email notifications for new RSVPs and orders
- Integrate analytics and usage monitoring
- Provide data export capabilities for admin users
- Implement GDPR compliance tools and user data management

### 🔮 **Future Evaluation**

- Assess optional features based on community feedback
- Consider advanced features like multi-language support
- Evaluate Porra system necessity and user demand
  - Analyze current usage patterns and community interest
  - Decide whether to migrate to Supabase or discontinue

---

## 📁 **Technical Stack for Version 2**

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel (Frontend) + Supabase (Database)
- **Storage**: Supabase Storage for images, PostgreSQL for data
- **Auth**: Admin authentication for dashboard
- **GDPR**: Automated data retention policies

---

## 🎯 **Next Steps**

1. Finalize database schema for Orders, Merchandise, and Voting systems.
2. Develop static partidos section.
3. Implement admin dashboard and monitoring features.
4. Conduct community feedback sessions for future enhancements.
