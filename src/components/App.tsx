// src/components/App.tsx
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import PokerDuelGame from '../game/PokerDuelGame';
import type { Card, GameState } from '../game/PokerDuelGame';

// Suit icons with custom colors
type SuitIcon = { symbol: string; colorClass: string };
const SuitIcons: Record<string, SuitIcon> = {
  hearts:   { symbol: '♥', colorClass: 'text-red-500' },
  diamonds: { symbol: '♦', colorClass: 'text-yellow-600' },
  clubs:    { symbol: '♣', colorClass: 'text-blue-800' },
  spades:   { symbol: '♠', colorClass: 'text-black' },
};

/** Renders the front of a playing card */
const CardView: React.FC<{ card: Card }> = ({ card }) => {
  const { symbol, colorClass } = SuitIcons[card.suit];
  return (
    <div className="w-14 h-20 bg-white rounded-lg border border-gray-700 shadow-md flex-shrink-0 flex flex-col items-center justify-center">
      <span className={`${colorClass} text-xl`}>{symbol}</span>
      <span className={`${colorClass} font-bold mt-1`}>{card.rank}</span>
    </div>
  );
};

/** Renders the back of a playing card; styled via .card-back */
const CardBack: React.FC = () => (
  <div className="card-back w-14 h-20 flex-shrink-0"></div>
);

/**
 * Adjusts spacing: 4px gap if fits, otherwise negative overlap
 */
const OverlapContainer: React.FC<{ count: number; children: React.ReactNode }> = ({ count, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [gap, setGap] = useState(4);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const avail = el.clientWidth;
    const cardW = 56;
    const needed = count * cardW;
    if (needed <= avail) {
      setGap(4);
    } else {
      const overlap = Math.ceil((needed - avail) / (count - 1));
      setGap(-Math.min(overlap, cardW - 8));
    }
  }, [count]);

  return (
    <div ref={ref} className="flex overflow-hidden w-full">
      {React.Children.map(children, (c, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : `${gap}px` }}>
          {c}
        </div>
      ))}
    </div>
  );
};

/** Generic zone for a list of cards */
const Zone: React.FC<{ title: string; cards: Card[]; faceDown?: boolean }> = ({ title, cards, faceDown }) => (
  <div className="w-full bg-gray-800 p-3 rounded-lg shadow-inner max-w-full">
    <div className="flex justify-between items-center mb-2">
      <span className="text-white font-bold">{title}</span>
      <span className="text-gray-400">{cards.length}</span>
    </div>
    <OverlapContainer count={cards.length}>
      {cards.map(c => (faceDown ? <CardBack key={c.id}/> : <CardView key={c.id} card={c}/>))}
    </OverlapContainer>
  </div>
);

/** Zone showing active cards (attack or defense) */
const FightZone: React.FC<{ attack: Card[]; defense: Card[] }> = ({ attack, defense }) => {
  const cards = attack.length ? attack : defense;
  const title = attack.length ? 'Attack Zone' : defense.length ? 'Defense Zone' : 'Fight Zone';
  return <Zone title={title} cards={cards} />;
};

/** Central zone grouping face-up then face-down */
const CentralZone: React.FC<{ faceUp: Card[]; faceDown: Card[] }> = ({ faceUp, faceDown }) => (
  <div className="w-full bg-gray-800 p-3 rounded-lg shadow-inner">
    <div className="flex justify-between items-center mb-2">
      <span className="text-white font-bold">Central</span>
      <span className="text-gray-400">↑{faceUp.length} ↓{faceDown.length}</span>
    </div>
    <OverlapContainer count={faceUp.length}>
      {faceUp.map(c => <CardView key={c.id} card={c}/>)}
    </OverlapContainer>
    <OverlapContainer count={faceDown.length}>
      {faceDown.map(c => <CardBack key={c.id}/>)}
    </OverlapContainer>
  </div>
);

/** Pile zone showing only top card, stacked offsets */
const PileZone: React.FC<{ title: string; pile: Card[]; faceDown?: boolean }> = ({ title, pile, faceDown }) => {
  const count = pile.length;
  const offset = Math.floor(count / 6);
  const offs = Array.from({ length: offset }, (_, i) => 2 + i * 2);
  const top = pile[0];
  return (
    <div className="bg-gray-800 p-3 rounded-lg flex-shrink-0" style={{ width: 80 }}>
      <div className="flex justify-center items-center mb-2">
        <span className="text-white font-bold">{title}</span>
      </div>
      <div className="relative mx-auto" style={{ width: 56, height: 80, top: (-offset*2), left: -offset*2 }}>
        {offs.reverse().map(off => (
          <div key={off} style={{ position: 'absolute', top: off, left: off, zIndex: 0 }}>
            {top ? (faceDown ? <CardBack/> : <CardView card={top}/>) : <div style={{ width:56, height:80 }}/>}
          </div>
        ))}
        <div style={{ position: 'absolute', top:0, left:0, zIndex:1 }}>
          {top ? (faceDown ? <CardBack/> : <CardView card={top}/>) : <div style={{ width:56, height:80 }}/>}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [game] = useState(() => new PokerDuelGame());
  const [state, setState] = useState<GameState>();

  useEffect(() => {
    setState({ ...game.initialize() });
  }, [game]);

  // @ts-expect-error
  window.game = game
  // @ts-expect-error
  window.setState = setState

  if (!state) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <span className="text-white">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen p-3 text-white flex flex-col gap-6 max-w-full">
      {/* Row1: Player2 Hand */}
      <Zone title="Player 2 Hand" cards={state.players.player2.hand} />

      {/* Row2: P2 FaceDown & Fight */}
      <div className="flex flex-row gap-4 w-full max-w-full">
        <div className="flex-1"><Zone title="P2 Face-Down" cards={state.players.player2.faceDownZone} faceDown /></div>
        <div className="flex-1"><FightZone attack={state.attackZone.filter(() => state.currentPlayerId==='player2')} defense={state.defenseZone.filter(() => state.currentPlayerId==='player2')}/></div>
      </div>

      {/* Row3: Central & Piles */}
      <div className="flex flex-row gap-4 w-full items-start max-w-full">
        <div className="flex-2"><CentralZone faceUp={state.central.revealed} faceDown={state.central.faceDown}/></div>
        <div className="flex-1"/>
        <div className="flex-none flex flex-row items-end gap-4">
          <PileZone title="Discard" pile={state.discardPile} />
          <PileZone title="Deck" pile={state.deck} faceDown />
        </div>
      </div>

      {/* Row4: P1 Fight & FaceDown */}
      <div className="flex flex-row gap-4 w-full max-w-full">
        <div className="flex-1"><FightZone attack={state.attackZone.filter(() => state.currentPlayerId==='player1')} defense={state.defenseZone.filter(() => state.currentPlayerId==='player1')}/></div>
        <div className="flex-1"><Zone title="P1 Face-Down" cards={state.players.player1.faceDownZone} faceDown /></div>
      </div>

      {/* Row5: Player1 Hand */}
      <Zone title="Player 1 Hand" cards={state.players.player1.hand} />
    </div>
  );
};

export default App;

