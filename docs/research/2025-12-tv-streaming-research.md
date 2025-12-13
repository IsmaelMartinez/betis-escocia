# TV & Streaming Research: Where to Watch Real Betis Matches in the UK

**Date**: December 2025  
**Status**: Research Complete  
**Related Feature**: TV & Streaming Integration (ideas.md)

## Executive Summary

This document provides research on where Real Betis matches are broadcast in the **United Kingdom**, including TV channels, streaming services, and implementation recommendations for the Peña Bética Escocesa website.

---

## 🇬🇧 UK Broadcasting Options

### 1. Premier Sports / LaLiga TV ⭐ **PRIMARY OPTION**

**Overview**: Premier Sports holds the exclusive UK rights for La Liga broadcasting.

| Feature | Details |
|---------|---------|
| **Channels** | LaLiga TV (dedicated channel), Premier Sports 1 & 2 |
| **Coverage** | All La Liga matches including Real Betis |
| **Availability** | Sky TV (Ch. 435), Virgin Media, Amazon Prime add-on |
| **Streaming** | Premier Player (standalone app) |
| **Price** | ~£14.99/month standalone, varies with TV packages |
| **Website** | [premiersports.com](https://www.premiersports.com) |

**Key Points**:
- Every Real Betis La Liga match is available
- Spanish commentary option often available
- HD quality streaming
- Can watch on mobile, tablet, smart TV

### 2. TNT Sports (formerly BT Sport)

**Overview**: Broadcasts European competitions where Betis might participate.

| Feature | Details |
|---------|---------|
| **Coverage** | UEFA Champions League, Europa League, Conference League |
| **Availability** | Sky, EE, BT broadband packages, Discovery+ |
| **Price** | Varies by package (~£25-40/month with broadband) |
| **Website** | [tntsports.co.uk](https://www.tntsports.co.uk) |

**Relevance**: Only relevant when Real Betis qualifies for European competitions.

### 3. Viaplay (Selected Matches)

**Overview**: Nordic streaming service with some La Liga content.

| Feature | Details |
|---------|---------|
| **Coverage** | Selected La Liga matches |
| **Price** | ~£6.99/month |
| **Website** | [viaplay.com](https://viaplay.com/gb-en) |

### 4. Free-to-Air Options (Limited)

- **ITV4**: Occasional La Liga highlights
- **BBC/Sky Sports News**: Match reports and highlights

---

## 💡 Implementation Recommendations

### Option A: Static Information Page (Recommended - Low Effort)

Create a dedicated "Where to Watch" section on the matches page with:
- UK broadcasting info
- Direct links to streaming services
- Pricing overview
- Tips for Scottish Betis fans

**Estimated Effort**: 2-4 hours  
**Maintenance**: Update annually when rights change

### Option B: Dynamic TV Schedule Widget (Medium Effort)

Integrate with a TV listings API to show:
- Which channel is showing each match
- Kickoff times in UK timezone
- Direct links to watch

**Potential APIs**:
1. **LiveScore API** - Has broadcaster info for some matches
2. **TV Guide APIs** - xmltv.co.uk, TVmaze
3. **Football-Data.org** - Does NOT include broadcaster info (limitation)

**Estimated Effort**: 1-2 weeks  
**Maintenance**: API monitoring required

### Option C: Manual Admin Entry (Simple but Manual)

Add a "TV Channel" field to match database entries that admins can populate:
- Flexible and accurate
- Requires manual updates per match
- Good for highlighting special broadcasts

**Estimated Effort**: 1 day  
**Maintenance**: Per-match admin work

---

## 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Recommendations for Edinburgh Peña

### Watching at Polwarth Tavern
The pub likely has:
- Sky Sports subscription (includes Premier Sports/LaLiga TV option)
- Ability to show any La Liga match

### Watching at Home (UK)
**Best Value Options**:
1. **Premier Player** - £14.99/month, all La Liga matches
2. **Amazon Prime + Premier Sports add-on** - Combined flexibility
3. **Sky Sports** - If already a Sky customer, add LaLiga TV

---

## 📊 UK Services Summary

| Service | La Liga | European | Price Range |
|---------|:-------:|:--------:|-------------|
| Premier Sports/LaLiga TV | ✅ | ❌ | £14.99/mo |
| TNT Sports | ❌ | ✅ | ~£25/mo+ |
| Viaplay | ⚠️ (selected) | ❌ | £6.99/mo |

---

## 🔗 Quick Links

- Premier Sports: https://www.premiersports.com
- LaLiga TV Schedule: https://www.laliga.com/laliga-easports/calendario
- TNT Sports: https://www.tntsports.co.uk
- La Liga Official: https://www.laliga.com
- Real Betis Official: https://www.realbetisbalompie.es

---

## 📋 Next Steps

1. **Decision Required**: Choose implementation approach (A, B, or C)
2. **Content Creation**: Write user-friendly "Where to Watch" content
3. **Design**: Create TV/streaming info component matching site aesthetic
4. **Integration**: Add to matches page or create dedicated section
5. **Testing**: Verify all links work and info is accurate

---

## 📝 Notes

- Broadcasting rights change annually (typically July-August)
- Rights can vary for Copa del Rey and European competitions
- Some matches may be moved for TV scheduling (usually announced 1-2 weeks ahead)
- Pub viewings at Polwarth Tavern remain the best community experience!

---

## References

- La Liga Broadcasting Partners: https://www.laliga.com/en-GB/broadcasters
- Premier Sports UK: https://www.premiersports.com
- UK TV Rights Analysis (2024-2027 cycle)
