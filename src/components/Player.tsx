// src/components/Player.tsx
import React from "react";
import { Container, Graphics, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import { PlayerComponentProps } from "../types";

const Player: React.FC<PlayerComponentProps> = ({
  health,
  maxHealth,
  block,
  weapon,
  cardsPlayedThisTurn,
  maxCardsPlayable,
  movesThisTurn,
  maxMovesPerTurn = 1,
  effects = [],
  x,
  y,
  width,
}) => {
  // Calculate health percentage
  const healthPercentage = (health / maxHealth) * 100;

  // Get health bar color based on percentage
  const getHealthBarColor = (percentage: number): number => {
    if (percentage > 50) return 0x4caf50; // Green
    if (percentage > 25) return 0xffc107; // Yellow
    return 0xf44336; // Red
  };

  // Get weapon name
  const getWeaponName = (): string => {
    switch (weapon) {
      case "sword_and_shield":
        return "Sword & Shield";
      case "greatsword":
        return "Greatsword";
      case "bow":
        return "Bow";
      default:
        return "Unknown Weapon";
    }
  };

  return (
    <Container x={x} y={y}>
      {/* Player Health and Block */}
      <Container>
        {/* Health Bar Background */}
        <Graphics
          draw={(g) => {
            g.clear();
            g.beginFill(0xe0e0e0);
            g.drawRoundedRect(0, 0, width, 15, 5);
            g.endFill();
          }}
        />

        {/* Health Bar Fill */}
        <Graphics
          draw={(g) => {
            g.clear();
            const barWidth = (width * healthPercentage) / 100;

            g.beginFill(getHealthBarColor(healthPercentage));
            g.drawRoundedRect(0, 0, barWidth, 15, 5);
            g.endFill();
          }}
        />

        {/* Health Text */}
        <Text
          text={`${health}/${maxHealth} HP`}
          anchor={[0.5, 0.5]}
          x={width / 2}
          y={7.5}
          style={
            new PIXI.TextStyle({
              fill: 0x333333,
              fontSize: 12,
              fontWeight: "bold",
            })
          }
        />
      </Container>

      {/* Weapon and Block */}
      <Container y={20}>
        <Container>
          {/* Weapon Icon */}
          <Graphics
            draw={(g) => {
              g.clear();
              g.lineStyle(2, 0x333333);
              g.beginFill(0xdcedc8);
              g.drawCircle(15, 15, 15);
              g.endFill();

              // Draw different icons based on weapon type
              g.lineStyle(2, 0x333333);
              switch (weapon) {
                case "sword_and_shield":
                  // Sword
                  g.moveTo(10, 5);
                  g.lineTo(20, 25);
                  // Shield
                  g.drawRoundedRect(5, 10, 10, 10, 2);
                  break;

                case "greatsword":
                  // Great Sword
                  g.moveTo(5, 5);
                  g.lineTo(15, 25);
                  g.lineTo(25, 5);
                  g.lineTo(5, 5);
                  break;

                case "bow":
                  // Bow
                  g.drawCircle(15, 15, 10);
                  g.moveTo(15, 5);
                  g.lineTo(15, 25);
                  break;
              }
            }}
          />

          {/* Weapon Name */}
          <Text
            text={getWeaponName()}
            x={40}
            y={15}
            anchor={[0, 0.5]}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 14,
                fontWeight: "bold",
              })
            }
          />
        </Container>

        {/* Block Value */}
        {block > 0 && (
          <Container x={width - 40}>
            <Graphics
              draw={(g) => {
                g.clear();
                g.beginFill(0x90caf9);
                g.drawCircle(15, 15, 15);
                g.endFill();

                // Shield icon
                g.lineStyle(2, 0x1976d2);
                g.drawRoundedRect(7.5, 7.5, 15, 15, 3);
              }}
            />
            <Text
              text={block.toString()}
              anchor={0.5}
              x={15}
              y={15}
              style={
                new PIXI.TextStyle({
                  fill: 0x1976d2,
                  fontWeight: "bold",
                  fontSize: 14,
                })
              }
            />
          </Container>
        )}
      </Container>

      {/* Card and Move Counter */}
      <Container y={60}>
        {/* Card Counter */}
        <Container>
          <Text
            text="Cards:"
            x={0}
            y={0}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 12,
              })
            }
          />

          <Container x={50}>
            {[...Array(maxCardsPlayable)].map((_, i) => (
              <Graphics
                key={`card-counter-${i}`}
                x={i * 25}
                draw={(g) => {
                  g.clear();
                  g.lineStyle(2, 0x333333);
                  g.beginFill(i < cardsPlayedThisTurn ? 0xbdbdbd : 0xffffff);
                  g.drawRoundedRect(0, 0, 20, 20, 3);
                  g.endFill();
                }}
              />
            ))}
          </Container>
        </Container>

        {/* Move Counter */}
        <Container y={30}>
          <Text
            text="Moves:"
            x={0}
            y={0}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 12,
              })
            }
          />

          <Container x={50}>
            {[...Array(maxMovesPerTurn)].map((_, i) => (
              <Graphics
                key={`move-counter-${i}`}
                x={i * 25}
                draw={(g) => {
                  g.clear();
                  g.lineStyle(2, 0x333333);
                  g.beginFill(i < movesThisTurn ? 0xbdbdbd : 0xffffff);
                  g.drawCircle(10, 10, 10);
                  g.endFill();
                }}
              />
            ))}
          </Container>
        </Container>
      </Container>

      {/* Effects */}
      {effects.length > 0 && (
        <Container y={120}>
          <Text
            text="Effects:"
            x={0}
            y={0}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 12,
                fontWeight: "bold",
              })
            }
          />

          <Container y={20}>
            {effects.map((effect, index) => (
              <Container key={`effect-${index}`} x={index * 60}>
                <Graphics
                  draw={(g) => {
                    g.clear();

                    // Different colors for different effect types
                    let color;
                    switch (effect.type) {
                      case "buff":
                        color = 0x4caf50;
                        break;
                      case "debuff":
                        color = 0xf44336;
                        break;
                      default:
                        color = 0xffc107;
                    }

                    g.beginFill(color, 0.2);
                    g.lineStyle(2, color);
                    g.drawRoundedRect(0, 0, 50, 25, 5);
                    g.endFill();
                  }}
                />
                <Text
                  text={effect.type}
                  anchor={[0.5, 0]}
                  x={25}
                  y={2}
                  style={
                    new PIXI.TextStyle({
                      fill: 0x333333,
                      fontSize: 10,
                      fontWeight: "bold",
                    })
                  }
                />
                <Text
                  text={`${effect.value || ""} (${effect.duration})`}
                  anchor={[0.5, 0]}
                  x={25}
                  y={14}
                  style={
                    new PIXI.TextStyle({
                      fill: 0x333333,
                      fontSize: 8,
                    })
                  }
                />
              </Container>
            ))}
          </Container>
        </Container>
      )}
    </Container>
  );
};

export default Player;
