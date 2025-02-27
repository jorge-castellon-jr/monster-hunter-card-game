# Monster Hunter Card Game

A roguelike card game inspired by Monster Hunter Iceborne's mechanics. The game features a position-based combat grid, weapon-specific card decks, and a Slay the Spire-style map progression.

## Features

- 3v3 position-based combat grid
- Three weapon types (Sword & Shield, Greatsword, Bow) with unique cards
- Monster part targeting system
- Roguelike map progression

## Technologies Used

- React
- TypeScript
- Vite
- PixiJS for 2D rendering
- GSAP for animations

## Project Structure

```
monster-hunter-card-game/
├── public/             # Static assets
├── src/
│   ├── assets/         # Game assets
│   ├── components/     # React components
│   ├── data/           # Game data (cards, monsters)
│   ├── game/           # Game logic
│   ├── screens/        # Game screens
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── styles.css      # Global styles
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 14.0 or higher
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/monster-hunter-card-game.git
cd monster-hunter-card-game
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

## Game Mechanics

### Combat System

- Grid Layout: 3x3 positions [P1][P2][P3] vs [M1][M2][M3]
- Player Positioning: Single hunter occupying one position
- Monster Positioning: Large monsters occupy all 3 spots (each spot representing different body parts)
- Movement: One free move per turn + additional moves by discarding cards
- Card Play: Limited by monster's current attack card
- Attack Targeting: Players select which position/monster part to attack

### Weapons

1. Sword & Shield: Balanced, versatile with defensive options
2. Greatsword: High damage, slower moves, charge mechanics
3. Bow: Ranged attacks, status effects, positioning advantage

### Monster Types

- Large Monsters: Occupy 3 positions (head, body, tail/limbs), complex attack patterns

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Monster Hunter World: Iceborne by Capcom
- Card game mechanics inspired by Slay the Spire and other roguelike deck builders
