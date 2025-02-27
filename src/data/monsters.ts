// src/data/monsters.ts
import {
  Monster,
  MonsterAttack,
  MonsterType,
  MonsterAttackType,
} from "../types";

export const MONSTER_TYPES: Record<string, MonsterType> = {
  SMALL: "small",
  LARGE: "large",
  ELITE: "elite",
  BOSS: "boss",
};

export const MONSTER_ATTACK_TYPES: Record<string, MonsterAttackType> = {
  BASIC: "basic",
  SWEEP: "sweep",
  HEAVY: "heavy",
  CHARGE: "charge",
  REPOSITION: "reposition",
};

export const MONSTER_ATTACKS: Record<string, MonsterAttack> = {
  BASIC_ATTACK: {
    id: "basic_attack",
    name: "Basic Attack",
    type: MONSTER_ATTACK_TYPES.BASIC,
    damage: 5,
    targetPositions: [0], // Will be dynamic in actual game
    playerCardsAllowed: 3,
    description: "Target 1 position, player can play 3 cards next turn",
  },
  SWEEPING_ATTACK: {
    id: "sweeping_attack",
    name: "Sweeping Attack",
    type: MONSTER_ATTACK_TYPES.SWEEP,
    damage: 3,
    targetPositions: [0, 1, 2], // All positions
    playerCardsAllowed: 2,
    description: "Target all positions, player can play 2 cards next turn",
  },
  HEAVY_STRIKE: {
    id: "heavy_strike",
    name: "Heavy Strike",
    type: MONSTER_ATTACK_TYPES.HEAVY,
    damage: 8,
    targetPositions: [0, 1], // Will be dynamic
    playerCardsAllowed: 1,
    description: "Target 2 positions, player can play 1 card next turn",
  },
  CHARGE: {
    id: "charge",
    name: "Charge",
    type: MONSTER_ATTACK_TYPES.CHARGE,
    damage: 0, // No damage this turn
    targetPositions: [],
    playerCardsAllowed: 3,
    nextAttack: "charged_attack",
    description: "No attack this turn, powerful attack next turn",
  },
  CHARGED_ATTACK: {
    id: "charged_attack",
    name: "Charged Attack",
    type: MONSTER_ATTACK_TYPES.HEAVY,
    damage: 12,
    targetPositions: [0, 1, 2], // All positions
    playerCardsAllowed: 2,
    description: "Powerful attack hitting all positions",
  },
  REPOSITION: {
    id: "reposition",
    name: "Reposition",
    type: MONSTER_ATTACK_TYPES.REPOSITION,
    damage: 0,
    targetPositions: [],
    playerCardsAllowed: 3,
    description: "Monster shifts target positions",
  },
};

export const MONSTERS: Record<string, Monster> = {
  GREAT_JAGRAS: {
    id: "great_jagras",
    name: "Great Jagras",
    type: MONSTER_TYPES.LARGE,
    parts: [
      { id: "head", name: "Head", health: 20, broken: false },
      { id: "body", name: "Body", health: 30, broken: false },
      { id: "tail", name: "Tail", health: 15, broken: false },
    ],
    totalHealth: 5,
    attackDeck: [
      MONSTER_ATTACKS.BASIC_ATTACK,
      MONSTER_ATTACKS.BASIC_ATTACK,
      MONSTER_ATTACKS.SWEEPING_ATTACK,
      MONSTER_ATTACKS.HEAVY_STRIKE,
      MONSTER_ATTACKS.REPOSITION,
    ],
    description:
      "The Great Jagras is known to attack in packs and uses its massive jaw to swallow prey whole.",
  },
  KULU_YA_KU: {
    id: "kulu_ya_ku",
    name: "Kulu-Ya-Ku",
    type: MONSTER_TYPES.LARGE,
    parts: [
      { id: "head", name: "Head", health: 25, broken: false },
      { id: "body", name: "Body", health: 25, broken: false },
      { id: "legs", name: "Legs", health: 20, broken: false },
    ],
    totalHealth: 5,
    attackDeck: [
      MONSTER_ATTACKS.BASIC_ATTACK,
      MONSTER_ATTACKS.BASIC_ATTACK,
      MONSTER_ATTACKS.SWEEPING_ATTACK,
      MONSTER_ATTACKS.CHARGE,
      MONSTER_ATTACKS.REPOSITION,
    ],
    special: "Can pick up rocks for defense",
    description:
      "This intelligent bird wyvern uses tools to fight and has been known to steal eggs.",
  },
  PUKEI_PUKEI: {
    id: "pukei_pukei",
    name: "Pukei-Pukei",
    type: MONSTER_TYPES.LARGE,
    parts: [
      { id: "head", name: "Head", health: 20, broken: false },
      { id: "body", name: "Body", health: 30, broken: false },
      { id: "tail", name: "Tail", health: 25, broken: false },
    ],
    totalHealth: 5,
    attackDeck: [
      MONSTER_ATTACKS.BASIC_ATTACK,
      MONSTER_ATTACKS.SWEEPING_ATTACK,
      MONSTER_ATTACKS.SWEEPING_ATTACK,
      MONSTER_ATTACKS.HEAVY_STRIKE,
      MONSTER_ATTACKS.CHARGE,
    ],
    status: "poison",
    description:
      "A flying wyvern that can inflate its throat sac to spray poison at its enemies.",
  },
};
