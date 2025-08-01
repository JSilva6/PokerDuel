import React from 'react';
import type { Card as CardType } from '../game/PokerDuelGame';
import Zone from './Zone';

/** Zona de combate, mostrando ataque e defesa lado a lado */
const FightZone: React.FC<{
  attack: CardType[];
  defense: CardType[];
}> = ({ attack, defense }) => (
  <div className="row">
    <Zone title="Attack Zone" cards={attack} />
    <Zone title="Defense Zone" cards={defense} />
  </div>
);

export default FightZone;

