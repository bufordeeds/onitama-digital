# Product Requirements Document: Onitama Expo App

## 1. Overview

**Purpose:**

-   Deliver a polished digital remake of Onitama using Expo + React Native (TypeScript).

**Scope (MVP):**

-   Local, 2‑player turn‑based play on the same device.
-   Core game logic: deal, move validation, win detection.
-   Basic UI: board, pieces, cards, highlights, animations.

**Out of Scope (Phase 1):**

-   Online matchmaking and real‑time networking.
-   AI/opponent bots.
-   Leaderboards, player profiles.

## 2. Objectives & Success Metrics

-   **Objective 1:** Implement core gameplay loop by Week 2.
-   **Objective 2:** Design intuitive touch controls and clear feedback.
-   **Objective 3:** Ship MVP to TestFlight/Play Beta by Week 4.

**Success Metrics:**

-   95% move accuracy (no invalid moves allowed).
-   <100ms UI response on modern devices.
-   Beta tester satisfaction ≥4/5 on UX.

## 3. User Personas

-   **Casual Gamer:** Wants quick, easy sessions with friends on one device.
-   **Strategy Enthusiast:** Appreciates clear move previews and smooth animations.

## 4. User Stories

1. **New Game Setup:** As a player, I want to start a new game in under 5 taps.
2. **Move Highlight:** As a player, I want all valid moves highlighted after selecting a card.
3. **Win Feedback:** As a player, I want clear, celebratory feedback on victory.

## 5. Functional Requirements

-   **Game Engine:** Shuffle 16 cards, deal 2 to each, place 1 center.
-   **Piece Movement:** Apply relative offsets; flip moves for the defending player.
-   **Win Conditions:** Capture Master or move Master to opponent's Temple Arch.
-   **UI Components:** Board grid (5x5), CardView (3x3 offset grid), Piece icons.
-   **State Management:** Use React Context or Redux for game state.

## 6. Non‑Functional Requirements

-   **Performance:** Target 60fps on mid‑range devices.
-   **Accessibility:** Support high‑contrast mode and screen readers.
-   **Maintainability:** Clean folder structure; modular logic in `/logic`.

## 7. Technical Stack

-   **Framework:** Expo (SDK 48+)
-   **Language:** TypeScript
-   **UI:** React Native + react-native-svg
-   **State:** React Context / Redux Toolkit
-   **Storage (future):** Firebase Firestore for async mode.

## 8. Milestones & Timeline

| Week | Deliverable                         |
| ---- | ----------------------------------- |
| 1    | Core logic (deal, move, win detect) |
| 2    | Board & Card UI prototype           |
| 3    | Animations & touch feedback         |
| 4    | Local play polish & beta release    |
| 5+   | Async multiplayer integration       |

## 9. Risks & Mitigations

-   **Complex Touch Handling:** Prototype early, use existing gesture libraries.
-   **Performance Hiccups:** Benchmark on-device; optimize SVG paths.

## 10. Future Phases

-   **Phase 2:** Async multiplayer + account auth.
-   **Phase 3:** AI opponent + global leaderboards.
-   **Phase 4:** Theming, offline stats tracking.
