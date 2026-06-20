import type { CardDelta, DeckCard, ManagedDeck } from "./types";

const storageKey = "ptcg.localDeckBuilder.decks.v1";
const selectedKey = "ptcg.localDeckBuilder.selectedDeck.v1";

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDeck(name: string, cards: DeckCard[] = []): ManagedDeck {
  const now = nowIso();
  return {
    schemaVersion: 1,
    id: uid("deck"),
    name,
    description: "",
    createdAt: now,
    updatedAt: now,
    cards: sortCards(cards),
    categoryNotes: {},
    history: []
  };
}

export function sortCards(cards: DeckCard[]) {
  return [...cards].filter((card) => card.count > 0);
}

export function loadDecks(): ManagedDeck[] {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return [];
  }
  try {
    const decks = JSON.parse(raw) as ManagedDeck[];
    return Array.isArray(decks) ? decks : [];
  } catch {
    return [];
  }
}

export function saveDecks(decks: ManagedDeck[]) {
  localStorage.setItem(storageKey, JSON.stringify(decks, null, 2));
}

export function loadSelectedDeckId() {
  return localStorage.getItem(selectedKey);
}

export function saveSelectedDeckId(id: string) {
  localStorage.setItem(selectedKey, id);
}

export function diffCards(before: DeckCard[], after: DeckCard[]) {
  const beforeMap = new Map(before.map((card) => [card.cardId, card.count]));
  const afterMap = new Map(after.map((card) => [card.cardId, card.count]));
  const ids = new Set([...beforeMap.keys(), ...afterMap.keys()]);
  const added: CardDelta[] = [];
  const removed: CardDelta[] = [];

  for (const id of ids) {
    const delta = (afterMap.get(id) || 0) - (beforeMap.get(id) || 0);
    if (delta > 0) {
      added.push({ cardId: id, count: delta });
    }
    if (delta < 0) {
      removed.push({ cardId: id, count: Math.abs(delta) });
    }
  }

  return { added, removed };
}

export function makeHistoryEntry(before: DeckCard[], after: DeckCard[], intent: string) {
  const { added, removed } = diffCards(before, after);
  return {
    id: uid("change"),
    savedAt: nowIso(),
    intent,
    added,
    removed
  };
}

export function expandedCsv(cards: DeckCard[]) {
  const rows = cards.filter((card) => card.count > 0).flatMap((card) => Array.from({ length: card.count }, () => String(card.cardId)));
  return `${rows.join("\n")}\n`;
}

export function cardsFromCsv(text: string): DeckCard[] {
  const counts = new Map<number, number>();
  const order: number[] = [];
  for (const token of text.split(/[\r\n,]+/).map((value) => value.trim()).filter(Boolean)) {
    const cardId = Number(token);
    if (!Number.isInteger(cardId) || cardId < 1) {
      continue;
    }
    if (!counts.has(cardId)) {
      order.push(cardId);
    }
    counts.set(cardId, (counts.get(cardId) || 0) + 1);
  }
  return order.map((cardId) => ({ cardId, count: counts.get(cardId) || 0 })).filter((card) => card.count > 0);
}

export function downloadText(filename: string, text: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
