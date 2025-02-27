// src/components/Monster.tsx
import React from "react";
import { Container, Graphics, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import { MonsterComponentProps } from "../types";

const Monster: React.FC<MonsterComponentProps> = ({
  monster,
  x,
  y,
  width,
  height,
  currentAttack,
}) => {
  // Calculate health percentage
  const calculateHealthPercentage = (): number => {
    if (!monster) return 0;

    // Calculate total initial health
    const initialHealth = monster.parts.reduce(
      (total, part) => total + part.health,
      0,
    );

    // Calculate current health percentage
    return (monster.totalHealth / initialHealth) * 100;
  };

  // Get health bar color based on percentage
  const getHealthBarColor = (percentage: number): number => {
    if (percentage > 50) return 0x4caf50; // Green
    if (percentage > 25) return 0xffc107; // Yellow
    return 0xf44336; // Red
  };

  if (!monster) return null;

  return (
    <Container x={x} y={y}>
      {/* Monster Name and Health */}
      <Container y={-40}>
        {/* Monster Name */}
        <Text
          text={monster.name}
          anchor={[0.5, 0]}
          x={width / 2}
          style={
            new PIXI.TextStyle({
              fill: 0x333333,
              fontSize: 20,
              fontWeight: "bold",
            })
          }
        />

        {/* Health Bar Background */}
        <Graphics
          draw={(g) => {
            g.clear();
            g.beginFill(0xe0e0e0);
            g.drawRoundedRect(0, 25, width, 10, 5);
            g.endFill();
          }}
        />

        {/* Health Bar Fill */}
        <Graphics
          draw={(g) => {
            g.clear();
            const healthPercentage = calculateHealthPercentage();
            const barWidth = (width * healthPercentage) / 100;

            g.beginFill(getHealthBarColor(healthPercentage));
            g.drawRoundedRect(0, 25, barWidth, 10, 5);
            g.endFill();
          }}
        />

        {/* Health Text */}
        <Text
          text={`${monster.totalHealth} HP`}
          anchor={[0.5, 0]}
          x={width / 2}
          y={25}
          style={
            new PIXI.TextStyle({
              fill: 0x333333,
              fontSize: 10,
              fontWeight: "bold",
            })
          }
        />
      </Container>

      {/* Monster Body */}
      <Container>
        <Graphics
          draw={(g) => {
            g.clear();

            // Draw monster body (placeholder)
            g.lineStyle(2, 0x333333);
            g.beginFill(0xaed581);

            // Different shapes for different monster types
            switch (monster.id) {
              case "great_jagras":
                // Rounded rectangle body
                g.drawRoundedRect(
                  width * 0.2,
                  height * 0.2,
                  width * 0.6,
                  height * 0.6,
                  20,
                );

                // Head
                g.drawCircle(width * 0.3, height * 0.3, 15);

                // Tail
                g.moveTo(width * 0.8, height * 0.5);
                g.lineTo(width * 0.9, height * 0.6);
                break;

              case "kulu_ya_ku":
                // Bird-like body
                g.drawEllipse(
                  width * 0.5,
                  height * 0.5,
                  width * 0.3,
                  height * 0.25,
                );

                // Head and beak
                g.drawCircle(width * 0.3, height * 0.4, 20);
                g.moveTo(width * 0.25, height * 0.4);
                g.lineTo(width * 0.15, height * 0.45);

                // Legs
                g.moveTo(width * 0.4, height * 0.75);
                g.lineTo(width * 0.35, height * 0.9);
                g.moveTo(width * 0.6, height * 0.75);
                g.lineTo(width * 0.65, height * 0.9);
                break;

              case "pukei_pukei":
                // Chameleon-like body
                g.drawEllipse(
                  width * 0.5,
                  height * 0.5,
                  width * 0.4,
                  height * 0.2,
                );

                // Head
                g.drawCircle(width * 0.3, height * 0.4, 18);

                // Tail
                g.moveTo(width * 0.9, height * 0.5);
                g.bezierCurveTo(
                  width * 0.95,
                  height * 0.4,
                  width * 1.0,
                  height * 0.6,
                  width * 0.9,
                  height * 0.7,
                );
                break;

              default:
                // Generic monster shape
                g.drawRect(
                  width * 0.25,
                  height * 0.25,
                  width * 0.5,
                  height * 0.5,
                );
            }

            g.endFill();
          }}
        />
      </Container>

      {/* Current Attack Indicator */}
      {currentAttack && (
        <Container y={height + 20}>
          <Text
            text="Next Attack:"
            anchor={[0.5, 0]}
            x={width / 2}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 14,
                fontWeight: "bold",
              })
            }
          />

          <Text
            text={currentAttack.name}
            anchor={[0.5, 0]}
            x={width / 2}
            y={20}
            style={
              new PIXI.TextStyle({
                fill: 0xe57373,
                fontSize: 16,
                fontWeight: "bold",
              })
            }
          />

          <Text
            text={currentAttack.description}
            anchor={[0.5, 0]}
            x={width / 2}
            y={40}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 12,
                wordWrap: true,
                wordWrapWidth: width,
                align: "center",
              })
            }
          />

          {/* Attack Type Icon */}
          <Container x={width / 2 - 80} y={30}>
            <Graphics
              draw={(g) => {
                g.clear();
                g.beginFill(0xffecb3);
                g.drawCircle(0, 0, 15);
                g.endFill();

                g.lineStyle(2, 0xff9800);

                // Draw different icons based on attack type
                switch (currentAttack.type) {
                  case "basic":
                    g.moveTo(-8, -8);
                    g.lineTo(8, 8);
                    g.moveTo(-8, 8);
                    g.lineTo(8, -8);
                    break;

                  case "sweep":
                    g.arc(0, 0, 8, 0, Math.PI * 1.5);
                    g.moveTo(8, 0);
                    g.lineTo(12, -4);
                    g.moveTo(8, 0);
                    g.lineTo(12, 4);
                    break;

                  case "heavy":
                    g.moveTo(0, -10);
                    g.lineTo(0, 10);
                    g.moveTo(-8, -5);
                    g.lineTo(8, -5);
                    break;

                  case "charge":
                    g.moveTo(-8, 0);
                    g.lineTo(8, 0);
                    g.moveTo(4, -4);
                    g.lineTo(8, 0);
                    g.lineTo(4, 4);
                    break;

                  case "reposition":
                    g.moveTo(-8, -8);
                    g.lineTo(8, 8);
                    g.moveTo(-8, 8);
                    g.lineTo(8, -8);
                    g.drawCircle(0, 0, 5);
                    break;
                }
              }}
            />
          </Container>

          {/* Damage Indicator */}
          {currentAttack.damage > 0 && (
            <Container x={width / 2 + 80} y={30}>
              <Graphics
                draw={(g) => {
                  g.clear();
                  g.beginFill(0xffcdd2);
                  g.drawCircle(0, 0, 15);
                  g.endFill();
                }}
              />
              <Text
                text={currentAttack.damage.toString()}
                anchor={0.5}
                style={
                  new PIXI.TextStyle({
                    fill: 0xe57373,
                    fontWeight: "bold",
                    fontSize: 14,
                  })
                }
              />
            </Container>
          )}
        </Container>
      )}
    </Container>
  );
};

export default Monster;
