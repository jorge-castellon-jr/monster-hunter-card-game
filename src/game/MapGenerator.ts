// src/game/MapGenerator.ts
import { GameMap, MapNode, MapEdge } from "../types";

// Node types and their probabilities at different stages
const NODE_TYPE_WEIGHTS = {
  EARLY: {
    monster: 0.5,
    elite: 0,
    rest: 0.3,
    merchant: 0.2,
  },
  MID: {
    monster: 0.4,
    elite: 0.2,
    rest: 0.2,
    merchant: 0.2,
  },
  LATE: {
    monster: 0.3,
    elite: 0.4,
    rest: 0.2,
    merchant: 0.1,
  },
};

export interface MapGenerationOptions {
  width?: number;
  height?: number;
  numLevels?: number;
  nodesPerLevel?: number;
  includeElites?: boolean;
  seed?: number;
}

export class MapGenerator {
  private width: number;
  // private height: number;
  private numLevels: number;
  private nodesPerLevel: number;
  private includeElites: boolean;
  private seed: number;

  constructor(options: MapGenerationOptions = {}) {
    this.width = options.width || 800;
    // this.height = options.height || 800;
    this.numLevels = options.numLevels || 4;
    this.nodesPerLevel = options.nodesPerLevel || 3;
    this.includeElites =
      options.includeElites !== undefined ? options.includeElites : true;
    this.seed = options.seed || Date.now();

    // Initialize random seed
    this.setSeed(this.seed);
  }

  // Simple random function with seed
  private random(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Set a new seed
  private setSeed(seed: number): void {
    this.seed = seed;
  }

  // Generate a random map
  generateMap(): GameMap {
    const nodes: MapNode[] = [];
    const edges: MapEdge[] = [];

    // Start node
    const startNode: MapNode = {
      id: "start",
      type: "start",
      x: this.width / 2,
      y: 50,
    };

    nodes.push(startNode);

    // Previous level nodes (starts with just the start node)
    let prevLevelNodes = [startNode];

    // Generate levels
    for (let level = 1; level <= this.numLevels; level++) {
      const difficulty =
        level <= 1 ? "EARLY" : level >= this.numLevels ? "LATE" : "MID";
      const levelNodes = this.generateLevel(level, difficulty, prevLevelNodes);

      // Add new nodes
      nodes.push(...levelNodes);

      // Connect to previous level
      const newEdges = this.connectLevels(prevLevelNodes, levelNodes);
      edges.push(...newEdges);

      // Update previous level for next iteration
      prevLevelNodes = levelNodes;
    }

    // Add boss node
    const bossNode: MapNode = {
      id: "boss",
      type: "boss",
      monsterId: "nergigante",
      x: this.width / 2,
      y: 50 - (this.numLevels + 1) * 120,
    };

    nodes.push(bossNode);
    nodes.reverse();

    // Connect all final level nodes to boss
    prevLevelNodes.forEach((node) => {
      edges.push({
        from: node.id,
        to: bossNode.id,
      });
    });

    return {
      nodes,
      edges,
      playerPosition: "start",
    };
  }

  // Generate a single level of nodes
  private generateLevel(
    level: number,
    difficulty: "EARLY" | "MID" | "LATE",
    prevLevelNodes: MapNode[],
  ): MapNode[] {
    console.log(prevLevelNodes);
    const nodes: MapNode[] = [];
    const levelY = 50 - level * 120; // Vertical position

    // Determine node types based on difficulty
    const weights = NODE_TYPE_WEIGHTS[difficulty];

    // Ensure at least one rest site per level
    let hasRestSite = false;

    // Create nodes for this level
    for (let i = 0; i < this.nodesPerLevel; i++) {
      const x = (i + 1) * (this.width / (this.nodesPerLevel + 1));

      // Force a rest site if last node and none yet
      let nodeType: "monster" | "elite" | "rest" | "merchant";

      if (i === this.nodesPerLevel - 1 && !hasRestSite) {
        nodeType = "rest";
      } else {
        // Random node type based on weights
        const rand = this.random();
        if (rand < weights.monster) {
          nodeType = "monster";
        } else if (
          rand < weights.monster + (weights.elite || 0) &&
          this.includeElites
        ) {
          nodeType = "elite";
        } else if (
          rand <
          weights.monster + (weights.elite || 0) + weights.rest
        ) {
          nodeType = "rest";
          hasRestSite = true;
        } else {
          nodeType = "merchant";
        }
      }

      // Create monster ID if needed
      let monsterId: string | undefined;

      if (nodeType === "monster") {
        // Use default monsters instead of random for better stability
        if (difficulty === "EARLY") {
          monsterId = level === 1 ? "great_jagras" : "kulu_ya_ku";
        } else if (difficulty === "MID") {
          monsterId = "pukei_pukei";
        } else {
          monsterId = "anjanath";
        }
      } else if (nodeType === "elite") {
        monsterId =
          difficulty === "EARLY" ? "great_jagras_elite" : "kulu_ya_ku_elite";
      }

      // Create the node
      const node: MapNode = {
        id: `${nodeType}_${level}_${i}`,
        type: nodeType,
        x,
        y: levelY,
      };

      if (monsterId) {
        node.monsterId = monsterId;
      }

      nodes.push(node);
    }

    return nodes;
  }

  // Connect two levels with edges
  private connectLevels(
    prevLevelNodes: MapNode[],
    currentLevelNodes: MapNode[],
  ): MapEdge[] {
    const edges: MapEdge[] = [];

    // For a single node in previous level, connect to all current level nodes
    if (prevLevelNodes.length === 1) {
      currentLevelNodes.forEach((node) => {
        edges.push({
          from: prevLevelNodes[0].id,
          to: node.id,
        });
      });
      return edges;
    }

    // For multiple nodes, create a zigzag pattern
    for (let i = 0; i < prevLevelNodes.length; i++) {
      // Connect to same index
      if (i < currentLevelNodes.length) {
        edges.push({
          from: prevLevelNodes[i].id,
          to: currentLevelNodes[i].id,
        });
      }

      // Connect to next index (if available)
      if (i + 1 < currentLevelNodes.length) {
        edges.push({
          from: prevLevelNodes[i].id,
          to: currentLevelNodes[i + 1].id,
        });
      }

      // Add some random connections for variety (25% chance)
      if (this.random() < 0.25) {
        const randomNodeIndex = Math.floor(
          this.random() * currentLevelNodes.length,
        );
        if (randomNodeIndex !== i && randomNodeIndex !== i + 1) {
          // Avoid duplicates
          edges.push({
            from: prevLevelNodes[i].id,
            to: currentLevelNodes[randomNodeIndex].id,
          });
        }
      }
    }

    return edges;
  }
}

// Export an instance with default options
export const mapGenerator = new MapGenerator();
export default mapGenerator;
