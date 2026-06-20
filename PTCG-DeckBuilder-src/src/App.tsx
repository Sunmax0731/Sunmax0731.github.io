import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode
} from "react";
import {
  Copy,
  Download,
  FileText,
  GripHorizontal,
  History,
  Languages,
  LayoutGrid,
  List,
  MinusCircle,
  Plus,
  PlusCircle,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  X
} from "lucide-react";

import CardArt from "./CardArt";
import {
  cardsFromCsv,
  createDeck,
  downloadText,
  expandedCsv,
  loadDecks,
  loadSelectedDeckId,
  makeHistoryEntry,
  saveDecks,
  saveSelectedDeckId,
  sortCards
} from "./deckStorage";
import { loadDataZip, revokeZipDataBundle, type ZipDataBundle } from "./dataZip";
import { defaultLocale, t } from "./i18n";
import type { CardInfo, DeckCard, Locale, ManagedDeck } from "./types";

type ViewMode = "list" | "grid";
type ModalMode = "policy" | "history" | null;
type SortKey =
  | "idAsc"
  | "idDesc"
  | "nameAsc"
  | "expansionAsc"
  | "collectionNoAsc"
  | "stageAsc"
  | "categoryAsc"
  | "typeAsc"
  | "hpAsc"
  | "hpDesc"
  | "weaknessAsc"
  | "resistanceAsc"
  | "retreatAsc"
  | "movesAsc"
  | "abilitiesAsc"
  | "countDesc";
type ColumnKey =
  | "id"
  | "name"
  | "count"
  | "expansion"
  | "collectionNo"
  | "stage"
  | "rule"
  | "category"
  | "previousStage"
  | "hp"
  | "type"
  | "weakness"
  | "resistance"
  | "retreat"
  | "abilities"
  | "moves";

type ColumnDef = {
  key: ColumnKey;
  labelKey?: string;
  label?: string;
  className?: string;
  width: string;
  render: (card: CardInfo, count: number) => string | ReactNode;
};

const appBaseUrl = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

function cardName(cardById: Map<number, CardInfo>, id: number) {
  return cardById.get(id)?.name || `Card ${id}`;
}

function isBasicEnergy(card?: CardInfo) {
  if (!card) {
    return false;
  }
  return card.stage.toLowerCase().includes("basic energy") || card.stage.includes("基本エネルギー");
}

function hpNumber(card: CardInfo) {
  const parsed = Number.parseInt(card.hp, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function typeValue(card: CardInfo) {
  return card.type || "-";
}

function textOrDash(value: string) {
  return value || "-";
}

function moveSummary(card: CardInfo) {
  if (card.moves.length === 0) {
    return "-";
  }
  return card.moves.map((move) => [move.name, move.damage].filter(Boolean).join(" ")).filter(Boolean).join(" / ");
}

function abilitySummary(card: CardInfo) {
  if (card.abilities.length === 0) {
    return "-";
  }
  return card.abilities.map((ability) => ability.name).filter(Boolean).join(" / ");
}

function moveSearchText(card: CardInfo) {
  return card.moves.map((move) => [move.name, move.cost, move.damage, move.effect].join(" ")).join(" ");
}

function abilitySearchText(card: CardInfo) {
  return card.abilities.map((ability) => [ability.name, ability.effect].join(" ")).join(" ");
}

function uniqueValues(cards: CardInfo[], getter: (card: CardInfo) => string) {
  const values = new Set(cards.map((card) => getter(card) || "-"));
  return [...values].sort((a, b) => a.localeCompare(b));
}

function cardDeckCount(cards: DeckCard[] | undefined, cardId: number) {
  return cards?.find((item) => item.cardId === cardId)?.count || 0;
}

function sameNameCount(cards: DeckCard[], cardById: Map<number, CardInfo>, targetCard: CardInfo, excludeCardId?: number) {
  return cards.reduce((sum, deckCard) => {
    const card = cardById.get(deckCard.cardId);
    if (!card || deckCard.cardId === excludeCardId) {
      return sum;
    }
    return card.name === targetCard.name ? sum + deckCard.count : sum;
  }, 0);
}

function maxCopiesForCard(card: CardInfo) {
  return isBasicEnergy(card) ? 60 : 4;
}

function setCardCount(cards: DeckCard[], cardId: number, count: number, insertIndex?: number): DeckCard[] {
  const next = cards.map((card) => ({ ...card }));
  const index = next.findIndex((card) => card.cardId === cardId);
  if (count <= 0) {
    return index >= 0 ? next.filter((card) => card.cardId !== cardId) : next;
  }
  if (index >= 0) {
    next[index] = { ...next[index], count };
    return next;
  }
  const item = { cardId, count };
  if (insertIndex == null || insertIndex < 0 || insertIndex > next.length) {
    next.push(item);
  } else {
    next.splice(insertIndex, 0, item);
  }
  return next;
}

function setCardMeta(cards: DeckCard[], cardId: number, field: "role" | "note", value: string): DeckCard[] {
  const exists = cards.some((card) => card.cardId === cardId);
  const base = exists ? cards : setCardCount(cards, cardId, 1);
  return base.map((card) => (card.cardId === cardId ? { ...card, [field]: value } : card));
}

function cloneDeck(deck: ManagedDeck): ManagedDeck {
  const now = new Date().toISOString();
  return {
    ...deck,
    id: `deck-${Date.now().toString(36)}`,
    name: `${deck.name} copy`,
    createdAt: now,
    updatedAt: now,
    history: []
  };
}

function deckTotal(deck?: ManagedDeck | null) {
  return (deck?.cards || []).reduce((sum, card) => sum + card.count, 0);
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => defaultLocale());
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [zipBundle, setZipBundle] = useState<ZipDataBundle | null>(null);
  const [zipDragActive, setZipDragActive] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [decks, setDecks] = useState<ManagedDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [draft, setDraft] = useState<ManagedDeck | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expansionFilter, setExpansionFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [ruleFilter, setRuleFilter] = useState("all");
  const [weaknessFilter, setWeaknessFilter] = useState("all");
  const [resistanceFilter, setResistanceFilter] = useState("all");
  const [retreatFilter, setRetreatFilter] = useState("all");
  const [moveQuery, setMoveQuery] = useState("");
  const [abilityQuery, setAbilityQuery] = useState("");
  const [hpMin, setHpMin] = useState("");
  const [hpMax, setHpMax] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("idAsc");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [changeIntent, setChangeIntent] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [topPanePercent, setTopPanePercent] = useState(48);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(["id", "name", "category", "type", "hp", "abilities", "count"]);
  const [visibleGridFields, setVisibleGridFields] = useState<ColumnKey[]>([
    "id",
    "expansion",
    "collectionNo",
    "category",
    "stage",
    "type",
    "hp",
    "abilities",
    "moves",
    "count"
  ]);
  const [columnMenu, setColumnMenu] = useState<{ x: number; y: number } | null>(null);
  const [gridMenu, setGridMenu] = useState<{ x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const importCsvRef = useRef<HTMLInputElement | null>(null);
  const importZipRef = useRef<HTMLInputElement | null>(null);
  const splitRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (zipBundle) {
      setCards(zipBundle.cards[locale]);
      setLoading(false);
      setError("");
      return;
    }
    if (appBaseUrl !== "/") {
      setCards([]);
      setLoading(false);
      setError(t(locale, "zipRequired"));
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/cards?lang=${locale}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        if (!response.headers.get("content-type")?.includes("application/json")) {
          throw new Error(t(locale, "zipRequired"));
        }
        return response.json();
      })
      .then((data: CardInfo[]) => {
        if (!cancelled) {
          setCards(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [locale, zipBundle]);

  useEffect(() => () => revokeZipDataBundle(zipBundle), [zipBundle]);

  useEffect(() => {
    const storedDecks = loadDecks();
    if (storedDecks.length > 0) {
      const selected = loadSelectedDeckId() || storedDecks[0].id;
      setDecks(storedDecks);
      setSelectedDeckId(storedDecks.some((deck) => deck.id === selected) ? selected : storedDecks[0].id);
      return;
    }
    if (appBaseUrl !== "/") {
      const initial = createDeck("deck_v0");
      setDecks([initial]);
      setSelectedDeckId(initial.id);
      saveDecks([initial]);
      return;
    }
    fetch("/api/sample-deck")
      .then((response) => response.json())
      .then((sample: { cards: DeckCard[] }) => {
        const initial = createDeck(t(locale, "sampleDeck"), sample.cards);
        setDecks([initial]);
        setSelectedDeckId(initial.id);
        saveDecks([initial]);
      })
      .catch(() => {
        const initial = createDeck("deck_v0");
        setDecks([initial]);
        setSelectedDeckId(initial.id);
        saveDecks([initial]);
      });
  }, []);

  useEffect(() => {
    const selected = decks.find((deck) => deck.id === selectedDeckId) || null;
    setDraft(selected ? structuredClone(selected) : null);
    if (selected) {
      saveSelectedDeckId(selected.id);
    }
  }, [decks, selectedDeckId]);

  useEffect(() => {
    if (!columnMenu && !gridMenu) {
      return;
    }
    const close = () => {
      setColumnMenu(null);
      setGridMenu(null);
    };
    window.addEventListener("click", close);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("resize", close);
    };
  }, [columnMenu, gridMenu]);

  const cardById = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);
  const columnDefs = useMemo<ColumnDef[]>(
    () => [
      { key: "id", labelKey: "cardId", className: "mono", width: "64px", render: (card) => String(card.id) },
      { key: "name", labelKey: "name", className: "cardTitle", width: "minmax(180px, 1.3fr)", render: (card) => card.name },
      { key: "expansion", labelKey: "expansion", width: "110px", render: (card) => textOrDash(card.expansion) },
      { key: "collectionNo", labelKey: "collectionNo", width: "120px", render: (card) => textOrDash(card.collectionNo) },
      { key: "stage", labelKey: "stage", width: "minmax(130px, 1fr)", render: (card) => textOrDash(card.stage) },
      { key: "rule", labelKey: "rule", width: "minmax(110px, 0.8fr)", render: (card) => textOrDash(card.rule) },
      { key: "category", labelKey: "category", width: "minmax(120px, 0.9fr)", render: (card) => textOrDash(card.category) },
      { key: "previousStage", labelKey: "previousStage", width: "110px", render: (card) => textOrDash(card.previousStage) },
      { key: "hp", label: "HP", width: "58px", render: (card) => textOrDash(card.hp) },
      { key: "type", labelKey: "type", width: "90px", render: (card) => typeValue(card) },
      { key: "weakness", labelKey: "weakness", width: "92px", render: (card) => textOrDash(card.weakness) },
      { key: "resistance", labelKey: "resistance", width: "92px", render: (card) => textOrDash(card.resistance) },
      { key: "retreat", labelKey: "retreat", width: "74px", render: (card) => textOrDash(card.retreat) },
      { key: "abilities", labelKey: "abilities", width: "minmax(170px, 1.2fr)", render: (card) => abilitySummary(card) },
      { key: "moves", labelKey: "moves", width: "minmax(170px, 1.2fr)", render: (card) => moveSummary(card) },
      { key: "count", labelKey: "count", width: "72px", render: (_card, count) => <span className="countPill">{count}</span> }
    ],
    []
  );
  const visibleColumnDefs = useMemo(() => {
    const selected = columnDefs.filter((column) => visibleColumns.includes(column.key));
    return selected.length > 0 ? selected : columnDefs.slice(0, 2);
  }, [columnDefs, visibleColumns]);
  const visibleGridFieldDefs = useMemo(() => {
    const selected = columnDefs.filter((column) => visibleGridFields.includes(column.key));
    return selected.length > 0 ? selected : columnDefs.filter((column) => ["id", "category", "type", "hp"].includes(column.key));
  }, [columnDefs, visibleGridFields]);
  const listGridTemplate = useMemo(() => visibleColumnDefs.map((column) => column.width).join(" "), [visibleColumnDefs]);
  const categories = useMemo(() => {
    const values = new Set(cards.map((card) => card.category || "Other"));
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [cards]);
  const types = useMemo(() => {
    const values = new Set(cards.map(typeValue));
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [cards]);
  const expansions = useMemo(() => uniqueValues(cards, (card) => card.expansion), [cards]);
  const stages = useMemo(() => uniqueValues(cards, (card) => card.stage), [cards]);
  const rules = useMemo(() => uniqueValues(cards, (card) => card.rule), [cards]);
  const weaknesses = useMemo(() => uniqueValues(cards, (card) => card.weakness), [cards]);
  const resistances = useMemo(() => uniqueValues(cards, (card) => card.resistance), [cards]);
  const retreats = useMemo(() => uniqueValues(cards, (card) => card.retreat), [cards]);
  const selectedCard = selectedCardId == null ? null : cardById.get(selectedCardId) || null;
  const selectedDeckCard = selectedCardId == null ? null : draft?.cards.find((card) => card.cardId === selectedCardId) || null;
  const selectedCount = selectedDeckCard?.count || 0;
  const totalCount = deckTotal(draft);

  const warnings = useMemo(() => {
    const result: string[] = [];
    if (totalCount > 60) {
      result.push(t(locale, "over60"));
    }
    if (totalCount < 60) {
      result.push(t(locale, "under60"));
    }
    if ((draft?.cards || []).some((deckCard) => {
      const card = cardById.get(deckCard.cardId);
      return card ? sameNameCount(draft?.cards || [], cardById, card) > maxCopiesForCard(card) : false;
    })) {
      result.push(t(locale, "tooManyCopies"));
    }
    return result;
  }, [cardById, draft, locale, totalCount]);

  const matchedCards = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const minHp = hpMin.trim() ? Number.parseInt(hpMin, 10) : null;
    const maxHp = hpMax.trim() ? Number.parseInt(hpMax, 10) : null;
    return cards
      .filter((card) => category === "all" || card.category === category)
      .filter((card) => typeFilter === "all" || typeValue(card) === typeFilter)
      .filter((card) => expansionFilter === "all" || textOrDash(card.expansion) === expansionFilter)
      .filter((card) => stageFilter === "all" || textOrDash(card.stage) === stageFilter)
      .filter((card) => ruleFilter === "all" || textOrDash(card.rule) === ruleFilter)
      .filter((card) => weaknessFilter === "all" || textOrDash(card.weakness) === weaknessFilter)
      .filter((card) => resistanceFilter === "all" || textOrDash(card.resistance) === resistanceFilter)
      .filter((card) => retreatFilter === "all" || textOrDash(card.retreat) === retreatFilter)
      .filter((card) => {
        const hp = hpNumber(card);
        if (minHp != null && (hp == null || hp < minHp)) {
          return false;
        }
        if (maxHp != null && (hp == null || hp > maxHp)) {
          return false;
        }
        return true;
      })
      .filter((card) => {
        if (!needle) {
          return true;
        }
        return [
          String(card.id),
          card.name,
          card.expansion,
          card.collectionNo,
          card.stage,
          card.rule,
          card.category,
          card.previousStage,
          card.hp,
          card.type,
          card.weakness,
          card.resistance,
          card.retreat,
          moveSearchText(card),
          abilitySearchText(card)
        ].join(" ").toLowerCase().includes(needle);
      })
      .filter((card) => {
        const moveNeedle = moveQuery.trim().toLowerCase();
        return !moveNeedle || moveSearchText(card).toLowerCase().includes(moveNeedle);
      })
      .filter((card) => {
        const abilityNeedle = abilityQuery.trim().toLowerCase();
        return !abilityNeedle || abilitySearchText(card).toLowerCase().includes(abilityNeedle);
      })
      .sort((a, b) => {
        if (sortKey === "idDesc") {
          return b.id - a.id;
        }
        if (sortKey === "nameAsc") {
          return a.name.localeCompare(b.name);
        }
        if (sortKey === "expansionAsc") {
          return a.expansion.localeCompare(b.expansion) || a.id - b.id;
        }
        if (sortKey === "collectionNoAsc") {
          return a.collectionNo.localeCompare(b.collectionNo, undefined, { numeric: true }) || a.id - b.id;
        }
        if (sortKey === "stageAsc") {
          return a.stage.localeCompare(b.stage) || a.id - b.id;
        }
        if (sortKey === "categoryAsc") {
          return a.category.localeCompare(b.category) || a.id - b.id;
        }
        if (sortKey === "typeAsc") {
          return typeValue(a).localeCompare(typeValue(b)) || a.id - b.id;
        }
        if (sortKey === "hpAsc" || sortKey === "hpDesc") {
          const aHp = hpNumber(a) ?? -1;
          const bHp = hpNumber(b) ?? -1;
          return sortKey === "hpAsc" ? aHp - bHp || a.id - b.id : bHp - aHp || a.id - b.id;
        }
        if (sortKey === "weaknessAsc") {
          return a.weakness.localeCompare(b.weakness) || a.id - b.id;
        }
        if (sortKey === "resistanceAsc") {
          return a.resistance.localeCompare(b.resistance) || a.id - b.id;
        }
        if (sortKey === "retreatAsc") {
          return a.retreat.localeCompare(b.retreat, undefined, { numeric: true }) || a.id - b.id;
        }
        if (sortKey === "movesAsc") {
          return moveSummary(a).localeCompare(moveSummary(b)) || a.id - b.id;
        }
        if (sortKey === "abilitiesAsc") {
          return abilitySummary(a).localeCompare(abilitySummary(b)) || a.id - b.id;
        }
        if (sortKey === "countDesc") {
          return cardDeckCount(draft?.cards, b.id) - cardDeckCount(draft?.cards, a.id) || a.id - b.id;
        }
        return a.id - b.id;
      });
  }, [
    abilityQuery,
    cards,
    category,
    draft?.cards,
    expansionFilter,
    hpMax,
    hpMin,
    moveQuery,
    query,
    resistanceFilter,
    retreatFilter,
    ruleFilter,
    sortKey,
    stageFilter,
    typeFilter,
    viewMode,
    weaknessFilter
  ]);
  const filteredCards = useMemo(() => matchedCards.slice(0, viewMode === "grid" ? 120 : 300), [matchedCards, viewMode]);
  const cardSheetUrl = zipBundle?.cardSheetUrls[locale] || `/api/card-sheet/${locale}`;

  function updateDraft(next: ManagedDeck) {
    setDraft(next);
  }

  function shouldReplaceWithSample() {
    if (decks.length === 0) {
      return true;
    }
    return decks.length === 1 && deckTotal(decks[0]) === 0 && decks[0].history.length === 0 && /^deck/i.test(decks[0].name);
  }

  async function importZipFile(file: File) {
    if (!/\.zip$/i.test(file.name)) {
      setError(t(locale, "zipOnly"));
      return;
    }
    setZipLoading(true);
    setLoading(true);
    setError("");
    try {
      const bundle = await loadDataZip(file);
      setZipBundle(bundle);
      setCards(bundle.cards[locale]);
      if (bundle.sampleDeck.length > 0 && shouldReplaceWithSample()) {
        const initial = createDeck(t(locale, "sampleDeck"), bundle.sampleDeck);
        setDecks([initial]);
        setSelectedDeckId(initial.id);
        saveDecks([initial]);
      }
      setSelectedCardId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setZipLoading(false);
      setLoading(false);
    }
  }

  function isFileDrag(event: ReactDragEvent) {
    return Array.from(event.dataTransfer.types).includes("Files");
  }

  function handleZipDragOver(event: ReactDragEvent<HTMLDivElement>) {
    if (!isFileDrag(event)) {
      return;
    }
    event.preventDefault();
    setZipDragActive(true);
  }

  function handleZipDragLeave(event: ReactDragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setZipDragActive(false);
    }
  }

  function handleZipDrop(event: ReactDragEvent<HTMLDivElement>) {
    if (!isFileDrag(event)) {
      return;
    }
    event.preventDefault();
    setZipDragActive(false);
    const file = Array.from(event.dataTransfer.files).find((item) => /\.zip$/i.test(item.name));
    if (file) {
      void importZipFile(file);
    } else {
      setError(t(locale, "zipOnly"));
    }
  }

  function updateCardCount(cardId: number, count: number, insertIndex?: number) {
    if (!draft) {
      return;
    }
    const card = cardById.get(cardId);
    const requested = Math.max(0, Math.floor(count));
    const capped = card
      ? Math.min(requested, Math.max(0, maxCopiesForCard(card) - sameNameCount(draft.cards, cardById, card, cardId)))
      : requested;
    updateDraft({ ...draft, cards: setCardCount(draft.cards, cardId, capped, insertIndex) });
    setSelectedCardId(cardId);
  }

  function addCard(cardId: number, insertIndex?: number) {
    const current = draft?.cards.find((card) => card.cardId === cardId)?.count || 0;
    updateCardCount(cardId, current + 1, insertIndex);
  }

  function createNewDeck() {
    const deck = createDeck(`deck_${decks.length + 1}`);
    const next = [...decks, deck];
    setDecks(next);
    saveDecks(next);
    setSelectedDeckId(deck.id);
    setSelectedCardId(null);
  }

  function duplicateDeck() {
    if (!draft) {
      return;
    }
    const deck = cloneDeck(draft);
    const next = [...decks, deck];
    setDecks(next);
    saveDecks(next);
    setSelectedDeckId(deck.id);
  }

  function deleteDeck() {
    if (!draft || !window.confirm(t(locale, "confirmDelete"))) {
      return;
    }
    const next = decks.filter((deck) => deck.id !== draft.id);
    const fallback = next.length > 0 ? next : [createDeck("deck_1")];
    setDecks(fallback);
    saveDecks(fallback);
    setSelectedDeckId(fallback[0].id);
    setSelectedCardId(null);
  }

  function saveCurrentDeck() {
    if (!draft) {
      return;
    }
    const original = decks.find((deck) => deck.id === draft.id);
    const historyEntry = original ? makeHistoryEntry(original.cards, draft.cards, changeIntent.trim()) : null;
    const changed = Boolean(historyEntry && (historyEntry.added.length > 0 || historyEntry.removed.length > 0 || changeIntent.trim()));
    const saved: ManagedDeck = {
      ...draft,
      cards: sortCards(draft.cards),
      updatedAt: new Date().toISOString(),
      history: changed && historyEntry ? [historyEntry, ...draft.history] : draft.history
    };
    const next = decks.map((deck) => (deck.id === saved.id ? saved : deck));
    setDecks(next);
    saveDecks(next);
    setChangeIntent("");
  }

  function exportCurrentCsv() {
    if (!draft) {
      return;
    }
    downloadText(`${draft.name || "deck"}.csv`, expandedCsv(draft.cards), "text/csv;charset=utf-8");
  }

  function importCsvFile(file: File) {
    file.text().then((text) => {
      const imported = createDeck(file.name.replace(/\.csv$/i, "") || `deck_${decks.length + 1}`, cardsFromCsv(text));
      const next = [...decks, imported];
      setDecks(next);
      saveDecks(next);
      setSelectedDeckId(imported.id);
    });
  }

  function columnLabel(column: ColumnDef) {
    return column.label || t(locale, column.labelKey || column.key);
  }

  function toggleColumn(key: ColumnKey) {
    setVisibleColumns((current) => {
      if (current.includes(key)) {
        return current.length > 1 ? current.filter((item) => item !== key) : current;
      }
      const next = [...current, key];
      return columnDefs.filter((column) => next.includes(column.key)).map((column) => column.key);
    });
  }

  function toggleGridField(key: ColumnKey) {
    setVisibleGridFields((current) => {
      if (current.includes(key)) {
        return current.length > 1 ? current.filter((item) => item !== key) : current;
      }
      const next = [...current, key];
      return columnDefs.filter((column) => next.includes(column.key)).map((column) => column.key);
    });
  }

  function menuPosition(event: ReactMouseEvent) {
    const width = 240;
    const height = Math.min(520, window.innerHeight * 0.82);
    return {
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - width - 8)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - height - 8))
    };
  }

  function openColumnMenu(event: ReactMouseEvent) {
    event.preventDefault();
    setColumnMenu(menuPosition(event));
  }

  function openGridMenu(event: ReactMouseEvent) {
    event.preventDefault();
    setGridMenu(menuPosition(event));
  }

  function startResize(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const container = splitRef.current;
    if (!container) {
      return;
    }
    const handle = event.currentTarget;
    const pointerId = event.pointerId;
    handle.setPointerCapture(pointerId);
    let nextPercent = topPanePercent;
    let frame = 0;
    const apply = (clientY: number) => {
      const rect = container.getBoundingClientRect();
      const usableHeight = Math.max(1, rect.height - 14);
      nextPercent = Math.min(78, Math.max(22, ((clientY - rect.top) / usableHeight) * 100));
      container.style.setProperty("--top-pane-percent", `${nextPercent}%`);
    };
    const move = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      frame = window.requestAnimationFrame(() => apply(moveEvent.clientY));
    };
    const stop = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      setTopPanePercent(nextPercent);
      document.body.classList.remove("resizingSplit");
      if (handle.hasPointerCapture(pointerId)) {
        handle.releasePointerCapture(pointerId);
      }
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    document.body.classList.add("resizingSplit");
    apply(event.clientY);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
    window.addEventListener("pointercancel", stop, { once: true });
  }

  function dragCard(event: React.DragEvent, cardId: number) {
    event.dataTransfer.setData("text/plain", String(cardId));
    event.dataTransfer.effectAllowed = "copy";
  }

  function dropCard(event: React.DragEvent, insertIndex?: number) {
    event.preventDefault();
    const cardId = Number(event.dataTransfer.getData("text/plain"));
    if (Number.isInteger(cardId)) {
      addCard(cardId, insertIndex);
    }
  }

  function renderCardRow(card: CardInfo, count: number, inDeck: boolean, index?: number) {
    return (
      <div
        key={`${inDeck ? "deck" : "lib"}-${card.id}`}
        className={selectedCardId === card.id ? "cardRow active" : "cardRow"}
        style={{ gridTemplateColumns: listGridTemplate }}
        role="button"
        tabIndex={0}
        draggable={!inDeck}
        onDragStart={(event) => dragCard(event, card.id)}
        onDragOver={(event) => inDeck && event.preventDefault()}
        onDrop={(event) => inDeck && dropCard(event, index)}
        onClick={() => {
          setSelectedCardId(card.id);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setSelectedCardId(card.id);
          }
        }}
      >
        {visibleColumnDefs.map((column) => (
          <span key={column.key} className={column.className}>
            {column.render(card, count)}
          </span>
        ))}
      </div>
    );
  }

  function renderGridField(card: CardInfo, count: number, key: ColumnKey) {
    if (key === "id") {
      return `ID ${card.id}`;
    }
    if (key === "name") {
      return null;
    }
    if (key === "count") {
      return `x${count}`;
    }
    if (key === "type" || key === "hp") {
      return null;
    }
    if (key === "moves") {
      return card.moves.length > 0 ? `${t(locale, "moves")}: ${moveSummary(card)}` : null;
    }
    if (key === "abilities") {
      return card.abilities.length > 0 ? `${t(locale, "abilities")}: ${abilitySummary(card)}` : null;
    }
    const column = columnDefs.find((item) => item.key === key);
    const value = column?.render(card, count);
    return <span>{column ? `${columnLabel(column)}: ${value || "-"}` : "-"}</span>;
  }

  function renderCardTile(card: CardInfo, count: number, inDeck: boolean, index?: number) {
    return (
      <div
        key={`${inDeck ? "deckTile" : "libTile"}-${card.id}`}
        className={selectedCardId === card.id ? "cardTile active" : "cardTile"}
        draggable={!inDeck}
        onDragStart={(event) => dragCard(event, card.id)}
        onDragOver={(event) => inDeck && event.preventDefault()}
        onDrop={(event) => inDeck && dropCard(event, index)}
        onContextMenu={openGridMenu}
        onClick={() => {
          setSelectedCardId(card.id);
        }}
      >
        <CardArt
          key={`${locale}-${card.id}-${card.pdfIndex.imagePage}-${inDeck ? "deck" : "library"}`}
          cardId={card.id}
          imagePage={card.pdfIndex.imagePage}
          locale={locale}
          label={card.name}
          pdfUrl={cardSheetUrl}
          compact
        />
        <strong>{card.name}</strong>
        <div className="tileMeta">
          {visibleGridFieldDefs.some((field) => field.key === "type" || field.key === "hp") ? (
            <span>{visibleGridFields.includes("type") ? typeValue(card) : ""}{visibleGridFields.includes("type") && visibleGridFields.includes("hp") ? " / " : ""}{visibleGridFields.includes("hp") ? `HP ${textOrDash(card.hp)}` : ""}</span>
          ) : null}
          {visibleGridFieldDefs
            .filter((field) => field.key !== "type" && field.key !== "hp")
            .map((field) => {
              const value = renderGridField(card, count, field.key);
              return value ? (
                <span key={field.key} className={field.key === "moves" || field.key === "abilities" ? "tileWide" : ""}>
                  {value}
                </span>
              ) : null;
            })}
        </div>
      </div>
    );
  }

  const deckCards = (draft?.cards || []).map((deckCard) => ({
    deckCard,
    card: cardById.get(deckCard.cardId)
  }));

  return (
    <div
      className={zipDragActive ? "appShell zipDragActive" : "appShell"}
      onDragOver={handleZipDragOver}
      onDragLeave={handleZipDragLeave}
      onDrop={handleZipDrop}
    >
      <header className="topbar">
        <div className="brand">
          <h1>{t(locale, "appName")}</h1>
        </div>
        <div className="topActions">
          <button type="button" onClick={() => importZipRef.current?.click()} disabled={zipLoading}>
            <Upload size={16} />
            {zipLoading ? t(locale, "loadingZip") : t(locale, "loadZip")}
          </button>
          <input
            ref={importZipRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void importZipFile(file);
              }
              event.target.value = "";
            }}
          />
          <span className="dataSourcePill">
            {zipBundle ? `${t(locale, "zipLoaded")}: ${zipBundle.name}` : cards.length > 0 ? t(locale, "localApiData") : t(locale, "zipNotLoaded")}
          </span>
          <button type="button" onClick={exportCurrentCsv} disabled={!draft}>
            <Download size={16} />
            {t(locale, "exportCsv")}
          </button>
          <button type="button" onClick={() => importCsvRef.current?.click()}>
            <Upload size={16} />
            {t(locale, "importCsv")}
          </button>
          <input
            ref={importCsvRef}
            type="file"
            accept="text/csv,.csv"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                importCsvFile(file);
              }
              event.target.value = "";
            }}
          />
          <label className="localeControl">
            <Languages size={16} />
            <span>{t(locale, "language")}</span>
            <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
      </header>

      <main className="workspace">
        <aside className="deckRail">
          <div className="deckFixed">
            <label className="deckNameEdit">
              <span>{t(locale, "deckName")}</span>
              <input
                value={draft?.name || ""}
                disabled={!draft}
                onChange={(event) => {
                  if (draft) {
                    updateDraft({ ...draft, name: event.target.value });
                  }
                }}
              />
            </label>
            <div className="deckActionGrid">
              <button type="button" onClick={createNewDeck}>
                <Plus size={16} />
                {t(locale, "newDeck")}
              </button>
              <button type="button" onClick={duplicateDeck} disabled={!draft}>
                <Copy size={16} />
                {t(locale, "duplicate")}
              </button>
              <button type="button" className="primary" onClick={saveCurrentDeck} disabled={!draft}>
                <Save size={16} />
                {t(locale, "save")}
              </button>
              <button type="button" className="danger" onClick={deleteDeck} disabled={!draft}>
                <Trash2 size={16} />
                {t(locale, "deleteDeck")}
              </button>
            </div>
            <div className="deckToolRow">
              <button type="button" onClick={() => setModalMode("policy")} disabled={!draft}>
                <FileText size={16} />
                {t(locale, "policy")}
              </button>
              <button type="button" onClick={() => setModalMode("history")} disabled={!draft}>
                <History size={16} />
                {t(locale, "history")}
              </button>
            </div>
          </div>
          <div className="deckList">
            {decks.map((deck) => (
              <button
                type="button"
                key={deck.id}
                className={deck.id === selectedDeckId ? "deckItem active" : "deckItem"}
                onClick={() => setSelectedDeckId(deck.id)}
              >
                <strong>{deck.name}</strong>
                <span>{deckTotal(deck)} / 60</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="previewPane">
          <div className="previewToolbar">
            <div>
              <h2>{t(locale, "deckCards")}</h2>
              <span>{draft?.name || "-"}</span>
            </div>
            <div className="previewActions">
              <div className={warnings.length ? "totalBadge warning" : "totalBadge"}>
                {t(locale, "total")} {totalCount}/60
              </div>
              <div className="viewSwitch">
                <button type="button" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>
                  <List size={16} />
                  {t(locale, "listView")}
                </button>
                <button type="button" className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>
                  <LayoutGrid size={16} />
                  {t(locale, "gridView")}
                </button>
              </div>
            </div>
          </div>
          {warnings.length ? <div className="warningText">{warnings.join(" / ")}</div> : null}

          {loading ? <div className="state">{t(locale, "loading")}</div> : null}
          {error ? <div className="state error">{t(locale, "dataError")}: {error}</div> : null}
          {cards.length === 0 ? (
            <button type="button" className="zipDropZone" onClick={() => importZipRef.current?.click()}>
              <Upload size={22} />
              <strong>{t(locale, "dropZipTitle")}</strong>
              <span>{t(locale, "dropZipDescription")}</span>
            </button>
          ) : null}

          <div
            ref={splitRef}
            className="splitWorkspace"
            style={{ "--top-pane-percent": `${topPanePercent}%` } as CSSProperties}
          >
            <section
              className="splitPanel deckPreview"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => dropCard(event)}
            >
              {viewMode === "list" ? (
                <div className="cardList">
                  <div className="cardRow tableHead" style={{ gridTemplateColumns: listGridTemplate }} onContextMenu={openColumnMenu}>
                    {visibleColumnDefs.map((column) => (
                      <span key={column.key}>{columnLabel(column)}</span>
                    ))}
                  </div>
                  {deckCards.map(({ deckCard, card }, index) =>
                    card ? renderCardRow(card, deckCard.count, true, index) : null
                  )}
                  {deckCards.length === 0 ? <div className="dropEmpty">{t(locale, "dropHere")}</div> : null}
                </div>
              ) : (
                <div className="cardGrid">
                  {deckCards.map(({ deckCard, card }, index) =>
                    card ? renderCardTile(card, deckCard.count, true, index) : null
                  )}
                  <div className="dropTile" onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropCard(event)}>
                    {t(locale, "dropHere")}
                  </div>
                </div>
              )}
            </section>

            <div className="splitHandle" role="separator" aria-orientation="horizontal" onPointerDown={startResize}>
              <GripHorizontal size={18} />
            </div>

            <section className="splitPanel libraryPanel">
              <div className="libraryHeader">
                <div className="libraryHeaderTop">
                  <div className="libraryTitle">
                    <h2>{t(locale, "library")}</h2>
                    <span>{matchedCards.length} / {cards.length} {t(locale, "cardTypes")}</span>
                  </div>
                  <button type="button" className="filterToggle" onClick={() => setFiltersOpen((current) => !current)}>
                    <SlidersHorizontal size={16} />
                    {filtersOpen ? t(locale, "hideFilters") : t(locale, "showFilters")}
                  </button>
                </div>
                {filtersOpen ? (
                  <div className="filters">
                    <label className="filterField searchField">
                      <span>{t(locale, "search")}</span>
                      <div className="searchBox">
                        <Search size={16} />
                        <input value={query} placeholder={t(locale, "searchPlaceholder")} onChange={(event) => setQuery(event.target.value)} />
                      </div>
                    </label>
                    <label className="filterField">
                      <span>{t(locale, "category")}</span>
                      <select value={category} onChange={(event) => setCategory(event.target.value)}>
                        <option value="all">{t(locale, "allCategories")}</option>
                        {categories.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="filterField">
                      <span>{t(locale, "type")}</span>
                      <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                        <option value="all">{t(locale, "allTypes")}</option>
                        {types.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="filterField">
                      <span>{t(locale, "expansion")}</span>
                      <select value={expansionFilter} onChange={(event) => setExpansionFilter(event.target.value)}>
                        <option value="all">{t(locale, "allValues")}</option>
                        {expansions.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="filterField">
                      <span>{t(locale, "stage")}</span>
                      <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
                        <option value="all">{t(locale, "allValues")}</option>
                        {stages.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="filterField">
                      <span>{t(locale, "rule")}</span>
                      <select value={ruleFilter} onChange={(event) => setRuleFilter(event.target.value)}>
                        <option value="all">{t(locale, "allValues")}</option>
                        {rules.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="filterField">
                      <span>{t(locale, "weakness")}</span>
                      <select value={weaknessFilter} onChange={(event) => setWeaknessFilter(event.target.value)}>
                        <option value="all">{t(locale, "allValues")}</option>
                        {weaknesses.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="filterField">
                      <span>{t(locale, "resistance")}</span>
                      <select value={resistanceFilter} onChange={(event) => setResistanceFilter(event.target.value)}>
                        <option value="all">{t(locale, "allValues")}</option>
                        {resistances.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="filterField">
                      <span>{t(locale, "retreat")}</span>
                      <select value={retreatFilter} onChange={(event) => setRetreatFilter(event.target.value)}>
                        <option value="all">{t(locale, "allValues")}</option>
                        {retreats.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="filterField compactFilter">
                      <span>{t(locale, "hpMin")}</span>
                      <input type="number" min="0" value={hpMin} onChange={(event) => setHpMin(event.target.value)} />
                    </label>
                    <label className="filterField compactFilter">
                      <span>{t(locale, "hpMax")}</span>
                      <input type="number" min="0" value={hpMax} onChange={(event) => setHpMax(event.target.value)} />
                    </label>
                    <label className="filterField searchField">
                      <span>{t(locale, "moves")}</span>
                      <input value={moveQuery} placeholder={t(locale, "moveSearch")} onChange={(event) => setMoveQuery(event.target.value)} />
                    </label>
                    <label className="filterField searchField">
                      <span>{t(locale, "abilities")}</span>
                      <input value={abilityQuery} placeholder={t(locale, "abilitySearch")} onChange={(event) => setAbilityQuery(event.target.value)} />
                    </label>
                    <label className="filterField">
                      <span>{t(locale, "sort")}</span>
                      <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
                        <option value="idAsc">{t(locale, "sortIdAsc")}</option>
                        <option value="idDesc">{t(locale, "sortIdDesc")}</option>
                        <option value="nameAsc">{t(locale, "sortName")}</option>
                        <option value="expansionAsc">{t(locale, "sortExpansion")}</option>
                        <option value="collectionNoAsc">{t(locale, "sortCollectionNo")}</option>
                        <option value="stageAsc">{t(locale, "sortStage")}</option>
                        <option value="categoryAsc">{t(locale, "sortCategory")}</option>
                        <option value="typeAsc">{t(locale, "sortType")}</option>
                        <option value="hpAsc">{t(locale, "sortHpAsc")}</option>
                        <option value="hpDesc">{t(locale, "sortHpDesc")}</option>
                        <option value="weaknessAsc">{t(locale, "sortWeakness")}</option>
                        <option value="resistanceAsc">{t(locale, "sortResistance")}</option>
                        <option value="retreatAsc">{t(locale, "sortRetreat")}</option>
                        <option value="movesAsc">{t(locale, "sortMoves")}</option>
                        <option value="abilitiesAsc">{t(locale, "sortAbilities")}</option>
                        <option value="countDesc">{t(locale, "sortCount")}</option>
                      </select>
                    </label>
                  </div>
                ) : null}
              </div>
              {viewMode === "list" ? (
                <div className="cardList libraryList">
                  <div className="cardRow tableHead" style={{ gridTemplateColumns: listGridTemplate }} onContextMenu={openColumnMenu}>
                    {visibleColumnDefs.map((column) => (
                      <span key={column.key}>{columnLabel(column)}</span>
                    ))}
                  </div>
                  {filteredCards.map((card) =>
                    renderCardRow(card, draft?.cards.find((item) => item.cardId === card.id)?.count || 0, false)
                  )}
                </div>
              ) : (
                <div className="cardGrid libraryGrid">
                  {filteredCards.map((card) =>
                    renderCardTile(card, draft?.cards.find((item) => item.cardId === card.id)?.count || 0, false)
                  )}
                </div>
              )}
            </section>
          </div>
        </section>

        <aside className="inspector">
          <section className="inspectorBlock">
            <h2>{t(locale, "selectedCard")}</h2>
            {selectedCard ? (
              <div className="selectedCard">
                <CardArt
                  key={`${locale}-${selectedCard.id}-${selectedCard.pdfIndex.imagePage}`}
                  cardId={selectedCard.id}
                    imagePage={selectedCard.pdfIndex.imagePage}
                    locale={locale}
                    label={selectedCard.name}
                    pdfUrl={cardSheetUrl}
                  />
                <div>
                  <strong>{selectedCard.name}</strong>
                  <span className="muted mono">ID {selectedCard.id}</span>
                </div>
                <div className="stepper wide">
                  <button className="iconButton" type="button" aria-label={t(locale, "remove")} onClick={() => updateCardCount(selectedCard.id, selectedCount - 1)}>
                    <MinusCircle size={18} />
                  </button>
                  <input value={selectedCount} inputMode="numeric" onChange={(event) => updateCardCount(selectedCard.id, Number(event.target.value) || 0)} />
                  <button className="iconButton" type="button" aria-label={t(locale, "add")} onClick={() => updateCardCount(selectedCard.id, selectedCount + 1)}>
                    <PlusCircle size={18} />
                  </button>
                </div>
                <input
                  value={selectedDeckCard?.role || ""}
                  placeholder={t(locale, "role")}
                  onChange={(event) => {
                    if (draft) {
                      updateDraft({ ...draft, cards: setCardMeta(draft.cards, selectedCard.id, "role", event.target.value) });
                    }
                  }}
                />
                <textarea
                  value={selectedDeckCard?.note || ""}
                  placeholder={t(locale, "note")}
                  onChange={(event) => {
                    if (draft) {
                      updateDraft({ ...draft, cards: setCardMeta(draft.cards, selectedCard.id, "note", event.target.value) });
                    }
                  }}
                />
                <dl>
                  <dt>{t(locale, "expansion")}</dt>
                  <dd>{textOrDash(selectedCard.expansion)}</dd>
                  <dt>{t(locale, "collectionNo")}</dt>
                  <dd>{textOrDash(selectedCard.collectionNo)}</dd>
                  <dt>{t(locale, "stage")}</dt>
                  <dd>{textOrDash(selectedCard.stage)}</dd>
                  <dt>{t(locale, "rule")}</dt>
                  <dd>{textOrDash(selectedCard.rule)}</dd>
                  <dt>{t(locale, "category")}</dt>
                  <dd>{textOrDash(selectedCard.category)}</dd>
                  <dt>{t(locale, "previousStage")}</dt>
                  <dd>{textOrDash(selectedCard.previousStage)}</dd>
                  <dt>HP</dt>
                  <dd>{textOrDash(selectedCard.hp)}</dd>
                  <dt>{t(locale, "type")}</dt>
                  <dd>{textOrDash(selectedCard.type)}</dd>
                  <dt>{t(locale, "weakness")}</dt>
                  <dd>{textOrDash(selectedCard.weakness)}</dd>
                  <dt>{t(locale, "resistance")}</dt>
                  <dd>{textOrDash(selectedCard.resistance)}</dd>
                  <dt>{t(locale, "retreat")}</dt>
                  <dd>{textOrDash(selectedCard.retreat)}</dd>
                  <dt>{t(locale, "tablePage")}</dt>
                  <dd>{selectedCard.pdfIndex.tablePage}</dd>
                  <dt>{t(locale, "imagePage")}</dt>
                  <dd>{selectedCard.pdfIndex.imagePage}</dd>
                </dl>
                <section className="moveDetails">
                  <h3>{t(locale, "abilities")}</h3>
                  {selectedCard.abilities.length > 0 ? (
                    selectedCard.abilities.map((ability, index) => (
                      <article key={`${selectedCard.id}-ability-${index}`}>
                        <div>
                          <strong>{textOrDash(ability.name)}</strong>
                        </div>
                        <p>{textOrDash(ability.effect)}</p>
                      </article>
                    ))
                  ) : (
                    <p className="muted">{t(locale, "noAbilities")}</p>
                  )}
                </section>
                <section className="moveDetails">
                  <h3>{t(locale, "moves")}</h3>
                  {selectedCard.moves.length > 0 ? (
                    selectedCard.moves.map((move, index) => (
                      <article key={`${selectedCard.id}-${index}`}>
                        <div>
                          <strong>{textOrDash(move.name)}</strong>
                          <span>{t(locale, "cost")}: {textOrDash(move.cost)}</span>
                          <span>{t(locale, "damage")}: {textOrDash(move.damage)}</span>
                        </div>
                        <p>{textOrDash(move.effect)}</p>
                      </article>
                    ))
                  ) : (
                    <p className="muted">{t(locale, "noMoves")}</p>
                  )}
                </section>
              </div>
            ) : (
              <div className="state compact">{t(locale, "noCard")}</div>
            )}
          </section>
        </aside>
      </main>

      {columnMenu ? (
        <div
          className="columnMenu"
          style={{ left: columnMenu.x, top: columnMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <strong>{t(locale, "visibleColumns")}</strong>
          {columnDefs.map((column) => (
            <label key={column.key}>
              <input
                type="checkbox"
                checked={visibleColumns.includes(column.key)}
                disabled={visibleColumns.length === 1 && visibleColumns.includes(column.key)}
                onChange={() => toggleColumn(column.key)}
              />
              <span>{columnLabel(column)}</span>
            </label>
          ))}
        </div>
      ) : null}

      {gridMenu ? (
        <div
          className="columnMenu"
          style={{ left: gridMenu.x, top: gridMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <strong>{t(locale, "gridFields")}</strong>
          {columnDefs.map((column) => (
            <label key={column.key}>
              <input
                type="checkbox"
                checked={visibleGridFields.includes(column.key)}
                disabled={visibleGridFields.length === 1 && visibleGridFields.includes(column.key)}
                onChange={() => toggleGridField(column.key)}
              />
              <span>{columnLabel(column)}</span>
            </label>
          ))}
        </div>
      ) : null}

      {modalMode && draft ? (
        <div className="modalBackdrop" role="dialog" aria-modal="true">
          <section className="modal">
            <header>
              <h2>{modalMode === "policy" ? t(locale, "policy") : t(locale, "history")}</h2>
              <button type="button" aria-label="close" onClick={() => setModalMode(null)}>
                <X size={16} />
              </button>
            </header>
            {modalMode === "policy" ? (
              <div className="modalBody policyBody">
                <label>
                  <span>{t(locale, "deckName")}</span>
                  <input value={draft.name} onChange={(event) => updateDraft({ ...draft, name: event.target.value })} />
                </label>
                <label>
                  <span>{t(locale, "deckPolicy")}</span>
                  <textarea value={draft.description} onChange={(event) => updateDraft({ ...draft, description: event.target.value })} />
                </label>
                <label>
                  <span>{t(locale, "changeIntent")}</span>
                  <textarea value={changeIntent} onChange={(event) => setChangeIntent(event.target.value)} />
                </label>
              </div>
            ) : (
              <div className="modalBody historyList">
                {draft.history.length === 0 ? <div className="state compact">{t(locale, "noHistory")}</div> : null}
                {draft.history.map((entry) => (
                  <article key={entry.id} className="historyItem">
                    <time>{new Date(entry.savedAt).toLocaleString(locale === "ja" ? "ja-JP" : "en-US")}</time>
                    <p>{entry.intent || "-"}</p>
                    <small>
                      {t(locale, "added")}: {entry.added.map((item) => `${cardName(cardById, item.cardId)} x${item.count}`).join(", ") || "-"}
                    </small>
                    <small>
                      {t(locale, "removed")}: {entry.removed.map((item) => `${cardName(cardById, item.cardId)} x${item.count}`).join(", ") || "-"}
                    </small>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
