// src/data/upgrades.ts
import { Card, WeaponType } from "../types";
import { CARDS } from "./cards";

export interface CardUpgrade {
  id: string;
  baseCardId: string;
  name: string;
  upgradedCard: Card;
  materials: Material[];
  description: string;
}

export interface Material {
  monsterId: string;
  partId: string;
  quantity: number;
}

export interface MaterialInventory {
  [key: string]: number; // Format: "monsterId:partId" => quantity
}

// Define upgraded cards
export const UPGRADED_CARDS: Record<string, Card> = {
  // Sword and Shield Upgrades
  PRECISE_SLASH: {
    ...CARDS.QUICK_SLASH,
    id: "precise_slash",
    name: "Precise Slash",
    damage: 6,
    drawCards: 1,
    description: "Deal 6 damage to target position and draw 1 card",
  },
  SHIELD_BASH_PLUS: {
    ...CARDS.SHIELD_BASH,
    id: "shield_bash_plus",
    name: "Shield Bash+",
    damage: 3,
    effects: [{ type: "stun", duration: 2 }],
    description:
      "Deal 3 damage and stun monster at target position for 2 turns",
  },
  IRONCLAD_GUARD: {
    ...CARDS.GUARD,
    id: "ironclad_guard",
    name: "Ironclad Guard",
    block: 8,
    description: "Block 8 damage from any position",
  },

  // Greatsword Upgrades
  BRUTAL_SLASH: {
    ...CARDS.OVERHEAD_SLASH,
    id: "brutal_slash",
    name: "Brutal Slash",
    damage: 9,
    description: "Deal 9 damage to target position",
  },
  SUPER_CHARGED_SLASH: {
    ...CARDS.CHARGED_SLASH,
    id: "super_charged_slash",
    name: "Super Charged Slash",
    damage: 15,
    description: "Charge for 1 turn, then deal 15 damage to target position",
  },

  // Bow Upgrades
  QUICK_SHOT: {
    ...CARDS.RAPID_SHOT,
    id: "quick_shot",
    name: "Quick Shot",
    damage: 4,
    drawCards: 2,
    description: "Deal 4 damage to target position and draw 2 cards",
  },
  PIERCING_SHOT: {
    ...CARDS.SPREAD_SHOT,
    id: "piercing_shot",
    name: "Piercing Shot",
    damage: 3,
    description: "Deal 3 damage to all positions",
  },
};

// Define card upgrades
export const CARD_UPGRADES: CardUpgrade[] = [
  {
    id: "quick_slash_upgrade",
    baseCardId: "quick_slash",
    name: "Precise Edge",
    upgradedCard: UPGRADED_CARDS.PRECISE_SLASH,
    materials: [
      { monsterId: "great_jagras", partId: "head", quantity: 2 },
      { monsterId: "great_jagras", partId: "tail", quantity: 1 },
    ],
    description: "Sharpen your blade for more precise attacks",
  },
  {
    id: "shield_bash_upgrade",
    baseCardId: "shield_bash",
    name: "Stunning Impact",
    upgradedCard: UPGRADED_CARDS.SHIELD_BASH_PLUS,
    materials: [{ monsterId: "kulu_ya_ku", partId: "head", quantity: 2 }],
    description: "Strengthen your shield for improved stunning capabilities",
  },
  {
    id: "guard_upgrade",
    baseCardId: "guard",
    name: "Ironclad Defense",
    upgradedCard: UPGRADED_CARDS.IRONCLAD_GUARD,
    materials: [{ monsterId: "great_jagras", partId: "body", quantity: 3 }],
    description: "Reinforce your guard stance for better protection",
  },
  {
    id: "overhead_slash_upgrade",
    baseCardId: "overhead_slash",
    name: "Brutal Edge",
    upgradedCard: UPGRADED_CARDS.BRUTAL_SLASH,
    materials: [
      { monsterId: "great_jagras", partId: "tail", quantity: 1 },
      { monsterId: "kulu_ya_ku", partId: "body", quantity: 2 },
    ],
    description: "Increase the weight and sharpness of your greatsword",
  },
  {
    id: "charged_slash_upgrade",
    baseCardId: "charged_slash",
    name: "Super Charge",
    upgradedCard: UPGRADED_CARDS.SUPER_CHARGED_SLASH,
    materials: [
      { monsterId: "pukei_pukei", partId: "head", quantity: 1 },
      { monsterId: "pukei_pukei", partId: "body", quantity: 2 },
    ],
    description: "Master the charging technique for devastating damage",
  },
  {
    id: "rapid_shot_upgrade",
    baseCardId: "rapid_shot",
    name: "Quick Draw",
    upgradedCard: UPGRADED_CARDS.QUICK_SHOT,
    materials: [{ monsterId: "kulu_ya_ku", partId: "legs", quantity: 2 }],
    description: "Improve your firing speed and precision",
  },
  {
    id: "spread_shot_upgrade",
    baseCardId: "spread_shot",
    name: "Piercing Arrows",
    upgradedCard: UPGRADED_CARDS.PIERCING_SHOT,
    materials: [{ monsterId: "pukei_pukei", partId: "tail", quantity: 2 }],
    description: "Craft arrows with better penetration power",
  },
];

// Helper function to get available upgrades based on weapon type
export function getAvailableUpgrades(
  weaponType: WeaponType,
  deck: Card[],
): CardUpgrade[] {
  // Get base card IDs in the deck
  const deckCardIds = deck.map((card) => card.id);

  // Filter upgrades for cards in the deck and matching weapon type
  return CARD_UPGRADES.filter((upgrade) => {
    // Find the base card
    const baseCard = Object.values(CARDS).find(
      (card) => card.id === upgrade.baseCardId,
    );
    // Check if it's in the deck and matches the weapon type
    return (
      baseCard &&
      baseCard.weapon === weaponType &&
      deckCardIds.includes(upgrade.baseCardId)
    );
  });
}

// Helper function to check if player has enough materials for an upgrade
export function canUpgradeCard(
  upgrade: CardUpgrade,
  inventory: MaterialInventory,
): boolean {
  return upgrade.materials.every((material) => {
    const key = `${material.monsterId}:${material.partId}`;
    return (inventory[key] || 0) >= material.quantity;
  });
}

// Helper function to consume materials for an upgrade
export function consumeMaterialsForUpgrade(
  upgrade: CardUpgrade,
  inventory: MaterialInventory,
): MaterialInventory {
  const newInventory = { ...inventory };

  upgrade.materials.forEach((material) => {
    const key = `${material.monsterId}:${material.partId}`;
    newInventory[key] = (newInventory[key] || 0) - material.quantity;
  });

  return newInventory;
}

// Helper function to upgrade a card in the deck
export function upgradeCardInDeck(
  deck: Card[],
  baseCardId: string,
  upgradedCard: Card,
): Card[] {
  return deck.map((card) => (card.id === baseCardId ? upgradedCard : card));
}
