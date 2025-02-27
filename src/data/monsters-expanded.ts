// src/data/monsters-expanded.ts
import { Monster, MonsterAttack, MonsterPart } from "../types";
import {
  MONSTER_TYPES,
  MONSTER_ATTACK_TYPES,
  MONSTER_ATTACKS,
} from "./monsters";

// Additional monster attacks for more variety
export const EXPANDED_MONSTER_ATTACKS: Record<string, MonsterAttack> = {
  // Anjanath Attacks
  FIRE_BREATH: {
    id: "fire_breath",
    name: "Fire Breath",
    type: MONSTER_ATTACK_TYPES.SWEEP,
    damage: 7,
    targetPositions: [0, 1, 2], // All positions
    playerCardsAllowed: 1,
    description: "Breathes a devastating stream of fire across all positions",
  },
  TAIL_SWIPE: {
    id: "tail_swipe",
    name: "Tail Swipe",
    type: MONSTER_ATTACK_TYPES.SWEEP,
    damage: 4,
    targetPositions: [1, 2], // Middle and right position
    playerCardsAllowed: 2,
    description: "Swipes its massive tail across two positions",
  },
  ENRAGED_CHARGE: {
    id: "enraged_charge",
    name: "Enraged Charge",
    type: MONSTER_ATTACK_TYPES.CHARGE,
    damage: 0,
    targetPositions: [],
    playerCardsAllowed: 3,
    nextAttack: "trampling_rush",
    description: "The monster becomes enraged, preparing for a powerful charge",
  },
  TRAMPLING_RUSH: {
    id: "trampling_rush",
    name: "Trampling Rush",
    type: MONSTER_ATTACK_TYPES.HEAVY,
    damage: 10,
    targetPositions: [0, 1, 2], // All positions
    playerCardsAllowed: 1,
    description: "Rushes forward with tremendous force, hitting all positions",
  },

  // Rathian Attacks
  POISON_TAIL_FLIP: {
    id: "poison_tail_flip",
    name: "Poison Tail Flip",
    type: MONSTER_ATTACK_TYPES.HEAVY,
    damage: 6,
    targetPositions: [1, 2], // Middle and right position
    playerCardsAllowed: 2,
    description: "Flips its toxic tail, poisoning hunters in two positions",
  },
  FIREBALL: {
    id: "fireball",
    name: "Fireball",
    type: MONSTER_ATTACK_TYPES.BASIC,
    damage: 5,
    targetPositions: [1], // Middle position
    playerCardsAllowed: 2,
    description: "Spits a ball of fire at a single position",
  },
  TRIPLE_FIREBALL: {
    id: "triple_fireball",
    name: "Triple Fireball",
    type: MONSTER_ATTACK_TYPES.SWEEP,
    damage: 4,
    targetPositions: [0, 1, 2], // All positions
    playerCardsAllowed: 1,
    description:
      "Launches three fireballs in quick succession across all positions",
  },

  // Odogaron Attacks
  BLEEDING_SLASH: {
    id: "bleeding_slash",
    name: "Bleeding Slash",
    type: MONSTER_ATTACK_TYPES.BASIC,
    damage: 4,
    targetPositions: [0], // Will be dynamic
    playerCardsAllowed: 2,
    description: "Slashes with razor-sharp claws, causing bleeding",
  },
  FRENZY_RUSH: {
    id: "frenzy_rush",
    name: "Frenzy Rush",
    type: MONSTER_ATTACK_TYPES.SWEEP,
    damage: 3,
    targetPositions: [0, 1, 2], // All positions
    playerCardsAllowed: 1,
    description: "Rushes back and forth in a frenzy, hitting all positions",
  },
  LUNGING_BITE: {
    id: "lunging_bite",
    name: "Lunging Bite",
    type: MONSTER_ATTACK_TYPES.HEAVY,
    damage: 7,
    targetPositions: [0, 1], // Front two positions
    playerCardsAllowed: 2,
    description: "Lunges forward with a powerful bite, targeting two positions",
  },
};

// Combine all monster attacks
export const ALL_MONSTER_ATTACKS = {
  ...MONSTER_ATTACKS,
  ...EXPANDED_MONSTER_ATTACKS,
};

// New monsters for expanded gameplay
export const EXPANDED_MONSTERS: Record<string, Monster> = {
  ANJANATH: {
    id: "anjanath",
    name: "Anjanath",
    type: MONSTER_TYPES.LARGE,
    parts: [
      { id: "head", name: "Head", health: 30, broken: false },
      { id: "body", name: "Body", health: 35, broken: false },
      { id: "tail", name: "Tail", health: 25, broken: false },
    ],
    totalHealth: 5,
    attackDeck: [
      ALL_MONSTER_ATTACKS.BASIC_ATTACK,
      ALL_MONSTER_ATTACKS.FIRE_BREATH,
      ALL_MONSTER_ATTACKS.TAIL_SWIPE,
      ALL_MONSTER_ATTACKS.ENRAGED_CHARGE,
      ALL_MONSTER_ATTACKS.HEAVY_STRIKE,
    ],
    special: "Enrages when health is low, increasing damage",
    status: "fire",
    description:
      "A fearsome brute wyvern with powerful fire attacks and a signature nose crest that expands when enraged.",
  },
  RATHIAN: {
    id: "rathian",
    name: "Rathian",
    type: MONSTER_TYPES.LARGE,
    parts: [
      { id: "head", name: "Head", health: 25, broken: false },
      { id: "wings", name: "Wings", health: 30, broken: false },
      { id: "tail", name: "Tail", health: 35, broken: false },
    ],
    totalHealth: 5,
    attackDeck: [
      ALL_MONSTER_ATTACKS.FIREBALL,
      ALL_MONSTER_ATTACKS.POISON_TAIL_FLIP,
      ALL_MONSTER_ATTACKS.TRIPLE_FIREBALL,
      ALL_MONSTER_ATTACKS.SWEEPING_ATTACK,
      ALL_MONSTER_ATTACKS.REPOSITION,
    ],
    special: "Tail can cause poison status effect",
    status: "poison",
    description:
      "The female counterpart to the Rathalos, this wyvern controls the land with a poisonous tail and fire attacks.",
  },
  ODOGARON: {
    id: "odogaron",
    name: "Odogaron",
    type: MONSTER_TYPES.LARGE,
    parts: [
      { id: "head", name: "Head", health: 20, broken: false },
      { id: "body", name: "Body", health: 30, broken: false },
      { id: "legs", name: "Legs", health: 25, broken: false },
    ],
    totalHealth: 5,
    attackDeck: [
      ALL_MONSTER_ATTACKS.BLEEDING_SLASH,
      ALL_MONSTER_ATTACKS.FRENZY_RUSH,
      ALL_MONSTER_ATTACKS.LUNGING_BITE,
      ALL_MONSTER_ATTACKS.REPOSITION,
      ALL_MONSTER_ATTACKS.CHARGE,
    ],
    special: "Attacks can cause bleeding status effect",
    status: "bleeding",
    description:
      "A ferocious fanged wyvern that moves with incredible speed, its razor-sharp claws and teeth cause severe bleeding.",
  },

  // Elite versions of existing monsters
  GREAT_JAGRAS_ELITE: {
    id: "great_jagras_elite",
    name: "Great Jagras Alpha",
    type: MONSTER_TYPES.ELITE,
    parts: [
      { id: "head", name: "Head", health: 30, broken: false },
      { id: "body", name: "Body", health: 40, broken: false },
      { id: "tail", name: "Tail", health: 25, broken: false },
    ],
    totalHealth: 5,
    attackDeck: [
      ALL_MONSTER_ATTACKS.BASIC_ATTACK,
      ALL_MONSTER_ATTACKS.HEAVY_STRIKE,
      ALL_MONSTER_ATTACKS.SWEEPING_ATTACK,
      ALL_MONSTER_ATTACKS.CHARGE,
      ALL_MONSTER_ATTACKS.SWEEPING_ATTACK,
    ],
    description:
      "An alpha Great Jagras with enhanced strength and aggression, capable of more devastating attacks.",
  },
  KULU_YA_KU_ELITE: {
    id: "kulu_ya_ku_elite",
    name: "Kulu-Ya-Ku Alpha",
    type: MONSTER_TYPES.ELITE,
    parts: [
      { id: "head", name: "Head", health: 35, broken: false },
      { id: "body", name: "Body", health: 35, broken: false },
      { id: "legs", name: "Legs", health: 30, broken: false },
    ],
    totalHealth: 5,
    attackDeck: [
      ALL_MONSTER_ATTACKS.BASIC_ATTACK,
      ALL_MONSTER_ATTACKS.HEAVY_STRIKE,
      ALL_MONSTER_ATTACKS.SWEEPING_ATTACK,
      ALL_MONSTER_ATTACKS.ENRAGED_CHARGE,
      ALL_MONSTER_ATTACKS.REPOSITION,
    ],
    special: "Uses larger rocks for defense and offense",
    description:
      "An elite Kulu-Ya-Ku that has learned to use larger rocks both defensively and as devastating weapons.",
  },

  // Boss monsters
  NERGIGANTE: {
    id: "nergigante",
    name: "Nergigante",
    type: MONSTER_TYPES.BOSS,
    parts: [
      { id: "head", name: "Head", health: 40, broken: false },
      { id: "body", name: "Body", health: 50, broken: false },
      { id: "wings", name: "Wings", health: 35, broken: false },
    ],
    totalHealth: 5,
    attackDeck: [
      ALL_MONSTER_ATTACKS.HEAVY_STRIKE,
      ALL_MONSTER_ATTACKS.SWEEPING_ATTACK,
      ALL_MONSTER_ATTACKS.ENRAGED_CHARGE,
      ALL_MONSTER_ATTACKS.LUNGING_BITE,
      ALL_MONSTER_ATTACKS.FRENZY_RUSH,
    ],
    special: "Regenerates spikes that increase damage when fully grown",
    description:
      'The "Extinction Dragon," known for its regenerative spikes and brutal dive bomb attack. The embodiment of destruction.',
  },
};

// Combine all monsters
export const ALL_MONSTERS = {
  ...EXPANDED_MONSTERS,
};

// Create monster encounters by difficulty
export const MONSTER_ENCOUNTERS = {
  // Early encounters (low difficulty)
  EARLY: ["great_jagras", "kulu_ya_ku"],

  // Mid encounters (medium difficulty)
  MID: ["pukei_pukei", "great_jagras_elite", "kulu_ya_ku_elite"],

  // Late encounters (high difficulty)
  LATE: ["anjanath", "rathian", "odogaron"],

  // Boss encounters
  BOSS: ["nergigante"],
};

// Helper function to get a random monster by difficulty
export function getRandomMonster(
  difficulty: "EARLY" | "MID" | "LATE" | "BOSS",
): Monster {
  const monsterIds = MONSTER_ENCOUNTERS[difficulty];
  const randomId = monsterIds[Math.floor(Math.random() * monsterIds.length)];

  return ALL_MONSTERS[randomId] || EXPANDED_MONSTERS.GREAT_JAGRAS; // Fallback
}
