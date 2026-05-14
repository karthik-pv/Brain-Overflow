# Brain Overflow — Atmospheric Frontend Reconstruction
## Phase 0-4 Deliverables: Repository Analysis, Research Synthesis & Architecture Proposal

**Date:** 2026-05-14  
**Project:** Brain Overflow — "An abandoned operating system for thinkers and dreamers"  
**Status:** Research Complete → Awaiting Approval for Implementation

---

## TABLE OF CONTENTS

1. [Repository Map](#1-repository-map)
2. [Backend/Frontend Dependency Analysis](#2-backendfrontend-dependency-analysis)
3. [Architectural Extraction Strategy](#3-architectural-extraction-strategy)
4. [Research Findings Synthesis](#4-research-findings-synthesis)
5. [Design Language Report](#5-design-language-report)
6. [Perception-First Analysis](#6-perception-first-analysis)
7. [Frontend Folder Structure Proposal](#7-frontend-folder-structure-proposal)
8. [Rendering Pipeline Proposal](#8-rendering-pipeline-proposal)
9. [Motion/Animation Philosophy](#9-motionanimation-philosophy)
10. [Component Hierarchy](#10-component-hierarchy)
11. [State Management Strategy](#11-state-management-strategy)
12. [Performance Considerations](#12-performance-considerations)
13. [Swarm Execution Plan](#13-swarm-execution-plan)

---

## 1. REPOSITORY MAP

### 1.1 Directory Structure

```
Brain-Overflow/
├── .git/                          # Git repository
├── .opencode/                     # OpenCode configuration
│   ├── node_modules/
│   ├── opencode-swarm.json
│   └── package.json
├── .swarm/                        # Swarm orchestration state
│   ├── context.md
│   ├── doc-manifest.json
│   ├── repo-graph.json
│   └── evidence/
├── backend/                       # Backend services & configuration
│   ├── .env                       # Environment variables
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json               # Backend scripts & dependencies
│   ├── node_modules/
│   ├── scripts/                   # Utility scripts
│   │   ├── fetch-fireworks-models.mjs
│   │   ├── reset.mjs
│   │   ├── seed.mjs
│   │   ├── setup.mjs
│   │   └── sync-telegram-commands.mjs
│   └── supabase/                  # Supabase configuration
│       ├── config.toml
│       ├── functions/             # Edge Functions (Deno)
│       │   ├── _shared/         # Shared utilities
│       │   │   ├── cors.ts      # CORS handling
│       │   │   ├── db.ts        # Service client factory
│       │   │   ├── log.ts       # Logging utilities
│       │   │   └── providers/   # LLM provider adapters
│       │   │       ├── anthropic.ts
│       │   │       ├── fireworks.ts
│       │   │       └── openai.ts
│       │   ├── process-prompt/  # AI processing pipeline
│       │   │   └── index.ts
│       │   └── telegram-webhook/ # Telegram bot integration
│       │       └── index.ts
│       └── migrations/           # Database schema
│           ├── 20260511000000_rebuild.sql
│           ├── 20260511000001_additions.sql
│           └── 20260512000000_multi_turn.sql
└── frontend/                      # Current React frontend
    ├── README.md
    ├── eslint.config.js
    ├── index.html
    ├── package.json               # React 19 + Vite + Tailwind v4
    ├── vite.config.js
    ├── node_modules/
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── index.css              # Tailwind theme + custom CSS
        ├── main.jsx               # React entry point
        ├── App.jsx                # Router + layout
        ├── lib/
        │   └── supabase.js        # Supabase client (localStorage auth)
        ├── hooks/
        │   ├── useAudioVisualizer.js
        │   ├── useIdeaPolling.js
        │   └── useSpeechRecognition.js
        ├── components/
        │   ├── IdeaChat.jsx
        │   ├── LoadingStates.jsx
        │   ├── NavBar.jsx
        │   ├── ParticleCanvas.jsx
        │   ├── SetupScreen.jsx
        │   ├── StatusBadge.jsx
        │   └── VoiceRecorder.jsx
        ├── pages/
        │   ├── FlowsPage.jsx
        │   ├── IdeaDetailPage.jsx
        │   ├── IdeasPage.jsx
        │   ├── ModelsPage.jsx
        │   ├── PromptsPage.jsx
        │   └── VoiceRecorderPage.jsx
        └── assets/
            ├── hero.png
            ├── react.svg
            └── vite.svg
```

### 1.2 Technology Stack Audit

**Frontend (Current):**
- **Framework:** React 19.2.6 (JSX, not TypeScript)
- **Build Tool:** Vite 8.0.12
- **Styling:** Tailwind CSS v4.1.6 with custom theme
- **Animation:** Framer Motion 12.23.25, GSAP 3.13.0
- **Icons:** Phosphor Icons React 2.1.7
- **State:** React useState/useEffect (no global state library)
- **Routing:** React Router DOM 7.15.0
- **Database Client:** @supabase/supabase-js 2.105.4
- **Drag & Drop:** @dnd-kit/core, sortable, utilities
- **AI (Local):** @huggingface/transformers 4.2.0

**Backend:**
- **Runtime:** Deno (Supabase Edge Functions)
- **Database:** PostgreSQL (Supabase)
- **AI Providers:** Fireworks AI (default), OpenAI, Anthropic
- **Integration:** Telegram Bot API
- **Auth:** None (trust-based, RLS disabled)

### 1.3 API Relationship Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │  Supabase   │  │  Web Speech   │  │  HuggingFace        │   │
│  │  Client     │  │  Recognition  │  │  Transformers       │   │
│  │  (REST/WS)  │  │  (Browser)    │  │  (Local AI)         │   │
│  └──────┬──────┘  └─────────────┘  └─────────────────────┘   │
└─────────┼─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE PLATFORM                          │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │  PostgreSQL │  │  Edge Functions │  │  Realtime API    │   │
│  │  (Database) │  │  (Deno Runtime) │  │  (WebSocket)     │   │
│  └──────┬──────┘  └────────┬────────┘  └──────────────────┘   │
└─────────┼────────────────────┼─────────────────────────────────┘
          │                    │
          ▼                    ▼
┌─────────────────┐    ┌─────────────────────────────────────────┐
│   ideas table   │    │  process-prompt function                │
│   flows table   │    │  ├── Load idea + flow + prompt          │
│   prompts table │    │  ├── Build LLM message history          │
│   models table  │    │  ├── Call provider (Fireworks/OpenAI/   │
│   chat_messages │    │  │   Anthropic)                          │
│   telegram_chat │    │  ├── Validate JSON response (3 retries) │
│   _config       │    │  ├── Store messages in chat_messages    │
└─────────────────┘    │  ├── Update idea category/score         │
                       │  └── Chain next prompt (async invoke)   │
                       └─────────────────────────────────────────┘
                                        │
                                        ▼
                       ┌─────────────────────────────────────────┐
                       │  telegram-webhook function              │
                       │  ├── Receive Telegram messages          │
                       │  ├── Parse commands (/flows, /setflow)  │
                       │  ├── Resolve flow for chat              │
                       │  ├── Create idea in database            │
                       │  └── Trigger process-prompt chain       │
                       └─────────────────────────────────────────┘
```

### 1.4 Frontend → Backend Flow Diagram

```
User Action → Frontend → Backend → Database → AI Processing

1. VOICE RECORDING FLOW:
   User speaks → VoiceRecorder.jsx → Web Speech API (browser)
   → Transcript → Supabase insert (ideas + chat_messages)
   → Edge Function invoke (process-prompt)
   → LLM API call → Response stored → Status updated
   → Frontend polls for status changes

2. TELEGRAM FLOW:
   User sends message → Telegram API → Webhook
   → telegram-webhook edge function
   → Parse command or idea text → Database insert
   → Trigger process-prompt chain
   → Send confirmation back to Telegram

3. IDEA VIEWING FLOW:
   User navigates → IdeasPage.jsx → Supabase query (ideas)
   → Display list with filters/sort
   → User clicks idea → IdeaDetailPage.jsx
   → Query idea + chat_messages → Display conversation

4. CONFIGURATION FLOW:
   User visits /prompts, /flows, /models → CRUD operations
   → Supabase direct table access (no RLS)
   → Drag-and-drop flow builder (dnd-kit)
```

### 1.5 Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     STATE LIFECYCLE                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐     ┌──────────┐     ┌─────────────────────┐  │
│  │  RECORDED│────▶│PROCESSING│────▶│     COMPLETED       │  │
│  │          │     │          │     │                     │  │
│  │ - User   │     │ - AI     │     │ - Analysis complete │  │
│  │   submits│     │   chain  │     │ - Category assigned │  │
│  │   idea   │     │   running│     │ - Score assigned    │  │
│  │ - Initial│     │ - Poll   │     │ - Full chat history │  │
│  │   message│     │   every  │     │   available         │  │
│  │   stored │     │   2s     │     │                     │  │
│  └──────────┘     └──────────┘     └─────────────────────┘  │
│       │                  │                    │               │
│       ▼                  ▼                    ▼               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                    FAILED                           │    │
│  │  - JSON validation failed after 3 retries          │    │
│  │  - Raw response stored for debugging                 │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. BACKEND/FRONTEND DEPENDENCY ANALYSIS

### 2.1 Critical Backend Dependencies (Must Preserve)

| Component | Purpose | Risk Level | Notes |
|-----------|---------|------------|-------|
| **Supabase Client** | Database access | **LOW** | Standard client, easily reconnectable |
| **process-prompt** | AI processing pipeline | **MEDIUM** | Complex chaining logic, well-tested |
| **telegram-webhook** | Telegram integration | **LOW** | Independent, no frontend coupling |
| **Database Schema** | Data persistence | **LOW** | Stable, no changes needed |
| **AI Providers** | LLM API adapters | **LOW** | Abstracted, swappable |

### 2.2 Frontend Dependencies on Backend

```
Frontend Pages → Backend Tables/Functions:

VoiceRecorderPage.jsx
  ├── ideas (INSERT)
  ├── chat_messages (INSERT)
  └── process-prompt (INVOKE via fetch)

IdeasPage.jsx
  ├── ideas (SELECT, ORDER BY created_at)
  └── ideas (DELETE)

IdeaDetailPage.jsx
  ├── ideas (SELECT by id)
  └── chat_messages (SELECT by idea_id)

PromptsPage.jsx
  └── prompts (CRUD)

FlowsPage.jsx
  ├── flows (CRUD)
  └── prompts (SELECT for dropdown)

ModelsPage.jsx
  └── models (CRUD)

SetupScreen.jsx
  └── Supabase URL + Key (localStorage)
```

### 2.3 API Contract Summary

**Database Tables (Direct Supabase REST):**
- `ideas`: id, idea, category, score, flow_id, status, telegram_chat_id, telegram_message_id, created_at
- `flows`: id, flow_name, prompt_ids, telegram_command, created_at
- `prompts`: id, prompt_name, prompt, multi_turn, created_at
- `models`: id, model_name, model_id, provider, is_active, created_at
- `chat_messages`: id, idea_id, message, role, prompt_id, sequence_number, created_at
- `telegram_chat_config`: telegram_chat_id, flow_id, created_at, updated_at

**Edge Functions (HTTP POST):**
- `process-prompt`: `{ idea_id, prompt_index }` → `{ ok: true }`
- `telegram-webhook`: Telegram webhook payload → `{ ok: true }`

### 2.4 Authentication & Authorization

- **No user authentication** — trust-based system
- **Row Level Security (RLS) disabled** on all tables
- **Supabase credentials** stored in localStorage (sb_url, sb_key)
- **Telegram authorization** via TELEGRAM_ALLOWED_USERS env var

### 2.5 Hidden Coupling Risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Status Polling** | Frontend polls every 2s for processing ideas | Can be replaced with Supabase Realtime subscriptions |
| **Hardcoded Colors** | Status colors scattered across components | Centralize in theme system |
| **Flow Resolution** | Frontend assumes first flow is default | Backend handles this, frontend just passes flow_id |
| **Message Sequence** | Frontend assumes sequence_number ordering | Backend guarantees this, frontend displays |
| **Telegram Integration** | Frontend doesn't know about Telegram | No coupling — independent channel |

---

## 3. ARCHITECTURAL EXTRACTION STRATEGY

### 3.1 Extraction Philosophy

**Core Principle:** The existing frontend is a temporary interface. We will build a completely new frontend in an isolated folder while preserving all backend connectivity.

### 3.2 Safe Extraction Plan

```
Phase A: Isolation (No Risk)
├── Create new folder: frontend-v2/ (or atmospheric/)
├── Copy only: package.json dependencies (as reference)
├── Do NOT touch: frontend/ (existing) during development
└── New frontend will connect to same Supabase instance

Phase B: Backend Preservation (No Risk)
├── All backend code remains untouched
├── Database schema unchanged
├── Edge functions unchanged
└── API contracts honored exactly

Phase C: Gradual Migration (Controlled Risk)
├── Test new frontend against same backend
├── Verify all CRUD operations work
├── Verify AI processing pipeline works
├── Verify Telegram integration unaffected
└── Only then swap frontend/ folder

Phase D: Cleanup (After Validation)
├── Archive old frontend to frontend-legacy/
├── Rename new folder to frontend/
├── Update build scripts
└── Remove legacy code
```

### 3.3 Reusable Logic Inventory

**Can Reuse (Business Logic):**
- Supabase client initialization pattern
- Database query patterns (SELECT, INSERT, UPDATE, DELETE)
- Status polling logic (every 2 seconds)
- Flow resolution algorithm (frontend doesn't need this)
- Message formatting and display

**Must Rebuild (UI Layer):**
- All React components (complete rewrite)
- All CSS/Tailwind classes (new design system)
- All animations (new motion philosophy)
- Page layouts (new spatial design)
- Icon system (new aesthetic)

**Can Adapt (With Modifications):**
- Speech recognition hook (useSpeechRecognition)
- Audio visualizer hook (useAudioVisualizer)
- Drag-and-drop logic (dnd-kit → new DnD library or custom)
- Router structure (same routes, new implementation)

### 3.4 Dead Components Identification

| Component | Status | Reason |
|-----------|--------|--------|
| `ParticleCanvas.jsx` | **DISPOSABLE** | Will be replaced with WebGL scene |
| `LoadingStates.jsx` | **ADAPT** | Concepts reusable, implementation new |
| `StatusBadge.jsx` | **DISPOSABLE** | Simple component, rebuild with new design |
| `SetupScreen.jsx` | **ADAPT** | Functionality needed, new aesthetic |
| `NavBar.jsx` | **DISPOSABLE** | New navigation paradigm (terminal/command) |
| `hero.png` | **DISPOSABLE** | New visual identity |
| `react.svg`, `vite.svg` | **DISPOSABLE** | Default assets |

---

## 4. RESEARCH FINDINGS SYNTHESIS

### 4.1 UI Research — Retro Terminal & CRT Aesthetics

**Key Findings:**

1. **Terminal Aesthetics Create Intellectual Intimacy**
   - Monospace fonts + dark backgrounds = contemplative space
   - Character cell grids (80×24) create rhythm and predictability
   - Blinking cursor = presence, listening, waiting
   - Command-line imperative = user tells system what to do

2. **CRT Effects Create Emotional Resonance**
   - Phosphor persistence = memory, ghosting, past thoughts lingering
   - Scanlines = structure, order, mechanical precision
   - Curvature = portal, depth, looking into another world
   - Flicker = instability, life, electricity, impermanence

3. **Abandoned Software Aesthetics**
   - Bit rot and glitch = time passing, decay, nostalgia
   - Vaporwave = 90s corporate imagery, pastel colors, classical statues
   - "Dead Internet" = Geocities-era web, broken links, visitor counters
   - Recovery narrative = UI suggests it was found, not designed

4. **Cyberdeck UIs**
   - William Gibson's Neuromancer: "lines of light ranged in the nonspace of the mind"
   - DIY cyberdecks: mechanical keyboards, small screens, exposed components
   - Functional art: utilitarian beauty, hacker culture

**Reference Implementations:**
- **cool-retro-term-webgl**: WebGL-based CRT terminal emulator — primary reference
- **retro-terminal**: React + Vite + Tailwind + Framer Motion terminal portfolio
- **CRT-FX**: WebGL shader-based CRT monitor effects library
- **obsidian-crt-phosphor**: CSS-based CRT terminal theme with boot sequence

### 4.2 Motion Research — CRT Effects & Atmospheric Animation

**Key Technical Findings:**

1. **Phosphor Persistence**
   - Power-law decay (not exponential) creates authentic trails
   - Frame buffering: maintain 2-4 previous frames with decreasing opacity
   - Shader-based: floating-point framebuffers with feedback loops
   - Parameters: decay_rate (0.85-0.98), trail_intensity (0.1-0.4)

2. **Scanline Rendering**
   - CSS: linear-gradient with 4px spacing
   - WebGL: sin(uv.y * 800.0) for 800 scanlines
   - Canvas: procedural fillRect loops
   - Parameters: scanline_count, scanline_opacity (0.05-0.2)

3. **Delayed Text Rendering (Typewriter)**
   - Base speed: 30-100ms per character
   - Variance: 10-30ms random deviation
   - Punctuation pauses: 2.5x for `.!?`, 1.5x for `,;`
   - Stutter probability: 0.01-0.05 (simulates sticky keys)

4. **Low-Frame Ambient Animation**
   - Target 8-15 FPS (not 60) for "heavier" feel
   - Breathing glow: 4-8 second sinusoidal cycles
   - Drifting text: ±1px over 10-20 seconds
   - Flickering cursor: irregular blink timing

5. **Shader-Based Distortion**
   - Screen curvature: barrel distortion (0.0-0.1)
   - Chromatic aberration: RGB channel separation (0.001-0.01)
   - Signal noise: fract(sin(dot(uv, vec2(12.9898, 78.233)) + time) * 43758.5453)
   - Bloom: two-pass Gaussian blur on bright areas

**Recommended Architecture:**
```
Layer Stack (Bottom to Top):
1. Background: Dark void with subtle noise texture
2. Content Layer: HTML text with typewriter effects
3. Phosphor/Ghost Buffer: WebGL framebuffer for persistence
4. Scanlines: CSS overlay or WebGL post-process
5. Distortion: WebGL curvature + chromatic aberration
6. Bloom: WebGL glow on bright text
7. Vignette: CSS radial gradient
8. Flicker: CSS animation or JS opacity modulation
9. Bezel/Frame: CSS border-image (optional)
```

### 4.3 Frontend Architecture Research

**Key Technical Recommendations:**

1. **React Three Fiber (R3F) for WebGL Background**
   - Version: @react-three/fiber ^9.0.0, @react-three/drei ^10.0.0
   - Use `<Canvas>` with `gl={{ antialias: false, alpha: true }}`
   - Adaptive quality with `PerformanceMonitor` from drei
   - InstancedMesh for repeated geometry (particles, debris)

2. **Render Layering Strategy**
   - WebGL Layer: fixed, z-index 0, full viewport
   - DOM UI Layer: fixed, z-index 10, pointer-events: none (selective auto)
   - Never store rapidly changing state (mouse, time) in React state
   - Use refs and `useFrame` for animation values

3. **State Management: Zustand**
   - Minimal boilerplate (~1KB)
   - Excellent R3F integration
   - Outside-React access for `useFrame` loops
   - DevTools integration for time-travel debugging
   - Slices pattern for organization

4. **Vite Optimization**
   - Code splitting: separate Three.js into its own chunk
   - Preload critical assets (fonts, initial textures)
   - Tree-shaking Three.js (import from `three` core)
   - GLSL minification with `vite-plugin-glsl`

5. **Postprocessing Pipeline**
   - @react-three/postprocessing ^3.0.0
   - EffectComposer with selective bloom
   - Order: Bloom → Tone Mapping → Noise
   - Disable MSAA on Canvas, use SMAA pass instead

6. **Font Loading Strategy**
   - Self-host WOFF2 fonts with `font-display: swap`
   - Preload critical font in index.html
   - Subset fonts to needed characters (~30KB)
   - Fallback: `font-family: 'JetBrains Mono', 'Courier New', monospace`

### 4.4 Design Language Research

**Key Psychological Findings:**

1. **Perception-First Design (PFD)**
   - 5-layer diagnostic framework: Cognitive Load → First Impression → Processing Fluency → Perception Bias → Decision Architecture
   - ~100 peer-reviewed citations
   - Ralph Loop methodology for iterative refinement

2. **Cognitive Load Theory**
   - Working memory limited to 3-5 chunks (Cowan)
   - Intrinsic, germane, and extraneous load
   - Reduce extraneous load through minimalism

3. **Processing Fluency**
   - Reber & Schwarz truth effect: fluent = true = beautiful
   - Aesthetic pleasure from easy processing
   - Mere exposure effect: familiarity breeds preference

4. **Calm Technology (Weiser & Brown, 1995)**
   - Technology should require smallest possible attention
   - Inform but not demand
   - Use the periphery
   - Examples: "Dangling String" (LiveWire) — physical string moves with network traffic

5. **Emotional Design (Donald Norman)**
   - Visceral level: immediate emotional response
   - Behavioral level: usability, pleasure of use
   - Reflective level: self-image, personal satisfaction
   - Four pleasures: physio, socio, psycho, ideo

6. **Dark Mode & Low-Light Design**
   - Pupil response: dark backgrounds reduce eye strain
   - OLED power savings
   - Long-term myopia considerations
   - Contrast polarity effects

### 4.5 GitHub Scout — Reference Catalog

**Top Reference Implementations:**

| Repository | Relevance | Extractable Patterns |
|------------|-----------|---------------------|
| **cool-retro-term-webgl** | ⭐⭐⭐⭐⭐ | Shader architecture, phosphor decay, XTerm.js integration |
| **retro-terminal (Sanjays2402)** | ⭐⭐⭐⭐⭐ | React terminal, command system, theme switching |
| **CRT-FX (stefanlegg)** | ⭐⭐⭐⭐⭐ | Modular effects, phosphor masks, parameter system |
| **obsidian-crt-phosphor** | ⭐⭐⭐⭐ | CSS-only approach, boot sequence, IBM Plex Mono |
| **CRT-Dusha (Riskdiver)** | ⭐⭐⭐⭐ | Scientific phosphor decay, Fibonacci weighting |
| **webgl-crt-shader (gingerbeardman)** | ⭐⭐⭐⭐ | Mobile optimization, parameter-driven effects |
| **RetroZone (Phaser)** | ⭐⭐⭐ | Dual-mode (Vector + CRT), bloom passes, chromatic aberration |
| **threejs.paris** | ⭐⭐⭐ | SSGI warm lighting, physics-driven UI, WebGPU |
| **pixel-ui (joacod)** | ⭐⭐⭐ | Pixel-art React components, Base UI integration |
| **Indie Bytes Retro UI Kit** | ⭐⭐⭐ | Risograph effects, vintage LCD, Space Mono |

---

## 5. DESIGN LANGUAGE REPORT

### 5.1 Core Identity

**"An abandoned operating system for thinkers and dreamers."**

This is NOT a SaaS dashboard. This is a cognition machine that happens to process startup ideas. The interface should feel like:
- A forgotten terminal in a abandoned research lab
- A late-night philosophical companion
- A recovered experimental OS from 1987 that somehow still works
- A machine designed for impossible ideas
- A lonely machine still listening at 2:13 AM

### 5.2 Emotional Qualities

| Quality | How to Create It |
|---------|-----------------|
| **Solitude** | Full-screen immersion, no social features, no sharing buttons, no user counts |
| **Mystery** | Partially hidden controls, discovery-based interaction, no tutorials, no onboarding |
| **Intellectual Intimacy** | Monospace text, command-line interaction, direct address, personal language |
| **Late-Night Energy** | Dark palette, low brightness, warm phosphor glow, quiet sounds |
| **Recovered System** | Boot sequence, system messages, version numbers, diagnostic output |
| **Listening** | Blinking cursor, subtle animations, responsive to input, waiting state |

### 5.3 Visual System Directives

**USE:**
- Negative space (generous margins, breathing room)
- Tiny metadata typography (8-10px mono for timestamps, IDs)
- 1px borders (sharp, precise, technical)
- Dim phosphor glow (text-shadow, not box-shadow)
- Sparse blinking indicators (cursor, status dots)
- Scanlines (subtle, 5-10% opacity)
- UI ghosting (previous states faintly visible)
- Delayed rendering (typewriter, not instant)
- Low brightness (not pure black, not pure white)
- Subtle noise textures (film grain, static)
- Monochrome restraint (one accent color max)

**DO NOT USE:**
- Generic SaaS cards (no rounded corners, no shadows)
- Glassmorphism (no blur effects on UI)
- Gradient-heavy UI (no linear gradients)
- Oversized hero sections (no marketing language)
- Floating AI blobs (no chatbot avatars)
- Fintech aesthetics (no data viz charts)
- Excessive border radius (sharp corners only)
- Polished startup visuals (no "designed by committee" feel)

### 5.4 Color Palette

```css
/* Core Palette */
--color-bg-deep: #020202;           /* Nearly black, not pure black */
--color-bg-surface: #0a0a0f;        /* Slightly elevated */
--color-bg-elevated: #111118;       /* Cards, panels */

/* Phosphor Colors */
--color-phosphor-primary: #00f3ff;  /* Cyan phosphor (main accent) */
--color-phosphor-dim: rgba(0, 243, 255, 0.3);
--color-phosphor-glow: rgba(0, 243, 255, 0.15);

/* Amber Warning (restrained use) */
--color-amber: #ffb000;             /* Muted warning amber */
--color-amber-dim: rgba(255, 176, 0, 0.3);

/* Monochrome Scale */
--color-text-primary: #e0e0e0;    /* Slightly dimmed white */
--color-text-secondary: #8a8a8a;  /* Mid gray */
--color-text-muted: #4a4a4a;      /* Dark gray for metadata */
--color-text-dim: #2a2a2a;        /* Very dim for borders */

/* Status Colors (restrained) */
--color-status-active: #00f3ff;     /* Cyan = active/listening */
--color-status-processing: #ffb000; /* Amber = processing */
--color-status-complete: #50ff50;   /* Green = complete (rare) */
--color-status-error: #ff3030;      /* Red = error (rare) */
```

### 5.5 Typography System

```css
/* Primary: Departure Mono */
--font-mono: 'Departure Mono', 'IBM Plex Mono', 'JetBrains Mono', monospace;

/* Secondary: IBM Plex Mono (fallback) */
--font-mono-fallback: 'IBM Plex Mono', 'Courier New', monospace;

/* Display: VT323 (selective use) */
--font-display: 'VT323', monospace;

/* Size Scale */
--text-xs: 10px;      /* Metadata, timestamps, IDs */
--text-sm: 12px;      /* Labels, hints */
--text-base: 14px;    /* Body text, terminal output */
--text-lg: 16px;      /* Emphasis, headings */
--text-xl: 20px;      /* Section headers */
--text-2xl: 24px;     /* Major headings (rare) */

/* Line Heights */
--leading-tight: 1.2;   /* Terminal output */
--leading-normal: 1.5;  /* Body text */
--leading-relaxed: 1.8; /* Reading passages */
```

### 5.6 Spacing System

```css
/* Based on terminal character cell (8×16px) */
--space-1: 4px;       /* 0.25ch */
--space-2: 8px;       /* 0.5ch */
--space-3: 16px;      /* 1ch */
--space-4: 24px;      /* 1.5ch */
--space-5: 32px;      /* 2ch */
--space-6: 48px;      /* 3ch */
--space-7: 64px;      /* 4ch */
--space-8: 96px;      /* 6ch */

/* Generous margins for contemplation */
--section-margin: 96px;
--card-padding: 24px;
```

---

## 6. PERCEPTION-FIRST ANALYSIS

### 6.1 How the Interface Creates Solitude

**Principle:** Solitude is created by removing social context and emphasizing the one-to-one relationship between user and machine.

**Implementation:**
1. **No user accounts** — the machine doesn't know your name, doesn't greet you
2. **No sharing features** — ideas stay in the machine, no "share to Twitter"
3. **No collaboration** — no multi-user, no comments, no likes
4. **Full-screen mode** — terminal takes over the entire viewport
5. **No notifications** — the machine waits, it doesn't demand
6. **Personal language** — "Your idea", "Your thoughts", intimate second person
7. **Late-night palette** — dark, warm, low brightness like a desk lamp at 2 AM

### 6.2 How the Interface Creates Mystery

**Principle:** Mystery is created by partial revelation, hidden depth, and the sense that there's more to discover.

**Implementation:**
1. **No onboarding** — user must explore, no guided tour
2. **Hidden commands** — easter eggs, secret key combinations
3. **Partial UI** — some controls only appear on hover or in specific modes
4. **Cryptic system messages** — "Signal stable", "Memory fragment recovered"
5. **Unlabeled indicators** — blinking dots that mean something to the initiated
6. **Boot sequence** — system initialization that reveals fragments of lore
7. **Archive aesthetic** — "Recovered from sector 7G", "Last accessed: 1987-03-15"

### 6.3 How the Interface Creates Intellectual Intimacy

**Principle:** Intellectual intimacy is created by precision, depth, and the sense that the machine understands complex thought.

**Implementation:**
1. **Monospace text** — code, poetry, terminal output = thinking space
2. **Direct command interface** — user speaks to machine as equal
3. **Deep analysis display** — show the full reasoning, not just conclusions
4. **Thought stream** — display ideas as continuous flow, not discrete cards
5. **Metadata richness** — timestamps, IDs, processing steps, technical details
6. **No dumbing down** — use technical terms, assume intelligence
7. **Paul Graham framework** — serious intellectual tool, not toy

### 6.4 How the Interface Evokes Late-Night Thinking Energy

**Principle:** Late-night energy is contemplative, focused, slightly melancholic, and deeply creative.

**Implementation:**
1. **Dark mode only** — no light mode, ever
2. **Low brightness** — dim phosphor, not bright neon
3. **Warm accents** — amber and cyan, not harsh blue
4. **Slow animations** — no bouncy, energetic motion
5. **Quiet sounds** — mechanical keyboard clicks, disk access, fan hum
6. **Minimal chrome** — no distractions, just content and space
7. **Oscar Wilde quote** — philosophical, provocative, slightly dangerous

### 6.5 How Latency Should FEEL

| Operation | Target Latency | Feel |
|-----------|---------------|------|
| **Character display** | 25-60ms | Mechanical, deliberate, typewriter |
| **Cursor blink** | 530ms ± 100ms | Hypnotic, steady, alive |
| **Page transition** | 300-500ms | Fade, not slide — memory, not movement |
| **AI response start** | 1-2s | Contemplation, thinking, not instant |
| **AI response stream** | 50-100ms/char | Typing, not appearing — someone is writing |
| **Status update** | 2s (poll) | Slow, patient, not demanding |
| **Boot sequence** | 3-5s total | Dramatic, theatrical, building anticipation |

### 6.6 Empty Space as Design Material

**Principle:** In a terminal interface, empty space is not absence — it's potential, silence, waiting.

**Implementation:**
1. **Generous margins** — 96px between sections minimum
2. **Single-column layout** — no sidebars, no multi-panel
3. **Breathing room around text** — 48px padding in cards
4. **Sparse UI density** — one action per screen, one thought at a time
5. **Whitespace as pause** — transitions through empty space
6. **Terminal scrollback** — empty space above = history, below = future
7. **Full-screen void** — WebGL background is mostly empty, with sparse elements

### 6.7 Alive vs Abandoned vs Unstable vs Listening

| Element | State | Visual Behavior |
|---------|-------|----------------|
| **Cursor** | Listening | Blinking steadily, 530ms interval |
| **Status dot** | Active | Cyan glow, slow pulse (4s cycle) |
| **Background** | Alive | Particles drift slowly, almost imperceptibly |
| **Text** | Active | Phosphor glow, slight flicker |
| **UI chrome** | Abandoned | Slightly desaturated, 1px borders only |
| **Error states** | Unstable | Brief glitch, chromatic aberration flash |
| **Loading** | Listening | Cursor waits, no spinner, just patience |
| **Completed** | Abandoned | Fade to dim, ghost of previous state |

### 6.8 "Recovered Experimental Operating System" Visual Behaviors

1. **Boot Sequence**
   ```
   > MEMORY CHECK: 640K OK
   > LOADING COGNITION KERNEL... [OK]
   > MOUNTING THOUGHT_VOLUME... [OK]
   > AN IDEA THAT IS NOT DANGEROUS...
   > ...IS UNWORTHY OF BEING CALLED AN IDEA AT ALL.
   > — OSCAR WILDE
   > SYSTEM READY.
   > _
   ```

2. **System Messages**
   - "Signal stable" (not "Connected")
   - "Memory fragment recovered" (not "Idea saved")
   - "Processing in sector 7G" (not "Analyzing...")
   - "Transmission archived" (not "Saved to database")

3. **Visual Artifacts**
   - Occasional pixel misalignment (0.5px offset)
   - Brief brightness fluctuations (power supply simulation)
   - Scanline intensity variation (CRT refresh simulation)
   - Subtle chromatic aberration at edges (lens distortion)

4. **Time Displacement**
   - Timestamps in Unix epoch or obscure formats
   - "Last accessed: 1987-03-15 02:13:47"
   - Version numbers like "v0.7.3-alpha-recovered"

### 6.9 Emotional Pacing of the UI

```
BOOT (0-5s)
├── Anticipation: Black screen, then faint glow
├── Curiosity: System messages appear slowly
├── Connection: Oscar Wilde quote — philosophical anchor
└── Resolution: Cursor appears, ready

RECORDING (variable)
├── Focus: Minimal UI, just cursor and waveform
├── Intimacy: Voice visualized as gentle particles
├── Tension: Waiting for user to finish
└── Release: Idea captured, brief acknowledgment

PROCESSING (2-30s)
├── Patience: Slow status updates, not spinners
├── Mystery: "Processing in sector 7G"
├── Contemplation: Background particles drift
└── Revelation: Results appear character by character

READING (variable)
├── Depth: Full analysis displayed as terminal output
├── Understanding: User reads, scrolls, contemplates
├── Action: Commands available to explore deeper
└── Closure: Idea archived, return to void
```

---

## 7. FRONTEND FOLDER STRUCTURE PROPOSAL

### 7.1 New Frontend Architecture

```
frontend-v2/                          # New atmospheric frontend
├── public/
│   ├── fonts/
│   │   ├── DepartureMono-Regular.woff2
│   │   ├── IBMPlexMono-Regular.woff2
│   │   ├── IBMPlexMono-Bold.woff2
│   │   └── VT323-Regular.woff2
│   ├── textures/
│   │   ├── noise.png                 # Film grain overlay
│   │   └── scanlines.png             # Scanline pattern
│   └── favicon.svg
├── src/
│   ├── main.jsx                      # React entry point
│   ├── App.jsx                       # Router + global layout
│   ├── index.css                     # Global styles, CSS variables, fonts
│   │
│   ├── stores/                       # Zustand state management
│   │   ├── appStore.js               # Global UI state
│   │   ├── audioStore.js             # Audio visualization data
│   │   ├── terminalStore.js          # Terminal command history
│   │   └── settingsStore.js          # User preferences (persisted)
│   │
│   ├── scenes/                       # React Three Fiber scenes
│   │   ├── AtmosphericScene.jsx      # Main WebGL background
│   │   ├── PrometheusBust.jsx        # Low-poly Prometheus model
│   │   ├── DigitalFlame.jsx        # Flame effect in Prometheus hand
│   │   ├── SynapticParticles.jsx     # Orbiting particle system
│   │   └── PostProcessing.jsx        # CRT effects pipeline
│   │
│   ├── shaders/                      # GLSL shaders
│   │   ├── crt.vert                  # CRT vertex shader
│   │   ├── crt.frag                  # CRT fragment shader
│   │   ├── phosphor.frag             # Phosphor persistence
│   │   ├── scanlines.frag            # Scanline overlay
│   │   ├── noise.frag                # Analog noise
│   │   └── bloom.frag                # Glow/bloom effect
│   │
│   ├── components/                   # React components
│   │   ├── terminal/               # Terminal UI system
│   │   │   ├── Terminal.jsx          # Main terminal container
│   │   │   ├── TerminalLine.jsx      # Single line of output
│   │   │   ├── TerminalInput.jsx     # Command input with cursor
│   │   │   ├── TypewriterText.jsx    # Character-by-character rendering
│   │   │   ├── BlinkingCursor.jsx    # Mechanical cursor
│   │   │   └── BootSequence.jsx      # Startup animation
│   │   │
│   │   ├── ui/                       # UI overlay components
│   │   │   ├── StatusBar.jsx         # Top status bar
│   │   │   ├── CommandPalette.jsx    # Command palette overlay
│   │   │   ├── IdeaPanel.jsx         # Idea display panel
│   │   │   ├── AnalysisDisplay.jsx   # AI analysis output
│   │   │   ├── RecordingIndicator.jsx # Voice recording UI
│   │   │   └── Navigation.jsx        # Keyboard-driven navigation
│   │   │
│   │   ├── effects/                  # Visual effects components
│   │   │   ├── Scanlines.jsx         # CSS scanline overlay
│   │   │   ├── PhosphorGlow.jsx      # Text glow effect
│   │   │   ├── Vignette.jsx          # Edge darkening
│   │   │   ├── Flicker.jsx           # Screen flicker
│   │   │   └── NoiseOverlay.jsx      # Film grain
│   │   │
│   │   └── layout/                   # Layout components
│   │       ├── CanvasLayer.jsx       # WebGL canvas container
│   │       ├── UILayer.jsx           # DOM UI overlay
│   │       └── BootScreen.jsx        # Initial boot screen
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useTypewriter.js          # Typewriter effect hook
│   │   ├── useAudioVisualizer.js     # Audio analysis (adapted)
│   │   ├── useSpeechRecognition.js   # Web Speech API (adapted)
│   │   ├── useKeyboardNavigation.js  # Keyboard shortcut handler
│   │   ├── useCRTEffect.js           # CRT shader controls
│   │   ├── useTerminalCommands.js    # Command parsing and routing
│   │   └── useSupabase.js            # Database queries
│   │
│   ├── lib/                          # Utilities and clients
│   │   ├── supabase.js               # Supabase client (reused)
│   │   ├── commands.js               # Terminal command definitions
│   │   ├── shaders.js                # Shader compilation helpers
│   │   ├── audio.js                  # Audio context utilities
│   │   └── constants.js              # Theme constants, config
│   │
│   ├── pages/                        # Page-level components
│   │   ├── BootPage.jsx              # Boot sequence page
│   │   ├── TerminalPage.jsx          # Main terminal interface
│   │   ├── IdeasArchive.jsx          # Ideas list (terminal style)
│   │   ├── IdeaDetail.jsx            # Single idea analysis
│   │   ├── InterrogationModules.jsx  # Paul Graham test, etc.
│   │   ├── SettingsPage.jsx          # System settings
│   │   └── HelpPage.jsx              # Command reference
│   │
│   └── types/                        # TypeScript types (if migrating)
       └── index.ts

├── index.html                        # HTML entry point
├── vite.config.js                    # Vite configuration
├── tailwind.config.js               # Tailwind theme customization
├── package.json                     # Dependencies
└── README.md                        # Documentation
```

### 7.2 Key Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.15.0",
    "@react-three/fiber": "^9.0.0",
    "@react-three/drei": "^10.0.0",
    "@react-three/postprocessing": "^3.0.0",
    "postprocessing": "^7.0.0",
    "three": "^0.172.0",
    "zustand": "^5.0.0",
    "framer-motion": "^12.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0",
    "@supabase/supabase-js": "^2.105.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react-swc": "^3.8.0",
    "vite": "^6.0.0",
    "vite-plugin-glsl": "^1.3.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.1.6",
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/three": "^0.172.0"
  }
}
```

---

## 8. RENDERING PIPELINE PROPOSAL

### 8.1 Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 9: Bezel/Frame (optional)                              │
│  CSS border-image for CRT monitor frame                      │
│  z-index: 100                                                │
├─────────────────────────────────────────────────────────────┤
│  LAYER 8: Flicker Overlay                                     │
│  CSS animation or JS opacity modulation                       │
│  Random 30-120ms intervals, 0.01-0.08 intensity              │
│  z-index: 90                                                 │
├─────────────────────────────────────────────────────────────┤
│  LAYER 7: Vignette                                            │
│  CSS radial-gradient darkening edges                         │
│  z-index: 80                                                 │
├─────────────────────────────────────────────────────────────┤
│  LAYER 6: Bloom/Glow (WebGL Postprocessing)                   │
│  Two-pass Gaussian blur on bright areas                      │
│  Threshold: 0.5, Radius: 4-8px, Intensity: 0.5-1.5         │
│  z-index: 70 (rendered within Canvas)                      │
├─────────────────────────────────────────────────────────────┤
│  LAYER 5: Distortion (WebGL Postprocessing)                   │
│  Barrel distortion + chromatic aberration                    │
│  Curvature: 0.04, Aberration: 0.005                        │
│  z-index: 60 (rendered within Canvas)                      │
├─────────────────────────────────────────────────────────────┤
│  LAYER 4: Scanlines (CSS or WebGL)                            │
│  Horizontal lines at 4px spacing, 5-15% opacity             │
│  z-index: 50                                                 │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: Phosphor/Ghost Buffer (WebGL)                      │
│  Framebuffer feedback loop for persistence trails            │
│  Decay rate: 0.90-0.95                                       │
│  z-index: 40 (rendered within Canvas)                      │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: DOM UI Overlay                                      │
│  Terminal interface, text, controls                          │
│  pointer-events: none (selective auto on interactive)        │
│  z-index: 10                                                 │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1: WebGL Background (React Three Fiber)               │
│  Low-poly Prometheus, digital flame, particles               │
│  Postprocessing: Bloom, Vignette, Noise                    │
│  z-index: 0                                                  │
├─────────────────────────────────────────────────────────────┤
│  LAYER 0: Base Background                                     │
│  Solid color: #020202                                        │
│  z-index: -1                                                 │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 WebGL Scene Composition

```jsx
// AtmosphericScene.jsx
function AtmosphericScene() {
  return (
    <Canvas
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance'
      }}
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0
      }}
    >
      <Suspense fallback={null}>
        <PerformanceMonitor
          onDecline={() => setSceneQuality('low')}
        />
        
        {/* Postprocessing Pipeline */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.3}
            mipmapBlur
          />
          <Vignette
            eskil={false}
            offset={0.1}
            darkness={1.2}
          />
          <Noise opacity={0.03} />
        </EffectComposer>
        
        {/* Scene Content */}
        <PrometheusBust />
        <DigitalFlame />
        <SynapticParticles count={200} />
        <AmbientLight intensity={0.2} />
        <pointLight position={[2, 2, 2]} intensity={0.5} color="#00f3ff" />
      </Suspense>
    </Canvas>
  )
}
```

### 8.3 CSS Overlay Composition

```jsx
// UILayer.jsx
function UILayer() {
  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {/* Terminal Interface */}
      <div className="pointer-events-auto">
        <Terminal />
      </div>
      
      {/* Status Bar */}
      <div className="pointer-events-auto">
        <StatusBar />
      </div>
      
      {/* Scanlines Overlay */}
      <Scanlines />
      
      {/* Vignette Overlay */}
      <Vignette />
      
      {/* Flicker Overlay */}
      <Flicker />
      
      {/* Noise Overlay */}
      <NoiseOverlay />
    </div>
  )
}
```

---

## 9. MOTION/ANIMATION PHILOSOPHY

### 9.1 Core Principles

1. **Slowness is Beauty** — Animations should feel heavy, deliberate, ancient
2. **Mechanical Precision** — Like a well-engineered machine, not organic fluidity
3. **Imperfection is Authentic** — Slight stutter, random variance, wear and tear
4. **Silence is Presence** — Long pauses between actions, empty space is active
5. **Ghosting is Memory** — Previous states linger faintly, history is visible

### 9.2 Animation Parameters

| Effect | Speed | Easing | Variance |
|--------|-------|--------|----------|
| **Typewriter** | 60ms/char | Linear | ±20ms random |
| **Cursor blink** | 530ms | Step | ±100ms random |
| **Page fade** | 400ms | Ease-out | None |
| **Particle drift** | 0.001 units/frame | Linear | Per-particle random |
| **Glow pulse** | 4s cycle | Sine | None |
| **Scanline scroll** | 10s | Linear | None |
| **Flicker** | 30-120ms | Random | Intensity 0.01-0.03 |
| **Phosphor fade** | 2s | Power-law | Decay 0.90-0.95 |

### 9.3 Boot Sequence Animation

```
Timeline (0-5000ms):
├── 0ms: Screen black
├── 200ms: Faint glow appears (center)
├── 500ms: First line: "> MEMORY CHECK: 640K OK"
├── 800ms: Second line: "> LOADING COGNITION KERNEL..."
├── 1200ms: "[OK]" appears after kernel line
├── 1500ms: Third line: "> MOUNTING THOUGHT_VOLUME..."
├── 2000ms: "[OK]" appears after volume line
├── 2500ms: Quote begins: "> AN IDEA THAT IS NOT DANGEROUS..."
├── 3500ms: Quote continues: "...IS UNWORTHY OF BEING CALLED AN IDEA AT ALL."
├── 4000ms: Attribution: "> — OSCAR WILDE"
├── 4500ms: Final line: "> SYSTEM READY."
├── 4800ms: Cursor appears: "> _"
└── 5000ms: Boot complete, transition to main interface
```

### 9.4 Recording State Animation

```
State: LISTENING
├── Background: Particles respond to audio frequency
├── Cursor: Changes to waveform visualization
├── Status: "● LISTENING" — cyan dot pulses slowly
├── Text: "signal stable" — small, dim, below status
└── No large visual elements — minimal, focused

State: PROCESSING
├── Background: Particles slow down, almost freeze
├── Status: "● PROCESSING" — amber dot, slow pulse
├── Text: "sector 7G active" — cryptic, mysterious
├── Occasional glitch flash (chromatic aberration)
└── No progress bar — just waiting

State: COMPLETED
├── Background: Particles resume gentle drift
├── Status: "● COMPLETE" — green dot, brief flash
├── Text: "transmission archived" — archival language
├── Result appears character by character
└── Fade to dim after 30s of inactivity
```

### 9.5 Shader Effects Specification

**CRT Vertex Shader:**
```glsl
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**CRT Fragment Shader:**
```glsl
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uScanlineIntensity;
uniform float uCurvature;
uniform float uChromaticAberration;
uniform vec2 uResolution;

varying vec2 vUv;

// Barrel distortion
vec2 curve(vec2 uv) {
  uv = uv * 2.0 - 1.0;
  vec2 offset = abs(uv.yx) / vec2(6.0, 4.0);
  uv = uv + uv * offset * offset;
  uv = uv * 0.5 + 0.5;
  return uv;
}

// Scanlines
float scanline(vec2 uv) {
  float sl = sin(uv.y * uResolution.y * 0.5) * 0.5 + 0.5;
  return 0.9 + 0.1 * sl;
}

// Chromatic aberration
vec4 chromaticAberration(sampler2D tex, vec2 uv, float amount) {
  vec2 direction = normalize(uv - 0.5);
  float r = texture2D(tex, uv + direction * amount).r;
  float g = texture2D(tex, uv).g;
  float b = texture2D(tex, uv - direction * amount).b;
  return vec4(r, g, b, 1.0);
}

void main() {
  vec2 uv = curve(vUv);
  
  // Chromatic aberration
  vec4 color = chromaticAberration(tDiffuse, uv, uChromaticAberration);
  
  // Scanlines
  color.rgb *= scanline(uv);
  
  // Vignette
  float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 1.5;
  color.rgb *= vignette;
  
  gl_FragColor = color;
}
```

---

## 10. COMPONENT HIERARCHY

### 10.1 Component Tree

```
App
├── BootScreen (initial load)
│   └── BootSequence
│       ├── TerminalLine (memory check)
│       ├── TerminalLine (kernel load)
│       ├── TerminalLine (volume mount)
│       ├── TerminalLine (quote)
│       ├── TerminalLine (attribution)
│       ├── TerminalLine (system ready)
│       └── BlinkingCursor
│
├── CanvasLayer (WebGL background)
│   └── AtmosphericScene
│       ├── PrometheusBust
│       ├── DigitalFlame
│       ├── SynapticParticles
│       └── PostProcessing
│           ├── Bloom
│           ├── Vignette
│           └── Noise
│
├── UILayer (DOM overlay)
│   ├── Scanlines
│   ├── Vignette
│   ├── Flicker
│   ├── NoiseOverlay
│   │
│   ├── StatusBar
│   │   ├── SystemStatus
│   │   ├── ConnectionIndicator
│   │   └── Clock (obscure format)
│   │
│   ├── Terminal (main interface)
│   │   ├── TerminalHeader
│   │   ├── TerminalOutput
│   │   │   └── TerminalLine
│   │   │       ├── TypewriterText
│   │   │       └── Timestamp
│   │   ├── TerminalInput
│   │   │   ├── Prompt
│   │   │   └── BlinkingCursor
│   │   └── TerminalFooter
│   │       └── CommandHints
│   │
│   ├── CommandPalette (overlay)
│   │   ├── CommandInput
│   │   └── CommandList
│   │
│   ├── IdeaPanel (slide-out)
│   │   ├── IdeaHeader
│   │   ├── IdeaContent
│   │   └── AnalysisDisplay
│   │       ├── ScoreIndicator
│   │       └── ReasoningTree
│   │
│   └── RecordingIndicator
│       ├── Waveform
│       └── StatusText
│
└── Navigation (keyboard-driven)
    ├── KeyboardShortcuts
    └── RouteHandler
```

### 10.2 Component Responsibilities

| Component | Responsibility | Props |
|-----------|---------------|-------|
| **App** | Router, global layout, layer coordination | None |
| **BootScreen** | Initial boot animation, system initialization | `onComplete` |
| **CanvasLayer** | WebGL canvas container, fixed position | None |
| **AtmosphericScene** | R3F scene composition | None |
| **PrometheusBust** | Low-poly geometry, subtle rotation | None |
| **DigitalFlame** | Particle system, flickering glow | `intensity` |
| **SynapticParticles** | Orbiting particles, audio-reactive | `audioData`, `count` |
| **UILayer** | DOM overlay, pointer event management | None |
| **Terminal** | Main command interface | `commands`, `history` |
| **TerminalLine** | Single line of terminal output | `text`, `timestamp`, `type` |
| **TypewriterText** | Character-by-character rendering | `text`, `speed`, `onComplete` |
| **BlinkingCursor** | Mechanical cursor with irregular blink | `active`, `style` |
| **StatusBar** | System status display | `status`, `message` |
| **CommandPalette** | Command search and execution | `commands`, `isOpen` |
| **IdeaPanel** | Idea detail display | `idea`, `messages` |
| **RecordingIndicator** | Voice recording status | `isRecording`, `audioData` |

---

## 11. STATE MANAGEMENT STRATEGY

### 11.1 Zustand Store Architecture

```javascript
// stores/appStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useAppStore = create(
  devtools(
    (set, get) => ({
      // Boot state
      bootComplete: false,
      setBootComplete: (complete) => set({ bootComplete: complete }),
      
      // Navigation
      currentPage: 'terminal',
      setCurrentPage: (page) => set({ currentPage: page }),
      
      // Terminal state
      terminalHistory: [],
      addTerminalLine: (line) => set((state) => ({
        terminalHistory: [...state.terminalHistory, line]
      })),
      clearTerminal: () => set({ terminalHistory: [] }),
      
      // UI state
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      
      ideaPanelOpen: false,
      setIdeaPanelOpen: (open) => set({ ideaPanelOpen: open }),
      
      // Recording state
      recordingState: 'idle', // 'idle' | 'listening' | 'processing' | 'completed'
      setRecordingState: (state) => set({ recordingState: state }),
      
      // WebGL quality
      sceneQuality: 'high', // 'high' | 'medium' | 'low'
      setSceneQuality: (quality) => set({ sceneQuality: quality }),
      
      // Theme
      phosphorColor: 'cyan', // 'cyan' | 'amber' | 'green' | 'white'
      setPhosphorColor: (color) => set({ phosphorColor: color }),
    }),
    { name: 'BrainOverflowStore' }
  )
)
```

```javascript
// stores/audioStore.js
import { create } from 'zustand'

export const useAudioStore = create((set) => ({
  // Audio data
  frequencyData: null,
  setFrequencyData: (data) => set({ frequencyData: data }),
  
  // Recording state
  isRecording: false,
  setIsRecording: (recording) => set({ isRecording: recording }),
  
  // Transcript
  transcript: '',
  setTranscript: (text) => set({ transcript: text }),
  
  // Audio context
  audioContext: null,
  setAudioContext: (ctx) => set({ audioContext: ctx }),
}))
```

```javascript
// stores/settingsStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      // Display settings
      crtEffects: true,
      setCrtEffects: (enabled) => set({ crtEffects: enabled }),
      
      scanlines: true,
      setScanlines: (enabled) => set({ scanlines: enabled }),
      
      phosphorPersistence: true,
      setPhosphorPersistence: (enabled) => set({ phosphorPersistence: enabled }),
      
      flicker: true,
      setFlicker: (enabled) => set({ flicker: enabled }),
      
      // Performance
      targetFps: 30,
      setTargetFps: (fps) => set({ targetFps: fps }),
      
      // Audio
      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      
      // Supabase
      supabaseUrl: '',
      setSupabaseUrl: (url) => set({ supabaseUrl: url }),
      
      supabaseKey: '',
      setSupabaseKey: (key) => set({ supabaseKey: key }),
    }),
    {
      name: 'brain-overflow-settings',
      partialize: (state) => ({
        crtEffects: state.crtEffects,
        scanlines: state.scanlines,
        phosphorPersistence: state.phosphorPersistence,
        flicker: state.flicker,
        targetFps: state.targetFps,
        soundEnabled: state.soundEnabled,
        supabaseUrl: state.supabaseUrl,
        supabaseKey: state.supabaseKey,
      }),
    }
  )
)
```

### 11.2 State Flow Diagram

```
User Input
    │
    ▼
┌─────────────┐
│  Keyboard   │
│  Handler    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  Terminal   │◄────│  Command    │
│  Store      │     │  Parser     │
└──────┬──────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│  Router     │
│  (Pages)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  Supabase   │◄───►│  Database   │
│  Client     │     │  (Backend)  │
└──────┬──────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│  UI Update  │
│  (Terminal) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  WebGL      │
│  Scene      │
│  (Visual    │
│  Feedback)  │
└─────────────┘
```

---

## 12. PERFORMANCE CONSIDERATIONS

### 12.1 Performance Budget

| Metric | Target | Low-End Target |
|--------|--------|----------------|
| **First Contentful Paint** | < 1.5s | < 2.5s |
| **Time to Interactive** | < 3s | < 5s |
| **WebGL Init Time** | < 1s after UI | < 2s after UI |
| **Frame Rate (High)** | 60fps | — |
| **Frame Rate (Low)** | — | 30fps stable |
| **Bundle Size (gzipped)** | < 200KB (UI) + 300KB (WebGL) | < 400KB total |
| **Total Blocking Time** | < 200ms | < 500ms |

### 12.2 Adaptive Quality System

```javascript
// hooks/useAdaptiveQuality.js
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useAppStore } from '../stores/appStore'

export function useAdaptiveQuality() {
  const { gl } = useThree()
  const setSceneQuality = useAppStore((s) => s.setSceneQuality)
  
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let lowFpsCount = 0
    
    const checkPerformance = () => {
      const now = performance.now()
      const delta = now - lastTime
      
      if (delta >= 1000) {
        const fps = (frameCount / delta) * 1000
        
        if (fps < 30) {
          lowFpsCount++
          if (lowFpsCount >= 3) {
            setSceneQuality('low')
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 1))
          }
        } else if (fps < 45) {
          setSceneQuality('medium')
        } else {
          lowFpsCount = 0
          setSceneQuality('high')
        }
        
        frameCount = 0
        lastTime = now
      }
      
      frameCount++
      requestAnimationFrame(checkPerformance)
    }
    
    const id = requestAnimationFrame(checkPerformance)
    return () => cancelAnimationFrame(id)
  }, [gl, setSceneQuality])
}
```

### 12.3 Quality Tiers

| Tier | Pixel Ratio | Postprocessing | Geometry | Shaders |
|------|-------------|----------------|----------|---------|
| **High** | `devicePixelRatio` | Full (Bloom, Vignette, Noise) | High-poly, Instanced | Full precision |
| **Medium** | `min(dpr, 1.5)` | Bloom + Tone Mapping | Medium-poly | `mediump` |
| **Low** | `1.0` | Tone mapping only | Low-poly, merged | `lowp`, simplified |

### 12.4 Optimization Strategies

1. **Code Splitting**
   - Three.js in separate chunk
   - WebGL scene lazy-loaded after boot
   - Route-based code splitting

2. **Asset Optimization**
   - Fonts: WOFF2, subsetted, preloaded
   - Textures: KTX2/Basis Universal compression
   - Models: Draco compression for GLTF

3. **Shader Optimization**
   - Pre-warm shaders during boot
   - Reuse materials across meshes
   - Use `mediump` precision on mobile
   - Avoid branching in fragment shaders

4. **Animation Optimization**
   - Use refs for animation values (not React state)
   - Throttle `useFrame` to target FPS
   - Skip frames on low-end devices
   - Use `requestIdleCallback` for non-critical updates

5. **Memory Management**
   - Dispose geometries/materials on unmount
   - Object pooling for particles
   - Limit framebuffer history (2-4 frames)
   - Use `useMemo` for expensive computations

### 12.5 Mobile Considerations

- **WebGL context loss**: Implement `onContextLost` handlers
- **Touch interactions**: Larger touch targets (44px minimum)
- **Battery**: Reduce animation complexity when battery low
- **Network**: Offline mode with localStorage caching
- **Viewport**: Handle virtual keyboard, safe areas

---

## 13. SWARM EXECUTION PLAN

### 13.1 Phase Structure

```
PHASE 1: Foundation & Boot Sequence
├── Task 1.1: Initialize new frontend project structure
├── Task 1.2: Configure Vite, Tailwind, and build pipeline
├── Task 1.3: Set up font loading and CSS variables
├── Task 1.4: Implement BootSequence component
├── Task 1.5: Create basic Terminal component
└── Task 1.6: Implement BlinkingCursor and TypewriterText

PHASE 2: WebGL Background & Atmosphere
├── Task 2.1: Set up React Three Fiber Canvas
├── Task 2.2: Implement PrometheusBust (low-poly geometry)
├── Task 2.3: Create DigitalFlame particle system
├── Task 2.4: Build SynapticParticles orbiting system
├── Task 2.5: Configure postprocessing pipeline (Bloom, Vignette, Noise)
├── Task 2.6: Implement adaptive quality system
└── Task 2.7: Add CRT shader effects (curvature, chromatic aberration)

PHASE 3: Terminal Interface & Navigation
├── Task 3.1: Build Terminal component with command history
├── Task 3.2: Implement command parser and routing
├── Task 3.3: Create keyboard navigation system
├── Task 3.4: Build CommandPalette overlay
├── Task 3.5: Implement page transitions (fade, not slide)
├── Task 3.6: Create StatusBar component
└── Task 3.7: Add terminal command definitions

PHASE 4: Core Features Integration
├── Task 4.1: Connect Supabase client (reuse existing logic)
├── Task 4.2: Implement voice recording with audio visualization
├── Task 4.3: Build IdeasArchive (terminal-style list)
├── Task 4.4: Create IdeaDetail with analysis display
├── Task 4.5: Implement InterrogationModules (Paul Graham test)
├── Task 4.6: Add SettingsPage with CRT effect toggles
└── Task 4.7: Build HelpPage with command reference

PHASE 5: Polish & Effects
├── Task 5.1: Implement scanlines overlay
├── Task 5.2: Add phosphor glow text effects
├── Task 5.3: Create flicker animation system
├── Task 5.4: Add noise overlay (film grain)
├── Task 5.5: Implement phosphor persistence trails
├── Task 5.6: Add sound effects (keyboard clicks, ambient)
├── Task 5.7: Create boot sound sequence
└── Task 5.8: Add reduced motion support

PHASE 6: Testing & Migration
├── Task 6.1: Test all CRUD operations against backend
├── Task 6.2: Verify AI processing pipeline
├── Task 6.3: Test voice recording and transcription
├── Task 6.4: Performance profiling on low-end devices
├── Task 6.5: Accessibility audit (keyboard navigation, screen readers)
├── Task 6.6: Cross-browser testing
├── Task 6.7: Swap frontend/ folder
└── Task 6.8: Archive old frontend to frontend-legacy/
```

### 13.2 Task Dependencies

```
Phase 1 (Foundation)
├── 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6
│
Phase 2 (WebGL)
├── 2.1 → 2.2 → 2.3 → 2.4
├── 2.1 → 2.5 → 2.6
├── 2.1 → 2.7
│
Phase 3 (Terminal)
├── 1.6 → 3.1 → 3.2 → 3.3 → 3.4
├── 3.1 → 3.5
├── 3.1 → 3.6
├── 3.2 → 3.7
│
Phase 4 (Features)
├── 3.1 → 4.1 → 4.2 → 4.3
├── 4.1 → 4.4
├── 4.1 → 4.5
├── 3.6 → 4.6
├── 3.7 → 4.7
│
Phase 5 (Polish)
├── 2.5 → 5.1 → 5.2 → 5.3 → 5.4 → 5.5
├── 4.2 → 5.6 → 5.7
├── 5.1 → 5.8
│
Phase 6 (Testing)
├── All previous phases → 6.1 → 6.2 → 6.3 → 6.4 → 6.5 → 6.6 → 6.7 → 6.8
```

### 13.3 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **WebGL performance issues** | Medium | High | Adaptive quality, CSS fallback |
| **Shader compilation stutter** | Medium | Medium | Pre-warm during boot |
| **Font loading delays** | Low | Low | Preload WOFF2, use swap |
| **Supabase connection issues** | Low | High | Reuse existing client logic |
| **Browser compatibility** | Medium | Medium | Progressive enhancement |
| **Scope creep** | High | Medium | Strict adherence to design doc |
| **Performance on mobile** | High | High | Aggressive quality reduction |
| **Accessibility gaps** | Medium | Medium | Keyboard-first, reduced motion |

### 13.4 Success Criteria

1. **Atmosphere**: Interface feels like an abandoned OS — 10/10 user survey
2. **Functionality**: All existing features work — 100% parity
3. **Performance**: 60fps on desktop, 30fps on mobile
4. **Accessibility**: Full keyboard navigation, screen reader support
5. **Backend**: Zero changes to backend code
6. **Migration**: Seamless swap, no data loss

---

## APPENDIX A: BOOT SEQUENCE SCRIPT

```
> BRAIN OVERFLOW v0.7.3-alpha-recovered
> COPYRIGHT (C) 1987-2026 COGNITION SYSTEMS INC.
> 
> MEMORY CHECK: 640K OK
> EXTENDED MEMORY: 16384K OK
> 
> LOADING COGNITION KERNEL... [OK]
> MOUNTING THOUGHT_VOLUME... [OK]
> INITIALIZING NEURAL PATHWAYS... [OK]
> CALIBRATING PHOSPHOR ARRAY... [OK]
> 
> AN IDEA THAT IS NOT DANGEROUS
> IS UNWORTHY OF BEING CALLED AN IDEA AT ALL.
> 
>     — OSCAR WILDE
> 
> SYSTEM READY.
> LAST BOOT: 1987-03-15 02:13:47
> 
> _
```

## APPENDIX B: COMMAND REFERENCE

```
Available Commands:
├── record [idea]     — Record a new idea (voice or text)
├── ideas             — List all recorded ideas
├── idea [id]         — View idea detail and analysis
├── analyze [id]      — Run analysis on an idea
├── flows             — List configured flows
├── flow [name]       — View flow details
├── prompts           — List available prompts
├── models            — List AI models
├── settings          — System settings
├── help              — Show this help
├── clear             — Clear terminal
├── theme [color]     — Change phosphor color
└── reboot            — Restart system
```

## APPENDIX C: TERMINAL OUTPUT EXAMPLES

```
> record
● LISTENING
signal stable

[User speaks: "A platform for connecting freelance philosophers with startups"]

> TRANSMISSION RECEIVED
> SECTOR: 7G
> TIMESTAMP: 1747203227
> ID: idea_a7f3d9e2
> 
> PROCESSING...
> sector 7G active
> 
> [Analysis appears character by character]
> 
> CATEGORY: startup_idea
> SCORE: needs_refinement
> 
> The idea has merit but lacks specificity...
> [Full analysis continues]
> 
> TRANSMISSION ARCHIVED
> 
> _
```

---

**Document Status:** COMPLETE  
**Next Step:** Await user approval before proceeding to implementation  
**Approval Required For:** Phase 1-6 execution plan, design language, component hierarchy

---

*"An idea that is not dangerous is unworthy of being called an idea at all."*
*— Oscar Wilde*
