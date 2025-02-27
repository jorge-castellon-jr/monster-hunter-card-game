// src/data/status-cards.ts
import { Card } from "../types";
import { WEAPON_TYPES, CARD_TYPES } from "./cards";

// Define status effect cards
export const STATUS_CARDS: Record<string, Card> = {
  // Sword & Shield status cards
  POISON_SLASH: {
    id: "poison_slash",
    name: "Poison Slash",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.SWORD_AND_SHIELD,
    damage: 3,
    description: "Deal 3 damage and apply Poison to target position",
    cost: 1,
    targetType: "single",
    status: "poison",
  },

  FIRE_ATTACK: {
    id: "fire_attack",
    name: "Fire Attack",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.SWORD_AND_SHIELD,
    damage: 2,
    description: "Deal 2 damage and apply Burning to target position",
    cost: 1,
    targetType: "single",
    status: "burning",
  },

  // Greatsword status cards
  BLEED_SLASH: {
    id: "bleed_slash",
    name: "Bleed Slash",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.GREATSWORD,
    damage: 5,
    description: "Deal 5 damage and apply Bleeding to target position",
    cost: 1,
    targetType: "single",
    status: "bleeding",
  },

  STUN_STRIKE: {
    id: "stun_strike",
    name: "Stun Strike",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.GREATSWORD,
    damage: 4,
    description: "Deal 4 damage and apply Stun to target position",
    cost: 2,
    targetType: "single",
    status: "stun",
  },

  // Bow status cards
  POISON_ARROW: {
    id: "poison_arrow",
    name: "Poison Arrow",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.BOW,
    damage: 2,
    description: "Deal 2 damage and apply Poison to target position",
    cost: 1,
    targetType: "single",
    status: "poison",
  },

  FIRE_ARROW: {
    id: "fire_arrow",
    name: "Fire Arrow",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.BOW,
    damage: 2,
    description: "Deal 2 damage and apply Burning to all positions",
    cost: 2,
    targetType: "all",
    status: "burning",
  },

  PARALYSIS_SHOT: {
    id: "paralysis_shot",
    name: "Paralysis Shot",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.BOW,
    damage: 1,
    description: "Deal 1 damage and apply Stun to target position",
    cost: 1,
    targetType: "single",
    status: "stun",
  },
};

// Advanced status cards (higher rarity)
export const ADVANCED_STATUS_CARDS: Record<string, Card> = {
  // Sword & Shield advanced
  TOXIC_BARRAGE: {
    id: "toxic_barrage",
    name: "Toxic Barrage",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.SWORD_AND_SHIELD,
    damage: 2,
    description: "Deal 2 damage and apply Poison to all positions",
    cost: 2,
    targetType: "all",
    status: "poison",
  },

  // Greatsword advanced
  CONCUSSIVE_BLOW: {
    id: "concussive_blow",
    name: "Concussive Blow",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.GREATSWORD,
    damage: 7,
    description: "Deal 7 damage and apply Stun to target position",
    cost: 2,
    targetType: "single",
    status: "stun",
  },

  // Bow advanced
  DRAGON_PIERCER: {
    id: "dragon_piercer",
    name: "Dragon Piercer",
    type: CARD_TYPES.ATTACK,
    weapon: WEAPON_TYPES.BOW,
    damage: 8,
    chargeTime: 1,
    description:
      "Charge for 1 turn, then deal 8 damage and apply Burning to all positions",
    cost: 3,
    targetType: "all",
    status: "burning",
  },
};

// Add status cards to card upgrade options
export const STATUS_CARD_UPGRADES = [
  {
    baseCardId: "quick_slash",
    upgradeToId: "poison_slash",
    materials: [{ monsterId: "pukei_pukei", partId: "tail", quantity: 2 }],
  },
  {
    baseCardId: "overhead_slash",
    upgradeToId: "bleed_slash",
    materials: [{ monsterId: "odogaron", partId: "claws", quantity: 2 }],
  },
  {
    baseCardId: "rapid_shot",
    upgradeToId: "poison_arrow",
    materials: [
      { monsterId: "pukei_pukei", partId: "tail", quantity: 1 },
      { monsterId: "great_jagras", partId: "scale", quantity: 2 },
    ],
  },
];
