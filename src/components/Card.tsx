// src/components/Card.tsx
import React from "react";
import { Container, Graphics, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import { CardProps } from "../types";

const CARD_WIDTH = 120;
const CARD_HEIGHT = 160;

const Card: React.FC<CardProps> = ({
  card,
  x = 0,
  y = 0,
  onClick,
  isSelected = false,
  isPlayable = true,
  scale = 1,
}) => {
  const cardColors: Record<string, number> = {
    attack: 0xe57373, // Red
    defense: 0x64b5f6, // Blue
    movement: 0x81c784, // Green
    special: 0xffd54f, // Yellow
  };

  const borderColor = isSelected ? 0xffffff : 0x333333;
  const backgroundColor = isPlayable ? cardColors[card.type] : 0x9e9e9e;
  const textColor = isPlayable ? 0x000000 : 0x666666;

  const handleClick = () => {
    if (isPlayable && onClick) {
      onClick(card);
    }
  };

  const drawCard = React.useCallback(
    (g: PIXI.Graphics) => {
      // Clear graphics
      g.clear();

      // Draw card shadow
      g.beginFill(0x000000, 0.3);
      g.drawRoundedRect(3, 3, CARD_WIDTH, CARD_HEIGHT, 8);
      g.endFill();

      // Draw card background
      g.lineStyle(2, borderColor, 1);
      g.beginFill(backgroundColor);
      g.drawRoundedRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 8);
      g.endFill();

      // If card is selected, draw a highlight effect
      if (isSelected) {
        g.lineStyle(3, 0xffffff, 0.8);
        g.drawRoundedRect(-3, -3, CARD_WIDTH + 6, CARD_HEIGHT + 6, 10);
      }
    },
    [backgroundColor, borderColor, isSelected],
  );

  return (
    <Container
      x={x}
      y={y}
      interactive
      pointerdown={handleClick}
      scale={scale}
      cursor={isPlayable ? "pointer" : "default"}
    >
      <Graphics draw={drawCard} />

      {/* Card Name */}
      <Text
        text={card.name}
        anchor={0.5}
        x={CARD_WIDTH / 2}
        y={15}
        style={
          new PIXI.TextStyle({
            fill: textColor,
            fontWeight: "bold",
            fontSize: 14,
            align: "center",
          })
        }
      />

      {/* Card Description */}
      <Text
        text={card.description}
        anchor={[0.5, 0]}
        x={CARD_WIDTH / 2}
        y={30}
        style={
          new PIXI.TextStyle({
            fill: textColor,
            fontSize: 10,
            wordWrap: true,
            wordWrapWidth: CARD_WIDTH - 10,
            align: "center",
          })
        }
      />

      {/* Card Cost */}
      <Container x={10} y={10}>
        <Graphics
          draw={(g) => {
            g.clear();
            g.beginFill(0xffffff);
            g.drawCircle(0, 0, 12);
            g.endFill();
          }}
        />
        <Text
          text={card.cost.toString()}
          anchor={0.5}
          style={
            new PIXI.TextStyle({
              fill: 0x000000,
              fontWeight: "bold",
              fontSize: 14,
            })
          }
        />
      </Container>

      {/* Card Type Icon */}
      <Container x={CARD_WIDTH - 20} y={CARD_HEIGHT - 20}>
        <Graphics
          draw={(g) => {
            g.clear();
            g.beginFill(0xffffff);
            g.drawCircle(0, 0, 12);
            g.endFill();

            // Draw different icons based on card type
            g.lineStyle(2, 0x000000);
            switch (card.type) {
              case "attack":
                // Sword icon
                g.moveTo(-6, 6);
                g.lineTo(6, -6);
                g.moveTo(-6, -6);
                g.lineTo(6, 6);
                break;
              case "defense":
                // Shield icon
                g.drawRoundedRect(-6, -6, 12, 12, 2);
                break;
              case "movement":
                // Arrow icon
                g.moveTo(0, -6);
                g.lineTo(6, 0);
                g.lineTo(0, 6);
                g.moveTo(0, -6);
                g.lineTo(-6, 0);
                g.lineTo(0, 6);
                break;
              case "special":
                // Star icon
                for (let i = 0; i < 5; i++) {
                  const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                  const x = 6 * Math.cos(angle);
                  const y = 6 * Math.sin(angle);
                  if (i === 0) g.moveTo(x, y);
                  else g.lineTo(x, y);
                }
                g.closePath();
                break;
            }
          }}
        />
      </Container>

      {/* Optional Stats Display */}
      {card.damage && (
        <Container x={20} y={CARD_HEIGHT - 20}>
          <Graphics
            draw={(g) => {
              g.clear();
              g.beginFill(0xff0000);
              g.drawCircle(0, 0, 12);
              g.endFill();
            }}
          />
          <Text
            text={card.damage.toString()}
            anchor={0.5}
            style={
              new PIXI.TextStyle({
                fill: 0xffffff,
                fontWeight: "bold",
                fontSize: 12,
              })
            }
          />
        </Container>
      )}

      {card.block && (
        <Container x={card.damage ? 50 : 20} y={CARD_HEIGHT - 20}>
          <Graphics
            draw={(g) => {
              g.clear();
              g.beginFill(0x2196f3);
              g.drawCircle(0, 0, 12);
              g.endFill();
            }}
          />
          <Text
            text={card.block.toString()}
            anchor={0.5}
            style={
              new PIXI.TextStyle({
                fill: 0xffffff,
                fontWeight: "bold",
                fontSize: 12,
              })
            }
          />
        </Container>
      )}
    </Container>
  );
};

export default Card;
