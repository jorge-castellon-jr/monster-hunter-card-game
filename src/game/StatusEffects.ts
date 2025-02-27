// src/game/StatusEffects.ts

import { MonsterPart } from "../types";

export type StatusEffectType =
  | "poison"
  | "bleeding"
  | "burning"
  | "stun"
  | "buff"
  | "weakness"
  | "sharpness"
  | "resistance";

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  name: string;
  description: string;
  duration: number;
  value?: number; // For damage/buff effects
  apply: (target: MonsterPart) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTurnStart?: (target: any) => void;
  onTurnEnd?: (target: MonsterPart) => void;
}

// Factory functions to create status effects
export const createPoisonEffect = (
  duration: number = 3,
  damagePerTurn: number = 3,
): StatusEffect => ({
  id: `poison_${Date.now()}`,
  type: "poison",
  name: "Poison",
  description: `Take ${damagePerTurn} damage at the end of each turn`,
  duration,
  value: damagePerTurn,
  apply: (target) => {
    // Apply visual indicator
    console.log(target);
  },
  // onTurnEnd: (target) => {
  //   // Apply poison damage
  //   if (target.damagePlayer) {
  //     target.damagePlayer(damagePerTurn);
  //   }
  // },
});

export const createBleedingEffect = (
  duration: number = 3,
  damagePerTurn: number = 2,
): StatusEffect => ({
  id: `bleeding_${Date.now()}`,
  type: "bleeding",
  name: "Bleeding",
  description: `Take ${damagePerTurn} damage when moving`,
  duration,
  value: damagePerTurn,
  apply: (target) => {
    // Apply visual indicator
    console.log(target);
  },
  // Movement penalty handled in combat engine
});

export const createBurningEffect = (
  duration: number = 2,
  damagePerTurn: number = 5,
): StatusEffect => ({
  id: `burning_${Date.now()}`,
  type: "burning",
  name: "Burning",
  description: `Take ${damagePerTurn} damage at the end of each turn`,
  duration,
  value: damagePerTurn,
  apply: (target) => {
    // Apply visual indicator
    console.log(target);
  },
  // onTurnEnd: (target) => {
  //   // Apply burn damage
  //   if (target.damagePlayer) {
  //     target.damagePlayer(damagePerTurn);
  //   }
  // },
});

export const createStunEffect = (duration: number = 1): StatusEffect => ({
  id: `stun_${Date.now()}`,
  type: "stun",
  name: "Stunned",
  description: "Unable to attack",
  duration,
  apply: (target) => {
    // Apply visual indicator
    console.log(target);
  },
  // Effect handled in monster AI
});

export const createBuffEffect = (
  duration: number = 3,
  value: number = 2,
): StatusEffect => ({
  id: `buff_${Date.now()}`,
  type: "buff",
  name: "Attack Up",
  description: `+${value} damage to all attacks`,
  duration,
  value,
  apply: (target) => {
    // Apply visual indicator
    console.log(target);
  },
  // Damage bonus applied in combat engine
});

export const createWeaknessEffect = (
  duration: number = 3,
  value: number = 2,
): StatusEffect => ({
  id: `weakness_${Date.now()}`,
  type: "weakness",
  name: "Weakness Exploit",
  description: `Target takes ${value} extra damage`,
  duration,
  value,
  apply: (target) => {
    // Apply visual indicator
    console.log(target);
  },
  // Extra damage applied in combat engine
});

export const createSharpnessEffect = (duration: number = 3): StatusEffect => ({
  id: `sharpness_${Date.now()}`,
  type: "sharpness",
  name: "Sharpened Weapon",
  description: "Increased chance to break parts",
  duration,
  apply: (target) => {
    // Apply visual indicator
    console.log(target);
  },
  // Break chance bonus applied in combat engine
});

// Check if a target has a specific status effect
export const hasStatusEffect = (
  target: MonsterPart,
  type: StatusEffectType,
): boolean => {
  if (!target || !target.statusEffects) return false;

  return target.statusEffects.some(
    (effect: StatusEffect) => effect.type === type,
  );
};

// Get a status effect from a target
export const getStatusEffect = (
  target: MonsterPart,
  type: StatusEffectType,
): StatusEffect | null => {
  if (!target || !target.statusEffects) return null;

  return (
    target.statusEffects.find((effect: StatusEffect) => effect.type === type) ||
    null
  );
};

// Apply a status effect to a target
export const applyStatusEffect = (
  target: MonsterPart,
  effect: StatusEffect,
): void => {
  if (!target) return;

  // Initialize statusEffects array if it doesn't exist
  if (!target.statusEffects) {
    target.statusEffects = [];
  }

  // Check if target already has this type of effect
  const existingEffectIndex = target.statusEffects.findIndex(
    (e: StatusEffect) => e.type === effect.type,
  );

  if (existingEffectIndex !== -1) {
    // Replace the existing effect
    target.statusEffects[existingEffectIndex] = effect;
  } else {
    // Add new effect
    target.statusEffects.push(effect);
  }

  // Call the apply function
  effect.apply(target);
};

// Handle turn start effects
export const handleTurnStartEffects = (target: MonsterPart): void => {
  if (!target || !target.statusEffects) return;

  target.statusEffects.forEach((effect: StatusEffect) => {
    if (effect.onTurnStart) {
      effect.onTurnStart(target);
    }
  });
};

// Handle turn end effects
export const handleTurnEndEffects = (target: MonsterPart): void => {
  if (!target || !target.statusEffects) return;

  // Apply end of turn effects
  target.statusEffects.forEach((effect: StatusEffect) => {
    if (effect.onTurnEnd) {
      effect.onTurnEnd(target);
    }
  });

  // Reduce duration of all effects
  target.statusEffects.forEach((effect: StatusEffect) => {
    effect.duration--;
  });

  // Remove expired effects
  target.statusEffects = target.statusEffects.filter(
    (effect: StatusEffect) => effect.duration > 0,
  );
};
