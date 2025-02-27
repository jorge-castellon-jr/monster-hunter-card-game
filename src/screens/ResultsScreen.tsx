// src/screens/ResultsScreen.tsx
import React, { useState, useEffect } from "react";
import { Stage, Container, Graphics, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import playerProgress, { RunData } from "../game/PlayerProgress";
import { MONSTERS } from "../data/monsters";
import { ALL_MONSTERS } from "../data/monsters-expanded";

interface ResultsScreenProps {
  onComplete: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ onComplete }) => {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [completedRun, setCompletedRun] = useState<RunData | null>(null);
  const [materialsSummary, setMaterialsSummary] = useState<
    {
      name: string;
      parts: { name: string; quantity: number }[];
    }[]
  >([]);

  // Set up component
  useEffect(() => {
    const handleResize = () => {
      setWidth(Math.min(800, window.innerWidth - 40));
      setHeight(800);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Get player stats
    const playerStats = playerProgress.getPlayerStats();

    // Get the most recently completed run
    if (playerStats.completedRuns.length > 0) {
      const lastRun =
        playerStats.completedRuns[playerStats.completedRuns.length - 1];
      setCompletedRun(lastRun);

      // Generate materials summary
      const monstersDefeated = lastRun.monstersDefeated;
      const summary = monstersDefeated.map((monsterData) => {
        // Find monster info
        const monster = MONSTERS[monsterData.monsterId] ||
          ALL_MONSTERS[monsterData.monsterId] || { name: "Unknown Monster" };

        // Get part names
        const parts = monsterData.partsHarvested.map((part) => {
          // Find part name
          const monsterPart = monster.parts?.find((p) => p.id === part.partId);
          return {
            name: monsterPart?.name || part.partId,
            quantity: part.quantity,
          };
        });

        return {
          name: monster.name,
          parts,
        };
      });

      setMaterialsSummary(summary);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!completedRun) {
    return <div>No completed runs</div>;
  }

  return (
    <div className="results-screen">
      <Stage
        width={width}
        height={height}
        options={{ backgroundColor: 0xf5f5f5 }}
      >
        {/* Title */}
        <Text
          text="Victory!"
          x={width / 2}
          y={30}
          anchor={[0.5, 0]}
          style={
            new PIXI.TextStyle({
              fill: 0x4caf50,
              fontSize: 36,
              fontWeight: "bold",
            })
          }
        />

        <Text
          text="Hunt Complete"
          x={width / 2}
          y={80}
          anchor={[0.5, 0]}
          style={
            new PIXI.TextStyle({
              fill: 0x333333,
              fontSize: 24,
            })
          }
        />

        {/* Run Statistics */}
        <Container x={width / 2 - 300} y={130}>
          <Graphics
            draw={(g) => {
              g.clear();
              g.lineStyle(1, 0xbdbdbd);
              g.beginFill(0xffffff);
              g.drawRoundedRect(0, 0, 600, 100, 10);
              g.endFill();
            }}
          />

          {/* Run Stats */}
          <Container x={20} y={20}>
            <Text
              text="Run Statistics"
              style={
                new PIXI.TextStyle({
                  fill: 0x333333,
                  fontSize: 18,
                  fontWeight: "bold",
                })
              }
            />

            {/* Stats Grid */}
            <Container y={30}>
              {/* Monsters Defeated */}
              <Text
                text={`Monsters Defeated: ${completedRun.monstersDefeated.length}`}
                style={
                  new PIXI.TextStyle({
                    fill: 0x333333,
                    fontSize: 14,
                  })
                }
              />

              {/* Cards Upgraded */}
              <Text
                text={`Cards Upgraded: ${completedRun.cardsUpgraded.length}`}
                x={200}
                style={
                  new PIXI.TextStyle({
                    fill: 0x333333,
                    fontSize: 14,
                  })
                }
              />

              {/* Gold Earned */}
              <Text
                text={`Gold Earned: ${completedRun.gold}`}
                x={400}
                style={
                  new PIXI.TextStyle({
                    fill: 0x333333,
                    fontSize: 14,
                  })
                }
              />
            </Container>
          </Container>
        </Container>

        {/* Materials Collected */}
        <Container x={width / 2 - 300} y={250}>
          <Graphics
            draw={(g) => {
              g.clear();
              g.lineStyle(1, 0xbdbdbd);
              g.beginFill(0xffffff);
              g.drawRoundedRect(0, 0, 600, 250, 10);
              g.endFill();
            }}
          />

          <Text
            text="Materials Collected"
            x={20}
            y={20}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 18,
                fontWeight: "bold",
              })
            }
          />

          {/* Materials List */}
          <Container x={20} y={50}>
            {materialsSummary.map((monster, monsterIndex) => (
              <Container key={`monster-${monsterIndex}`} y={monsterIndex * 60}>
                <Text
                  text={monster.name}
                  style={
                    new PIXI.TextStyle({
                      fill: 0x333333,
                      fontSize: 16,
                      fontWeight: "bold",
                    })
                  }
                />

                <Container y={25}>
                  {monster.parts.map((part, partIndex) => (
                    <Container key={`part-${partIndex}`} x={partIndex * 150}>
                      <Graphics
                        draw={(g) => {
                          g.clear();
                          g.lineStyle(1, 0xbdbdbd);
                          g.beginFill(0xf5f5f5);
                          g.drawRoundedRect(0, 0, 140, 30, 5);
                          g.endFill();
                        }}
                      />
                      <Text
                        text={`${part.name} x${part.quantity}`}
                        x={10}
                        y={15}
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
              </Container>
            ))}
          </Container>
        </Container>

        {/* Continue Button */}
        <Container
          x={width / 2 - 75}
          y={520}
          eventMode="static"
          cursor="pointer"
          pointerdown={onComplete}
        >
          <Graphics
            draw={(g) => {
              g.clear();
              g.lineStyle(2, 0x333333);
              g.beginFill(0x4caf50);
              g.drawRoundedRect(0, 0, 150, 50, 10);
              g.endFill();
            }}
          />
          <Text
            text="Back to Title"
            x={75}
            y={25}
            anchor={0.5}
            style={
              new PIXI.TextStyle({
                fill: 0xffffff,
                fontSize: 16,
                fontWeight: "bold",
              })
            }
          />
        </Container>
      </Stage>
    </div>
  );
};

export default ResultsScreen;
