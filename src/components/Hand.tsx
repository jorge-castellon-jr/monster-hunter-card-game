// src/components/Hand.tsx
import React, { useState, useEffect } from "react";
import { Container } from "@pixi/react";
import Card from "./Card";
import { Card as CardType } from "../types";

interface CardPosition {
  x: number;
  y: number;
  rotation: number;
}

interface HandProps {
  cards: CardType[];
  x: number;
  y: number;
  width: number;
  onCardClick?: (card: CardType, index: number) => void;
  selectedCardId?: string | null;
  cardsPlayable?: boolean;
  maxCardsPlayable?: number;
  cardsPlayedThisTurn?: number;
}

const Hand: React.FC<HandProps> = ({
  cards,
  x,
  y,
  width,
  onCardClick,
  selectedCardId = null,
  cardsPlayable = true,
  maxCardsPlayable = 3,
  cardsPlayedThisTurn = 0,
}) => {
  const [cardPositions, setCardPositions] = useState<CardPosition[]>([]);

  // Calculate card positions based on hand size
  useEffect(() => {
    if (!cards || cards.length === 0) {
      setCardPositions([]);
      return;
    }

    const cardWidth = 120;
    const cardSpacing = Math.min(
      40,
      (width - cardWidth) / Math.max(1, cards.length - 1),
    );
    const totalWidth = cardWidth + (cards.length - 1) * cardSpacing;
    const startX = (width - totalWidth) / 2;

    const newPositions = cards.map((_, index) => {
      return {
        x: startX + index * cardSpacing,
        y: 0,
        rotation: -10 + (20 / (cards.length - 1 || 1)) * index,
      };
    });

    setCardPositions(newPositions);
  }, [cards, width]);

  // Handle card selection
  const handleCardClick = (card: CardType, index: number) => {
    // Check if we can play more cards
    const isPlayable = cardsPlayable && cardsPlayedThisTurn < maxCardsPlayable;

    if (isPlayable && onCardClick) {
      onCardClick(card, index);
    }
  };

  return (
    <Container x={x} y={y}>
      {cards.map((card, index) => {
        // Create a unique ID for this card
        const uniqueCardId = `${card.id}-${index}`;
        const isSelected = selectedCardId === uniqueCardId;
        const canPlayMoreCards = cardsPlayedThisTurn < maxCardsPlayable;
        const isPlayable = cardsPlayable && canPlayMoreCards;

        // Calculate card position
        const position = cardPositions[index] || { x: 0, y: 0, rotation: 0 };

        // Apply vertical offset if selected
        const yOffset = isSelected ? -80 : 0; // Increased from -30 to -80
        const scale = isSelected ? 1.2 : 1; // Add scaling for better visibility

        return (
          <Container
            key={uniqueCardId}
            x={position.x}
            y={position.y + yOffset}
            scale={scale}
            rotation={isSelected ? 0 : position.rotation * (Math.PI / 180)}
          >
            <Card
              card={card}
              onClick={() => handleCardClick(card, index)}
              isSelected={isSelected}
              isPlayable={isPlayable}
            />
          </Container>
        );
      })}
    </Container>
  );
};

export default Hand;
