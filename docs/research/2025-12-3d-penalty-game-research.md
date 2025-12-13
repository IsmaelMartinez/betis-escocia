# Research: 3D Penalty Shootout Game

**Date**: December 2025  
**Status**: Research Phase  
**Related Feature**: Games & Engagement (ideas.md lines 107-113)  
**Priority**: Medium (engagement feature)

## Executive Summary

This document outlines the research and technical spikes required to implement a browser-based 3D penalty shootout game for the Peña Bética Escocesa website. The game would provide an engaging, Betis-themed experience for supporters.

---

## 🎯 Feature Overview

### Vision
A browser-based 3D penalty shootout game where users take penalties against a virtual goalkeeper in a Betis-themed stadium (Benito Villamarín). The game should be:
- Fun and addictive
- Mobile-friendly
- Fast-loading (progressive enhancement)
- Integrated with the existing user system

### Core Features
1. **Penalty Shooting Mechanics**: Aim and power controls
2. **Goalkeeper AI**: Reactive goalkeeper with difficulty levels
3. **Physics Simulation**: Realistic ball movement
4. **Betis Theming**: Stadium, kit, crowd sounds
5. **Leaderboards**: Integration with existing user system
6. **Daily Challenges**: Limited attempts per day (like trivia)

---

## 🔧 Technology Options

### Option A: Three.js + TypeScript ⭐ **RECOMMENDED**

| Aspect | Details |
|--------|---------|
| **Library** | Three.js (industry standard WebGL) |
| **Language** | TypeScript (matches existing codebase) |
| **Physics** | Cannon.js or Ammo.js |
| **Bundle Size** | ~150-300KB gzipped (tree-shakeable) |
| **Development Time** | 2-4 weeks |
| **Learning Curve** | Moderate (good documentation) |

**Pros**:
- Large community and excellent documentation
- Integrates naturally with Next.js/React
- Many examples and tutorials available
- TypeScript support built-in
- Progressive loading possible

**Cons**:
- Larger bundle than minimal solutions
- Requires understanding of 3D concepts

### Option B: Rust + WebAssembly

| Aspect | Details |
|--------|---------|
| **Engine** | Bevy or custom Rust + wgpu |
| **Compilation** | WASM target |
| **Bundle Size** | ~200-500KB |
| **Development Time** | 6-12 weeks |
| **Performance** | Excellent |

**Pros**:
- Superior performance
- Memory safety
- Modern game engine patterns

**Cons**:
- Steep learning curve
- Longer development time
- Limited Rust/WASM expertise in team
- Harder to integrate with React

### Option C: Babylon.js

| Aspect | Details |
|--------|---------|
| **Library** | Babylon.js |
| **Language** | TypeScript |
| **Bundle Size** | ~300-500KB |
| **Development Time** | 2-4 weeks |

**Pros**:
- Full-featured game engine
- Built-in physics
- Good TypeScript support

**Cons**:
- Larger bundle than Three.js
- More opinionated architecture

### Option D: PlayCanvas

| Aspect | Details |
|--------|---------|
| **Platform** | PlayCanvas Editor + Runtime |
| **Language** | JavaScript/TypeScript |
| **Bundle Size** | ~200KB runtime |
| **Development Time** | 1-2 weeks |

**Pros**:
- Visual editor for scene creation
- Fast development
- Good mobile performance

**Cons**:
- External dependency on PlayCanvas platform
- Less control over implementation
- May require paid plan for features

---

## 📱 Mobile Considerations

### Touch Controls
- **Swipe to aim**: Direction and curve
- **Press and hold**: Power gauge
- **Release to shoot**: Execute shot

### Performance Targets
| Device | Target FPS | Resolution |
|--------|------------|------------|
| iPhone 12+ | 60 FPS | Native |
| iPhone 8-11 | 30 FPS | 0.75x |
| Android Mid-range | 30 FPS | 0.5x-0.75x |
| Desktop | 60 FPS | Native |

### WebGL Fallback
- Detect WebGL2 support
- Fallback to WebGL1 or canvas 2D simplified version
- Graceful degradation message for unsupported browsers

---

## 🏗️ Architecture Recommendations

### Code Organization
```
src/
├── games/
│   └── penalty-shootout/
│       ├── components/
│       │   ├── Game.tsx           # Main React wrapper
│       │   ├── GameCanvas.tsx     # Three.js canvas
│       │   └── UI/                # Overlay UI components
│       ├── engine/
│       │   ├── Scene.ts           # 3D scene setup
│       │   ├── Ball.ts            # Ball physics
│       │   ├── Goalkeeper.ts      # AI controller
│       │   ├── Stadium.ts         # Environment
│       │   └── Controls.ts        # Input handling
│       ├── assets/                # 3D models, textures
│       └── hooks/
│           └── useGameState.ts    # Game state management
```

### Loading Strategy
1. **Lazy load** game module only when user navigates to game
2. **Progressive asset loading**: Low-poly → High-poly
3. **Preload hints** on game section hover
4. **Service worker caching** for assets

### Integration Points
- **User System**: Clerk authentication for scores
- **Database**: Supabase for leaderboards
- **API**: New `/api/games/penalty` endpoint

---

## 🔬 Required Spikes

### Spike 1: Three.js + Next.js Integration
**Duration**: 2-3 days  
**Objective**: Validate Three.js integration with Next.js App Router

**Tasks**:
- [ ] Create minimal Three.js scene in Next.js
- [ ] Test SSR compatibility (client-only rendering)
- [ ] Measure bundle impact
- [ ] Test dynamic import and code splitting
- [ ] Verify hot reload works during development

**Success Criteria**:
- Working 3D scene renders without errors
- Bundle size < 200KB for base scene
- No SSR hydration issues

---

### Spike 2: Mobile Touch Controls
**Duration**: 1-2 days  
**Objective**: Prototype touch-based aiming and shooting

**Tasks**:
- [ ] Implement swipe-to-aim gesture
- [ ] Create power gauge UI
- [ ] Test on iOS Safari and Android Chrome
- [ ] Measure touch latency
- [ ] Handle multi-touch edge cases

**Success Criteria**:
- Responsive controls (< 50ms latency)
- Works on iOS 14+ and Android 10+
- Intuitive gesture recognition

---

### Spike 3: Physics Engine Evaluation
**Duration**: 2-3 days  
**Objective**: Compare physics libraries for ball simulation

**Options to test**:
- Cannon.js (lightweight)
- Rapier.js (Rust/WASM, performant)
- Ammo.js (Bullet physics port)
- Custom simplified physics

**Tasks**:
- [ ] Implement ball trajectory with each option
- [ ] Add spin/curve effects
- [ ] Measure CPU usage on mobile
- [ ] Test collision detection accuracy

**Success Criteria**:
- Realistic ball movement
- < 5ms physics step on mobile
- Accurate goal detection

---

### Spike 4: Goalkeeper AI Prototype
**Duration**: 2-3 days  
**Objective**: Create believable goalkeeper behavior

**Tasks**:
- [ ] Implement dive animation system
- [ ] Create difficulty-based reaction times
- [ ] Add prediction algorithm (shot reading)
- [ ] Test balance (not too easy, not impossible)

**Difficulty Levels**:
| Level | Reaction Time | Save Probability |
|-------|--------------|------------------|
| Easy | 600ms | 20% |
| Medium | 400ms | 40% |
| Hard | 250ms | 60% |

**Success Criteria**:
- Goalkeeper feels "alive" and reactive
- Clear difficulty progression
- Not frustrating at any level

---

### Spike 5: Asset Pipeline
**Duration**: 1-2 days  
**Objective**: Establish 3D asset creation/import workflow

**Tasks**:
- [ ] Test GLTF/GLB import in Three.js
- [ ] Create or source low-poly stadium model
- [ ] Optimize textures for web (< 512KB total)
- [ ] Test asset compression (Draco/KTX2)
- [ ] Set up asset loading progress indicator

**Asset Requirements**:
| Asset | Format | Target Size |
|-------|--------|-------------|
| Stadium | GLTF | < 500KB |
| Ball | GLTF | < 50KB |
| Goalkeeper | GLTF + animations | < 200KB |
| Textures | KTX2/WebP | < 300KB |

**Success Criteria**:
- All assets load in < 3 seconds on 4G
- Visual quality acceptable on mobile
- Compression ratio > 50%

---

### Spike 6: Leaderboard Integration
**Duration**: 1 day  
**Objective**: Design database schema and API

**Tasks**:
- [ ] Design `game_scores` table schema
- [ ] Create API endpoint for score submission
- [ ] Implement anti-cheat measures (server validation)
- [ ] Test with existing Clerk authentication

**Schema Draft**:
```sql
CREATE TABLE penalty_game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  goals_scored INTEGER NOT NULL,
  total_attempts INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  client_hash TEXT -- for basic anti-cheat
);
```

**Success Criteria**:
- Secure score submission
- Leaderboard queries < 100ms
- Daily/weekly/all-time views

---

## 📊 Effort Estimation

### Three.js Implementation (Recommended)

| Phase | Duration | Description |
|-------|----------|-------------|
| Spikes | 1.5 weeks | Technical validation |
| Core Engine | 1 week | Scene, physics, controls |
| Goalkeeper AI | 3-4 days | AI and animations |
| UI/UX | 3-4 days | Menus, HUD, feedback |
| Integration | 2-3 days | Auth, leaderboards, API |
| Polish | 3-4 days | Sounds, effects, testing |
| **Total** | **4-5 weeks** | Including spikes |

### MVP Scope (2-3 weeks)
Reduce scope for faster delivery:
- Single difficulty level
- Basic goalkeeper (no fancy AI)
- Simplified stadium (skybox + goal)
- No leaderboards initially
- Desktop-first, mobile later

---

## 🚫 Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance issues on mobile | Medium | High | Early mobile testing, LOD system |
| Large bundle size | Medium | Medium | Aggressive code splitting, lazy load |
| WebGL compatibility | Low | High | Feature detection, fallback UI |
| Scope creep | High | Medium | Strict MVP definition |
| Asset creation complexity | Medium | Medium | Use free/purchased assets |

---

## 🎨 Asset Sources

### Free/Open Source
- [Kenney Assets](https://kenney.nl/) - Game assets
- [Sketchfab](https://sketchfab.com/) - 3D models (check licenses)
- [Poly Haven](https://polyhaven.com/) - Textures and HDRIs

### Paid Options
- [TurboSquid](https://www.turbosquid.com/) - Professional 3D models
- [Unity Asset Store](https://assetstore.unity.com/) - Convert to GLTF
- Custom commission via Fiverr/Upwork

### DIY
- Blender for modeling (free)
- Simple geometric stadium is achievable

---

## 📋 Recommended Next Steps

1. **Decision**: Approve Three.js approach
2. **Spike 1**: Three.js + Next.js integration (priority)
3. **Spike 2 & 3**: Mobile controls + Physics (parallel)
4. **Asset planning**: Decide buy vs. build for 3D models
5. **MVP definition**: Lock scope for first release

---

## 📚 References

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Journey Course](https://threejs-journey.com/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Cannon.js](https://schteppe.github.io/cannon.js/)
- [GLTF Specification](https://www.khronos.org/gltf/)

---

## Appendix: Similar Games for Inspiration

1. **Mini Football** (mobile game) - Simple 3D football
2. **FIFA Mobile** - Penalty shootout mode
3. **Head Soccer** - 2D simplified approach
4. **Kick the Ball** (web) - Three.js football game

---

*Document created: December 2025*  
*Last updated: December 2025*

