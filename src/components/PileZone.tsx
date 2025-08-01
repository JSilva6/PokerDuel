import React from 'react';
import type { Card as CardType } from '../game/PokerDuelGame';
import { CardView, CardBack } from './Card';
import '../styles/game.css';

/** Zona para exibir apenas o topo de uma pilha */
const PileZone: React.FC<{
  title: string;
  pile: CardType[];
  faceDown?: boolean;
}> = ({ title, pile, faceDown }) => {
  const count = pile.length;
  const offset = Math.floor(count / 6);
  const offs = Array.from({ length: offset }, (_, i) => 2 + i * 2);
  const top = pile[0];

  return (
    <div className="pile-zone" style={{ width: 80 }}>
      <div className="pile-header">
        <span className="pile-title">{title}</span>
      </div>
      <div style={{ position: 'relative', width: 56, height: 80, top: -offset * 2, left: -offset * 2 }}>
        {offs.reverse().map(off => (
          <div key={off} style={{ position: 'absolute', top: off, left: off, zIndex: 0 }}>
            {top
              ? (faceDown ? <CardBack /> : <CardView card={top} />)
              : <div style={{ width: 56, height: 80 }} />
            }
          </div>
        ))}
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
          {top
            ? (faceDown ? <CardBack /> : <CardView card={top} />)
            : <div style={{ width: 56, height: 80 }} />
          }
        </div>
      </div>
    </div>
  );
};

export default PileZone;

