// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// Add PIXI.Graphics.prototype.drawStar method for star shapes
import * as PIXI from "pixi.js";

// Extend PIXI.Graphics to add drawStar method if it doesn't exist
if (!PIXI.Graphics.prototype.drawStar) {
  PIXI.Graphics.prototype.drawStar = function(
    x: number,
    y: number,
    points: number,
    radius: number,
    innerRadius: number,
    rotation: number = 0,
  ) {
    innerRadius = innerRadius || radius / 2;

    const startAngle = (-1 * Math.PI) / 2 + rotation;
    const len = points * 2;
    const delta = (Math.PI * 2) / len;
    const polygon = [];

    for (let i = 0; i < len; i++) {
      const r = i % 2 ? innerRadius : radius;
      const angle = i * delta + startAngle;

      polygon.push(x + r * Math.cos(angle), y + r * Math.sin(angle));
    }

    return this.drawPolygon(polygon);
  };
}

const rootElement = document.getElementById("root");
createRoot(rootElement!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
