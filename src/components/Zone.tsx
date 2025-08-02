import React, { type RefObject } from 'react';
import type { Card, Card as CardType } from '../game/PokerDuelGame';
import { OverlapContainer } from './OverlapContainer';
import { CardView, CardBack } from './Card';
import '../styles/game.css';

interface ZoneProps {
  title: string;
  cards: CardType[];
  faceDown?: boolean;
  hiddenCards?: string[];
  highlight?: string[];
  ref?: RefObject<HTMLDivElement | null>;
  /** Novo prop para handler de clique na carta */
  onCardClick?: (card: CardType) => void;
}

/** Zona genérica para exibir uma coleção de cartas */
const Zone: React.FC<ZoneProps> = ({ title, cards, faceDown, hiddenCards, highlight, onCardClick, ref }) => {
  const emptyCard: Card = {
    suit: 'none',
    rank: 'none',
    id: 'none'
  }
  return <div className="zone" ref={ref}>
    <div className="zone-header">
      <span className="zone-title">{title}</span>
      <span className="zone-count">{cards.length}</span>
    </div>
    <OverlapContainer count={cards.length}>
      {cards.map(c => {
        const isHidden = hiddenCards?.includes(c.id) ?? false
        const isHighlight = highlight?.includes(c.id) ?? false
        return <>
          {faceDown
            ? <CardBack key={c.id} card={c} hidden={isHidden} />
          : <CardView key={c.id} card={c} onClick={onCardClick} highlight={isHighlight} />}
        </>
      })}
      {cards.length === 0 && <CardBack card={emptyCard} hidden={true} />}
    </OverlapContainer>
  </div>
};

export default Zone;

