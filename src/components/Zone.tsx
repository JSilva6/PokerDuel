import React from 'react';
import type { Card as CardType } from '../game/PokerDuelGame';
import { OverlapContainer } from './OverlapContainer';
import { CardView, CardBack } from './Card';
import '../styles/game.css';

interface ZoneProps {
  title: string;
  cards: CardType[];
  faceDown?: boolean;
  /** Novo prop para handler de clique na carta */
  onCardClick?: (cardId: string) => void;
}

/** Zona genérica para exibir uma coleção de cartas */
const Zone: React.FC<ZoneProps> = ({ title, cards, faceDown, onCardClick }) => (
  <div className="zone">
    <div className="zone-header">
      <span className="zone-title">{title}</span>
      <span className="zone-count">{cards.length}</span>
    </div>
    <OverlapContainer count={cards.length}>
      {cards.map(c =>
        faceDown
          ? <CardBack key={c.id} />
          : <CardView key={c.id} card={c} onClick={onCardClick} />
      )}
    </OverlapContainer>
  </div>
);

export default Zone;

