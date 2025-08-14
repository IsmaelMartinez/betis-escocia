# Ideas for Peña Bética Escocesa Website

This document provides a list of ideas and features for the Peña Bética Escocesa website. It serves as a brainstorming space for future enhancements and functionalities.

## 🎯 **Core Feature Ideas**

### TV & Streaming Integration
* Find where it is shown on TV in the UK and Spain, maybe provide some links to the channels or streaming services.

### La Porra Enhancement
* Make the porra private only for Peña members, so that we don't get in a legal trouble with the gambling commission. Also it is a skill based game, not gambling. 50/50 split of the prize pool, 50% to the winner, 50% to the Peña (donation for the yearly celebration).

### AI Assistant
* Provide a cheap AI assistant for the users that access the website. It can guide them through the website, help them with the porra, and answer questions about Real Betis.

### Rumors Page (Soylenti)
* Add a soylenti (rumors in Turkish) page where rumors spread. Ceballos, again, is coming back to Betis, etc. It can be a fun page where people can share their opinions and rumors about the team. Fran mode to provide % values to the rumors.

### E-commerce Integration
* Implement merchandise management system to allow users to buy Peña merchandise directly from the website. (low priority at the moment)

### Voting System
* Implement a voting system for Peña members to vote on various collection items (like t-shirts etc).

## 📊 **Admin Features**

* Develop admin dashboard for RSVP management and statistics
* Add push notifications for new RSVPs and orders

## 👥 **User Features**

### ✅ **Implemented User Features**

* **User Dashboard:** Complete personal dashboard with RSVP & contact history (✅ LIVE)
  * View all personal RSVP confirmations with match details
  * See contact message history with status tracking
  * Profile management through Clerk integration
  * Email-based automatic linking of existing anonymous submissions

* **RSVP System:** Users can confirm attendance and view their history (✅ LIVE)
  * Anonymous submissions supported (backward compatibility)
  * Authenticated users get pre-filled forms and submission tracking
  * Match-specific RSVPs with attendee counts

* **Contact Form:** Enhanced contact system with user tracking (✅ LIVE)
  * Pre-populated name/email for authenticated users
  * Contact type categorization and subject handling
  * Admin interface for managing submissions with status updates

* **GDPR Compliance:** Complete data access and deletion system (✅ LIVE)
  * Data export functionality (JSON download)
  * Right to be forgotten (complete data deletion)
  * Email-based data access requests
  * **Data Retention:** Both RSVPs and contact submissions auto-deleted after 3 months for GDPR compliance

### 🚧 **User Features To Be Developed**

* **Enhanced User Profiles:** Expand beyond basic Clerk information
  * Add Peña membership status and preferences
  * Integration with community points/activity tracking
  * Custom profile fields for supporter preferences

* **GitHub Issues Integration:** Enable users to submit feedback/suggestions directly
  * Link contact form to GitHub issue creation
  * Community voting on suggestions and feature requests

* **GDPR Dashboard Integration:** Move GDPR controls to user dashboard
  * Currently requires email entry - could be streamlined for authenticated users
  * Integrate data retention notifications and consent management

## 🌍 **Multi-language Support**

* Spanish/English toggle for all pages
* Comprehensive translation of UI elements

## 🔔 **Push Notifications**

* Reminders for upcoming events and matches
* Notifications for new blog posts or updates

## 🏆 **Community Profiles**

* Member profiles with activity and participation history
* Community recognition and points system

## 🎮 **Games & Engagement**

### ✅ **Implemented Games**

* **Daily Trivia Challenge:** 3-question daily quiz about Real Betis & Scotland (✅ LIVE)
  * Feature flagged (`show-trivia-game`)
  * Mobile-optimized with 15-second timer per question  
  * Points system: 1 point per correct answer
  * Daily play limit with score tracking
  * Database: Full user score history
  * **Known Issues**: Some edge cases and UX improvements needed

### 🚧 **Games To Be Developed**

* **"Guess the Lineup" game** for matches - Interactive team selection
* **"Guess the Score" game** for matches - Match prediction system  
* **Crossword puzzles** related to Real Betis history and players
* **Word Search** themed puzzles
* **Enhanced Daily Quiz** - Expand beyond 3 questions, add categories
* **🥅 3D Penalty Shootout Game** - Browser-based 3D football game
  * **Technology Options**: Three.js + TypeScript (recommended) or Rust + WebAssembly
  * **Features**: Physics simulation, goalkeeper AI, multiple difficulty levels
  * **Integration**: Daily challenges, leaderboards, Betis-themed stadium
  * **Mobile Support**: Touch controls with WebGL fallback for compatibility
  * **Progressive Loading**: Code-split bundle, loads only when requested
  * **Estimated Development**: 2-4 weeks (Three.js) or 6-12 weeks (Rust + WASM)

## ⚡ **Advanced Performance Enhancements**

* Server-side rendering improvements
* Further optimization of images and static assets