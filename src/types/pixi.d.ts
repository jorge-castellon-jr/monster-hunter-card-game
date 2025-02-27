// src/types/pixi.d.ts
import * as PIXI from "pixi.js";

declare module "pixi.js" {
  interface Graphics {
    drawStar(
      x: number,
      y: number,
      points: number,
      radius: number,
      innerRadius: number,
      rotation?: number,
    ): PIXI.Graphics;
  }
}
