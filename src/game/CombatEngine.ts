// src/game/CombatEngine.ts
import { Card, MonsterPart, Monster, CardEffect } from "../types";
import GameState, { PlayerStats } from "./GameState";
import {
  applyStatusEffect,
  createBleedingEffect,
  createBurningEffect,
  createPoisonEffect,
  createStunEffect,
  StatusEffect,
} from "./StatusEffects";

type EventCallback = (data: unknown) => void;

class CombatEngine {
  gameState: GameState | null;
  eventListeners: Record<string, EventCallback[]>;

  constructor() {
    this.gameState = null;
    this.eventListeners = {};
  }

  initialize(gameState: GameState): void {
    this.gameState = gameState;
  }

  addEventListener(event: string, callback: EventCallback): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  triggerEvent(event: string, data: unknown): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => callback(data));
    }
  }

  startCombat(player: PlayerStats, monster: Monster): void {
    if (!this.gameState) return;

    this.gameState.startCombat(player, monster);
    this.drawPlayerHand();
    this.revealMonsterIntention();
    this.triggerEvent("combatStarted", { player, monster });
  }

  endPlayerTurn(): void {
    if (!this.gameState) return;

    // Apply any end-of-turn effects for the player
    this.applyEndOfTurnEffects("player");

    // Execute monster's attack
    this.executeMonsterAttack();

    // Check if combat has ended
    if (this.checkCombatEnd()) {
      return;
    }

    // Start next turn
    this.gameState.nextTurn();

    this.applyStartOfTurnEffects();

    this.drawPlayerHand();
    this.revealMonsterIntention();

    this.triggerEvent("turnEnded", {
      currentTurn: this.gameState.currentTurn,
      playerCardsAllowed: this.gameState.playerCardsAllowed,
    });
  }

  applyStartOfTurnEffects(): void {
    if (!this.gameState) return;

    // Player status effects
    if (
      this.gameState.playerStatusEffects &&
      this.gameState.playerStatusEffects.length > 0
    ) {
      // Process each effect's start of turn action
      this.gameState.playerStatusEffects.forEach((effect) => {
        if (effect.onTurnStart) {
          effect.onTurnStart(this.gameState);
          this.triggerEvent("statusEffectActivated", {
            effectType: effect.type,
            effectName: effect.name,
            target: "player",
          });
        }
      });
    }

    // Monster part status effects
    if (this.gameState.currentMonster && this.gameState.currentMonster.parts) {
      this.gameState.currentMonster.parts.forEach((part) => {
        if (part.statusEffects && part.statusEffects.length > 0) {
          part.statusEffects.forEach((effect) => {
            if (effect.onTurnStart) {
              effect.onTurnStart(part);
              this.triggerEvent("statusEffectActivated", {
                effectType: effect.type,
                effectName: effect.name,
                target: "monster",
                partId: part.id,
              });
            }
          });
        }
      });
    }
  }

  playCard(cardId: string, targetPosition?: number): boolean {
    if (!this.gameState) return false;

    const card = this.gameState.findCardInHand(cardId);
    if (!card) return false;

    // Check if player can play more cards this turn
    if (
      this.gameState.cardsPlayedThisTurn >= this.gameState.playerCardsAllowed
    ) {
      this.triggerEvent("error", {
        message: "Cannot play more cards this turn",
      });
      return false;
    }

    // Apply card effects
    this.applyCardEffect(card, targetPosition);

    // Remove card from hand and add to discard pile
    this.gameState.removeCardFromHand(cardId);
    this.gameState.addCardToDiscard(card);

    // Increment cards played
    this.gameState.cardsPlayedThisTurn++;

    this.triggerEvent("cardPlayed", { card, targetPosition });

    // Check if monster was defeated
    if (this.checkMonsterDefeated()) {
      this.endCombat("victory");
      return true;
    }

    return true;
  }

  movePlayer(newPosition: number): boolean {
    if (!this.gameState) return false;

    // Check if this would be a free move or requires a card discard
    if (this.gameState.playerMovesThisTurn < 1) {
      // Free move
      this.gameState.playerPosition = newPosition;
      this.gameState.playerMovesThisTurn++;
      this.triggerEvent("playerMoved", { position: newPosition, free: true });
      return true;
    } else {
      // Would require a card discard
      this.triggerEvent("error", {
        message: "No free moves left this turn. Discard a card to move again.",
      });
      return false;
    }
  }

  discardCardToMove(cardId: string, newPosition: number): boolean {
    if (!this.gameState) return false;

    const card = this.gameState.findCardInHand(cardId);
    if (!card) return false;

    // Remove card from hand and add to discard pile
    this.gameState.removeCardFromHand(cardId);
    this.gameState.addCardToDiscard(card);

    // Move player
    this.gameState.playerPosition = newPosition;

    this.triggerEvent("cardDiscarded", { card });
    this.triggerEvent("playerMoved", { position: newPosition, free: false });

    return true;
  }

  drawPlayerHand(): void {
    if (!this.gameState) return;

    // Draw until hand size is reached or deck is empty
    while (
      this.gameState.playerHand.length < this.gameState.maxHandSize &&
      (this.gameState.playerDeck.length > 0 ||
        this.gameState.playerDiscard.length > 0)
    ) {
      // If deck is empty, shuffle discard pile into deck
      if (
        this.gameState.playerDeck.length === 0 &&
        this.gameState.playerDiscard.length > 0
      ) {
        this.gameState.shuffleDiscardIntoDeck();
        this.triggerEvent("deckShuffled", {});
      }

      // If we still have cards in the deck, draw one
      if (this.gameState.playerDeck.length > 0) {
        const card = this.gameState.drawCard();
        if (card) {
          this.triggerEvent("cardDrawn", { card });
        }
      } else {
        break;
      }
    }
  }

  revealMonsterIntention(): void {
    if (!this.gameState) return;

    // Get next monster attack
    const monsterAttack = this.gameState.getNextMonsterAttack();

    if (monsterAttack) {
      // Set player cards allowed based on monster attack
      this.gameState.playerCardsAllowed = monsterAttack.playerCardsAllowed;

      // Reset cards played this turn
      this.gameState.cardsPlayedThisTurn = 0;

      // Reset player moves this turn
      this.gameState.playerMovesThisTurn = 0;

      this.triggerEvent("monsterIntentionRevealed", { attack: monsterAttack });
    }
  }

  executeMonsterAttack(): void {
    if (!this.gameState || !this.gameState.currentMonsterAttack) return;

    const attack = this.gameState.currentMonsterAttack;
    // Check if monster is stunned
    let isStunned = false;
    if (this.gameState.currentMonster) {
      // Consider monster stunned if any part has stun effect
      this.gameState.currentMonster.parts.forEach((part) => {
        if (
          part.statusEffects &&
          part.statusEffects.some((effect) => effect.type === "stun")
        ) {
          isStunned = true;
        }
      });
    }

    // Skip attack if stunned
    if (isStunned) {
      this.triggerEvent("monsterStunned", {});
    } else {
      // Apply damage to player if they're in a targeted position
      if (attack.targetPositions.includes(this.gameState.playerPosition)) {
        // Calculate damage after block and effects
        const baseDamage = attack.damage;
        const finalDamage = this.calculateDamage(baseDamage, "player");
        const damageAfterBlock = Math.max(
          0,
          finalDamage - this.gameState.playerBlock,
        );

        // Apply damage to player
        this.gameState.damagePlayer(damageAfterBlock);

        this.triggerEvent("playerDamaged", { damage: damageAfterBlock });

        // Check if player was defeated
        if (this.gameState.playerHealth <= 0) {
          this.endCombat("defeat");
          return;
        }
      }
    }

    // Reset player block after attack
    this.gameState.playerBlock = 0;

    // Move to next monster attack
    this.gameState.nextMonsterAttack();
  }

  applyCardEffect(card: Card, targetPosition?: number): void {
    // Apply different effects based on card type
    switch (card.type) {
      case "attack":
        this.applyAttackCard(card, targetPosition);
        break;
      case "defense":
        this.applyDefenseCard(card);
        break;
      case "movement":
        this.applyMovementCard(card, targetPosition);
        break;
      case "special":
        this.applySpecialCard(card);
        break;
    }

    if (!this.gameState) return;

    // Apply any additional effects
    if (card.drawCards && card.drawCards > 0) {
      for (let i = 0; i < card.drawCards; i++) {
        if (
          this.gameState.playerDeck.length === 0 &&
          this.gameState.playerDiscard.length > 0
        ) {
          this.gameState.shuffleDiscardIntoDeck();
        }

        if (this.gameState.playerDeck.length > 0) {
          const drawnCard = this.gameState.drawCard();
          if (drawnCard) {
            this.triggerEvent("cardDrawn", { card: drawnCard });
          }
        }
      }
    }
    // Apply status effects that might be on the card
    if (card.status && this.gameState.currentMonster) {
      this.applyCardStatusEffect(card, targetPosition);
    }
  }
  // Add this method to CombatEngine
  applyCardStatusEffect(card: Card, targetPosition?: number): void {
    if (!this.gameState || !this.gameState.currentMonster) return;

    // If no status defined, do nothing
    if (!card.status) return;

    // Get target part or monster
    let target;

    if (targetPosition !== undefined) {
      target = this.gameState.getMonsterPartAtPosition(targetPosition);
    } else if (card.targetType === "all") {
      // Apply to all parts
      this.gameState.currentMonster.parts.forEach((part) => {
        this.applyStatusToMonsterPart(card.status!, part);
      });
      return;
    }

    // Apply to specific target
    if (target) {
      this.applyStatusToMonsterPart(card.status, target);
    }
  }
  applyStatusToMonsterPart(statusType: string, part: MonsterPart): void {
    // Determine which status effect to apply
    let effect: StatusEffect | null = null;

    switch (statusType) {
      case "poison":
        effect = createPoisonEffect(3, 3);
        break;
      case "burning":
        effect = createBurningEffect(2, 5);
        break;
      case "bleeding":
        effect = createBleedingEffect(3, 2);
        break;
      case "stun":
        effect = createStunEffect(1);
        break;
      default:
        return; // Unknown status type
    }

    if (effect) {
      // Apply to part
      applyStatusEffect(part, effect);

      // Trigger event
      this.triggerEvent("statusEffectApplied", {
        effect,
        targetType: "monster",
        partId: part.id,
      });
    }
  }
  calculateDamage(
    baseDamage: number,
    targetType: "player" | "monster",
    partId?: string,
  ): number {
    if (!this.gameState) return baseDamage;

    let damage = baseDamage;

    if (targetType === "player") {
      // Check for player weakness/resistance effects
      if (this.gameState.playerStatusEffects) {
        this.gameState.playerStatusEffects.forEach((effect) => {
          if (effect.type === "weakness" && effect.value) {
            damage += effect.value; // Take extra damage
          }
          if (effect.type === "resistance" && effect.value) {
            damage = Math.max(1, damage - effect.value); // Reduce damage, minimum 1
          }
        });
      }
    } else if (targetType === "monster" && this.gameState.currentMonster) {
      // Check for monster part weakness/resistance effects
      if (partId) {
        const part = this.gameState.currentMonster.parts.find(
          (p) => p.id === partId,
        );
        if (part && part.statusEffects) {
          part.statusEffects.forEach((effect) => {
            if (effect.type === "weakness" && effect.value) {
              damage += effect.value; // Deal extra damage
            }
          });
        }
      }

      // Check for player attack boosts
      if (this.gameState.playerStatusEffects) {
        this.gameState.playerStatusEffects.forEach((effect) => {
          if (effect.type === "buff" && effect.value) {
            damage += effect.value; // Add bonus damage
          }
        });
      }
    }

    // Ensure damage is at least 0
    return Math.max(0, damage);
  }

  applyAttackCard(card: Card, targetPosition?: number): void {
    if (!this.gameState) return;
    const damage = card.damage || 0;

    // Check if this is a targeted attack
    if (card.targetType === "single" && targetPosition !== undefined) {
      // Apply damage to monster part at target position
      const monsterPart =
        this.gameState.getMonsterPartAtPosition(targetPosition);
      if (monsterPart) {
        // Calculate damage with effects
        const finalDamage = this.calculateDamage(
          damage,
          "monster",
          monsterPart.id,
        );
        this.damageMonsterPart(monsterPart, finalDamage);
      }
    }
    // Check if this is an attack that hits all positions
    else if (card.targetType === "all" && this.gameState.currentMonster) {
      // Apply damage to all monster parts
      this.gameState.currentMonster.parts.forEach((part) => {
        const finalDamage = this.calculateDamage(damage, "monster", part.id);
        this.damageMonsterPart(part, finalDamage);
      });
    }
    // Apply any additional effects
    if (card.effects) {
      card.effects.forEach((effect) => {
        this.applyEffect(effect, targetPosition);
      });
    }
  }

  damageMonsterPart(part: MonsterPart, damage: number): void {
    if (!this.gameState || !this.gameState.currentMonster) return;

    // Reduce part health by damage
    part.health -= damage;

    // Check if part is broken
    if (!part.broken && part.health <= 0) {
      part.broken = true;
      this.triggerEvent("partBroken", { part });
    }

    // Ensure part health doesn't go below 0
    part.health = Math.max(0, part.health);

    // Reduce total monster health
    this.gameState.currentMonster.totalHealth -= damage;
    this.gameState.currentMonster.totalHealth = Math.max(
      0,
      this.gameState.currentMonster.totalHealth,
    );

    this.triggerEvent("monsterDamaged", {
      part,
      damage,
      totalHealth: this.gameState.currentMonster.totalHealth,
    });
  }

  applyDefenseCard(card: Card): void {
    if (!this.gameState) return;

    // Add block to player
    if (card.block) {
      this.gameState.playerBlock += card.block;
      this.triggerEvent("playerBlocked", { block: card.block });
    }
  }

  applyMovementCard(card: Card, targetPosition?: number): void {
    if (!this.gameState || targetPosition === undefined) return;

    // Move player to target position
    this.gameState.playerPosition = targetPosition;
    this.triggerEvent("playerMoved", { position: targetPosition, free: false });
  }

  applySpecialCard(card: Card): void {
    if (!this.gameState) return;

    // Apply heal
    if (card.heal) {
      this.gameState.healPlayer(card.heal);
      this.triggerEvent("playerHealed", { amount: card.heal });
    }

    // Apply effects
    if (card.effect) {
      this.applyEffect(card.effect);
    }
  }

  applyEffect(effect: CardEffect, targetPosition?: number): void {
    if (!this.gameState) return;

    switch (effect.type) {
      case "stun":
        // Apply stun to monster
        if (targetPosition !== undefined) {
          const monsterPart =
            this.gameState.getMonsterPartAtPosition(targetPosition);
          if (monsterPart) {
            this.gameState.addMonsterEffect(
              "stun",
              effect.duration!,
              monsterPart.id,
            );
            this.triggerEvent("monsterEffectApplied", {
              effect,
              part: monsterPart,
            });
          }
        }
        break;
      case "buff":
        // Apply buff to player
        this.gameState.addPlayerEffect("buff", effect.value!, effect.duration!);
        this.triggerEvent("playerEffectApplied", { effect });
        break;
    }
  }

  applyEndOfTurnEffects(target: "player" | "monster"): void {
    if (!this.gameState) return;

    if (target === "player") {
      // Handle player status effects
      if (
        this.gameState.playerStatusEffects &&
        this.gameState.playerStatusEffects.length > 0
      ) {
        // Process each effect's end of turn action
        this.gameState.playerStatusEffects.forEach((effect) => {
          if (effect.onTurnEnd) {
            effect.onTurnEnd(this.gameState);
            this.triggerEvent("statusEffectActivated", {
              effectType: effect.type,
              effectName: effect.name,
              target: "player",
            });
          }
        });

        // Reduce durations and remove expired effects
        this.gameState.playerStatusEffects = this.gameState.playerStatusEffects
          .map((effect) => ({ ...effect, duration: effect.duration - 1 }))
          .filter((effect) => effect.duration > 0);
      }

      // Reduce duration of player effects
      this.gameState.playerEffects.forEach((effect) => {
        effect.duration--;
      });

      // Remove expired effects
      this.gameState.playerEffects = this.gameState.playerEffects.filter(
        (effect) => effect.duration > 0,
      );
    } else if (target === "monster") {
      // Handle monster part status effects
      this.gameState.currentMonster!.parts.forEach((part) => {
        if (part.statusEffects && part.statusEffects.length > 0) {
          // Process each effect's end of turn action
          part.statusEffects.forEach((effect) => {
            if (effect.onTurnEnd) {
              effect.onTurnEnd(part);
              this.triggerEvent("statusEffectActivated", {
                effectType: effect.type,
                effectName: effect.name,
                target: "monster",
                partId: part.id,
              });
            }
          });

          // Reduce durations and remove expired effects
          part.statusEffects = part.statusEffects
            .map((effect) => ({ ...effect, duration: effect.duration - 1 }))
            .filter((effect) => effect.duration > 0);
        }
      });

      // Reduce duration of monster effects
      this.gameState.monsterEffects.forEach((effect) => {
        effect.duration--;
      });

      // Remove expired effects
      this.gameState.monsterEffects = this.gameState.monsterEffects.filter(
        (effect) => effect.duration > 0,
      );
    }
  }

  checkMonsterDefeated(): boolean {
    if (!this.gameState || !this.gameState.currentMonster) return false;
    return this.gameState.currentMonster.totalHealth <= 0;
  }

  checkPlayerDefeated(): boolean {
    if (!this.gameState) return false;
    return this.gameState.playerHealth <= 0;
  }

  checkCombatEnd(): boolean {
    if (this.checkMonsterDefeated()) {
      this.endCombat("victory");
      return true;
    }

    if (this.checkPlayerDefeated()) {
      this.endCombat("defeat");
      return true;
    }

    return false;
  }

  endCombat(result: "victory" | "defeat"): void {
    if (this.gameState) {
      this.gameState.endCombat();
    }
    this.triggerEvent("combatEnded", { result });
  }
}

export default CombatEngine;
