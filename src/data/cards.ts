// src/data/cards.ts
import { Card, CardType, WeaponType } from "../types";

// Card Types
export const CARD_TYPES: Record<string, CardType> = {
  ATTACK: "attack",
  DEFENSE: "defense",
  MOVEMENT: "movement",
  SPECIAL: "special",
};

// Weapon Types
export const WEAPON_TYPES: Record<string, WeaponType> = {
  SWORD_AND_SHIELD: "sword_and_shield",
  GREATSWORD: "greatsword",
  BOW: "bow",
};

// Card Definitions
export const CARDS: Record<string, Card> = {
  // Sword and Shield Cards
  QUICK_SLASH: {
    id: "quick_slash",
    name: "Quick Slash",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.SWORD_AND_SHIELD,
    damage: 4,
    description: "Deal 4 damage to target position",
    cost: 1,
    targetType: "single",
  },
  SHIELD_BASH: {
    id: "shield_bash",
    name: "Shield Bash",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.SWORD_AND_SHIELD,
    damage: 2,
    effects: [{ type: "stun", duration: 1 }],
    description: "Deal 2 damage and stun monster at target position for 1 turn",
    cost: 1,
    targetType: "single",
  },
  GUARD: {
    id: "guard",
    name: "Guard",
    type: CARD_TYPES.DEFENSE,
    weapon: WEAPON_TYPES.SWORD_AND_SHIELD,
    block: 5,
    description: "Block 5 damage from any position",
    cost: 1,
    targetType: "self",
  },
  ROLL: {
    id: "roll",
    name: "Roll",
    type: CARD_TYPES.MOVEMENT,
    weapon: WEAPON_TYPES.SWORD_AND_SHIELD,
    drawCards: 1,
    description: "Move to any position and draw 1 card",
    cost: 1,
    targetType: "position",
  },
  ROUNDSLASH: {
    id: "roundslash",
    name: "Roundslash",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.SWORD_AND_SHIELD,
    damage: 3,
    description: "Deal 3 damage to all positions",
    cost: 1,
    targetType: "all",
  },
  ITEM_USE: {
    id: "item_use",
    name: "Item Use",
    type: CARD_TYPES.SPECIAL,
    weapon: WEAPON_TYPES.SWORD_AND_SHIELD,
    heal: 4,
    description: "Recover 4 health",
    cost: 1,
    targetType: "self",
  },

  // Greatsword Cards
  OVERHEAD_SLASH: {
    id: "overhead_slash",
    name: "Overhead Slash",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.GREATSWORD,
    damage: 6,
    description: "Deal 6 damage to target position",
    cost: 1,
    targetType: "single",
  },
  TACKLE: {
    id: "tackle",
    name: "Tackle",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.GREATSWORD,
    damage: 2,
    block: 3,
    description: "Deal 2 damage and gain Block 3",
    cost: 1,
    targetType: "single",
  },
  CHARGED_SLASH: {
    id: "charged_slash",
    name: "Charged Slash",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.GREATSWORD,
    damage: 10,
    chargeTime: 1,
    description: "Charge for 1 turn, then deal 10 damage to target position",
    cost: 2,
    targetType: "single",
  },
  SIDE_ROLL: {
    id: "side_roll",
    name: "Side Roll",
    type: CARD_TYPES.MOVEMENT,
    weapon: WEAPON_TYPES.GREATSWORD,
    description: "Move to any position",
    cost: 1,
    targetType: "position",
  },
  WIDE_SWEEP: {
    id: "wide_sweep",
    name: "Wide Sweep",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.GREATSWORD,
    damage: 4,
    description: "Deal 4 damage to all positions",
    cost: 2,
    targetType: "all",
  },
  GS_GUARD: {
    id: "gs_guard",
    name: "Guard",
    type: CARD_TYPES.DEFENSE,
    weapon: WEAPON_TYPES.GREATSWORD,
    block: 7,
    description: "Block 7 damage from any position",
    cost: 1,
    targetType: "self",
  },

  // Bow Cards
  RAPID_SHOT: {
    id: "rapid_shot",
    name: "Rapid Shot",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.BOW,
    damage: 3,
    drawCards: 1,
    description: "Deal 3 damage to target position and draw 1 card",
    cost: 1,
    targetType: "single",
  },
  SPREAD_SHOT: {
    id: "spread_shot",
    name: "Spread Shot",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.BOW,
    damage: 2,
    description: "Deal 2 damage to all positions",
    cost: 1,
    targetType: "all",
  },
  POWER_SHOT: {
    id: "power_shot",
    name: "Power Shot",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.BOW,
    damage: 5,
    description: "Deal 5 damage to target position",
    cost: 1,
    targetType: "single",
  },
  QUICK_DASH: {
    id: "quick_dash",
    name: "Quick Dash",
    type: CARD_TYPES.MOVEMENT,
    weapon: WEAPON_TYPES.BOW,
    drawCards: 1,
    description: "Move to any position and draw 1 card",
    cost: 1,
    targetType: "position",
  },
  APPLY_COATING: {
    id: "apply_coating",
    name: "Apply Coating",
    type: CARD_TYPES.SPECIAL,
    weapon: WEAPON_TYPES.BOW,
    description: "Your next attack deals 3 additional damage",
    effect: { type: "buff", value: 3, duration: 1 },
    cost: 1,
    targetType: "self",
  },
  CHARGED_SHOT: {
    id: "charged_shot",
    name: "Charged Shot",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.BOW,
    damage: 8,
    chargeTime: 1,
    description: "Charge for 1 turn, then deal 8 damage to target position",
    cost: 2,
    targetType: "single",
  },
};

// Starting Decks
export const STARTING_DECKS: Record<string, Card[]> = {
  [WEAPON_TYPES.SWORD_AND_SHIELD]: [
    CARDS.QUICK_SLASH,
    CARDS.QUICK_SLASH,
    CARDS.QUICK_SLASH,
    CARDS.SHIELD_BASH,
    CARDS.SHIELD_BASH,
    CARDS.GUARD,
    CARDS.GUARD,
    CARDS.ROLL,
    CARDS.ROUNDSLASH,
    CARDS.ITEM_USE,
  ],

  [WEAPON_TYPES.GREATSWORD]: [
    CARDS.OVERHEAD_SLASH,
    CARDS.OVERHEAD_SLASH,
    CARDS.OVERHEAD_SLASH,
    CARDS.TACKLE,
    CARDS.TACKLE,
    CARDS.CHARGED_SLASH,
    CARDS.CHARGED_SLASH,
    CARDS.SIDE_ROLL,
    CARDS.WIDE_SWEEP,
    CARDS.GS_GUARD,
  ],

  [WEAPON_TYPES.BOW]: [
    CARDS.RAPID_SHOT,
    CARDS.RAPID_SHOT,
    CARDS.RAPID_SHOT,
    CARDS.SPREAD_SHOT,
    CARDS.SPREAD_SHOT,
    CARDS.POWER_SHOT,
    CARDS.QUICK_DASH,
    CARDS.QUICK_DASH,
    CARDS.APPLY_COATING,
    CARDS.CHARGED_SHOT,
  ],
};
