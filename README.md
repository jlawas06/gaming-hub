# 🎪 JL Gaming Hub

A carnival midway of browser games, built with **Next.js (App Router)**, **TypeScript**, and **React**. Styling is plain **CSS Modules** per route, and fonts are self-hosted via `next/font/google`. No backend — game stats and settings persist in the browser's `localStorage`.

## Getting started

```bash
npm install
npm run dev      # development server on http://localhost:3002
```

For a production build:

```bash
npm run build
npm start        # production server on http://localhost:3002
```

## The booths

| Route | Game |
|-------|------|
| `/` | The midway — landing page linking to every booth |
| `/bingo-caller` | Automated 75-ball bingo caller |
| `/bingo-card-generator` | Printable 75-ball bingo card generator |
| `/color-game` | Perya-style color dice roller |
| `/deal-or-no-deal` | Deal or No Deal game-show clone |

### 🎱 Bingo Caller

Hosts a bingo night for you: draws random numbers, announces them with the browser's speech synthesis, and lights them up on a classic flashboard with a running call history. Start/pause, adjustable call interval (1–10s), mute, and a BINGO celebration with confetti.

- **Keyboard shortcuts:** `Space` start/pause · `N` new game · `M` mute · `B` bingo celebration
- **Settings** (voice speed/pitch/volume, default interval) persist in `localStorage`.

### 🖨️ Bingo Cards

Generates 1–24 fresh 75-ball bingo cards (B 1–15 · I 16–30 · N 31–45 · G 46–60 · O 61–75, FREE center). Tap a number to dab it on screen, or hit Print for a clean print layout.

### 🎲 Color Dice

Roll three 3D color dice (red, green, blue, yellow, white, pink) and watch them tumble across the felt. Tracks how often each color lands, with a roll history. Stats persist in `localStorage`; respects `prefers-reduced-motion`.

### 💼 Deal or No Deal

26 briefcases, ₱1–₱200. Pick your case, open the rest round by round, and weigh the banker's offers. Final-round keep-or-switch decision, good-deal/bad-deal verdict, and configurable prize values (persisted in `localStorage`).

## Project layout

```
app/
├── layout.tsx / globals.css / fonts.ts   # root layout, reset, next/font setup
├── page.tsx                              # the midway landing page
├── lib/                                  # shared hooks (speech, keyboard shortcuts)
├── bingo-caller/
├── bingo-card-generator/
├── color-game/
└── deal-or-no-deal/                      # one route folder per game:
                                          # page.tsx (server) + client components,
                                          # hooks, and a scoped CSS Module
```
