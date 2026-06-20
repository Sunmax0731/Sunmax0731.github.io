import { parse } from "csv-parse/browser/esm/sync";
import JSZip from "jszip";

import type { CardInfo, DeckCard, Locale } from "./types";

type ColumnMap = {
  id: string;
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
  moveName: string;
  cost: string;
  damage: string;
  effect: string;
};

export type ZipDataBundle = {
  name: string;
  cards: Record<Locale, CardInfo[]>;
  sampleDeck: DeckCard[];
  cardSheetUrls: Record<Locale, string>;
};

const columnMap: Record<Locale, ColumnMap> = {
  en: {
    id: "Card ID",
    name: "Card Name",
    expansion: "Expansion",
    collectionNo: "Collection No.",
    stage: "Stage (Pokémon)/Type (Energy and Trainer)",
    rule: "Rule",
    category: "Category",
    previousStage: "Previous stage",
    hp: "HP",
    type: "Type",
    weakness: "Weakness",
    resistance: "Resistance (Type)",
    retreat: "Retreat",
    moveName: "Move Name",
    cost: "Cost",
    damage: "Damage",
    effect: "Effect Explanation"
  },
  ja: {
    id: "カード ID",
    name: "カード名",
    expansion: "エキスパンションマーク",
    collectionNo: "コレクション番号",
    stage: "ポケモンの進化の段階/エネルギー・トレーナーズの種類",
    rule: "ルール",
    category: "カテゴリ",
    previousStage: "進化前",
    hp: "HP",
    type: "タイプ",
    weakness: "弱点",
    resistance: "抵抗力",
    retreat: "にげる",
    moveName: "ワザ名",
    cost: "コスト",
    damage: "ダメージ",
    effect: "効果の説明"
  }
};

function clean(value: unknown) {
  if (value == null) {
    return "";
  }
  const text = String(value).trim();
  return text === "n/a" ? "" : text;
}

function normalizeCategory(value: unknown, locale: Locale) {
  const category = clean(value);
  if (locale === "ja" && category.startsWith("トレーナーのポケモン")) {
    return "トレーナーのポケモン";
  }
  if (locale === "en" && category.toLowerCase().startsWith("trainer's pokemon")) {
    return "Trainer's Pokemon";
  }
  if (locale === "en" && category.toLowerCase().startsWith("trainer's pokémon")) {
    return "Trainer's Pokémon";
  }
  return category;
}

function abilityName(value: unknown) {
  return clean(value).replace(/^\[(特性|Ability)\]\s*/i, "");
}

function isAbilityRow(moveName: unknown, effect: unknown) {
  return /^\[(特性|Ability)\]/i.test(clean(moveName)) || /^\[(特性|Ability)\]/i.test(clean(effect));
}

async function zipText(zip: JSZip, entryName: string) {
  const entry = zip.file(entryName);
  if (!entry) {
    throw new Error(`Missing zip entry: ${entryName}`);
  }
  return entry.async("text");
}

async function optionalZipText(zip: JSZip, entryNames: string[]) {
  for (const entryName of entryNames) {
    const entry = zip.file(entryName);
    if (entry) {
      return entry.async("text");
    }
  }
  return "";
}

async function zipBlobUrl(zip: JSZip, entryName: string, type: string) {
  const entry = zip.file(entryName);
  if (!entry) {
    throw new Error(`Missing zip entry: ${entryName}`);
  }
  const blob = await entry.async("blob");
  return URL.createObjectURL(new Blob([blob], { type }));
}

function parseCards(csvText: string, locale: Locale): CardInfo[] {
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  }) as Record<string, string>[];
  const cols = columnMap[locale];
  const byId = new Map<number, CardInfo>();

  for (const row of rows) {
    const cardId = Number(row[cols.id]);
    if (!Number.isFinite(cardId)) {
      continue;
    }

    if (!byId.has(cardId)) {
      byId.set(cardId, {
        id: cardId,
        name: clean(row[cols.name]),
        expansion: clean(row[cols.expansion]),
        collectionNo: clean(row[cols.collectionNo]),
        stage: clean(row[cols.stage]),
        rule: clean(row[cols.rule]),
        category: normalizeCategory(row[cols.category], locale) || clean(row[cols.stage]) || "Other",
        previousStage: clean(row[cols.previousStage]),
        hp: clean(row[cols.hp]),
        type: clean(row[cols.type]),
        weakness: clean(row[cols.weakness]),
        resistance: clean(row[cols.resistance]),
        retreat: clean(row[cols.retreat]),
        pdfIndex: {
          tablePage: Math.floor((cardId - 1) / 33) + 1,
          tableRow: ((cardId - 1) % 33) + 1,
          imagePage: cardId + 39
        },
        abilities: [],
        moves: []
      });
    }

    const moveName = clean(row[cols.moveName]);
    const effect = clean(row[cols.effect]);
    if (isAbilityRow(moveName, effect)) {
      byId.get(cardId)?.abilities.push({
        name: abilityName(moveName || effect),
        effect
      });
    } else if (moveName || effect) {
      byId.get(cardId)?.moves.push({
        name: moveName,
        cost: clean(row[cols.cost]),
        damage: clean(row[cols.damage]),
        effect
      });
    }
  }

  return [...byId.values()].sort((a, b) => a.id - b.id);
}

function parseSampleDeck(csvText: string): DeckCard[] {
  const counts = new Map<number, number>();
  for (const line of csvText.split(/\r?\n/).map((value) => value.trim()).filter(Boolean).slice(0, 60)) {
    const id = Number(line);
    if (Number.isInteger(id) && id > 0) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([cardId, count]) => ({ cardId, count }));
}

export async function loadDataZip(file: File): Promise<ZipDataBundle> {
  const zip = await JSZip.loadAsync(file);
  const [jpCsv, enCsv, sampleCsv, jpPdfUrl, enPdfUrl] = await Promise.all([
    zipText(zip, "JP_Card_Data.csv"),
    zipText(zip, "EN_Card_Data.csv"),
    optionalZipText(zip, ["sample_submission/deck.csv", "sample_submission_deck.csv"]),
    zipBlobUrl(zip, "Card_ID List_JP.pdf", "application/pdf"),
    zipBlobUrl(zip, "Card_ID List_EN.pdf", "application/pdf")
  ]);

  return {
    name: file.name,
    cards: {
      ja: parseCards(jpCsv, "ja"),
      en: parseCards(enCsv, "en")
    },
    sampleDeck: parseSampleDeck(sampleCsv),
    cardSheetUrls: {
      ja: jpPdfUrl,
      en: enPdfUrl
    }
  };
}

export function revokeZipDataBundle(bundle: ZipDataBundle | null) {
  if (!bundle) {
    return;
  }
  URL.revokeObjectURL(bundle.cardSheetUrls.ja);
  URL.revokeObjectURL(bundle.cardSheetUrls.en);
}
