// src/game/PlayerProgress.ts
import { Card, WeaponType } from "../types";
import { Material, MaterialInventory } from "../data/upgrades";

export interface PlayerStats {
  health: number;
  maxHealth: number;
  currentRun: RunData | null;
  completedRuns: RunData[];
  materials: MaterialInventory;
  unlockedCards: string[];
}

export interface RunData {
  id: number;
  weapon: WeaponType;
  deck: Card[];
  currentHealth: number;
  maxHealth: number;
  currentNodeId: string;
  completedNodeIds: string[];
  gold: number;
  monstersDefeated: {
    monsterId: string;
    partsHarvested: {
      partId: string;
      quantity: number;
    }[];
  }[];
  cardsUpgraded: {
    oldCardId: string;
    newCardId: string;
  }[];
}

class PlayerProgress {
  private playerStats: PlayerStats;
  private listeners: (() => void)[] = [];

  constructor() {
    // Initialize with default values or load from storage
    this.playerStats = this.loadFromStorage() || {
      health: 100,
      maxHealth: 100,
      currentRun: null,
      completedRuns: [],
      materials: {},
      unlockedCards: [],
    };
  }

  // Add a listener for state changes
  addListener(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notify all listeners of state changes
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
    this.saveToStorage();
  }

  // Start a new run
  startNewRun(weapon: WeaponType, startingDeck: Card[]): void {
    this.playerStats.currentRun = {
      id: Date.now(),
      weapon,
      deck: [...startingDeck],
      currentHealth: this.playerStats.maxHealth,
      maxHealth: this.playerStats.maxHealth,
      currentNodeId: "start",
      completedNodeIds: ["start"],
      gold: 0,
      monstersDefeated: [],
      cardsUpgraded: [],
    };

    this.notifyListeners();
  }

  // End the current run (either by victory or defeat)
  endRun(wasSuccessful: boolean): void {
    if (this.playerStats.currentRun) {
      if (wasSuccessful) {
        // Add harvested materials to inventory
        this.playerStats.currentRun.monstersDefeated.forEach((monster) => {
          monster.partsHarvested.forEach((part) => {
            const key = `${monster.monsterId}:${part.partId}`;
            this.playerStats.materials[key] =
              (this.playerStats.materials[key] || 0) + part.quantity;
          });
        });

        // Store completed run
        this.playerStats.completedRuns.push(this.playerStats.currentRun);
      }

      // Reset current run
      this.playerStats.currentRun = null;
    }

    this.notifyListeners();
  }

  // Move to a new node on the map
  moveToNode(nodeId: string): void {
    if (this.playerStats.currentRun) {
      this.playerStats.currentRun.currentNodeId = nodeId;
      this.notifyListeners();
    }
  }

  // Complete the current node
  completeCurrentNode(): void {
    if (
      this.playerStats.currentRun &&
      this.playerStats.currentRun.currentNodeId
    ) {
      if (
        !this.playerStats.currentRun.completedNodeIds.includes(
          this.playerStats.currentRun.currentNodeId,
        )
      ) {
        this.playerStats.currentRun.completedNodeIds.push(
          this.playerStats.currentRun.currentNodeId,
        );
      }
      this.notifyListeners();
    }
  }

  // Update health after combat
  updateHealth(newHealth: number): void {
    if (this.playerStats.currentRun) {
      this.playerStats.currentRun.currentHealth = Math.min(
        newHealth,
        this.playerStats.currentRun.maxHealth,
      );
      this.notifyListeners();
    }
  }

  // Heal player at rest sites
  healPlayer(amount: number): void {
    if (this.playerStats.currentRun) {
      this.playerStats.currentRun.currentHealth = Math.min(
        this.playerStats.currentRun.currentHealth + amount,
        this.playerStats.currentRun.maxHealth,
      );
      this.notifyListeners();
    }
  }

  // Add rewards after defeating a monster
  addMonsterRewards(
    monsterId: string,
    harvestedParts: { partId: string; broken: boolean }[],
  ): void {
    if (this.playerStats.currentRun) {
      // Convert parts to harvested materials (more for broken parts)
      const partsHarvested = harvestedParts.map((part) => ({
        partId: part.partId,
        quantity: part.broken ? 2 : 1,
      }));

      // Add to monster defeated list
      this.playerStats.currentRun.monstersDefeated.push({
        monsterId,
        partsHarvested,
      });

      // Add gold reward
      this.playerStats.currentRun.gold += 50; // Base amount

      this.notifyListeners();
    }
  }

  // Upgrade a card in the deck
  upgradeCard(oldCardId: string, newCard: Card): void {
    if (this.playerStats.currentRun) {
      // Find the card in the deck
      const cardIndex = this.playerStats.currentRun.deck.findIndex(
        (card) => card.id === oldCardId,
      );

      if (cardIndex !== -1) {
        // Replace the card
        this.playerStats.currentRun.deck[cardIndex] = newCard;

        // Add to upgraded cards list
        this.playerStats.currentRun.cardsUpgraded.push({
          oldCardId,
          newCardId: newCard.id,
        });

        this.notifyListeners();
      }
    }
  }

  // Consume materials from inventory
  consumeMaterials(materials: Material[]): boolean {
    // Check if we have enough materials
    const hasEnough = materials.every((material) => {
      const key = `${material.monsterId}:${material.partId}`;
      return (this.playerStats.materials[key] || 0) >= material.quantity;
    });

    if (hasEnough) {
      // Consume the materials
      materials.forEach((material) => {
        const key = `${material.monsterId}:${material.partId}`;
        this.playerStats.materials[key] -= material.quantity;
      });

      this.notifyListeners();
      return true;
    }

    return false;
  }

  // Get the current run data
  getCurrentRun(): RunData | null {
    return this.playerStats.currentRun;
  }

  // Get all player stats
  getPlayerStats(): PlayerStats {
    return { ...this.playerStats };
  }

  // Get materials inventory
  getMaterialsInventory(): MaterialInventory {
    return { ...this.playerStats.materials };
  }

  // Increment max health (permanent upgrade)
  incrementMaxHealth(amount: number): void {
    this.playerStats.maxHealth += amount;

    if (this.playerStats.currentRun) {
      this.playerStats.currentRun.maxHealth += amount;
      this.playerStats.currentRun.currentHealth += amount;
    }

    this.notifyListeners();
  }

  // Save progress to local storage
  private saveToStorage(): void {
    try {
      localStorage.setItem("playerProgress", JSON.stringify(this.playerStats));
    } catch (e) {
      console.error("Failed to save progress to local storage", e);
    }
  }

  // Load progress from local storage
  private loadFromStorage(): PlayerStats | null {
    try {
      const savedData = localStorage.getItem("playerProgress");
      return savedData ? JSON.parse(savedData) : null;
    } catch (e) {
      console.error("Failed to load progress from local storage", e);
      return null;
    }
  }

  // Clear all progress (for testing)
  clearProgress(): void {
    this.playerStats = {
      health: 10,
      maxHealth: 10,
      currentRun: null,
      completedRuns: [],
      materials: {},
      unlockedCards: [],
    };

    localStorage.removeItem("playerProgress");
    this.notifyListeners();
  }
}

// Export a singleton instance
export const playerProgress = new PlayerProgress();
export default playerProgress;
