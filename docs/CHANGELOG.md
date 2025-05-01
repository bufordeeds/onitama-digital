# Changelog

All notable changes to the Onitama Digital project will be documented in this file.

## [Unreleased]

### Added

-   Firebase integration for online multiplayer
    -   User authentication (email/password)
    -   Firestore for game rooms and user profiles
    -   Realtime Database for game state synchronization
    -   Security rules for data protection
-   Online context provider for managing online game state
-   Services for Firebase interactions (auth, firestore, realtime)

## [0.1.1] - 2025-04-30

### Fixed

-   Fixed a bug where capturing opponent pieces wasn't working. The issue was in the Board component's handleCellPress function, which was prioritizing piece selection over valid move execution when clicking on opponent pieces.

## [0.1.0] - Initial Version

### Added

-   Core game mechanics implementation
-   Local two-player gameplay
-   Basic UI components (board, pieces, cards)
-   Move validation and highlighting
-   Win condition detection
