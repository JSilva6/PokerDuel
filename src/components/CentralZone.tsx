import React from 'react';
import type { Card as CardType } from '../game/PokerDuelGame';
import { OverlapContainer } from './OverlapContainer';
import { CardView, CardBack } from './Card';
import '../styles/game.css';

/** Zona combinada para as cartas centrais (reveladas e viradas) */
const CentralZone: React.FC<{
  faceUp: CardType[];
  faceDown: CardType[];
}> = ({ faceUp, faceDown }) => (
  <div className="zone">
    <div className="zone-header">
      <span className="zone-title">Central (Reveladas)</span>
      <span className="zone-count">↑{faceUp.length} ↓{faceDown.length}</span>
    </div>
    <OverlapContainer count={faceUp.length + faceDown.length}>
      {faceUp.map(c => <CardView key={c.id} card={c} />)}
      {faceDown.map(c => <CardBack key={c.id} card={c} />)}
    </OverlapContainer>
  </div>
);

export default CentralZone;

