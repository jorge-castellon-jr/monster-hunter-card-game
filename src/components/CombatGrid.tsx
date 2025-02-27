// src/components/CombatGrid.tsx
import React from "react";
import { Container, Graphics, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import { CombatGridProps, MonsterPart } from "../types";

const CombatGrid: React.FC<CombatGridProps> = ({
  width,
  height,
  playerPosition,
  monsterParts,
  onPlayerPositionClick,
  onMonsterPartClick,
  monsterAttack,
  playerCanMove = true,
}) => {
  // Change to horizontal layout
  const cellWidth = width / 6; // Split into 6 columns
  const cellHeight = height; // Use full height

  // Draw grid cell
  const drawCell = (
    g: PIXI.Graphics,
    isTarget: boolean,
    isPlayerPosition: boolean,
    isBreakable: boolean,
  ) => {
    g.clear();

    // Draw cell background
    const bgColor = isTarget
      ? 0xffcdd2
      : isPlayerPosition
        ? 0xe3f2fd
        : 0xeeeeee;
    g.beginFill(bgColor);
    g.drawRect(0, 0, cellWidth, cellHeight);
    g.endFill();

    // Draw cell border
    const borderColor = isTarget
      ? 0xe57373
      : isPlayerPosition
        ? 0x64b5f6
        : 0xbdbdbd;
    g.lineStyle(2, borderColor);
    g.drawRect(0, 0, cellWidth, cellHeight);

    // Draw breakable indicator
    if (isBreakable) {
      g.lineStyle(2, 0xffb74d);
      g.moveTo(5, 5);
      g.lineTo(cellWidth - 5, 5);
      g.lineTo(cellWidth - 5, cellHeight - 5);
      g.lineTo(5, cellHeight - 5);
      g.lineTo(5, 5);
    }
  };

  // Handle player position click
  const handlePlayerPositionClick = (position: number) => {
    if (playerCanMove && onPlayerPositionClick) {
      onPlayerPositionClick(position);
    }
  };

  // Handle monster part click
  const handleMonsterPartClick = (part: MonsterPart) => {
    if (onMonsterPartClick) {
      onMonsterPartClick(part);
    }
  };

  // Check if a position is targeted by the monster
  const isTargetedPosition = (position: number): boolean => {
    return !!monsterAttack && monsterAttack.targetPositions.includes(position);
  };

  return (
    <Container>
      {/* Player Positions (Left Side) */}
      {[0, 1, 2].map((position) => (
        <Container
          key={`player-${position}`}
          x={position * cellWidth}
          y={275}
          eventMode="static"
          cursor={playerCanMove ? "pointer" : "default"}
          pointerdown={() => handlePlayerPositionClick(position)}
        >
          <Graphics
            draw={(g) =>
              drawCell(
                g,
                isTargetedPosition(position),
                playerPosition === position,
                false,
              )
            }
          />

          {/* Position Label */}
          <Text
            text={`Position ${position + 1}`}
            anchor={[0.5, 0]}
            x={cellWidth / 2}
            y={10}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 12,
              })
            }
          />

          {/* Player Indicator */}
          {playerPosition === position && (
            <Container x={cellWidth / 2} y={cellHeight / 2}>
              <Graphics
                draw={(g) => {
                  g.clear();
                  g.beginFill(0x2196f3);
                  g.drawCircle(0, 0, 20);
                  g.endFill();

                  // Draw player icon
                  g.lineStyle(3, 0xffffff);
                  g.drawCircle(0, -5, 8); // Head
                  g.moveTo(0, 3);
                  g.lineTo(0, 15); // Body
                  g.moveTo(-10, 8);
                  g.lineTo(10, 8); // Arms
                }}
              />
            </Container>
          )}

          {/* Target Indicator */}
          {isTargetedPosition(position) && (
            <Container x={cellWidth / 2} y={cellHeight - 25}>
              <Graphics
                draw={(g) => {
                  g.clear();
                  g.lineStyle(2, 0xe57373);
                  g.beginFill(0xffcdd2, 0.5);

                  // Create star shape for target indicator
                  const numPoints = 5;
                  const outerRadius = 10;
                  const innerRadius = 5;

                  for (let i = 0; i < numPoints * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i * Math.PI) / numPoints;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    if (i === 0) {
                      g.moveTo(x, y);
                    } else {
                      g.lineTo(x, y);
                    }
                  }

                  g.closePath();
                  g.endFill();
                }}
              />
              <Text
                text="TARGET"
                anchor={[0.5, 0]}
                y={15}
                style={
                  new PIXI.TextStyle({
                    fill: 0xe57373,
                    fontSize: 10,
                    fontWeight: "bold",
                  })
                }
              />
            </Container>
          )}
        </Container>
      ))}

      {/* Monster Positions (Right Side) */}
      {monsterParts &&
        monsterParts.map((part, index) => (
          <Container
            key={`monster-${index}`}
            x={(index + 3) * cellWidth} // Start after player positions
            y={275}
            eventMode="static"
            cursor="pointer"
            pointerdown={() => handleMonsterPartClick(part)}
          >
            <Graphics
              draw={(g) =>
                drawCell(g, false, false, !part.broken && part.health > 0)
              }
            />

            {/* Part Name */}
            <Text
              text={part.name}
              anchor={[0.5, 0]}
              x={cellWidth / 2}
              y={10}
              style={
                new PIXI.TextStyle({
                  fill: 0x333333,
                  fontSize: 14,
                  fontWeight: "bold",
                })
              }
            />

            {/* Part Health */}
            <Text
              text={`HP: ${part.health}`}
              anchor={[0.5, 0]}
              x={cellWidth / 2}
              y={30}
              style={
                new PIXI.TextStyle({
                  fill: part.broken ? 0xe57373 : 0x333333,
                  fontSize: 12,
                })
              }
            />

            {/* Broken Status */}
            {part.broken && (
              <Text
                text="BROKEN"
                anchor={[0.5, 0]}
                x={cellWidth / 2}
                y={50}
                style={
                  new PIXI.TextStyle({
                    fill: 0xe57373,
                    fontSize: 14,
                    fontWeight: "bold",
                  })
                }
              />
            )}

            {/* Monster Part Icon */}
            <Container x={cellWidth / 2} y={cellHeight / 2 + 20}>
              <Graphics
                draw={(g) => {
                  g.clear();
                  g.lineStyle(2, 0x333333);

                  // Draw different icons based on part type
                  switch (part.id) {
                    case "head":
                      // Head icon
                      g.beginFill(0xaed581);
                      g.drawCircle(0, 0, 20);
                      g.endFill();

                      // Eyes
                      g.beginFill(0x333333);
                      g.drawCircle(-8, -5, 3);
                      g.drawCircle(8, -5, 3);
                      g.endFill();

                      // Mouth
                      g.lineStyle(2, 0x5d4037);
                      g.moveTo(-10, 5);
                      g.lineTo(10, 5);
                      break;

                    case "body":
                      // Body icon
                      g.beginFill(0xaed581);
                      g.drawEllipse(0, 0, 25, 15);
                      g.endFill();

                      // Pattern
                      g.lineStyle(1, 0x689f38);
                      g.moveTo(-15, -5);
                      g.lineTo(15, -5);
                      g.moveTo(-15, 0);
                      g.lineTo(15, 0);
                      g.moveTo(-15, 5);
                      g.lineTo(15, 5);
                      break;

                    case "tail":
                      // Tail icon
                      g.beginFill(0xaed581);
                      g.drawEllipse(0, 0, 25, 8);
                      g.endFill();

                      // Tail segments
                      g.lineStyle(2, 0x689f38);
                      g.moveTo(-20, 0);
                      g.lineTo(20, 0);
                      break;

                    case "wings":
                      // Wings icon
                      g.beginFill(0xaed581, 0.7);
                      g.moveTo(0, 0);
                      g.lineTo(-20, -15);
                      g.lineTo(-15, -5);
                      g.lineTo(-25, 0);
                      g.lineTo(-15, 5);
                      g.lineTo(-20, 15);
                      g.lineTo(0, 0);
                      g.lineTo(20, -15);
                      g.lineTo(15, -5);
                      g.lineTo(25, 0);
                      g.lineTo(15, 5);
                      g.lineTo(20, 15);
                      g.lineTo(0, 0);
                      g.endFill();
                      break;

                    case "legs":
                      // Legs icon
                      g.beginFill(0xaed581);
                      g.drawRect(-20, -8, 40, 16);
                      g.endFill();

                      // Leg segments
                      g.lineStyle(3, 0x689f38);
                      g.moveTo(-15, -15);
                      g.lineTo(-15, 15);
                      g.moveTo(15, -15);
                      g.lineTo(15, 15);
                      break;

                    default:
                      // Generic part icon
                      g.beginFill(0xaed581);
                      g.drawCircle(0, 0, 20);
                      g.endFill();
                  }
                }}
              />
            </Container>
          </Container>
        ))}
    </Container>
  );
};

export default CombatGrid;
