# Copilot Instructions for Peña Bética Escocesa Website

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a Next.js TypeScript project for the Peña Bética Escocesa (Real Betis FC supporters association in Edinburgh, Scotland). The website serves as a portal for Real Betis fans visiting Scotland to join the community at Polwarth Tavern.

## Key Features

- **Mobile-first responsive design** optimized for smartphones
- **Real Betis branding** using official colors (green #00A651 and white)
- **La Porra de Fran** - A betting/prediction system for matches
- **Serverless architecture** using Vercel Functions
- **Social media integration** with Facebook and Instagram
- **Bilingual content** (Spanish/English)

## Technical Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Serverless functions (API routes)
- **Database**: JSON file storage (upgradeable to MongoDB/Supabase)
- **Deployment**: Vercel with GitHub Actions

## Coding Guidelines

- Use TypeScript strictly
- Follow mobile-first responsive design principles
- Implement proper accessibility (WCAG guidelines)
- Use Real Betis official colors consistently
- Keep Spanish terminology for football-specific terms
- Ensure fast loading times and SEO optimization
- Use serverless best practices for API routes

## File Structure

- `/src/app` - App Router pages and layouts
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and types
- `/data` - JSON storage files
- `/public` - Static assets including Real Betis imagery

## Special Considerations

- "La Porra de Fran" is the key interactive feature
- Polwarth Tavern is the primary meeting location
- Content should appeal to both local and visiting Real Betis fans
- Maintain authentic Spanish football culture terminology
- Add "salero" (flair) to content where appropriate
