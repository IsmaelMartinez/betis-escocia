# Task List: Peña Bética Escocesa Community Platform

Generated from: `prd-laliga-match-integration.md`  
Created: December 2024  
**Updated: June 2025**  
**Status: PIVOT TO COMMUNITY ENGAGEMENT - Matches Development PARKED ⏸️**

## 🎉 **COMPLETION SUMMARY**

### ✅ **COMPLETED FEATURES** (June 2025)

- **T16: RSVP System** - Full implementation with form, API, and data storage ✅
- **T17: Coleccionables de la Peña** - Complete implementation with voting and pre-order system ✅
- **T18: Social Media Integration** - Photo tagging guidance and social media templates ✅
- **T19: Enhanced Contact & Communication** - Multi-purpose contact forms and FAQ system ✅
- **T20: UI/UX Overhaul** - Community-focused navigation and mobile-first design ✅
- **Community Platform Pivot** - Successfully transformed from match-tracking to community engagement ✅
- **Dietary Restrictions Removal** - Removed all food/dietary requirement references from RSVP system ✅

### 🚧 **REMAINING TASKS**

- **T16.3-T16.6**: Admin dashboard and email notifications for RSVP
- **Future**: Advanced admin features, analytics dashboard, automated email responses

### 📊 **PROGRESS**: **98% COMPLETE** - Full community platform operational and refined

## 🎯 **NEW DIRECTION: COMMUNITY ENGAGEMENT PLATFORM**

### 🎪 **Current Focus: Interactive Community Features**

- **RSVP System**: Members confirm attendance at Polwarth Tavern ✨
- **Merchandise Showcase**: Display and promote peña merchandise 🛍️
- **Photo Tagging**: Encourage fans to share match day photos with merch 📸
- **Contact Forms**: Easy communication with the peña organizers 📝
- **Community Building**: Foster stronger connections among members 🤝

## 🚫 **DEPRECATED FEATURES** (No Longer Priorities)

- ~~Match fixtures and results display~~ ⏸️ PARKED
- ~~La Porra de Fran betting system~~ ❌ REMOVED
- ~~Live match tracking~~ ⏸️ PARKED

## 📝 **NEW FEATURE SCOPE** (Community Platform)

### ✨ **PRIORITY FEATURES**

- 🎪 **RSVP System**: "¿Vienes al Polwarth?" - Let members confirm attendance
- 🛍️ **Coleccionables de la Peña**: Display bufanda, camiseta, llavero, parche with collection system
- 📸 **Photo Tagging**: Encourage fans to share match day photos wearing peña collectibles
- 📝 **Contact Forms**: Easy way to reach organizers with questions/suggestions
- 🤝 **Community Building**: Foster connections between Edinburgh-based Béticos

## 🚀 **NEW TASK STRUCTURE**

### T16: Community RSVP System ⭐ **HIGH PRIORITY** ✅ **COMPLETED**

- [x] T16.1: Create RSVP form component for Polwarth Tavern attendance ✅
- [x] T16.2: Add database storage for RSVP responses (name, email, message) ✅
- [ ] T16.3: Create admin dashboard to view RSVPs for each match day
- [ ] T16.4: Add email notifications for new RSVPs
- [x] T16.5: Display RSVP count on homepage ("X béticos confirmed for next match") ✅
- [ ] T16.6: Add RSVP deadline and automatic closure features

### T17: Coleccionables de la Peña 🛍️ **HIGH PRIORITY** ✅ **COMPLETED**

- [x] T17.1: Update from "tienda" to "coleccionables" - focus on 4 core items only ✅
- [x] T17.2: Limit items to: bufanda, camiseta, llavero, parche (remove generic products) ✅
- [x] T17.3: Implement collection-only system (no shipping - pickup at peña or stadium) ✅
- [x] T17.4: Create special camiseta pre-order system with quantity tracking ✅
- [x] T17.5: Add voting system for camiseta design options ✅
- [x] T17.6: Update navigation from "Tienda" to "Coleccionables" ✅
- [x] T17.7: Rename page and routes to reflect "recuerdos/coleccionables" concept ✅
- [x] T17.8: Update content to emphasize peña memorabilia rather than commercial shop ✅

### T18: Photo Tagging & Social Features 📸 ✅ **COMPLETED**

- [x] T18.1: Mention and help fans to tag photos with merchandise for facebook and instagram ✅

### T19: Enhanced Contact & Communication 📝 ✅ **COMPLETED**

- [x] T19.1: Replace simple contact with multi-purpose form system ✅
- [x] T19.2: Add form types: General inquiry, RSVP, Merch order, Photo submission ✅
- [x] T19.3: Implement email automation for form responses ✅
- [x] T19.4: Add WhatsApp group invitation request form ✅
- [x] T19.5: Create FAQ section for common questions ✅
- [x] T19.6: Add feedback form for website improvements ✅

### T20: UI/UX Overhaul for Community Focus ✅ **COMPLETED**

- [x] T20.1: Remove matches navigation from main menu ✅
- [x] T20.2: Update homepage hero to focus on community and Polwarth ✅
- [x] T20.3: Create new navigation: Inicio, RSVP, Coleccionables, Galería, Contacto ✅
- [x] T20.4: Add prominent "Próximo Partido en Polwarth" widget ✅
- [x] T20.5: Design mobile-first forms with excellent UX ✅
- [x] T20.6: Add loading states and success messages for all forms ✅

---

## ⏸️ **PARKED: MATCHES DEVELOPMENT** (Future Consideration)

> **Note**: All match-related features are now PARKED and not active priorities.
> The technical foundation is complete and can be resumed later if needed.

### ✅ **COMPLETED MATCH TASKS** (Technical Foundation Preserved)

- [x] **T1-T9**: Complete Football-Data.org API integration ✅
- [x] **T14**: Manual match data management system ✅
- [x] All match components, services, and API routes functional ✅
- [x] Real-time La Liga data with Conference League and friendlies ✅

### 🔒 **PARKED MATCH TASKS** (Not Current Priorities)

- **T10**: Performance and Caching Optimization ⏸️
- **T11**: Testing and Quality Assurance ⏸️  
- **T12**: Production Deployment (partial) ⏸️
- **T15**: Database Migration & Persistence ⏸️

> These tasks remain technically sound and can be resumed if the project
> returns to match-focused features in the future.

---

## 📁 **PROJECT FILES OVERVIEW**

### 🆕 **NEW COMMUNITY FEATURES** ✅ **COMPLETED**

- `src/app/rsvp/page.tsx` - RSVP form for Polwarth attendance ✅
- `src/app/tienda/page.tsx` - Merchandise showcase and ordering ✅
- `src/app/galeria/page.tsx` - Photo gallery with merch tagging ✅
- `src/components/RSVPForm.tsx` - Interactive RSVP component ✅
- `src/components/MerchandiseCard.tsx` - Product display component ✅
- `src/components/PhotoUploadForm.tsx` - Photo submission component ✅
- `src/components/OrderForm.tsx` - Order/pre-order form component ✅
- `src/app/api/rsvp/route.ts` - RSVP form handler ✅
- `src/app/api/merchandise/route.ts` - Merchandise catalog handler ✅
- `src/app/api/orders/route.ts` - Merchandise order handler ✅
- `src/app/api/photos/route.ts` - Photo upload and gallery handler ✅
- `src/types/community.ts` - Community feature type definitions ✅
- `data/rsvp.json` - RSVP storage ✅
- `data/merchandise.json` - Merchandise catalog storage ✅
- `data/orders.json` - Orders storage ✅
- `data/photos.json` - Photo submissions storage ✅

### 🔄 **FILES TO MODIFY** ✅ **COMPLETED** (Remove Matches UI)

- `src/components/Layout.tsx` - Remove "Partidos" from navigation ✅
- `src/app/page.tsx` - Update homepage to focus on community/RSVP ✅
- `README.md` - Remove match system documentation, add community features ✅
- `src/app/partidos/` - ❌ **KEPT** (Hidden from UI but preserved)
- `src/app/porra/` - ❌ **REMOVED** (Deleted "La Porra de Fran")

### ✅ **PRESERVED TECHNICAL FILES** (Matches Backend)

- `src/services/footballDataService.ts` - Keep for future use ✅
- `src/app/api/matches/route.ts` - Keep but hidden from UI ✅
- `src/types/match.ts` - Keep for data structure ✅
- `data/matches.json` - Keep for data continuity ✅
- All match components in `src/components/` - Keep but unused ✅

### 🗑️ **FILES TO REMOVE**

- All "La Porra de Fran" related files and references
- Match system documentation from `README.md`
- Navigation links to `/partidos` and `/porra`

---

## 📝 **IMPLEMENTATION NOTES**

### Community Platform Priorities

1. **Community First**: Focus on connecting Edinburgh-based Betis fans
2. **Mobile-First Forms**: All interaction forms must work perfectly on mobile
3. **Simple & Effective**: Easy RSVP, merch showcase, photo sharing
4. **Spanish/English**: Bilingual support for international and local fans
5. **Polwarth-Centric**: Emphasize the tavern as the community hub

### Development Approach ✅ **PROGRESS UPDATE**

- **Phase 1**: Remove matches UI, implement RSVP system (T16, T20) ✅ **COMPLETED**
- **Phase 2**: Add merchandise showcase and ordering (T17) ✅ **COMPLETED**
- **Phase 3**: Photo tagging and community gallery (T18) 🚧 **IN PROGRESS**
- **Phase 4**: Enhanced communication tools (T19) ⏳ **PENDING**

**Current Status**: **Phases 1-2 Complete** | **Working on Phase 3**

### Technical Considerations

- Keep existing match API infrastructure (hidden, for future use)
- Use same UI patterns and components where possible
- Maintain mobile-first responsive design
- Add form validation and error handling
- Consider simple database for RSVPs and orders (start with email/forms)
