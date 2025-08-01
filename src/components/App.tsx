import React, { useEffect, useState } from 'react';
import PokerDuelGame from '../game/PokerDuelGame';
import type { GameState } from '../game/PokerDuelGame';
import '../styles/game.css';

import Zone from './Zone';
import PileZone from './PileZone';
import CentralZone from './CentralZone';
import FightZone from './FightZone';

const App: React.FC = () => {
  const [game] = useState(() => new PokerDuelGame());
  const [state, setState] = useState<GameState>();

  useEffect(() => {
    setState({ ...game.initialize() });
  }, [game]);

  // @ts-expect-error
  window.game = game;
  // @ts-expect-error
  window.setState = setState;

  if (!state) {
    return (
      <div className="app-loading">
        <span className="loading-text">Loading...</span>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Player 2 Hand */}
      <Zone title="Player 2 Hand" cards={state.players.player2.hand} />

      {/* P2 Face-Down & Fight */}
      <div className="row">
        <div className="flex-1">
          <Zone
            title="P2 Face-Down"
            cards={state.players.player2.faceDownZone}
            faceDown
          />
        </div>
        <div className="flex-1">
          <FightZone
            attack={state.attackZone.filter(() => state.currentPlayerId === 'player2')}
            defense={state.defenseZone.filter(() => state.currentPlayerId === 'player2')}
          />
        </div>
      </div>

      {/* Central & Piles */}
      <div className="row row-start">
        <div className="flex-2">
          <CentralZone
            faceUp={state.central.revealed}
            faceDown={state.central.faceDown}
          />
        </div>
        <div className="flex-1" />
        <div className="pile-flex">
          <PileZone title="Discard" pile={state.discardPile} />
          <PileZone title="Deck" pile={state.deck} faceDown />
        </div>
      </div>

      {/* P1 Fight & Face-Down */}
      <div className="row">
        <div className="flex-1">
          <FightZone
            attack={state.attackZone.filter(() => state.currentPlayerId === 'player1')}
            defense={state.defenseZone.filter(() => state.currentPlayerId === 'player1')}
          />
        </div>
        <div className="flex-1">
          <Zone
            title="P1 Face-Down"
            cards={state.players.player1.faceDownZone}
            faceDown
          />
        </div>
      </div>

      {/* Player 1 Hand */}
      <Zone title="Player 1 Hand" cards={state.players.player1.hand} />
    </div>
  );
};

export default App;

