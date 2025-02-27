// src/types/index.ts

import { StatusEffect } from "../game/StatusEffects";

// Card types
export type CardType = "attack" | "defense" | "movement" | "special";
export type WeaponType = "sword_and_shield" | "greatsword" | "bow";
export type TargetType = "single" | "all" | "self" | "position";

export interface CardEffect {
  type: string;
  duration?: number;
  value?: number;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  weapon: WeaponType;
  damage?: number;
  block?: number;
  heal?: number;
  drawCards?: number;
  chargeTime?: number;
  description: string;
  cost: number;
  targetType: TargetType;
  effects?: CardEffect[];
  effect?: CardEffect;
  status?: string;
}

// Monster types
export type MonsterType = "small" | "large" | "elite" | "boss";
export type MonsterAttackType =
  | "basic"
  | "sweep"
  | "heavy"
  | "charge"
  | "reposition";

export interface MonsterPart {
  id: string;
  name: string;
  health: number;
  broken: boolean;
  statusEffects?: StatusEffect[];
}

export interface MonsterAttack {
  id: string;
  name: string;
  type: MonsterAttackType;
  damage: number;
  targetPositions: number[];
  playerCardsAllowed: number;
  description: string;
  nextAttack?: string;
}

export interface Monster {
  id: string;
  name: string;
  type: MonsterType;
  parts: MonsterPart[];
  totalHealth: number;
  attackDeck: MonsterAttack[];
  special?: string;
  status?: string;
  description: string;
}

// Game State types
export interface PlayerEffect {
  type: string;
  value: number;
  duration: number;
}

export interface MonsterEffect {
  type: string;
  duration: number;
  partId: string;
}

export interface MapNode {
  id: string;
  type: "start" | "monster" | "elite" | "boss" | "rest" | "merchant";
  x: number;
  y: number;
  monsterId?: string;
  completed?: boolean;
}

export interface MapEdge {
  from: string;
  to: string;
}

export interface GameMap {
  nodes: MapNode[];
  edges: MapEdge[];
  playerPosition: string;
}

// Component props
export interface CardProps {
  card: Card;
  x?: number;
  y?: number;
  onClick?: (card: Card) => void;
  isSelected?: boolean;
  isPlayable?: boolean;
  scale?: number;
}

export interface HandProps {
  cards: Card[];
  x: number;
  y: number;
  width: number;
  selectedCardId: string | null;
  onCardClick?: (card: Card, index: number) => void;
  cardsPlayable?: boolean;
  maxCardsPlayable?: number;
  cardsPlayedThisTurn?: number;
}

export interface CombatGridProps {
  width: number;
  height: number;
  playerPosition: number;
  monsterParts: MonsterPart[];
  onPlayerPositionClick?: (position: number) => void;
  onMonsterPartClick?: (part: MonsterPart) => void;
  monsterAttack?: MonsterAttack;
  playerCanMove?: boolean;
}

export interface MonsterComponentProps {
  monster: Monster;
  x: number;
  y: number;
  width: number;
  height: number;
  currentAttack?: MonsterAttack;
}

export interface PlayerComponentProps {
  health: number;
  maxHealth: number;
  block: number;
  weapon: WeaponType;
  cardsPlayedThisTurn: number;
  maxCardsPlayable: number;
  movesThisTurn: number;
  maxMovesPerTurn?: number;
  effects?: PlayerEffect[];
  x: number;
  y: number;
  width: number;
}

export interface CombatScreenProps {
  onReturnToMap?: () => void;
  selectedWeapon?: WeaponType;
}

export interface MapScreenProps {
  onEnterCombat: () => void;
  selectedWeapon?: WeaponType;
}
