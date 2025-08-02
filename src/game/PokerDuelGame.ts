// PokerDuelGame.ts

/**
 * Base class for game errors
 */
export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameError';
  }
}

/**
 * Indicates that a requested action requires additional input (e.g., target card ID)
 */
export class RequestActionError extends GameError {
  constructor(message: string) {
    super(message);
    this.name = 'RequestActionError';
  }
}

/**
 * Indicates that a card or resource was not found where expected
 */
export class NotFoundError extends GameError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Indicates that the deck is empty when trying to draw
 */
export class DeckEmptyError extends GameError {
  constructor() {
    super('Cannot draw: deck is empty');
    this.name = 'DeckEmptyError';
  }
}

/**
 * Indicates invalid combinations for attack/defense
 */
export class InvalidCombinationError extends GameError {
  constructor() {
    super('Selected cards do not form a valid combination');
    this.name = 'InvalidCombinationError';
  }
}

// Card definitions
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

/**
 * Represents a single playing card
 * @property suit The card's suit
 * @property rank The card's rank
 * @property id Unique identifier for the card
 */
export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

/**
 * State of a single player
 * @property hand Cards in player's hand
 * @property faceDownZone Cards placed face-down
 * @property life Player's life points
 * @property attackBonus Current attack bonus
 */
export interface PlayerState {
  hand: Card[];
  faceDownZone: Card[];
  life: number;
  attackBonus: number;
}

/**
 * State of the central zone
 * @property faceDown Cards not yet revealed
 * @property revealed Cards revealed and available for draw
 */
export interface CentralZone {
  faceDown: Card[];
  revealed: Card[];
}

/**
 * Overall game state
 */
export interface GameState {
  deck: Card[];
  discardPile: Card[];
  central: CentralZone;
  players: {
    player1: PlayerState;
    player2: PlayerState;
  };
  currentPlayerId: 'player1' | 'player2' | null;
  turnCount: number;
  attackZone: Card[];
  defenseZone: Card[];
}

/**
 * Main controller class for Poker Duel game logic
 */
export default class PokerDuelGame {
  public gameState: GameState;
  private static suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  private static ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  private static allowedFaceDownRanks: Rank[] = ['J', 'Q', 'K', 'A'];

  /**
   * Initializes the game controller with empty state
   */
  constructor() {
    this.gameState = {
      deck: [],
      discardPile: [],
      central: { faceDown: [], revealed: [] },
      players: {
        player1: { hand: [], faceDownZone: [], life: 10, attackBonus: 0 },
        player2: { hand: [], faceDownZone: [], life: 10, attackBonus: 0 }
      },
      currentPlayerId: null,
      turnCount: 0,
      attackZone: [],
      defenseZone: []
    };
  }

  /**
   * Creates an ordered deck of 52 cards
   * @returns Array of Card objects
   */
  private createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of PokerDuelGame.suits) {
      for (const rank of PokerDuelGame.ranks) {
        deck.push({ suit, rank, id: `${suit}-${rank}` });
      }
    }
    return deck;
  }

  /**
   * Shuffles an array in place using Fisher–Yates algorithm
   * @param array Array to shuffle
   * @returns The shuffled array
   */
  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Sets up a new game by:
   * - Resetting all zones and player states
   * - Shuffling the deck
   * - Dealing 7 cards alternately to each player
   * - Placing 7 cards face-down in the central zone
   * @returns Initialized GameState
   */
  public initialize(): GameState {
    // Reset discard and central zones
    this.gameState.discardPile = [];
    this.gameState.central.faceDown = [];
    this.gameState.central.revealed = [];
    // Reset attack/defense zones and turn
    this.gameState.attackZone = [];
    this.gameState.defenseZone = [];
    this.gameState.turnCount = 0;
    this.gameState.currentPlayerId = 'player1';

    // Reset each player state
    Object.values(this.gameState.players).forEach((player) => {
      player.hand = [];
      player.faceDownZone = [];
      player.life = 10;
      player.attackBonus = 0;
    });

    // Create and shuffle deck
    let deck = this.createDeck();
    deck = this.shuffle(deck);
    this.gameState.deck = deck;

    // Deal 7 cards to each player alternately
    for (let i = 0; i < 7; i++) {
      this.gameState.players.player1.hand.push(
        this.gameState.deck.shift()!
      );
      this.gameState.players.player2.hand.push(
        this.gameState.deck.shift()!
      );
    }

    // Place next 7 cards face-down in central zone
    this.gameState.central.faceDown = this.gameState.deck.splice(0, 7);

    return this.gameState;
  }

  /**
   * Advances to the next player's turn
   * @returns Updated GameState
   */
  public nextTurn(): GameState {
    this.gameState.currentPlayerId =
      this.gameState.currentPlayerId === 'player1' ? 'player2' : 'player1';
    this.gameState.turnCount += 1;
    return this.gameState;
  }

  /**
   * Draws the top card from the deck into the current player's hand
   * @returns Drawn Card
   * @throws DeckEmptyError if deck is empty
   */
  public drawFromDeck(): Card {
    if (!this.canDrawFromDeck()) throw new DeckEmptyError();
    const card = this.gameState.deck.shift()!;
    this.getCurrentPlayer().hand.push(card);
    return card;
  }

  /**
   * Draws the oldest revealed central card into the current player's hand
   * @returns Drawn Card
   * @throws NotFoundError if no revealed cards
   */
  public drawFromCenter(): Card {
    if (!this.canDrawFromCenter()) throw new NotFoundError('No revealed central cards to draw');
    const card = this.gameState.central.revealed.shift()!;
    this.getCurrentPlayer().hand.push(card);
    return card;
  }

  /**
   * Reveals a random face-down central card
   * @returns Revealed Card
   * @throws NotFoundError if no face-down cards
   */
  public revealCentralCard(): Card {
    if (!this.canRevealCentralCard()) throw new NotFoundError('No face-down central cards to reveal');
    const idx = Math.floor(Math.random() * this.gameState.central.faceDown.length);
    const [card] = this.gameState.central.faceDown.splice(idx, 1);
    this.gameState.central.revealed.push(card);
    return card;
  }

  /** Checks if deck has cards */
  public canDrawFromDeck(): boolean {
    return this.gameState.deck.length > 0;
  }

  /** Checks if central has revealed cards */
  public canDrawFromCenter(): boolean {
    return this.gameState.central.revealed.length > 0;
  }

  /** Checks if central has face-down cards */
  public canRevealCentralCard(): boolean {
    return this.gameState.central.faceDown.length > 0;
  }

  /**
   * Places a card from hand face-down into its faceDownZone
   * @param cardId ID of card to place
   * @throws NotFoundError if card not in hand
   * @throws GameError if rank not allowed
   */
  public placeCardFaceDown(cardId: string): void {
    const player = this.getCurrentPlayer();
    const idx = player.hand.findIndex(c => c.id === cardId);
    if (idx === -1) throw new NotFoundError(`Card ${cardId} not in hand`);
    const card = player.hand[idx];
    if (!PokerDuelGame.allowedFaceDownRanks.includes(card.rank)) {
      throw new GameError(`Card rank ${card.rank} cannot be placed face-down`);
    }
    player.hand.splice(idx, 1);
    player.faceDownZone.push(card);
  }

  /**
   * Activates a face-down card; some cards require a targetId
   * @param cardId ID of face-down card to activate
   * @param targetId Optional ID of target card for certain effects
   * @throws RequestActionError if targetId missing
   * @throws NotFoundError if cardId invalid
   */
  public activateFaceDownCard(cardId: string, targetId?: string): void {
    const player = this.getCurrentPlayer();
    const idx = player.faceDownZone.findIndex(c => c.id === cardId);
    if (idx === -1) throw new NotFoundError(`Card ${cardId} not face-down`);
    const [card] = player.faceDownZone.splice(idx, 1);
    switch (card.rank) {
      case 'J': this.activateJack(card, player); break;
      case 'A': this.activateAce(card, player); break;
      case 'K':
        if (!targetId) throw new RequestActionError('Target card ID required for King effect');
        this.activateKing(card, player, targetId);
        break;
      case 'Q':
        if (!targetId) throw new RequestActionError('Target card ID required for Queen effect');
        this.activateQueen(card, targetId);
        break;
      default:
        throw new GameError(`Effect for rank ${card.rank} not implemented`);
    }
  }

  /** Jack effect: +2 attack bonus */
  private activateJack(card: Card, player: PlayerState): void {
    player.attackBonus += 2;
    this.gameState.discardPile.push(card);
  }

  /** Ace effect: discard hand, draw equal number, discard the Ace */
  private activateAce(card: Card, player: PlayerState): void {
    if (!this.canDrawFromDeck()) throw new DeckEmptyError();
    const count = player.hand.length;
    this.gameState.discardPile.push(...player.hand);
    player.hand = [];
    for (let i = 0; i < count && this.canDrawFromDeck(); i++) {
      player.hand.push(this.gameState.deck.shift()!);
    }
    this.gameState.discardPile.push(card);
  }

  /** King effect: retrieve a card from discard pile */
  private activateKing(card: Card, player: PlayerState, targetId: string): void {
    if (this.gameState.discardPile.length === 0) throw new NotFoundError('Discard pile is empty');
    const idx = this.gameState.discardPile.findIndex(c => c.id === targetId);
    if (idx === -1) throw new NotFoundError(`Card ${targetId} not in discard pile`);
    const [chosen] = this.gameState.discardPile.splice(idx, 1);
    player.hand.push(chosen);
    this.gameState.discardPile.push(card);
  }

  /** Queen effect: force opponent to discard a card */
  private activateQueen(card: Card, targetId: string): void {
    const opponent = this.getOpponent();
    if (opponent.hand.length === 0) throw new NotFoundError('Opponent has no cards');
    const idx = opponent.hand.findIndex(c => c.id === targetId);
    if (idx === -1) throw new NotFoundError(`Card ${targetId} not in opponent hand`);
    const [chosen] = opponent.hand.splice(idx, 1);
    this.gameState.discardPile.push(chosen, card);
  }

  /** Applies a suit effect by discarding two cards of same suit
   * @param cardIds IDs of two cards to discard
   * @param targetId Optional ID for Clubs effect
   * @throws RequestActionError if parameters missing or invalid
   * @throws InvalidCombinationError if suits differ
   */
  public applySuitEffect(cardIds: string[], targetId?: string): void {
    if (cardIds.length !== 2) throw new RequestActionError('Two card IDs required for suit effect');
    const player = this.getCurrentPlayer();
    const cards = this.extractCardsFromHand(player, cardIds);
    if (cards[0].suit !== cards[1].suit) {
      player.hand.push(...cards);
      throw new InvalidCombinationError();
    }
    this.gameState.discardPile.push(...cards);
    switch (cards[0].suit) {
      case 'hearts': this.effectHearts(player); break;
      case 'diamonds': this.effectDiamonds(player); break;
      case 'spades': this.effectSpades(); break;
      case 'clubs':
        if (!targetId) throw new RequestActionError('Target card ID required for Clubs effect');
        this.effectClubs(player, targetId);
        break;
    }
  }

  /** +2 life to current player */
  private effectHearts(player: PlayerState): void {
    player.life += 2;
  }

  /** Draw 2 cards from deck */
  private effectDiamonds(player: PlayerState): void {
    for (let i = 0; i < 2 && this.canDrawFromDeck(); i++) {
      player.hand.push(this.gameState.deck.shift()!);
    }
  }

  /** Both players lose 2 life, minimum 1 */
  private effectSpades(): void {
    Object.values(this.gameState.players).forEach(p => {
      p.life = Math.max(1, p.life - 2);
    });
  }

  /** Discard one card from player's hand */
  private effectClubs(player: PlayerState, targetId: string): void {
    const idx = player.hand.findIndex(c => c.id === targetId);
    if (idx === -1) throw new NotFoundError(`Card ${targetId} not in hand`);
    const [chosen] = player.hand.splice(idx, 1);
    this.gameState.discardPile.push(chosen);
  }

  /** Moves cards from hand to attack zone after validation
   * @param cardIds IDs of cards to attack with
   * @throws RequestActionError if too many cards
   * @throws InvalidCombinationError if invalid combo
   */
  public attack(cardIds: string[]): void {
    if (cardIds.length > 5) throw new RequestActionError('Up to 5 cards allowed for attack');
    const player = this.getCurrentPlayer();
    const cards = this.extractCardsFromHand(player, cardIds);
    if (!this.isExactCombo(cards)) {
      player.hand.push(...cards);
      throw new InvalidCombinationError();
    }
    this.gameState.attackZone = cards;
  }

  /** Moves cards from hand to defense zone after validation
   * @param cardIds IDs of cards to defend with
   * @throws RequestActionError if too many cards
   * @throws InvalidCombinationError if invalid combo
   */
  public defend(cardIds: string[]): void {
    if (cardIds.length > 5) throw new RequestActionError('Up to 5 cards allowed for defense');
    const player = this.getCurrentPlayer();
    const cards = this.extractCardsFromHand(player, cardIds);
    if (!this.isExactCombo(cards)) {
      player.hand.push(...cards);
      throw new InvalidCombinationError();
    }
    this.gameState.defenseZone = cards;
  }

  /** Calculates damage, applies to opponent, clears zones and resets bonus
   * @returns Damage dealt
   */
  public resolveDuel(): number {
    const attacker = this.getCurrentPlayer();
    const defender = this.getOpponent();
    const attackValue = this.getComboValue(this.gameState.attackZone) + attacker.attackBonus;
    const defenseValue = this.getComboValue(this.gameState.defenseZone);
    const damage = Math.max(0, attackValue - defenseValue);
    if (damage > 0) defender.life = Math.max(0, defender.life - damage);
    this.gameState.discardPile.push(...this.gameState.attackZone, ...this.gameState.defenseZone);
    this.gameState.attackZone = [];
    this.gameState.defenseZone = [];
    attacker.attackBonus = 0;
    return damage;
  }

  /** Helper: extract cards by IDs from player's hand */
  private extractCardsFromHand(player: PlayerState, cardIds: string[]): Card[] {
    return cardIds.map(id => {
      const idx = player.hand.findIndex(c => c.id === id);
      if (idx === -1) throw new NotFoundError(`Card ${id} not in hand`);
      return player.hand.splice(idx, 1)[0];
    });
  }

  /** Helper: checks if cards form an exact poker combo */
  private isExactCombo(cards: Card[]): boolean {
    const combo = this.getBestCombo(cards);
    return combo !== null && combo.cards.length === cards.length;
  }

  /** Helper: finds best combo subset and value */
  private getBestCombo(cards: Card[]): { value: number; cards: Card[] } | null {
    if (cards.length === 0) return null;
    const combos = this.getAllSubsets(cards, 5)
      .map(sub => ({ value: this.getComboValue(sub), cards: sub }))
      .filter(c => c.value > 0);
    return combos.length ? combos.reduce((a, b) => a.value >= b.value ? a : b) : null;
  }

  /** Helper: generates all subsets up to maxLen */
  private getAllSubsets<T>(arr: T[], maxLen: number): T[][] {
    const res: T[][] = [];
    const bt = (i: number, path: T[]) => {
      if (path.length > 0 && path.length <= maxLen) res.push([...path]);
      if (path.length >= maxLen) return;
      for (let j = i; j < arr.length; j++) {
        path.push(arr[j]); bt(j + 1, path); path.pop();
      }
    };
    bt(0, []);
    return res;
  }

  /** Helper: evaluates combo value by poker rules */
  private getComboValue(cards: Card[]): number {
    if (cards.length === 0) return 0;
    const ranks = cards.map(c => c.rank);
    const suits = cards.map(c => c.suit);
    const countMap = new Map<string, number>();
    ranks.forEach(r => countMap.set(r, (countMap.get(r) || 0) + 1));
    const counts = Array.from(countMap.values()).sort((a, b) => b - a);
    const flush = suits.every(s => s === suits[0]);
    const nums = ranks.map(r => this.rankToNumber(r)).sort((a, b) => a - b);
    const straight = nums.every((v, i) => i === 0 || v === nums[i - 1] + 1);
    if (straight && flush) return 12;
    if (counts[0] === 4) return 8;
    if (counts[0] === 3 && counts[1] === 2) return 7;
    if (flush) return 6;
    if (straight) return 5;
    if (counts[0] === 3) return 4;
    if (counts[0] === 2 && counts[1] === 2) return 3;
    if (counts[0] === 2) return 2;
    return 1;
  }

  /** Helper: converts rank string to numeric value */
  private rankToNumber(rank: Rank): number {
    if (rank === 'J') return 11;
    if (rank === 'Q') return 12;
    if (rank === 'K') return 13;
    if (rank === 'A') return 14;
    return parseInt(rank, 10);
  }

  /** Helper: retrieves current player's state */
  private getCurrentPlayer(): PlayerState {
    const id = this.gameState.currentPlayerId;
    if (!id) throw new GameError('Current player undefined');
    return this.gameState.players[id];
  }

  /** Helper: retrieves opponent's state */
  private getOpponent(): PlayerState {
    const id = this.gameState.currentPlayerId;
    if (!id) throw new GameError('Current player undefined');
    const oppId = id === 'player1' ? 'player2' : 'player1';
    return this.gameState.players[oppId];
  }
}
