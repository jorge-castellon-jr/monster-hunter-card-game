// src/screens/CombatScreen.tsx
import React, { useState, useEffect } from "react";
import { Stage, Container, Graphics, Text } from "@pixi/react";
import * as PIXI from "pixi.js";

import Hand from "../components/Hand";
import CombatGrid from "../components/CombatGrid";
import Monster from "../components/Monster";
import Player from "../components/Player";

import CombatEngine from "../game/CombatEngine";
import GameState, { PlayerStats } from "../game/GameState";
import playerProgress from "../game/PlayerProgress";

import { MONSTERS } from "../data/monsters";
import { ALL_MONSTERS } from "../data/monsters-expanded";
import { WEAPON_TYPES } from "../data/cards";
import {
  Card as CardType,
  Monster as MonsterType,
  MonsterPart,
  WeaponType,
} from "../types";

interface UpdatedCombatScreenProps {
  onComplete: (result: "victory" | "defeat") => void;
  selectedWeapon?: WeaponType;
  nodeType?: string;
}

const CombatScreen: React.FC<UpdatedCombatScreenProps> = ({
  onComplete,
  selectedWeapon,
  nodeType = "monster",
}) => {
  // Game State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [combatEngine, setCombatEngine] = useState<CombatEngine | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  // const [selectedTarget, setSelectedTarget] = useState<MonsterPart | null>(
  //   null,
  // );
  const [gameMessage, setGameMessage] = useState("");
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [statusEffects, setStatusEffects] = useState<
    { id: string; name: string; turnsLeft: number }[]
  >([]);

  // Screen dimensions
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);

  // Initialize the game
  useEffect(() => {
    const newGameState = new GameState();
    const newCombatEngine = new CombatEngine();

    // Get current run from player progress
    const currentRun = playerProgress.getCurrentRun();

    if (!currentRun) {
      // Fallback to a default if no current run exists
      const weaponType =
        (selectedWeapon as WeaponType) || WEAPON_TYPES.SWORD_AND_SHIELD;
      newGameState.startNewGame(weaponType);
    }

    // Initialize combat engine with game state
    newCombatEngine.initialize(newGameState);

    // Set up event listeners
    newCombatEngine.addEventListener(
      "combatStarted",
      (data: { player: PlayerStats; monster: MonsterType }) => {
        addToCombatLog(`Combat started against ${data.monster.name}!`);
        setIsPlayerTurn(true);
      },
    );

    newCombatEngine.addEventListener("turnEnded", (data) => {
      addToCombatLog(
        `Turn ${data.currentTurn} ended. You can play ${data.playerCardsAllowed} cards.`,
      );
      setIsPlayerTurn(true);
    });

    newCombatEngine.addEventListener("cardPlayed", (data) => {
      addToCombatLog(`Played card: ${data.card.name}`);
      setSelectedCardId(null);
      // setSelectedTarget(null);
    });

    newCombatEngine.addEventListener("playerMoved", (data) => {
      addToCombatLog(
        `Moved to position ${data.position + 1}${data.free ? " (free move)" : ""}`,
      );
    });

    newCombatEngine.addEventListener("playerDamaged", (data) => {
      addToCombatLog(`Took ${data.damage} damage!`);
    });

    newCombatEngine.addEventListener("playerHealed", (data) => {
      addToCombatLog(`Healed for ${data.amount} HP`);
    });

    newCombatEngine.addEventListener("playerBlocked", (data) => {
      addToCombatLog(`Gained ${data.block} block`);
    });

    newCombatEngine.addEventListener("monsterDamaged", (data) => {
      addToCombatLog(`Dealt ${data.damage} damage to ${data.part.name}`);
    });

    newCombatEngine.addEventListener("partBroken", (data) => {
      addToCombatLog(`Broke the monster's ${data.part.name}!`);
    });

    newCombatEngine.addEventListener("monsterIntentionRevealed", (data) => {
      addToCombatLog(`Monster prepares: ${data.attack.name}`);
    });

    newCombatEngine.addEventListener("combatEnded", (data) => {
      if (data.result === "victory") {
        addToCombatLog("Victory! You defeated the monster!");
        setGameMessage("Victory! You defeated the monster!");

        // Handle rewards and progression
        if (newGameState.currentMonster) {
          // Get broken parts for better rewards
          const brokenParts = newGameState.currentMonster.parts
            .filter((part) => part.broken)
            .map((part) => ({
              partId: part.id,
              broken: part.broken,
            }));

          // Add monster to defeated list with harvested parts
          playerProgress.addMonsterRewards(
            newGameState.currentMonster.id,
            brokenParts,
          );

          // Update player health in progress
          playerProgress.updateHealth(newGameState.playerHealth);
        }

        // Delay to show victory message before returning
        setTimeout(() => {
          onComplete("victory");
        }, 2000);
      } else {
        addToCombatLog("Defeat! You were carted back to camp...");
        setGameMessage("Defeat! You were carted back to camp...");

        // Delay to show defeat message before returning
        setTimeout(() => {
          onComplete("defeat");
        }, 2000);
      }
    });

    newCombatEngine.addEventListener("error", (data) => {
      setGameMessage(data.message);
      setTimeout(() => setGameMessage(""), 3000);
    });

    // Determine which monster to fight based on node type
    let monster;

    // Get current run data for monster selection
    if (currentRun) {
      const currentNodeId = currentRun.currentNodeId;
      const nodeIdParts = currentNodeId.split("_");
      const level = parseInt(nodeIdParts[1]) || 1;

      // Select monster based on node type and level
      switch (nodeType) {
        case "monster": {
          // Get random monster based on level
          const difficulty = level <= 1 ? "EARLY" : level >= 3 ? "LATE" : "MID";
          const candidates =
            difficulty === "EARLY"
              ? [MONSTERS.GREAT_JAGRAS, MONSTERS.KULU_YA_KU]
              : difficulty === "MID"
                ? [
                  MONSTERS.PUKEI_PUKEI,
                  ALL_MONSTERS.GREAT_JAGRAS_ELITE,
                  ALL_MONSTERS.KULU_YA_KU_ELITE,
                ]
                : [
                  ALL_MONSTERS.ANJANATH,
                  ALL_MONSTERS.RATHIAN,
                  ALL_MONSTERS.ODOGARON,
                ];

          monster = candidates[Math.floor(Math.random() * candidates.length)];
          break;
        }

        case "elite":
          // Elite monsters
          monster =
            level <= 2
              ? ALL_MONSTERS.GREAT_JAGRAS_ELITE
              : ALL_MONSTERS.KULU_YA_KU_ELITE;
          break;

        case "boss":
          // Boss monster
          monster = ALL_MONSTERS.NERGIGANTE;
          break;

        default:
          // Fallback to Great Jagras
          monster = MONSTERS.GREAT_JAGRAS;
      }

      // Start combat with player's current deck and monster
      newCombatEngine.startCombat(
        {
          health: currentRun.currentHealth,
          maxHealth: currentRun.maxHealth,
          weapon: currentRun.weapon,
          deck: currentRun.deck,
        },
        monster,
      );
    } else {
      // Fallback if no run data
      monster = MONSTERS.GREAT_JAGRAS;

      // Start combat with default
      newCombatEngine.startCombat(
        {
          health: 100,
          maxHealth: 100,
          weapon: selectedWeapon || WEAPON_TYPES.SWORD_AND_SHIELD,
          deck: newGameState.playerDeck,
        },
        monster,
      );
    }

    // Save to state
    setGameState(newGameState);
    setCombatEngine(newCombatEngine);

    // Set up window resize listener
    const handleResize = () => {
      setWidth(Math.min(800, window.innerWidth - 40));
      setHeight(800);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedWeapon, nodeType]);

  // Helper function to add message to combat log
  const addToCombatLog = (message: string) => {
    setCombatLog((prevLog) => {
      const newLog = [...prevLog, message];
      if (newLog.length > 10) {
        return newLog.slice(newLog.length - 10);
      }
      return newLog;
    });
  };

  // Handle card selection
  const handleCardSelect = (card: CardType, index: number) => {
    // Create a unique ID using both card.id and index to avoid duplicate highlights
    const uniqueCardId = `${card.id}-${index}`;

    // Toggle selection
    setSelectedCardId(uniqueCardId === selectedCardId ? null : uniqueCardId);

    // If the card doesn't need a target, play it immediately
    if (card.targetType === "self" && combatEngine) {
      combatEngine.playCard(card.id);
    }
  };

  // Handle monster part click
  const handleMonsterPartClick = (part: MonsterPart) => {
    // If a card is selected and it requires a target
    if (
      selectedCardId &&
      combatEngine &&
      gameState &&
      gameState.currentMonster
    ) {
      // Get the actual card from the unique ID
      const cardId = selectedCardId.split("-")[0];
      const card = gameState.playerHand.find((c) => c.id === cardId);

      if (card && (card.targetType === "single" || card.targetType === "all")) {
        // setSelectedTarget(part);

        // Find the position of the part
        const position = gameState.currentMonster.parts.findIndex(
          (p) => p.id === part.id,
        );

        // Play the card
        combatEngine.playCard(cardId, position);
      }
    }
  };

  // Handle player position click
  const handlePlayerPositionClick = (position: number) => {
    if (!combatEngine || !gameState) return;

    // If a movement card is selected
    if (selectedCardId) {
      const cardId = selectedCardId.split("-")[0];
      const card = gameState.playerHand.find((c) => c.id === cardId);

      if (card && card.targetType === "position") {
        combatEngine.playCard(cardId, position);
      }
    }
    // Otherwise, handle as a normal move
    else if (position !== gameState.playerPosition) {
      combatEngine.movePlayer(position);
    }
  };

  // Handle end turn button click
  const handleEndTurn = () => {
    if (combatEngine) {
      setIsPlayerTurn(false);
      combatEngine.endPlayerTurn();

      // Update status effects
      setStatusEffects((prev) =>
        prev
          .map((effect) => ({
            ...effect,
            turnsLeft: effect.turnsLeft - 1,
          }))
          .filter((effect) => effect.turnsLeft > 0),
      );
    }
  };

  // If game state isn't initialized yet, show loading
  if (!gameState || !combatEngine) {
    return <div>Loading battle...</div>;
  }

  return (
    <div className="combat-screen">
      <Stage
        width={width}
        height={height}
        options={{ backgroundColor: 0xf5f5f5 }}
      >
        {/* Monster */}
        <Monster
          monster={gameState.currentMonster!}
          currentAttack={gameState.currentMonsterAttack!}
          x={width / 2 - 150}
          y={60}
          width={300}
          height={120}
        />

        {/* Combat Grid - Updated for side-by-side layout */}
        <CombatGrid
          width={width}
          height={120}
          playerPosition={gameState.playerPosition}
          monsterParts={gameState.currentMonster?.parts || []}
          onPlayerPositionClick={handlePlayerPositionClick}
          onMonsterPartClick={handleMonsterPartClick}
          monsterAttack={gameState.currentMonsterAttack!}
          playerCanMove={isPlayerTurn && gameState.playerMovesThisTurn < 1}
        />

        {/* Player Info */}
        <Player
          health={gameState.playerHealth}
          maxHealth={gameState.playerMaxHealth}
          block={gameState.playerBlock}
          weapon={gameState.playerWeapon!}
          cardsPlayedThisTurn={gameState.cardsPlayedThisTurn}
          maxCardsPlayable={gameState.playerCardsAllowed}
          movesThisTurn={gameState.playerMovesThisTurn}
          effects={gameState.playerEffects}
          x={10}
          y={450}
          width={200}
        />

        {/* Status Effects */}
        {statusEffects.length > 0 && (
          <Container x={width - 200} y={400}>
            <Text
              text="Status Effects:"
              style={
                new PIXI.TextStyle({
                  fill: 0x333333,
                  fontSize: 14,
                  fontWeight: "bold",
                })
              }
            />

            {statusEffects.map((effect, index) => (
              <Container key={effect.id} y={20 + index * 25}>
                <Graphics
                  draw={(g) => {
                    g.clear();

                    // Different colors for different effect types
                    let color = 0x9c27b0; // Default purple
                    if (effect.name === "Poison") color = 0x8bc34a;
                    if (effect.name === "Bleeding") color = 0xf44336;
                    if (effect.name === "Burning") color = 0xff9800;

                    g.lineStyle(1, color);
                    g.beginFill(color, 0.2);
                    g.drawRoundedRect(0, 0, 180, 20, 5);
                    g.endFill();
                  }}
                />
                <Text
                  text={`${effect.name} (${effect.turnsLeft} turns)`}
                  x={10}
                  y={10}
                  anchor={[0, 0.5]}
                  style={
                    new PIXI.TextStyle({
                      fill: 0x333333,
                      fontSize: 12,
                    })
                  }
                />
              </Container>
            ))}
          </Container>
        )}

        {/* Hand - Improved to handle duplicate cards */}
        <Hand
          cards={gameState.playerHand}
          x={width / 2 - 350}
          y={500}
          width={700}
          onCardClick={handleCardSelect}
          selectedCardId={selectedCardId}
          cardsPlayable={isPlayerTurn}
          maxCardsPlayable={gameState.playerCardsAllowed}
          cardsPlayedThisTurn={gameState.cardsPlayedThisTurn}
        />

        {/* End Turn Button */}
        <Container
          x={width - 80}
          y={475}
          eventMode="static"
          cursor="pointer"
          pointerdown={handleEndTurn}
        >
          <Graphics
            draw={(g) => {
              g.clear();
              g.lineStyle(2, 0x333333);
              g.beginFill(isPlayerTurn ? 0x4caf50 : 0xbdbdbd);
              g.drawRoundedRect(0, 0, 70, 40, 5);
              g.endFill();
            }}
          />
          <Text
            text="End Turn"
            anchor={0.5}
            x={35}
            y={20}
            style={
              new PIXI.TextStyle({
                fill: 0xffffff,
                fontSize: 14,
                fontWeight: "bold",
              })
            }
          />
        </Container>

        {/* Game Message */}
        {gameMessage && (
          <Container x={width / 2 - 150} y={height - 50}>
            <Graphics
              draw={(g) => {
                g.clear();
                g.lineStyle(2, 0x333333);
                g.beginFill(0xffffff, 0.9);
                g.drawRoundedRect(0, 0, 300, 100, 10);
                g.endFill();
              }}
            />
            <Text
              text={gameMessage}
              anchor={[0.5, 0.5]}
              x={150}
              y={50}
              style={
                new PIXI.TextStyle({
                  fill: 0x333333,
                  fontSize: 16,
                  fontWeight: "bold",
                  wordWrap: true,
                  wordWrapWidth: 280,
                  align: "center",
                })
              }
            />
          </Container>
        )}

        {/* Combat Log */}
        <Container x={width - 210} y={50}>
          <Graphics
            draw={(g) => {
              g.clear();
              g.lineStyle(1, 0xbdbdbd);
              g.beginFill(0xffffff, 0.7);
              g.drawRoundedRect(0, 0, 200, 175, 5);
              g.endFill();
            }}
          />
          <Text
            text="Combat Log"
            x={10}
            y={5}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 12,
                fontWeight: "bold",
              })
            }
          />
          {combatLog.map((message, index) => (
            <Text
              key={`log-${index}`}
              text={message}
              x={10}
              y={20 + index * 15}
              style={
                new PIXI.TextStyle({
                  fill: 0x333333,
                  fontSize: 10,
                })
              }
            />
          ))}
        </Container>
      </Stage>
    </div>
  );
};

export default CombatScreen;
