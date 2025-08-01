import React from 'react';
import type { Card as CardType } from '../game/PokerDuelGame';
import '../styles/game.css';

// Mapeamento de símbolos e classes de cor para cada naipe
const SuitIcons: Record<string, { symbol: string; colorClass: string }> = {
  hearts:   { symbol: '♥', colorClass: 'suit-hearts' },
  diamonds: { symbol: '♦', colorClass: 'suit-diamonds' },
  clubs:    { symbol: '♣', colorClass: 'suit-clubs' },
  spades:   { symbol: '♠', colorClass: 'suit-spades' },
};

/** Cartão virado para cima */
export const CardView: React.FC<{ card: CardType }> = ({ card }) => {
  const { symbol, colorClass } = SuitIcons[card.suit];
  return (
    <div className="card">
      <span className={`card-symbol ${colorClass}`}>{symbol}</span>
      <span className={`card-rank ${colorClass}`}>{card.rank}</span>
    </div>
  );
};

/** Cartão virado para baixo */
export const CardBack: React.FC = () => (
  <div className="card-back" />
);

