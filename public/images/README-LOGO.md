# Betis Logo Setup

## Missing Logo Issue

The Real Betis logo is currently missing from `/public/images/betis-logo.png`. 

## To Fix This Issue:

1. **Download the official Real Betis logo** from:
   - Official website: https://www.realbetisbalompie.es/
   - Or use any high-quality Betis logo image

2. **Save the logo as** `betis-logo.png` in the `/public/images/` directory

3. **Recommended specifications:**
   - Format: PNG with transparent background
   - Size: At least 200x200 pixels
   - Aspect ratio: 1:1 (square)

## Current Temporary Solution

For now, the code will fall back to the green circle with "RB" initials when the logo is not found.

## Alternative Solution

You can also use the SVG version created at `/public/images/betis-logo.svg` by updating the references in the code to use `.svg` instead of `.png`.

## Files that reference the logo:

- `src/components/MatchCard.tsx`
- `src/app/partidos/[matchId]/page.tsx`
