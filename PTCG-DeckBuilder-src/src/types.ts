export type Locale = "ja" | "en";

export type CardMove = {
  name: string;
  cost: string;
  damage: string;
  effect: string;
};

export type CardAbility = {
  name: string;
  effect: string;
};

export type CardInfo = {
  id: number;
  name: string;
  expansion: string;
  collectionNo: string;
  stage: string;
  rule: string;
  category: string;
  previousStage: string;
  hp: string;
  type: string;
  weakness: string;
  resistance: string;
  retreat: string;
  pdfIndex: {
    tablePage: number;
    tableRow: number;
    imagePage: number;
  };
  abilities: CardAbility[];
  moves: CardMove[];
};

export type DeckCard = {
  cardId: number;
  count: number;
  role?: string;
  note?: string;
};

export type CardDelta = {
  cardId: number;
  count: number;
};

export type DeckHistoryEntry = {
  id: string;
  savedAt: string;
  intent: string;
  added: CardDelta[];
  removed: CardDelta[];
};

export type ManagedDeck = {
  schemaVersion: 1;
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  cards: DeckCard[];
  categoryNotes: Record<string, string>;
  history: DeckHistoryEntry[];
};
