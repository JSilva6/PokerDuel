import React, { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';

import PokerDuelGame from '../game/PokerDuelGame';
import type { Card, GameState } from '../game/PokerDuelGame';
import '../styles/game.css';

import Zone from './Zone';
import PileZone from './PileZone';
import CentralZone from './CentralZone';
import FightZone from './FightZone';
import FloatingWindow from '../devComponents/FloatingWindow';

type FaceDownCheckResult =
  | { allowed: true; selectedCard: Card }
  | { allowed: false; selectedCard: null };

const App: React.FC = () => {
  const [game] = useState(() => new PokerDuelGame());
  const [state, setState] = useState<GameState>();
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())

  const selectCard = useCallback((card: Card) => {
    const setClone = new Set(selectedCards)
    if(setClone.has(card.id)) setClone.delete(card.id)
    else setClone.add(card.id)
    setSelectedCards(setClone)
  }, [selectedCards, setSelectedCards]);

  const faceDownAllowed = useCallback((): FaceDownCheckResult => {
    if (selectedCards.size !== 1) return { allowed: false, selectedCard: null };

    const selectedId = Array.from(selectedCards)[0];
    const selectedCard = state?.players.player1.hand.find(c => c.id === selectedId) ?? null;
    if (!selectedCard) return { allowed: false, selectedCard: null };

    const isAllowed = PokerDuelGame.allowedFaceDownRanks.includes(selectedCard.rank);
    if (!isAllowed) return { allowed: false, selectedCard: null };

    return { allowed: true, selectedCard };
  }, [selectedCards, state]);


  const placeFaceDown = useCallback(() => {
    const {allowed, selectedCard} = faceDownAllowed()
    if(allowed) {
      console.log(selectedCard)
      alert('opa')
    }
  }, [faceDownAllowed])


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
      <FloatingWindow width={300} height={200} initialX={100} initialY={150} title="Comandos">
        {selectedCards.size >= 1 && <>
          {faceDownAllowed().allowed && <Button variant="contained" onClick={placeFaceDown}>Place Face-Down</Button>}
        </>}
      </FloatingWindow>
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
      <Zone title="Player 1 Hand" cards={state.players.player1.hand} onCardClick={selectCard} highlight={Array.from(selectedCards)}/>
    </div>
  );
};

export default App;

