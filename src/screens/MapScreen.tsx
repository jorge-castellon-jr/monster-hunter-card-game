// src/screens/MapScreen.tsx
import React, { useState, useEffect } from "react";
import { Stage, Container, Graphics, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import { MONSTERS } from "../data/monsters";
import { ALL_MONSTERS } from "../data/monsters-expanded";
import { MapNode } from "../types";
import playerProgress from "../game/PlayerProgress";
import { MapGenerator } from "../game/MapGenerator";

interface UpdatedMapScreenProps {
  onNodeSelect: (nodeType: string) => void;
  selectedWeapon?: string;
}

const MapScreen: React.FC<UpdatedMapScreenProps> = ({ onNodeSelect }) => {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);

  // Map data
  const [map, setMap] = useState<{
    nodes: MapNode[];
    edges: { from: string; to: string }[];
    playerPosition: string;
  } | null>(null);

  // Set up window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWidth(Math.min(800, window.innerWidth - 40));
      setHeight(800);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Get current run data
    const currentRun = playerProgress.getCurrentRun();

    if (currentRun) {
      // Generate map if not already generated
      if (!map) {
        // Use map generator with a seed based on the run ID
        const generatedMap = new MapGenerator({
          seed: currentRun.id,
        }).generateMap();

        setMap({
          ...generatedMap,
          playerPosition: currentRun.currentNodeId,
        });
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  // Get available nodes (connected to current position)
  const getAvailableNodes = (): string[] => {
    if (!map) return [];

    return map.edges
      .filter((edge) => edge.from === map.playerPosition)
      .map((edge) => edge.to);
  };

  // Handle node click
  const handleNodeClick = (nodeId: string): void => {
    if (!map) return;

    const availableNodes = getAvailableNodes();

    if (availableNodes.includes(nodeId)) {
      // Find the node
      const node = map.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      // Move player to the selected node
      setMap((prevMap) =>
        prevMap
          ? {
            ...prevMap,
            playerPosition: nodeId,
          }
          : null,
      );

      // Update player progress
      playerProgress.moveToNode(nodeId);

      // Notify parent component of node type selection
      onNodeSelect(node.type);
    }
  };

  // Get node color based on type
  const getNodeColor = (type: string): number => {
    switch (type) {
      case "start":
        return 0x4caf50; // Green
      case "monster":
        return 0xf44336; // Red
      case "elite":
        return 0x9c27b0; // Purple
      case "boss":
        return 0xff9800; // Orange
      case "rest":
        return 0x2196f3; // Blue
      case "merchant":
        return 0xffd700; // Gold
      default:
        return 0x9e9e9e; // Grey
    }
  };

  // Get node icon based on type
  const drawNodeIcon = (g: PIXI.Graphics, type: string): void => {
    g.clear();

    switch (type) {
      case "start":
        // Camp icon
        g.moveTo(0, -10);
        g.lineTo(10, -20);
        g.lineTo(20, -10);
        g.lineTo(15, -10);
        g.lineTo(15, 0);
        g.lineTo(5, 0);
        g.lineTo(5, -10);
        g.lineTo(0, -10);
        break;
      case "monster":
        // Monster icon
        g.moveTo(0, -5);
        g.lineTo(5, 0);
        g.lineTo(15, 0);
        g.lineTo(20, -5);
        g.lineTo(15, -10);
        g.lineTo(15, -15);
        g.lineTo(5, -15);
        g.lineTo(5, -10);
        g.lineTo(0, -5);
        break;
      case "elite": {
        // Elite monster icon
        g.moveTo(0, -5);
        g.lineTo(20, -5);
        g.moveTo(10, -15);
        g.lineTo(10, 5);

        // Star shape for elite
        const numPoints = 5;
        const outerRadius = 5;
        const innerRadius = 2.5;
        const centerX = 10;
        const centerY = -10;

        for (let i = 0; i < numPoints * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / numPoints - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          if (i === 0) {
            g.moveTo(x, y);
          } else {
            g.lineTo(x, y);
          }
        }
        g.closePath();
        break;
      }
      case "boss": {
        // Boss icon - larger star
        const bossNumPoints = 5;
        const bossOuterRadius = 10;
        const bossInnerRadius = 5;
        const bossCenterX = 10;
        const bossCenterY = -10;

        for (let i = 0; i < bossNumPoints * 2; i++) {
          const radius = i % 2 === 0 ? bossOuterRadius : bossInnerRadius;
          const angle = (i * Math.PI) / bossNumPoints - Math.PI / 2;
          const x = bossCenterX + Math.cos(angle) * radius;
          const y = bossCenterY + Math.sin(angle) * radius;

          if (i === 0) {
            g.moveTo(x, y);
          } else {
            g.lineTo(x, y);
          }
        }
        g.closePath();
        break;
      }
      case "rest":
        // Rest icon
        g.drawCircle(10, -10, 10);
        g.moveTo(5, -10);
        g.lineTo(15, -10);
        g.moveTo(10, -15);
        g.lineTo(10, -5);
        break;
      case "merchant":
        // Merchant icon
        g.drawCircle(10, -10, 10);
        // Gold coin
        g.moveTo(5, -10);
        g.lineTo(15, -10);
        g.moveTo(10, -15);
        g.lineTo(10, -5);
        g.drawCircle(10, -10, 5);
        break;
    }
  };

  // Get node name
  const getNodeName = (node: MapNode): string => {
    switch (node.type) {
      case "start":
        return "Camp";
      case "monster":
      case "elite":
      case "boss":
        if (node.monsterId) {
          const monster =
            ALL_MONSTERS[node.monsterId.toUpperCase()] ||
            MONSTERS[node.monsterId.toUpperCase()];
          return monster ? monster.name : "Unknown Monster";
        }
        return node.type === "elite"
          ? "Elite Monster"
          : node.type === "boss"
            ? "Boss Monster"
            : "Monster";
      case "rest":
        return "Rest Site";
      case "merchant":
        return "Merchant";
      default:
        return "Unknown";
    }
  };

  // Check if a node is completed
  const isNodeCompleted = (nodeId: string): boolean => {
    const currentRun = playerProgress.getCurrentRun();
    if (!currentRun) return false;

    return currentRun.completedNodeIds.includes(nodeId);
  };

  if (!map) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="map-screen">
      <Stage
        width={width}
        height={height}
        options={{ backgroundColor: 0xf5f5f5 }}
      >
        {/* Title */}
        <Text
          text="Hunt Map"
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

        {/* Player Stats (Gold, Health) */}
        <Container x={width - 200} y={20}>
          {(() => {
            const currentRun = playerProgress.getCurrentRun();
            if (!currentRun) return null;

            return (
              <>
                <Text
                  text={`Health: ${currentRun.currentHealth}/${currentRun.maxHealth}`}
                  style={
                    new PIXI.TextStyle({
                      fill: 0x333333,
                      fontSize: 14,
                    })
                  }
                />
                <Text
                  text={`Gold: ${currentRun.gold}`}
                  y={20}
                  style={
                    new PIXI.TextStyle({
                      fill: 0x333333,
                      fontSize: 14,
                    })
                  }
                />
              </>
            );
          })()}
        </Container>

        <Container y={650}>
          {/* Edges */}
          <Graphics
            draw={(g) => {
              g.clear();
              g.lineStyle(3, 0xbdbdbd, 0.5);

              map.edges.forEach((edge) => {
                const fromNode = map.nodes.find((n) => n.id === edge.from);
                const toNode = map.nodes.find((n) => n.id === edge.to);

                if (fromNode && toNode) {
                  g.moveTo(fromNode.x, fromNode.y);
                  g.lineTo(toNode.x, toNode.y);
                }
              });

              // Draw available paths with a different color
              g.lineStyle(4, 0x4caf50, 0.8);

              const availableNodes = getAvailableNodes();
              availableNodes.forEach((nodeId) => {
                const fromNode = map.nodes.find(
                  (n) => n.id === map.playerPosition,
                );
                const toNode = map.nodes.find((n) => n.id === nodeId);

                if (fromNode && toNode) {
                  g.moveTo(fromNode.x, fromNode.y);
                  g.lineTo(toNode.x, toNode.y);
                }
              });
            }}
          />

          {/* Nodes */}
          {map.nodes.map((node) => {
            const isAvailable = getAvailableNodes().includes(node.id);
            const isCurrentPosition = map.playerPosition === node.id;
            const isCompleted = isNodeCompleted(node.id);
            const nodeSize = isCurrentPosition ? 30 : isAvailable ? 25 : 20;

            return (
              <Container
                key={`node-${node.id}`}
                x={node.x}
                y={node.y}
                eventMode="static"
                cursor={isAvailable ? "pointer" : "default"}
                pointerdown={() => isAvailable && handleNodeClick(node.id)}
              >
                {/* Node Circle */}
                <Graphics
                  draw={(g) => {
                    g.clear();

                    // Draw shadow
                    g.beginFill(0x000000, 0.3);
                    g.drawCircle(3, 3, nodeSize);
                    g.endFill();

                    // Draw node
                    g.lineStyle(2, isCurrentPosition ? 0xffffff : 0x333333);
                    g.beginFill(
                      isAvailable || isCompleted
                        ? getNodeColor(node.type)
                        : 0x8d8d8d,
                    );
                    g.drawCircle(0, 0, nodeSize);
                    g.endFill();

                    // Draw player indicator
                    if (isCurrentPosition) {
                      g.lineStyle(2, 0xffffff);
                      g.beginFill(0x333333);
                      g.drawCircle(0, 0, 10);
                      g.endFill();
                    }

                    // Draw completed indicator
                    if (isCompleted && !isCurrentPosition) {
                      g.lineStyle(0);
                      g.beginFill(0xffffff, 0.7);
                      g.drawCircle(0, 0, nodeSize / 2);
                      g.endFill();

                      // Checkmark
                      g.lineStyle(2, 0x4caf50);
                      g.moveTo(-5, 0);
                      g.lineTo(-2, 3);
                      g.lineTo(5, -4);
                    }
                  }}
                />

                {/* Node Icon */}
                <Graphics
                  draw={(g) => {
                    g.lineStyle(
                      2,
                      isCompleted && !isCurrentPosition ? 0x4caf50 : 0x333333,
                    );
                    drawNodeIcon(g, node.type);
                  }}
                />

                {/* Node Label */}
                <Text
                  text={getNodeName(node)}
                  anchor={[0.5, 0]}
                  y={nodeSize + 5}
                  style={
                    new PIXI.TextStyle({
                      fill: 0x333333,
                      fontSize: 12,
                      fontWeight:
                        isCurrentPosition || isAvailable ? "bold" : "normal",
                    })
                  }
                />
              </Container>
            );
          })}
        </Container>
        {/* Instructions */}
        <Container x={10} y={height - 60}>
          <Graphics
            draw={(g) => {
              g.clear();
              g.lineStyle(1, 0xbdbdbd);
              g.beginFill(0xffffff, 0.7);
              g.drawRoundedRect(0, 0, 240, 50, 5);
              g.endFill();
            }}
          />
          <Text
            text="Click on a connected node to move there."
            x={10}
            y={10}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 12,
              })
            }
          />
          <Text
            text="Defeat monsters to earn rewards."
            x={10}
            y={30}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 12,
              })
            }
          />
        </Container>
      </Stage>
    </div>
  );
};

export default MapScreen;
