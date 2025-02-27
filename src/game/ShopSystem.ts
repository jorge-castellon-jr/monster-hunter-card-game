// src/game/ShopSystem.ts
import { Card, WeaponType } from "../types";
import { CARDS, STARTING_DECKS } from "../data/cards";
import playerProgress from "./PlayerProgress";
import { CARD_UPGRADES, UPGRADED_CARDS } from "../data/upgrades";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: "card" | "upgrade" | "consumable" | "maxhp";
  cardId?: string;
  upgradeId?: string;
  effect?: (currentRun: any) => void;
}

export class ShopSystem {
  private availableItems: ShopItem[] = [];

  // Generate shop inventory based on current run and progress
  generateShopInventory(weaponType: WeaponType, level: number): ShopItem[] {
    const items: ShopItem[] = [];

    // Add cards for current weapon type (2-4 cards)
    const weaponCards = this.getWeaponCards(weaponType, level);
    items.push(...weaponCards);

    // Add card upgrades if player has the base cards (1-3 upgrades)
    const upgrades = this.getCardUpgrades(weaponType, level);
    items.push(...upgrades);

    // Add consumables (2-3 items)
    const consumables = this.getConsumables(level);
    items.push(...consumables);

    // Add one max HP upgrade
    items.push(this.getMaxHPUpgrade(level));

    this.availableItems = items;
    return items;
  }

  // Generate weapon-specific cards for the shop
  private getWeaponCards(weaponType: WeaponType, level: number): ShopItem[] {
    const items: ShopItem[] = [];

    // Filter cards for this weapon type
    const weaponCards = Object.values(CARDS).filter(
      (card) => card.weapon === weaponType,
    );

    // Check which cards player doesn't have in current deck
    const currentRun = playerProgress.getCurrentRun();
    const currentDeckIds = currentRun
      ? currentRun.deck.map((card) => card.id)
      : [];

    // Filter to cards not in deck
    const availableCards = weaponCards.filter(
      (card) => !currentDeckIds.includes(card.id),
    );

    // Shuffle and take 2-4 cards
    const numCards = 2 + Math.floor(Math.random() * 3);
    const shuffledCards = this.shuffleArray(availableCards);
    const selectedCards = shuffledCards.slice(0, numCards);

    // Create shop items
    selectedCards.forEach((card) => {
      items.push({
        id: `card_${card.id}`,
        name: card.name,
        description: card.description,
        price: this.getCardPrice(card, level),
        type: "card",
        cardId: card.id,
        effect: (currentRun) => {
          if (currentRun) {
            currentRun.deck.push(card);
          }
        },
      });
    });

    return items;
  }

  // Generate card upgrades for the shop
  private getCardUpgrades(weaponType: WeaponType, level: number): ShopItem[] {
    const items: ShopItem[] = [];

    // Get current run
    const currentRun = playerProgress.getCurrentRun();
    if (!currentRun) return items;

    // Get upgrades for cards in player's deck
    const deckCardIds = currentRun.deck.map((card) => card.id);

    // Filter upgrades for cards in deck
    const possibleUpgrades = CARD_UPGRADES.filter((upgrade) => {
      return (
        deckCardIds.includes(upgrade.baseCardId) &&
        // Check that the card hasn't already been upgraded
        !currentRun.cardsUpgraded.some(
          (u) => u.oldCardId === upgrade.baseCardId,
        )
      );
    });

    // Shuffle and take 1-3 upgrades
    const numUpgrades = 1 + Math.floor(Math.random() * 3);
    const shuffledUpgrades = this.shuffleArray(possibleUpgrades);
    const selectedUpgrades = shuffledUpgrades.slice(0, numUpgrades);

    // Create shop items
    selectedUpgrades.forEach((upgrade) => {
      items.push({
        id: `upgrade_${upgrade.id}`,
        name: upgrade.name,
        description: `Upgrade: ${upgrade.description}`,
        price: this.getUpgradePrice(upgrade, level),
        type: "upgrade",
        upgradeId: upgrade.id,
        effect: (currentRun) => {
          if (currentRun) {
            // Find the card in deck
            const oldCardIndex = currentRun.deck.findIndex(
              (card) => card.id === upgrade.baseCardId,
            );
            if (oldCardIndex >= 0) {
              // Replace with upgraded version
              currentRun.deck[oldCardIndex] = upgrade.upgradedCard;

              // Record the upgrade
              currentRun.cardsUpgraded.push({
                oldCardId: upgrade.baseCardId,
                newCardId: upgrade.upgradedCard.id,
              });
            }
          }
        },
      });
    });

    return items;
  }

  // Generate consumable items for the shop
  private getConsumables(level: number): ShopItem[] {
    const items: ShopItem[] = [];

    // Define consumable types
    const consumables = [
      {
        id: "potion",
        name: "Potion",
        description: "Restore 20 HP",
        basePrice: 30,
        effect: (currentRun) => {
          if (currentRun) {
            currentRun.currentHealth = Math.min(
              currentRun.currentHealth + 20,
              currentRun.maxHealth,
            );
          }
        },
      },
      {
        id: "mega_potion",
        name: "Mega Potion",
        description: "Restore 50 HP",
        basePrice: 60,
        effect: (currentRun) => {
          if (currentRun) {
            currentRun.currentHealth = Math.min(
              currentRun.currentHealth + 50,
              currentRun.maxHealth,
            );
          }
        },
      },
      {
        id: "max_potion",
        name: "Max Potion",
        description: "Restore all HP",
        basePrice: 100,
        effect: (currentRun) => {
          if (currentRun) {
            currentRun.currentHealth = currentRun.maxHealth;
          }
        },
      },
      {
        id: "power_charm",
        name: "Power Charm",
        description: "Increase damage by 10% for the next 3 combats",
        basePrice: 80,
        effect: (currentRun) => {
          if (currentRun) {
            // Implement buff effect
          }
        },
      },
    ];

    // Shuffle and take 2-3 consumables
    const numConsumables = 2 + Math.floor(Math.random() * 2);
    const shuffledConsumables = this.shuffleArray(consumables);
    const selectedConsumables = shuffledConsumables.slice(0, numConsumables);

    // Create shop items
    selectedConsumables.forEach((consumable) => {
      items.push({
        id: `consumable_${consumable.id}_${Date.now()}`,
        name: consumable.name,
        description: consumable.description,
        price: Math.round(consumable.basePrice * (1 + level * 0.1)),
        type: "consumable",
        effect: consumable.effect,
      });
    });

    return items;
  }

  // Generate max HP upgrade item
  private getMaxHPUpgrade(level: number): ShopItem {
    const basePrice = 150;
    const scaledPrice = Math.round(basePrice * (1 + level * 0.2));

    return {
      id: `maxhp_upgrade_${Date.now()}`,
      name: "Ancient Potion",
      description: "Permanently increase max HP by 10",
      price: scaledPrice,
      type: "maxhp",
      effect: () => {
        playerProgress.incrementMaxHealth(10);
      },
    };
  }

  // Get price for a card based on its type and level
  private getCardPrice(card: Card, level: number): number {
    let basePrice = 0;

    // Set base price by card type
    switch (card.type) {
      case "attack":
        basePrice = 50 + (card.damage || 0) * 5;
        break;
      case "defense":
        basePrice = 40 + (card.block || 0) * 5;
        break;
      case "movement":
        basePrice = 30 + (card.drawCards || 0) * 20;
        break;
      case "special":
        basePrice = 70;
        break;
    }

    // Scale by level
    const scaledPrice = Math.round(basePrice * (1 + level * 0.1));

    return scaledPrice;
  }

  // Get price for a card upgrade based on the upgrade and level
  private getUpgradePrice(upgrade: any, level: number): number {
    const basePrice = 100;
    const scaledPrice = Math.round(basePrice * (1 + level * 0.15));

    return scaledPrice;
  }

  // Helper function to shuffle an array
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];

    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }

    return newArray;
  }

  // Purchase an item
  purchaseItem(itemId: string): boolean {
    // Find the item
    const item = this.availableItems.find((i) => i.id === itemId);
    if (!item) return false;

    // Get current run
    const currentRun = playerProgress.getCurrentRun();
    if (!currentRun) return false;

    // Check if player has enough gold
    if (currentRun.gold < item.price) return false;

    // Apply effect
    if (item.effect) {
      item.effect(currentRun);
    }

    // Subtract gold
    currentRun.gold -= item.price;

    // Remove from available items
    this.availableItems = this.availableItems.filter((i) => i.id !== itemId);

    return true;
  }
}

// Export a singleton instance
export const shopSystem = new ShopSystem();
export default shopSystem;

// Rest Site System
export class RestSiteSystem {
  // Heal at rest site (percentage of max health)
  healAtRestSite(percentage: number = 0.3): void {
    const currentRun = playerProgress.getCurrentRun();
    if (!currentRun) return;

    const healAmount = Math.floor(currentRun.maxHealth * percentage);
    playerProgress.healPlayer(healAmount);
  }

  // Fully heal at rest site (costs gold)
  fullHealAtRestSite(cost: number = 50): boolean {
    const currentRun = playerProgress.getCurrentRun();
    if (!currentRun) return false;

    // Check if player has enough gold
    if (currentRun.gold < cost) return false;

    // Apply full heal
    const healAmount = currentRun.maxHealth - currentRun.currentHealth;
    playerProgress.healPlayer(healAmount);

    // Subtract gold
    currentRun.gold -= cost;

    return true;
  }

  // Upgrade a random card in deck
  upgradeRandomCard(): string | null {
    const currentRun = playerProgress.getCurrentRun();
    if (!currentRun || currentRun.deck.length === 0) return null;

    // Get upgradeable cards (cards that have an upgrade available)
    const upgradeableCards = currentRun.deck.filter((card) => {
      // Check if card has an upgrade available
      return CARD_UPGRADES.some(
        (upgrade) =>
          upgrade.baseCardId === card.id &&
          !currentRun.cardsUpgraded.some((u) => u.oldCardId === card.id),
      );
    });

    if (upgradeableCards.length === 0) return null;

    // Select a random card to upgrade
    const randomIndex = Math.floor(Math.random() * upgradeableCards.length);
    const cardToUpgrade = upgradeableCards[randomIndex];

    // Find the upgrade
    const upgrade = CARD_UPGRADES.find(
      (u) => u.baseCardId === cardToUpgrade.id,
    );

    if (!upgrade) return null;

    // Apply the upgrade
    const cardIndex = currentRun.deck.findIndex(
      (c) => c.id === cardToUpgrade.id,
    );
    if (cardIndex >= 0) {
      // Replace with upgraded version
      currentRun.deck[cardIndex] = upgrade.upgradedCard;

      // Record the upgrade
      currentRun.cardsUpgraded.push({
        oldCardId: cardToUpgrade.id,
        newCardId: upgrade.upgradedCard.id,
      });

      return upgrade.upgradedCard.name;
    }

    return null;
  }

  // Remove a card from deck
  removeCardFromDeck(cardId: string): boolean {
    const currentRun = playerProgress.getCurrentRun();
    if (!currentRun) return false;

    // Find the card in deck
    const cardIndex = currentRun.deck.findIndex((card) => card.id === cardId);
    if (cardIndex < 0) return false;

    // Remove the card
    currentRun.deck.splice(cardIndex, 1);

    return true;
  }
}

// Export a singleton instance
export const restSiteSystem = new RestSiteSystem();
