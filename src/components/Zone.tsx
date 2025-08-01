import React from 'react';
import type { Card as CardType } from '../game/PokerDuelGame';
import { OverlapContainer } from './OverlapContainer';
import { CardView, CardBack } from './Card';
import '../styles/game.css';

/** Zona genérica para exibir uma coleção de cartas */
const Zone: React.FC<{
  title: string;
  cards: CardType[];
  faceDown?: boolean;
}> = ({ title, cards, faceDown }) => (
  <div className="zone">
    <div className="zone-header">
      <span className="zone-title">{title}</span>
      <span className="zone-count">{cards.length}</span>
    </div>
    <OverlapContainer count={cards.length}>
      {cards.map(c =>
        faceDown
          ? <CardBack key={c.id} />
          : <CardView key={c.id} card={c} />
      )}
    </OverlapContainer>
  </div>
);

export default Zone;

