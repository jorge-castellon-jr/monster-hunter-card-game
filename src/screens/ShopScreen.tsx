// src/screens/ShopScreen.tsx
import React, { useState, useEffect } from "react";
import { Stage, Container, Graphics, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import { shopSystem, ShopItem } from "../game/ShopSystem";
import playerProgress, { RunData } from "../game/PlayerProgress";

interface ShopScreenProps {
  onComplete: () => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ onComplete }) => {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);
  const [currentRun, setCurrentRun] = useState<RunData | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [message, setMessage] = useState<string>("");
  const [messageTimer, setMessageTimer] = useState<number | null>(null);

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

    // Generate shop inventory
    if (runData) {
      // Determine shop level based on run progress
      const shopLevel = Math.max(1, runData.completedNodeIds.length);
      const inventory = shopSystem.generateShopInventory(
        runData.weapon,
        shopLevel,
      );
      setShopItems(inventory);
    }

    return () => {
      window.removeEventListener("resize", handleResize);

      // Clear message timer
      if (messageTimer) {
        window.clearTimeout(messageTimer);
      }
    };
  }, []);

  // Display a temporary message
  const showMessage = (text: string, duration: number = 3000) => {
    // Clear any existing timer
    if (messageTimer) {
      window.clearTimeout(messageTimer);
    }

    setMessage(text);

    // Set a timer to clear the message
    const timer = window.setTimeout(() => {
      setMessage("");
      setMessageTimer(null);
    }, duration);

    setMessageTimer(timer);
  };

  // Handle purchase of an item
  const handlePurchase = (item: ShopItem) => {
    if (!currentRun) return;

    // Check if player has enough gold
    if (currentRun.gold < item.price) {
      showMessage(`Not enough gold! You need ${item.price} gold.`);
      return;
    }

    // Purchase the item
    const success = shopSystem.purchaseItem(item.id);

    if (success) {
      showMessage(`Purchased: ${item.name}`);

      // Update current run data
      setCurrentRun(playerProgress.getCurrentRun());

      // Update shop items
      setShopItems(shopItems.filter((i) => i.id !== item.id));
    } else {
      showMessage("Failed to purchase item.");
    }
  };

  if (!currentRun) {
    return <div>Loading...</div>;
  }

  return (
    <div className="shop-screen">
      <Stage
        width={width}
        height={height}
        options={{ backgroundColor: 0xf5f5f5 }}
      >
        {/* Title */}
        <Text
          text="Hunter's Shop"
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

        {/* Shop Keeper (placeholder) */}
        <Container x={80} y={80}>
          <Graphics
            draw={(g) => {
              g.clear();

              // Draw shop keeper silhouette
              g.lineStyle(2, 0x333333);
              g.beginFill(0xf5f5f5);

              // Head
              g.drawCircle(0, 0, 20);
              g.endFill();

              // Body
              g.beginFill(0xe0e0e0);
              g.drawEllipse(0, 40, 30, 40);
              g.endFill();

              // Arms
              g.lineStyle(5, 0xe0e0e0);
              g.moveTo(-20, 30);
              g.lineTo(-40, 50);

              g.moveTo(20, 30);
              g.lineTo(40, 50);
            }}
          />

          {/* Speech Bubble */}
          <Container x={50} y={-20}>
            <Graphics
              draw={(g) => {
                g.clear();
                g.lineStyle(1, 0x333333);
                g.beginFill(0xffffff);
                g.drawRoundedRect(0, 0, 150, 40, 10);

                // Pointer
                g.moveTo(0, 20);
                g.lineTo(-10, 30);
                g.lineTo(10, 30);
                g.closePath();

                g.endFill();
              }}
            />
            <Text
              text="Welcome, hunter!"
              x={75}
              y={20}
              anchor={[0.5, 0.5]}
              style={
                new PIXI.TextStyle({
                  fill: 0x333333,
                  fontSize: 12,
                })
              }
            />
          </Container>
        </Container>

        {/* Player Stats */}
        <Container x={width - 200} y={80}>
          <Text
            text={`Gold: ${currentRun.gold}`}
            style={
              new PIXI.TextStyle({
                fill: 0x333333,
                fontSize: 18,
                fontWeight: "bold",
              })
            }
          />
        </Container>

        {/* Messages */}
        {message && (
          <Container x={width / 2 - 150} y={80}>
            <Graphics
              draw={(g) => {
                g.clear();
                g.lineStyle(1, 0xbdbdbd);
                g.beginFill(0xffffff, 0.8);
                g.drawRoundedRect(0, 0, 300, 40, 5);
                g.endFill();
              }}
            />
            <Text
              text={message}
              x={150}
              y={20}
              anchor={[0.5, 0.5]}
              style={
                new PIXI.TextStyle({
                  fill: 0x333333,
                  fontSize: 14,
                  align: "center",
                })
              }
            />
          </Container>
        )}

        {/* Shop Items */}
        <Container x={20} y={140}>
          <Graphics
            draw={(g) => {
              g.clear();
              g.lineStyle(1, 0xbdbdbd);
              g.beginFill(0xf8f8f8);
              g.drawRoundedRect(0, 0, width - 40, height - 200, 10);
              g.endFill();
            }}
          />

          {/* Item Grid */}
          <Container x={20} y={20}>
            {shopItems.map((item, index) => {
              const row = Math.floor(index / 2);
              const col = index % 2;

              // Determine item icon and color based on type
              let iconColor = 0x333333;
              let bgColor = 0xffffff;

              switch (item.type) {
                case "card":
                  iconColor = 0x4caf50;
                  bgColor = 0xe8f5e9;
                  break;
                case "upgrade":
                  iconColor = 0x2196f3;
                  bgColor = 0xe3f2fd;
                  break;
                case "consumable":
                  iconColor = 0xff9800;
                  bgColor = 0xfff3e0;
                  break;
                case "maxhp":
                  iconColor = 0xf44336;
                  bgColor = 0xffebee;
                  break;
              }

              return (
                <Container
                  key={item.id}
                  x={col * 370}
                  y={row * 120}
                  eventMode="static"
                  cursor="pointer"
                  pointerdown={() => handlePurchase(item)}
                >
                  <Graphics
                    draw={(g) => {
                      g.clear();

                      // Can the player afford it?
                      const canAfford = currentRun.gold >= item.price;

                      g.lineStyle(2, canAfford ? 0x333333 : 0xbdbdbd);
                      g.beginFill(canAfford ? bgColor : 0xf5f5f5);
                      g.drawRoundedRect(0, 0, 350, 100, 8);
                      g.endFill();
                    }}
                  />

                  {/* Item Icon */}
                  <Container x={20} y={20}>
                    <Graphics
                      draw={(g) => {
                        g.clear();
                        g.lineStyle(2, iconColor);
                        g.beginFill(0xffffff);
                        g.drawCircle(0, 0, 25);
                        g.endFill();

                        // Draw icon based on item type
                        switch (item.type) {
                          case "card":
                            // Card icon
                            g.drawRoundedRect(-15, -20, 30, 40, 3);
                            break;
                          case "upgrade":
                            // Upgrade icon
                            g.moveTo(0, -15);
                            g.lineTo(10, 0);
                            g.lineTo(5, 0);
                            g.lineTo(5, 15);
                            g.lineTo(-5, 15);
                            g.lineTo(-5, 0);
                            g.lineTo(-10, 0);
                            g.closePath();
                            break;
                          case "consumable":
                            // Potion icon
                            g.drawRoundedRect(-10, -15, 20, 30, 8);
                            g.moveTo(-10, -5);
                            g.lineTo(10, -5);
                            break;
                          case "maxhp":
                            // Heart icon
                            g.moveTo(0, 10);
                            for (let i = 0; i < 10; i++) {
                              const angle = i * 36 * (Math.PI / 180);
                              const x = Math.sin(angle) * 15;
                              const y = Math.cos(angle) * 15;
                              g.lineTo(x, -y);
                            }
                            g.closePath();
                            break;
                        }
                      }}
                    />
                  </Container>

                  {/* Item Name */}
                  <Text
                    text={item.name}
                    x={70}
                    y={15}
                    style={
                      new PIXI.TextStyle({
                        fill: 0x333333,
                        fontSize: 16,
                        fontWeight: "bold",
                      })
                    }
                  />

                  {/* Item Description */}
                  <Text
                    text={item.description}
                    x={70}
                    y={40}
                    style={
                      new PIXI.TextStyle({
                        fill: 0x666666,
                        fontSize: 12,
                        wordWrap: true,
                        wordWrapWidth: 250,
                      })
                    }
                  />

                  {/* Item Price */}
                  <Container x={300} y={70}>
                    <Graphics
                      draw={(g) => {
                        g.clear();

                        // Can the player afford it?
                        const canAfford = currentRun.gold >= item.price;

                        g.lineStyle(1, canAfford ? 0xffa000 : 0xbdbdbd);
                        g.beginFill(canAfford ? 0xffecb3 : 0xf5f5f5);
                        g.drawCircle(0, 0, 20);
                        g.endFill();
                      }}
                    />
                    <Text
                      text={`${item.price}`}
                      anchor={0.5}
                      style={
                        new PIXI.TextStyle({
                          fill:
                            currentRun.gold >= item.price ? 0x333333 : 0x999999,
                          fontSize: 12,
                          fontWeight: "bold",
                        })
                      }
                    />
                  </Container>
                </Container>
              );
            })}
          </Container>
        </Container>

        {/* Exit Button */}
        <Container
          x={width / 2 - 50}
          y={height - 50}
          eventMode="static"
          cursor="pointer"
          pointerdown={onComplete}
        >
          <Graphics
            draw={(g) => {
              g.clear();
              g.lineStyle(2, 0x333333);
              g.beginFill(0xffd54f);
              g.drawRoundedRect(0, 0, 100, 40, 5);
              g.endFill();
            }}
          />
          <Text
            text="Continue"
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
      </Stage>
    </div>
  );
};

export default ShopScreen;
