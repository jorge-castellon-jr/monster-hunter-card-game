// src/App.tsx
import React, { useState, useEffect } from "react";
import CombatScreen from "./screens/CombatScreen";
import MapScreen from "./screens/MapScreen";
import RestSiteScreen from "./screens/RestSiteScreen";
import ShopScreen from "./screens/ShopScreen";
import ResultsScreen from "./screens/ResultsScreen";
import { WEAPON_TYPES, STARTING_DECKS } from "./data/cards";
import { WeaponType } from "./types";
import playerProgress from "./game/PlayerProgress";

type ScreenType = "title" | "map" | "combat" | "rest" | "shop" | "results";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("title");
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | null>(null);
  const [currentNodeType, setCurrentNodeType] = useState<string>("");
  const [isNewGame, setIsNewGame] = useState<boolean>(true);

  // Check for existing run on startup
  useEffect(() => {
    const currentRun = playerProgress.getCurrentRun();
    if (currentRun) {
      setSelectedWeapon(currentRun.weapon);
      setIsNewGame(false);
    }
  }, []);

  const handleStartGame = (weapon: WeaponType) => {
    setSelectedWeapon(weapon);

    // Start a new run with the selected weapon
    const currentRun = playerProgress.getCurrentRun();
    if (!currentRun) {
      // Get starting deck for weapon
      const startingDeck = WEAPON_TYPES[weapon]
        ? [...STARTING_DECKS[weapon]]
        : [...STARTING_DECKS[WEAPON_TYPES.SWORD_AND_SHIELD]];

      // Create new run
      playerProgress.startNewRun(weapon, startingDeck);
    }

    setCurrentScreen("map");
  };

  const handleNodeClick = (nodeType: string) => {
    setCurrentNodeType(nodeType);

    // Determine next screen based on node type
    switch (nodeType) {
      case "monster":
      case "elite":
      case "boss":
        setCurrentScreen("combat");
        break;
      case "rest":
        setCurrentScreen("rest");
        break;
      case "merchant":
        setCurrentScreen("shop");
        break;
      default:
        // Stay on map for unknown node types
        break;
    }
  };

  const handleCombatComplete = (result: "victory" | "defeat") => {
    if (result === "victory") {
      // Mark current node as completed
      playerProgress.completeCurrentNode();

      // Check if boss was defeated
      if (currentNodeType === "boss") {
        // End current run with success
        playerProgress.endRun(true);
        setCurrentScreen("results");
        return;
      }

      // Return to map after victory
      setCurrentScreen("map");
    } else {
      // End current run with failure
      playerProgress.endRun(false);
      setCurrentScreen("title");
    }
  };

  const handleRestComplete = () => {
    // Mark rest site as visited
    playerProgress.completeCurrentNode();

    // Return to map
    setCurrentScreen("map");
  };

  const handleShopComplete = () => {
    // Mark merchant as visited
    playerProgress.completeCurrentNode();

    // Return to map
    setCurrentScreen("map");
  };

  const handleRunResults = () => {
    // Start a new game
    setCurrentScreen("title");
    setIsNewGame(true);
  };

  // Title Screen
  if (currentScreen === "title") {
    return (
      <div className="title-screen">
        <div className="title-container">
          <h1>Monster Hunter Card Game</h1>
          <p>A roguelike card game inspired by Monster Hunter</p>

          {isNewGame ? (
            <div className="weapon-selection">
              <h2>Select Your Weapon</h2>
              <div className="weapons">
                <div
                  className="weapon-card"
                  onClick={() => handleStartGame(WEAPON_TYPES.SWORD_AND_SHIELD)}
                >
                  <h3>Sword & Shield</h3>
                  <p>Balanced, versatile with defensive options</p>
                </div>
                <div
                  className="weapon-card"
                  onClick={() => handleStartGame(WEAPON_TYPES.GREATSWORD)}
                >
                  <h3>Greatsword</h3>
                  <p>High damage, slower moves, charge mechanics</p>
                </div>
                <div
                  className="weapon-card"
                  onClick={() => handleStartGame(WEAPON_TYPES.BOW)}
                >
                  <h3>Bow</h3>
                  <p>Ranged attacks, status effects, positioning advantage</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="continue-buttons">
              <h2>Continue Your Hunt?</h2>
              <div className="button-group">
                <button
                  className="continue-button"
                  onClick={() => setCurrentScreen("map")}
                >
                  Continue Existing Run
                </button>
                <button
                  className="new-button"
                  onClick={() => {
                    playerProgress.clearProgress();
                    setIsNewGame(true);
                  }}
                >
                  Start New Run
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Map Screen
  if (currentScreen === "map") {
    return (
      <MapScreen
        onNodeSelect={handleNodeClick}
        selectedWeapon={selectedWeapon || undefined}
      />
    );
  }

  // Combat Screen
  if (currentScreen === "combat") {
    return (
      <CombatScreen
        onComplete={handleCombatComplete}
        selectedWeapon={selectedWeapon || undefined}
        nodeType={currentNodeType}
      />
    );
  }

  // Rest Site Screen
  if (currentScreen === "rest") {
    return <RestSiteScreen onComplete={handleRestComplete} />;
  }

  // Shop Screen
  if (currentScreen === "shop") {
    return <ShopScreen onComplete={handleShopComplete} />;
  }

  // Results Screen
  if (currentScreen === "results") {
    return <ResultsScreen onComplete={handleRunResults} />;
  }

  // Fallback
  return <div>Loading...</div>;
};

export default App;
