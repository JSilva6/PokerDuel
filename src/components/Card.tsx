import React, { useState } from 'react';
import type { Card as CardType } from '../game/PokerDuelGame';
import Tooltip from './Tooltip';
import '../styles/game.css';

export interface CardViewProps {
  card: CardType;
  /** Handler recebido do App.tsx que recebe o ID da carta clicada */
  onClick?: (cardId: CardType) => void;
  hidden?: boolean;
}

const SuitIcons: Record<string, { symbol: string; colorClass: string }> = {
  hearts:   { symbol: '♥', colorClass: 'suit-hearts' },
  diamonds: { symbol: '♦', colorClass: 'suit-diamonds' },
  clubs:    { symbol: '♣', colorClass: 'suit-clubs' },
  spades:   { symbol: '♠', colorClass: 'suit-spades' },
};

const suitEffects: Record<CardType['suit'], string> = {
  hearts:   'Descartar duas Copas: Recupere 2 de Vida',
  diamonds: 'Descartar duas Ouros: Compre 2 cartas (somente do baralho)',
  spades:   'Descartar duas Espadas: Ambos perdem 2 de Vida',
  clubs:    'Descartar duas Paus: Oponente descarta 1 carta',
};

const faceEffects: Partial<Record<CardType['rank'], string>> = {
  Q: 'Dama: Olhe a mão do oponente e descarte uma carta dela',
  K: 'Rei: Recupere qualquer carta do descarte para sua mão',
  A: 'Ás: Descarte sua mão e compre o mesmo número de cartas do baralho',
  J: 'Valete: +2 de dano no próximo ataque',
};

const getTooltipLines = (card: CardType): string[] => {
  const lines: string[] = [];
  const faceText = faceEffects[card.rank];
  const suitText = suitEffects[card.suit];
  if (faceText) lines.push(faceText);
  if (suitText) lines.push(suitText);
  return lines;
};

/** Cartão virado para cima com tooltip e callback genérico */
export const CardView: React.FC<CardViewProps> = ({ card, onClick, hidden = false }) => {
  const { symbol, colorClass } = SuitIcons[card.suit];
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const lines = getTooltipLines(card);
  const showBottom = pos.y > window.innerHeight * 0.7;

  const handleMouseEnter = () => { if (lines.length) setHover(true); };
  const handleMouseMove  = (e: React.MouseEvent) => {
    if (lines.length) setPos({ x: e.clientX + 12, y: e.clientY + 12 });
  };
  const handleMouseLeave = () => setHover(false);
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick(card);
  };

  return (
    <div
      id={card.id}
      className={hidden ? 'hidden-card' : ''}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ display: 'inline-block', cursor: 'pointer' }}
    >
      <div className="card">
        <span className={`card-symbol ${colorClass}`}>{symbol}</span>
        <span className={`card-rank ${colorClass}`}>{card.rank}</span>
      </div>
      {hover && lines.length > 0 && (
        <Tooltip lines={lines} x={pos.x} y={pos.y} bottom={showBottom} />
      )}
    </div>
  );
};

/** Cartão virado para baixo (sem tooltip) */
export const CardBack: React.FC<CardViewProps> = ({card, hidden = false}) => (
  <div data-card-id={card.id} className={`card-back ${hidden ? 'hidden-card' : ''}`} />
);
