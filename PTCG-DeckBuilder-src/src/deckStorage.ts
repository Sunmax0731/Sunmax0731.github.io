import type { CardDelta, DeckCard, ManagedDeck } from "./types";

const dbName = "ptcg.localDeckBuilder";
const dbVersion = 1;
const storeName = "settings";
const decksKey = "decks.v1";
const legacyStorageKey = "ptcg.localDeckBuilder.decks.v1";
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

function normalizeDeck(deck: Partial<ManagedDeck>): ManagedDeck | null {
  if (!deck || typeof deck.id !== "string" || typeof deck.name !== "string") {
    return null;
  }
  const now = nowIso();
  return {
    schemaVersion: 1,
    id: deck.id,
    name: deck.name,
    description: deck.description || "",
    createdAt: deck.createdAt || now,
    updatedAt: deck.updatedAt || now,
    cards: sortCards(
      Array.isArray(deck.cards)
        ? deck.cards
            .map((card) => ({
              cardId: Number(card.cardId),
              count: Number(card.count),
              role: card.role || "",
              note: card.note || ""
            }))
            .filter((card) => Number.isInteger(card.cardId) && card.cardId > 0 && Number.isFinite(card.count))
        : []
    ),
    categoryNotes: deck.categoryNotes || {},
    history: Array.isArray(deck.history) ? deck.history : []
  };
}

function normalizeDecks(value: unknown): ManagedDeck[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((deck) => normalizeDeck(deck as Partial<ManagedDeck>)).filter((deck): deck is ManagedDeck => Boolean(deck));
}

function openDeckDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readIndexedDbDecks() {
  const db = await openDeckDb();
  try {
    return await new Promise<unknown>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).get(decksKey);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

async function writeIndexedDbDecks(decks: ManagedDeck[]) {
  const db = await openDeckDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).put(decks, decksKey);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

function loadLegacyDecks(): ManagedDeck[] {
  const raw = localStorage.getItem(legacyStorageKey);
  if (!raw) {
    return [];
  }
  try {
    return normalizeDecks(JSON.parse(raw));
  } catch {
    return [];
  }
}

export async function loadDecks(): Promise<ManagedDeck[]> {
  try {
    const decks = normalizeDecks(await readIndexedDbDecks());
    if (decks.length > 0) {
      return decks;
    }
    const legacyDecks = loadLegacyDecks();
    if (legacyDecks.length > 0) {
      await saveDecks(legacyDecks);
      localStorage.removeItem(legacyStorageKey);
      return legacyDecks;
    }
  } catch {
    return loadLegacyDecks();
  }
  return [];
}

export async function saveDecks(decks: ManagedDeck[]) {
  const normalized = normalizeDecks(decks);
  await writeIndexedDbDecks(normalized);
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
