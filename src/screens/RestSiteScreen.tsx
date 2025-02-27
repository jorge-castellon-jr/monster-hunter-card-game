// src/screens/RestSiteScreen.tsx
import React, { useState, useEffect } from "react";
import { Stage, Container, Graphics, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import { restSiteSystem } from "../game/ShopSystem";
import playerProgress, { RunData } from "../game/PlayerProgress";
import { Card } from "../types";

interface RestSiteScreenProps {
  onComplete: () => void;
}

const RestSiteScreen: React.FC<RestSiteScreenProps> = ({ onComplete }) => {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);
  const [currentRun, setCurrentRun] = useState<RunData | null>(null);
  const [message, setMessage] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [cardsToShow, setCardsToShow] = useState<Card[]>([]);

  // Set up component
  useEffect(() => {
    const handleResize = () => {
      setWidth(Math.min(800, window.innerWidth - 40));
      setHeight(800);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Load current run data
    const runData = playerProgress.getCurrentRun();
    setCurrentRun(runData);

    // Auto-heal (30% of max health)
    if (runData) {
      restSiteSystem.healAtRestSite(0.3);
      setMessage(`You rested and recovered 30% of your health.`);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Actions the player can take at a rest site
  const restActions = [
    {
      id: "full_heal",
      name: "Full Heal",
      description: "Spend 50 gold to fully restore your health",
      action: () => {
        if (currentRun && currentRun.gold >= 50) {
          const success = restSiteSystem.fullHealAtRestSite(50);
          if (success) {
            setMessage("You spent 50 gold to fully restore your health.");
            setCurrentRun(playerProgress.getCurrentRun());
          } else {
            setMessage("Not enough gold!");
          }
        } else {
          setMessage("Not enough gold!");
        }
      },
    },
    {
      id: "upgrade_card",
      name: "Upgrade Card",
      description: "Upgrade a random card in your deck",
      action: () => {
        const upgradedCard = restSiteSystem.upgradeRandomCard();
        if (upgradedCard) {
          setMessage(`Successfully upgraded: ${upgradedCard}`);
          setCurrentRun(playerProgress.getCurrentRun());
        } else {
          setMessage("No cards available to upgrade.");
        }
      },
    },
    {
      id: "remove_card",
      name: "Remove Card",
      description: "Choose a card to remove from your deck",
      action: () => {
        if (currentRun) {
          setCardsToShow(currentRun.deck);
          setMessage("Select a card to remove from your deck:");
        }
      },
    },
    {
      id: "continue",
      name: "Continue Journey",
      description: "Leave the rest site and continue your hunt",
      action: () => {
        onComplete();
      },
    },
  ];

  // Handle card selection for removal
  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
  };

  // Handle card removal confirmation
  const handleRemoveCard = () => {
    if (selectedCard) {
      const success = restSiteSystem.removeCardFromDeck(selectedCard.id);
      if (success) {
        setMessage(`Removed ${selectedCard.name} from your deck.`);
        setSelectedCard(null);
        setCardsToShow([]);
        setCurrentRun(playerProgress.getCurrentRun());
      } else {
        setMessage("Failed to remove card.");
      }
    }
  };

  // Handle cancel card removal
  const handleCancelRemove = () => {
    setSelectedCard(null);
    setCardsToShow([]);
    setMessage("");
  };

  if (!currentRun) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rest-site-screen">
      <Stage
        width={width}
        height={height}
        options={{ backgroundColor: 0xf5f5f5 }}
      >
        {/* Title */}
        <Text
          text="Rest Site"
          x={width / 2}
          y={20}
          anchor={[0.5, 0]}
          style={
            new PIXI.TextStyle({
              fill: 0x333333,
              fontSize: 24,
              fontWeight: "bold",
            })
          }
        />

        {/* Player Stats */}
        <Container x={20} y={60}>
          {/* Health Bar Background */}
          <Graphics
            draw={(g) => {
              g.clear();
              g.beginFill(0xe0e0e0);
              g.drawRoundedRect(0, 0, 300, 15, 5);
              g.endFill();
            }}
          />

          {/* Health Bar Fill */}
          <Graphics
            draw={(g) => {
              g.clear();
              const healthPercentage =
                (currentRun.currentHealth / currentRun.maxHealth) * 100;
              const barWidth = (300 * healthPercentage) / 100;

              // Choose color based on health percentage
              let color = 0x4caf50; // Green
              if (healthPercentage < 25)
                color = 0xf44336; // Red
              else if (healthPercentage < 50) color = 0xffc107; // Yellow

              g.beginFill(color);
              g.drawRoundedRect(0, 0, barWidth, 15, 5);
              g.endFill();
            }}
          />

          {/* Health Text */}
          <Text
            text={`Health: ${currentRun.currentHealth}/${currentRun.maxHealth}`}
            x={320}
            y={0}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 14,
              })
            }
          />

          {/* Gold */}
          <Text
            text={`Gold: ${currentRun.gold}`}
            x={320}
            y={20}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 14,
              })
            }
          />

          {/* Deck Size */}
          <Text
            text={`Deck Size: ${currentRun.deck.length} cards`}
            x={320}
            y={40}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 14,
              })
            }
          />
        </Container>

        {/* Campfire Image (placeholder) */}
        <Container x={width / 2} y={150}>
          <Graphics
            draw={(g) => {
              g.clear();
              // Draw campfire
              g.lineStyle(0);

              // Fire logs
              g.beginFill(0x8b4513);
              g.drawRect(-40, 20, 80, 10);
              g.drawRect(-35, 10, 70, 10);
              g.drawRect(-30, 0, 60, 10);
              g.endFill();

              // Fire flames
              g.beginFill(0xff9800);
              g.drawEllipse(0, -10, 30, 40);
              g.endFill();

              g.beginFill(0xff5722);
              g.drawEllipse(0, -5, 20, 30);
              g.endFill();

              g.beginFill(0xffeb3b);
              g.drawEllipse(0, -15, 15, 25);
              g.endFill();
            }}
          />
        </Container>

        {/* Messages */}
        {message && (
          <Container x={width / 2 - 200} y={230}>
            <Graphics
              draw={(g) => {
                g.clear();
                g.lineStyle(1, 0xbdbdbd);
                g.beginFill(0xffffff, 0.8);
                g.drawRoundedRect(0, 0, 400, 50, 5);
                g.endFill();
              }}
            />
            <Text
              text={message}
              x={200}
              y={25}
              anchor={[0.5, 0.5]}
              style={
                new PIXI.TextStyle({
                  fill: 0x333333,
                  fontSize: 14,
                  align: "center",
                  wordWrap: true,
                  wordWrapWidth: 380,
                })
              }
            />
          </Container>
        )}

        {/* Rest Actions */}
        <Container y={300}>
          {restActions.map((action, index) => (
            <Container
              key={action.id}
              x={width / 2 - 150}
              y={index * 60}
              eventMode="static"
              cursor="pointer"
              pointerdown={() => {
                setSelectedAction(action.id);
                action.action();
              }}
            >
              <Graphics
                draw={(g) => {
                  g.clear();

                  // Disable style for options that require gold but player doesn't have enough
                  const disabled =
                    action.id === "full_heal" && currentRun.gold < 50;

                  g.lineStyle(2, disabled ? 0xbdbdbd : 0x333333);
                  g.beginFill(
                    disabled
                      ? 0xe0e0e0
                      : selectedAction === action.id
                        ? 0xdcedc8
                        : 0xffffff,
                  );
                  g.drawRoundedRect(0, 0, 300, 50, 5);
                  g.endFill();
                }}
              />
              <Text
                text={action.name}
                x={10}
                y={10}
                style={
                  new PIXI.TextStyle({
                    fill: 0x333333,
                    fontSize: 16,
                    fontWeight: "bold",
                  })
                }
              />
              <Text
                text={action.description}
                x={10}
                y={30}
                style={
                  new PIXI.TextStyle({
                    fill: 0x666666,
                    fontSize: 12,
                  })
                }
              />
            </Container>
          ))}
        </Container>

        {/* Card Selection for removal */}
        {cardsToShow.length > 0 && (
          <Container>
            {/* Darkened Background */}
            <Graphics
              draw={(g) => {
                g.clear();
                g.beginFill(0x000000, 0.7);
                g.drawRect(0, 0, width, height);
                g.endFill();
              }}
            />

            {/* Card Grid */}
            <Container x={width / 2 - 300} y={100}>
              {cardsToShow.map((card, index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;

                return (
                  <Container
                    key={`${card.id}-${index}`}
                    x={col * 200}
                    y={row * 150}
                    eventMode="static"
                    cursor="pointer"
                    pointerdown={() => handleCardSelect(card)}
                  >
                    <Graphics
                      draw={(g) => {
                        g.clear();

                        // Card background
                        const isSelected =
                          selectedCard && selectedCard.id === card.id;
                        g.lineStyle(2, isSelected ? 0xffffff : 0x333333);

                        // Different colors for different card types
                        let bgColor;
                        switch (card.type) {
                          case "attack":
                            bgColor = 0xffcdd2;
                            break;
                          case "defense":
                            bgColor = 0xbbdefb;
                            break;
                          case "movement":
                            bgColor = 0xc8e6c9;
                            break;
                          case "special":
                            bgColor = 0xffe0b2;
                            break;
                          default:
                            bgColor = 0xffffff;
                        }

                        g.beginFill(bgColor);
                        g.drawRoundedRect(0, 0, 180, 120, 8);
                        g.endFill();

                        // Selection highlight
                        if (isSelected) {
                          g.lineStyle(3, 0xffd700);
                          g.drawRoundedRect(-3, -3, 186, 126, 10);
                        }
                      }}
                    />

                    {/* Card Name */}
                    <Text
                      text={card.name}
                      x={90}
                      y={15}
                      anchor={[0.5, 0]}
                      style={
                        new PIXI.TextStyle({
                          fill: 0x333333,
                          fontSize: 16,
                          fontWeight: "bold",
                        })
                      }
                    />

                    {/* Card Description */}
                    <Text
                      text={card.description}
                      x={90}
                      y={40}
                      anchor={[0.5, 0]}
                      style={
                        new PIXI.TextStyle({
                          fill: 0x333333,
                          fontSize: 11,
                          wordWrap: true,
                          wordWrapWidth: 160,
                          align: "center",
                        })
                      }
                    />

                    {/* Card Stats */}
                    <Container x={5} y={90}>
                      {card.damage && (
                        <Text
                          text={`Damage: ${card.damage}`}
                          style={
                            new PIXI.TextStyle({
                              fill: 0xd32f2f,
                              fontSize: 12,
                            })
                          }
                        />
                      )}

                      {card.block && (
                        <Text
                          text={`Block: ${card.block}`}
                          x={card.damage ? 90 : 0}
                          style={
                            new PIXI.TextStyle({
                              fill: 0x1976d2,
                              fontSize: 12,
                            })
                          }
                        />
                      )}
                    </Container>
                  </Container>
                );
              })}
            </Container>

            {/* Action Buttons */}
            <Container x={width / 2 - 100} y={height - 80}>
              {/* Remove Button */}
              <Container
                x={0}
                y={0}
                eventMode="static"
                cursor="pointer"
                pointerdown={handleRemoveCard}
                alpha={selectedCard ? 1 : 0.5}
              >
                <Graphics
                  draw={(g) => {
                    g.clear();
                    g.lineStyle(2, 0xd32f2f);
                    g.beginFill(0xffcdd2);
                    g.drawRoundedRect(0, 0, 100, 40, 5);
                    g.endFill();
                  }}
                />
                <Text
                  text="Remove"
                  x={50}
                  y={20}
                  anchor={[0.5, 0.5]}
                  style={
                    new PIXI.TextStyle({
                      fill: 0xd32f2f,
                      fontSize: 14,
                      fontWeight: "bold",
                    })
                  }
                />
              </Container>

              {/* Cancel Button */}
              <Container
                x={120}
                y={0}
                eventMode="static"
                cursor="pointer"
                pointerdown={handleCancelRemove}
              >
                <Graphics
                  draw={(g) => {
                    g.clear();
                    g.lineStyle(2, 0x333333);
                    g.beginFill(0xffffff);
                    g.drawRoundedRect(0, 0, 100, 40, 5);
                    g.endFill();
                  }}
                />
                <Text
                  text="Cancel"
                  x={50}
                  y={20}
                  anchor={[0.5, 0.5]}
                  style={
                    new PIXI.TextStyle({
                      fill: 0x333333,
                      fontSize: 14,
                      fontWeight: "bold",
                    })
                  }
                />
              </Container>
            </Container>
          </Container>
        )}
      </Stage>
    </div>
  );
};

export default RestSiteScreen;
