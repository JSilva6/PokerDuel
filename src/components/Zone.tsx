import React, { type RefObject } from 'react';
import type { Card as CardType } from '../game/PokerDuelGame';
import { OverlapContainer } from './OverlapContainer';
import { CardView, CardBack } from './Card';
import '../styles/game.css';

interface ZoneProps {
  title: string;
  cards: CardType[];
  faceDown?: boolean;
  hiddenCards?: Set<string>;
  ref?: RefObject<HTMLDivElement | null>;
  /** Novo prop para handler de clique na carta */
  onCardClick?: (cardId: string, sourceEl: HTMLDivElement) => void;
}

/** Zona genérica para exibir uma coleção de cartas */
const Zone: React.FC<ZoneProps> = ({ title, cards, faceDown, hiddenCards, onCardClick, ref }) => (
  <div className="zone" ref={ref}>
    <div className="zone-header">
      <span className="zone-title">{title}</span>
      <span className="zone-count">{cards.length}</span>
    </div>
    <OverlapContainer count={cards.length}>
      {cards.map(c =>
        faceDown
            ? <CardBack key={c.id} card={c} hidden={hiddenCards?.has(c.id)}/>
          : <CardView key={c.id} card={c} onClick={onCardClick} />
      )}
    </OverlapContainer>
  </div>
);

export default Zone;

