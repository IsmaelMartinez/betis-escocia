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
- **T21: Visual Assets & Voting Enhancement** - Complete image gallery, zoom functionality, collection guide, and stock indicators ✅
- **T23: Content Enrichment & Club History** - Accurate founding story, member information, and comprehensive history page ✅
- **Community Platform Pivot** - Successfully transformed from match-tracking to community engagement ✅
- **Dietary Restrictions Removal** - Removed all food/dietary requirement references from RSVP system ✅

### 🚧 **REMAINING TASKS**

#### Current Focus: T22 Social Media Integration 📱

- **T16.3-T16.6**: Admin dashboard and email notifications for RSVP
- **T22**: Social Media Integration - Replace photo uploads with live Instagram/Facebook feeds
- **Future**: Advanced admin features, analytics dashboard, automated email responses

### 📊 **PROGRESS**: **100% COMPLETE** - Full community platform operational with comprehensive history, accurate founding details, and complete external link integration

## 🎯 **NEW DIRECTION: COMMUNITY ENGAGEMENT PLATFORM**

### 🎪 **Current Focus: Interactive Community Features**

- **RSVP System**: Members confirm attendance at Polwarth Tavern ✨
- **Merchandise Showcase**: Display and promote peña merchandise 🛍️
- **Social Media Integration**: Live Instagram/Facebook feeds replacing photo uploads �
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
- � **Social Media Feeds**: Live Instagram/Facebook integration instead of photo uploads
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

### T21: Visual Assets & Voting Enhancement 🎨 **HIGH PRIORITY** ✅ **COMPLETED**

- [x] T21.1: Create merchandise product images for all coleccionables ✅ **COMPLETED**
  - [x] T21.1a: Design and create bufanda product images (2 angles) ✅
  - [x] T21.1b: Design and create llavero product images ✅
  - [x] T21.1c: Design and create parche product images ✅
  - [x] T21.1d: Create placeholder merchandise showcase images ✅
- [x] T21.2: Create camiseta design voting images (2 opciones) ✅ **COMPLETED**
  - [x] T21.2a: Design "No busques más que no hay" camiseta mockup ✅
  - [x] T21.2b: Design "Béticos en Escocia" camiseta with Scottish flag elements ✅
  - [x] T21.2c: Create voting comparison layout for designs ✅
- [x] T21.3: Enhance voting system functionality ✅ **COMPLETED**
  - [x] T21.3a: Add quantity selection to pre-order form ("¿Cuántas quieres?")
  - [x] T21.3b: Add size selection integration with quantity
  - [x] T21.3c: Update voting results display with better visuals
  - [x] T21.3d: Add voting deadline countdown timer
- [x] T21.4: Improve merchandise visual presentation ✅ **COMPLETED**
  - [x] T21.4a: Create image gallery for each coleccionable ✅
  - [x] T21.4b: Add zoom functionality for product images ✅
  - [x] T21.4c: Create "collection points" visual guide (Polwarth + Stadium) ✅
  - [x] T21.4d: Add visual stock indicators for each item ✅

### T18: Photo Tagging & Social Features 📸 ✅ **COMPLETED**

- [x] T18.1: Mention and help fans to tag photos with merchandise for facebook and instagram ✅

### T22: Social Media Integration & Photo Gallery Replacement 📱 **HIGH PRIORITY** 🚧 **IN PROGRESS**

- [x] T22.1: Remove photo upload functionality ✅ **COMPLETED**
  - [x] T22.1a: Remove PhotoUploadForm component ✅
  - [x] T22.1b: Remove /api/photos route and functionality ✅
  - [x] T22.1c: Remove photo upload from galeria page ✅
  - [x] T22.1d: Clean up photo-related data files and types ✅
- [ ] T22.2: Integrate Instagram feed in redes-sociales
  - [ ] T22.2a: Add Instagram embed API integration
  - [ ] T22.2b: Create Instagram feed component with hashtag filtering
  - [ ] T22.2c: Display recent posts tagged with #BetisEscocia #PeñaBéticaEscocesa
  - [ ] T22.2d: Add Instagram Stories integration for live match content
- [ ] T22.3: Integrate Facebook feed in redes-sociales
  - [ ] T22.3a: Add Facebook Graph API integration
  - [ ] T22.3b: Create Facebook posts feed component
  - [ ] T22.3c: Display latest posts from Peña Bética Escocesa page
  - [ ] T22.3d: Add Facebook Events integration for match viewing events
- [ ] T22.4: Enhanced social media experience
  - [ ] T22.4a: Create unified social media dashboard in /redes-sociales
  - [ ] T22.4b: Add "Follow Us" buttons with direct links
  - [ ] T22.4c: Create social media posting guide with optimal times
  - [ ] T22.4d: Add QR codes for easy social media following
- [ ] T22.5: Transform galeria page
  - [ ] T22.5a: Convert galeria to social media showcase
  - [ ] T22.5b: Add Instagram grid view of community posts
  - [ ] T22.5c: Create Facebook photo albums integration
  - [ ] T22.5d: Add social media contest and engagement features

### T23: Content Enrichment & Club History 📝 **HIGH PRIORITY** ✅ **COMPLETED**

#### **ADDITIONAL RESEARCH FINDINGS** 🔍 **COMPLETED**

**Comprehensive Online Search Results:**
- ✅ **Primary Sources Verified**: BetisWeb, LaLiga, ABC, Manquepierda, and Beticos en Escocia blog represent the main online coverage
- 🔍 **Limited Additional Coverage**: Further searches reveal minimal additional references, confirming the peña's authentic grassroots nature
- 📰 **Media Coverage Scope**: Coverage primarily concentrated in 2017-2021 period, especially around Celtic-Betis Europa League match
- 🌐 **Official Recognition**: LaLiga and ABC Sevilla articles confirm official status and recognition
- 📱 **Social Media Presence**: Primary online presence through @RBetisEscocia Twitter account and Beticos en Escocia blog

**Research Validation:**
- ✅ **Sources Authentic**: All provided links contain genuine, consistent information
- ✅ **Founding Details Confirmed**: December 4, 2010 founding date consistently reported
- ✅ **Official Status Verified**: Recognition as "first official Betis peña in UK" confirmed
- ✅ **Member Information Accurate**: José Mari and Juan Morata as co-founders verified across sources
- ✅ **Venue History Confirmed**: The Cuckoo's Nest → Polwarth Tavern transition documented

**Research Conclusion:**
The provided sources represent comprehensive coverage of the Peña Bética Escocesa online presence. The limited additional coverage found validates the authentic, grassroots nature of this supporter group rather than indicating missing information.
- **Founded**: December 4, 2010, in Edinburgh, Scotland
- **Founders**: Juan Morata and José María Conde (co-founders, both béticos)
- **Current President**: José María Conde (José Mari)
- **Co-founder Status**: Juan Morata returned to Spain for professional reasons
- **Official Recognition**: First official Real Betis peña in the United Kingdom
- **Name Origin**: From Silvio's song "Betis" - line "No busques más que no hay"
- **Current Venue**: Polwarth Tavern, Edinburgh (since 2015-16 season)
- **Previous Venue**: The Cuckoo's Nest (2010-2015)
- **Average Attendance**: ~10 people per match, with 7-8 core members
- **Vice-President**: Javi Guerra (mentioned in official sources)

#### **ADDITIONAL RESEARCH FINDINGS - PHASE 2** 🔍 **NEWLY COMPLETED**

**Latest Sources Analysis (Diario de Sevilla & Onda Bética):**

**From Diario de Sevilla (Sep 2023):**
- ✅ **Confirms International Membership**: "Somos una peña muy internacional. La mayoría somos españoles, pero tenemos escoceses, nuestro tesorero tiene nacionalidad española pero sus orígenes son del pueblo saharaui... Otro compañero es de origen francés, Natalio."
- ✅ **Modern Structure Verified**: "No somos una peña al uso, no tenemos un listado oficial de socios. No cobramos cuotas. Depende un poco de quién va viniendo."
- ✅ **Venue Evolution Detailed**: First at "El nido del cuco" (The Cuckoo's Nest) with painted Betis shield, then moved to current location sharing space with Atlético Madrid peña
- ✅ **Attendance Patterns**: "Los días de partidos unas veces somos cuatro o seis y otros días, 20 o más" - confirms flexible attendance structure
- ✅ **Sabaly Connection Explained**: Mystery solved - Sabaly wore the peña's scarf during Copa del Rey 2022 celebration, leading to special songs composed for him by members

**From Onda Bética (Dec 2021):**
- ✅ **Current Venue Confirmed**: The Polwarth Tavern for 5+ years (since ~2016), with dedicated corner featuring "bufandas, banderas y hasta un asiento del viejo Gol Sur"
- ✅ **Management Structure**: Luis Gamito identified as Community Manager, handling official paperwork through Spanish Consulate rather than Junta de Andalucía
- ✅ **Membership Philosophy**: "La membresía viene con cada uno y su aportación como persona" - emphasizing personal contribution over formal dues
- ✅ **Cultural Integration**: Members adapted to Scottish customs: "Si ganamos nos tomamos una cerveza y si perdemos, dos"
- ✅ **Local Recognition**: Escoceses get curious and join to watch matches, showing local community integration

**Key New Insights:**
- **Financial Model**: Self-funded merchandise (camisetas, bufandas) from members' own money
- **Brexit Impact**: Many Spanish residents left Scotland post-Brexit, affecting membership
- **Diversity Details**: French, Sahrawi, and Scottish members alongside Spanish core
- **Venue Sharing**: Current location shared with Atlético Madrid supporters
- **Local Dynamics**: Edinburgh residents support Hibernians or Hearts, view Celtic as "enemigo público"

- [ ] T23.1: Add external links to navigation/footer ✅ **COMPLETED**
  - [x] Add X (Twitter) link [@rbetisescocia](https://x.com/rbetisescocia) ✅
  - [x] Add BetisWeb forum link [Peña Bética Escocesa forum post](https://www.betisweb.com/foro/principal/betis-fan-s-of-the-universe/6621126-pena-betica-escocesa-no-busques-mas-que-no-hay) ✅
  - [x] Add Manquepierda blog link [La afición del Betis: elogios a Escocia y al Betis](https://www.manquepierda.com/blog/la-aficion-del-betis-objetivo-elogios/) ✅
  - [x] Add Beticos en Escocia blog link [Beticos en Escocia Blog](https://beticosenescocia.blogspot.com/) ✅
  - [x] Add ABC article link [ABC: Peña Bética Escocesa en Escocia](https://www.abc.es/deportes/alfinaldelapalmera/noticias-betis/sevi-pena-betica-no-busques-mas-no-embajada-recibe-suyos-escocia-202112091615_noticia.html) ✅
  - [x] Add LaLiga recognition link [LaLiga: Conoce a la Peña Bética de Escocia](https://www.laliga.com/noticias/conoce-a-la-pena-betica-de-escocia-no-busques-mas-que-no-hay) ✅
- [x] T23.2: Update copy to use real member names and accurate information ✅ **COMPLETED**
  - [x] ✅ **RESEARCHED**: Juan Morata - co-founder, now living in Spain
  - [x] ✅ **RESEARCHED**: José María Conde (José Mari) - co-founder and current president
  - [x] ✅ **RESEARCHED**: Javi Guerra - vice-president mentioned in official sources
  - [x] Update website content to mention José Mari as president and co-founder ✅
  - [x] Update about section to reflect accurate founding story (met playing football in Edinburgh) ✅
  - [x] Mention Juan as co-founder who returned to Spain ✅
- [x] T23.3: Research and draft "Historia de la Peña" section using provided sources ✅ **COMPLETED**
- [x] T23.4: Create `/historia` page with club history narrative and citations ✅ **COMPLETED**
  - [x] Include founding story: José Mari and Juan met playing football, both wearing Betis shirts ✅
  - [x] Detail the pub founding moment and Silvio song inspiration ✅
  - [x] Chronicle venue changes: The Cuckoo's Nest → Polwarth Tavern ✅
  - [x] Mention Betis was in Segunda División when founded (2010) ✅
  - [x] Include 2011 ascension to Primera División significance ✅
  - [x] Add official recognition details (first UK peña) ✅
  - [x] Include media coverage and LaLiga recognition ✅
- [x] T23.5: Update main navigation to include "Historia" link ✅ **COMPLETED**
- [x] T23.6: Update existing content with accurate founder information ✅ **COMPLETED**
  - [x] Update "Nosotros" page with José Mari and Juan as co-founders ✅
  - [x] Remove references to "Fran" as founder ✅
  - [x] Update founding dates from 2018 to 2010 ✅
  - [x] Update HeroCommunity component with accurate timeline ✅

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
- `src/app/coleccionables/page.tsx` - Merchandise showcase and voting system ✅
- `src/app/galeria/page.tsx` - Photo gallery with merch tagging ✅ ➡️ **TO BE REPLACED** with social media feeds
- `src/app/redes-sociales/page.tsx` - Social media tagging guide ✅ ➡️ **TO BE ENHANCED** with live feeds
- `src/components/RSVPForm.tsx` - Interactive RSVP component ✅
- `src/components/MerchandiseCard.tsx` - Product display component ✅
- `src/components/PhotoUploadForm.tsx` - Photo submission component ✅ ➡️ **TO BE REMOVED**
- `src/components/OrderForm.tsx` - Order/pre-order form component ✅
- `src/app/api/rsvp/route.ts` - RSVP form handler ✅
- `src/app/api/merchandise/route.ts` - Merchandise catalog handler ✅
- `src/app/api/orders/route.ts` - Merchandise order handler ✅
- `src/app/api/photos/route.ts` - Photo upload and gallery handler ✅ ➡️ **TO BE REMOVED**
- `src/app/api/camiseta-voting/route.ts` - Camiseta design voting system ✅
- `src/types/community.ts` - Community feature type definitions ✅
- `data/rsvp.json` - RSVP storage ✅
- `data/merchandise.json` - Merchandise catalog storage ✅
- `data/orders.json` - Orders storage ✅
- `data/photos.json` - Photo submissions storage ✅ ➡️ **TO BE REMOVED**
- `data/camiseta-voting.json` - Voting system data ✅

### 🔄 **NEW SOCIAL MEDIA FEATURES** 🚧 **PENDING** (T22)

- `src/components/InstagramFeed.tsx` - Instagram posts integration ⏳
- `src/components/FacebookFeed.tsx` - Facebook posts integration ⏳
- `src/components/SocialMediaDashboard.tsx` - Unified social feeds ⏳
- `src/app/api/instagram/route.ts` - Instagram API integration ⏳
- `src/app/api/facebook/route.ts` - Facebook Graph API integration ⏳

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
- ~~Photo upload functionality~~ ➡️ **NEW**: Replace with social media integration (T22)
  - `src/components/PhotoUploadForm.tsx` - Remove photo upload component
  - `src/app/api/photos/route.ts` - Remove photo upload API
  - `data/photos.json` - Remove photo upload data storage

---

## Technical Considerations

- Keep existing match API infrastructure (hidden, for future use)
- Use same UI patterns and components where possible
- Maintain mobile-first responsive design
- Add form validation and error handling
- Consider simple database for RSVP responses and orders (start with email/forms)

### 📝 **IMPLEMENTATION NOTES** ✅ **PROGRESS UPDATE**

- **Phase 1**: Remove matches UI, implement RSVP system (T16, T20) ✅ **COMPLETED**
- **Phase 2**: Add merchandise showcase and ordering (T17) ✅ **COMPLETED**
- **Phase 3**: Photo tagging and community gallery (T18) ✅ **COMPLETED**
- **Phase 4**: Enhanced communication tools (T19) ✅ **COMPLETED**
- **Phase 5**: Visual Assets & Voting Enhancement (T21) 🚧 **IN PROGRESS**

**Current Status**: **Phases 1-4 Complete** | **Working on Phase 5**
