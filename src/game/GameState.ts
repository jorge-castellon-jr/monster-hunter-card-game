// src/game/GameState.ts
import {
  Card,
  WeaponType,
  MonsterPart,
  Monster,
  MonsterAttack,
  PlayerEffect,
  MonsterEffect,
  GameMap,
} from "../types";
import { STARTING_DECKS } from "../data/cards";
import { StatusEffect } from "./StatusEffects";

export interface PlayerStats {
  health: number;
  maxHealth: number;
  weapon: WeaponType;
  deck: Card[];
}

class GameState {
  // Player state
  playerHealth: number;
  playerMaxHealth: number;
  playerBlock: number;
  playerPosition: number;
  playerWeapon: WeaponType | null;
  playerDeck: Card[];
  playerHand: Card[];
  playerDiscard: Card[];
  playerEffects: PlayerEffect[];
  playerStatusEffects: StatusEffect[]; // New: Array of status effects
  maxHandSize: number;

  // Monster state
  currentMonster: Monster | null;
  currentMonsterAttack: MonsterAttack | null;
  monsterAttackIndex: number;
  monsterEffects: MonsterEffect[];

  // Combat state
  inCombat: boolean;
  currentTurn: number;
  playerCardsAllowed: number;
  cardsPlayedThisTurn: number;
  playerMovesThisTurn: number;

  // Map state
  currentMap: GameMap | null;

  // Run data
  gold: number; // New: Player gold for the current run
  monstersDefeated: string[]; // New: Track defeated monsters

  constructor() {
    // Player state
    this.playerHealth = 100;
    this.playerMaxHealth = 100;
    this.playerBlock = 0;
    this.playerPosition = 1; // Center position (0-2)
    this.playerWeapon = null;
    this.playerDeck = [];
    this.playerHand = [];
    this.playerDiscard = [];
    this.playerEffects = [];
    this.playerStatusEffects = []; // Initialize empty status effects
    this.maxHandSize = 5;

    // Monster state
    this.currentMonster = null;
    this.currentMonsterAttack = null;
    this.monsterAttackIndex = 0;
    this.monsterEffects = [];

    // Combat state
    this.inCombat = false;
    this.currentTurn = 0;
    this.playerCardsAllowed = 3;
    this.cardsPlayedThisTurn = 0;
    this.playerMovesThisTurn = 0;

    // Map state
    this.currentMap = null;

    // Run data
    this.gold = 0;
    this.monstersDefeated = [];
  }

  startNewGame(weaponType: WeaponType): void {
    // Set player starting stats
    this.playerHealth = 100;
    this.playerMaxHealth = 100;
    this.playerBlock = 0;
    this.playerPosition = 1;
    this.playerWeapon = weaponType;

    // Create a copy of the starting deck for the selected weapon
    this.playerDeck = [...STARTING_DECKS[weaponType]];

    // Shuffle the deck
    this.shuffleDeck();

    // Empty hand and discard
    this.playerHand = [];
    this.playerDiscard = [];
    this.playerEffects = [];
    this.playerStatusEffects = [];

    // Reset combat state
    this.inCombat = false;
    this.currentTurn = 0;

    // Reset run data
    this.gold = 0;
    this.monstersDefeated = [];

    // Generate a new map
    this.generateMap();
  }

  startCombat(player: PlayerStats, monster: Monster): void {
    // Set up player for combat
    this.playerHealth = player.health;
    this.playerMaxHealth = player.maxHealth;
    this.playerBlock = 0;
    this.playerPosition = 1;
    this.playerWeapon = player.weapon;
    this.playerDeck = [...player.deck];
    this.shuffleDeck();
    this.playerHand = [];
    this.playerDiscard = [];
    this.playerEffects = [];
    this.playerStatusEffects = [];

    // Set up monster for combat
    this.currentMonster = JSON.parse(JSON.stringify(monster)); // Deep copy

    // Initialize status effects arrays for monster parts
    if (this.currentMonster && this.currentMonster.parts) {
      this.currentMonster.parts.forEach((part) => {
        part.statusEffects = []; // Add status effects array to each part
      });
    }

    this.monsterAttackIndex = 0;
    this.currentMonsterAttack =
      this.currentMonster!.attackDeck[this.monsterAttackIndex];
    this.monsterEffects = [];

    // Set up combat state
    this.inCombat = true;
    this.currentTurn = 1;
    this.playerCardsAllowed = 3;
    this.cardsPlayedThisTurn = 0;
    this.playerMovesThisTurn = 0;
  }

  endCombat(wasVictory: boolean = true): void {
    // Add defeated monster to list if victory
    if (wasVictory && this.currentMonster) {
      this.monstersDefeated.push(this.currentMonster.id);

      // Add gold reward for victory (based on monster type)
      switch (this.currentMonster.type) {
        case "small":
          this.gold += 25;
          break;
        case "large":
          this.gold += 50;
          break;
        case "elite":
          this.gold += 75;
          break;
        case "boss":
          this.gold += 100;
          break;
        default:
          this.gold += 25;
      }
    }

    this.inCombat = false;
    this.currentMonster = null;
  }

  nextTurn(): void {
    this.currentTurn++;
    this.cardsPlayedThisTurn = 0;
    this.playerMovesThisTurn = 0;
  }

  shuffleDeck(): void {
    // Fisher-Yates shuffle algorithm
    for (let i = this.playerDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playerDeck[i], this.playerDeck[j]] = [
        this.playerDeck[j],
        this.playerDeck[i],
      ];
    }
  }

  drawCard(): Card | null {
    if (this.playerDeck.length === 0) return null;

    const card = this.playerDeck.pop();
    if (card) {
      this.playerHand.push(card);
    }
    return card || null;
  }

  findCardInHand(cardId: string): Card | undefined {
    return this.playerHand.find((card) => card.id === cardId);
  }

  removeCardFromHand(cardId: string): Card | null {
    const index = this.playerHand.findIndex((card) => card.id === cardId);
    if (index !== -1) {
      return this.playerHand.splice(index, 1)[0];
    }
    return null;
  }

  addCardToDiscard(card: Card): void {
    this.playerDiscard.push(card);
  }

  shuffleDiscardIntoDeck(): void {
    // Move all cards from discard to deck
    this.playerDeck = [...this.playerDiscard];
    this.playerDiscard = [];

    // Shuffle the deck
    this.shuffleDeck();
  }

  getNextMonsterAttack(): MonsterAttack | null {
    return this.currentMonsterAttack;
  }

  nextMonsterAttack(): MonsterAttack | null {
    if (!this.currentMonster) return null;

    // Move to next attack in the deck
    this.monsterAttackIndex =
      (this.monsterAttackIndex + 1) % this.currentMonster.attackDeck.length;
    this.currentMonsterAttack =
      this.currentMonster.attackDeck[this.monsterAttackIndex];

    // Check for a special case where a charge attack is followed by a charged attack
    if (this.currentMonsterAttack.type === "charge") {
      const chargedAttackIndex = this.currentMonster.attackDeck.findIndex(
        (attack) => attack.id === this.currentMonsterAttack?.nextAttack,
      );

      if (chargedAttackIndex !== -1) {
        this.monsterAttackIndex = chargedAttackIndex;
        this.currentMonsterAttack =
          this.currentMonster.attackDeck[chargedAttackIndex];
      }
    }

    return this.currentMonsterAttack;
  }

  getMonsterPartAtPosition(position: number): MonsterPart | null {
    if (!this.currentMonster) return null;

    // For large monsters, map positions to parts
    if (
      this.currentMonster.type === "large" ||
      this.currentMonster.type === "elite" ||
      this.currentMonster.type === "boss"
    ) {
      if (position === 0) return this.currentMonster.parts[0]; // Head
      if (position === 1) return this.currentMonster.parts[1]; // Body
      if (position === 2) return this.currentMonster.parts[2]; // Tail/Legs
    }
    // For small monsters, all positions target the same monster
    else {
      // Return the first part for simplicity in prototype
      return this.currentMonster.parts[0];
    }

    return null;
  }

  damagePlayer(amount: number): void {
    this.playerHealth -= amount;
    this.playerHealth = Math.max(0, this.playerHealth);
  }

  healPlayer(amount: number): void {
    this.playerHealth += amount;
    this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth);
  }

  addPlayerEffect(type: string, value: number, duration: number): void {
    this.playerEffects.push({ type, value, duration });
  }

  addMonsterEffect(type: string, duration: number, partId: string): void {
    this.monsterEffects.push({ type, duration, partId });
  }

  // New: Add status effect to player
  addPlayerStatusEffect(effect: StatusEffect): void {
    // Check if player already has this type of effect
    const existingIndex = this.playerStatusEffects.findIndex(
      (e) => e.type === effect.type,
    );

    if (existingIndex !== -1) {
      // Replace existing effect
      this.playerStatusEffects[existingIndex] = effect;
    } else {
      // Add new effect
      this.playerStatusEffects.push(effect);
    }
  }

  // New: Add status effect to monster part
  addMonsterPartStatusEffect(partId: string, effect: StatusEffect): void {
    if (!this.currentMonster) return;

    // Find part
    const part = this.currentMonster.parts.find((p) => p.id === partId);

    if (part) {
      // Initialize status effects array if it doesn't exist
      if (!part.statusEffects) {
        part.statusEffects = [];
      }

      // Check if part already has this type of effect
      const existingIndex = part.statusEffects.findIndex(
        (e) => e.type === effect.type,
      );

      if (existingIndex !== -1) {
        // Replace existing effect
        part.statusEffects[existingIndex] = effect;
      } else {
        // Add new effect
        part.statusEffects.push(effect);
      }
    }
  }

  // New: Add gold to player's total
  addGold(amount: number): void {
    this.gold += amount;
  }

  // New: Spend gold if player has enough
  spendGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      return true;
    }
    return false;
  }

  generateMap(): void {
    // Simple map generation for prototype
    this.currentMap = {
      nodes: [
        { id: "start", type: "start", x: 100, y: 300 },
        {
          id: "monster1",
          type: "monster",
          monsterId: "great_jagras",
          x: 200,
          y: 200,
        },
        {
          id: "monster2",
          type: "monster",
          monsterId: "kulu_ya_ku",
          x: 200,
          y: 400,
        },
        { id: "rest", type: "rest", x: 300, y: 300 },
        {
          id: "monster3",
          type: "monster",
          monsterId: "pukei_pukei",
          x: 400,
          y: 200,
        },
        {
          id: "elite",
          type: "elite",
          monsterId: "great_jagras",
          x: 400,
          y: 400,
        },
        { id: "boss", type: "boss", monsterId: "pukei_pukei", x: 500, y: 300 },
      ],
      edges: [
        { from: "start", to: "monster1" },
        { from: "start", to: "monster2" },
        { from: "monster1", to: "rest" },
        { from: "monster2", to: "rest" },
        { from: "rest", to: "monster3" },
        { from: "rest", to: "elite" },
        { from: "monster3", to: "boss" },
        { from: "elite", to: "boss" },
      ],
      playerPosition: "start",
    };
  }
}

export default GameState;
