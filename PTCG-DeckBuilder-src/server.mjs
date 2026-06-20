import path from "node:path";
import { fileURLToPath } from "node:url";

import AdmZip from "adm-zip";
import express from "express";
import { parse } from "csv-parse/sync";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const dataZipPath =
  process.env.PTCG_DATA_ZIP || path.join(repoRoot, "data", "pokemon-tcg-ai-battle.zip");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 5173);

let zip;
let cardsCache = new Map();

function getZip() {
  if (!zip) {
    zip = new AdmZip(dataZipPath);
  }
  return zip;
}

function readZipText(entryName) {
  const entry = getZip().getEntry(entryName);
  if (!entry) {
    throw new Error(`Missing zip entry: ${entryName}`);
  }
  return entry.getData().toString("utf8");
}

function readOptionalZipText(entryNames) {
  for (const entryName of entryNames) {
    const entry = getZip().getEntry(entryName);
    if (entry) {
      return entry.getData().toString("utf8");
    }
  }
  return "";
}

function readZipBuffer(entryName) {
  const entry = getZip().getEntry(entryName);
  if (!entry) {
    throw new Error(`Missing zip entry: ${entryName}`);
  }
  return entry.getData();
}

const columnMap = {
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

function clean(value) {
  if (value == null) {
    return "";
  }
  const text = String(value).trim();
  return text === "n/a" ? "" : text;
}

function normalizeCategory(value, lang) {
  const category = clean(value);
  if (lang === "ja" && category.startsWith("トレーナーのポケモン")) {
    return "トレーナーのポケモン";
  }
  if (lang === "en" && category.toLowerCase().startsWith("trainer's pokemon")) {
    return "Trainer's Pokemon";
  }
  if (lang === "en" && category.toLowerCase().startsWith("trainer's pokémon")) {
    return "Trainer's Pokémon";
  }
  return category;
}

function abilityName(value) {
  return clean(value).replace(/^\[(特性|Ability)\]\s*/i, "");
}

function isAbilityRow(moveName, effect) {
  return /^\[(特性|Ability)\]/i.test(clean(moveName)) || /^\[(特性|Ability)\]/i.test(clean(effect));
}

function loadCards(locale) {
  const lang = locale === "en" ? "en" : "ja";
  if (cardsCache.has(lang)) {
    return cardsCache.get(lang);
  }

  const entryName = lang === "en" ? "EN_Card_Data.csv" : "JP_Card_Data.csv";
  const rows = parse(readZipText(entryName), {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });
  const cols = columnMap[lang];
  const byId = new Map();

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
        category: normalizeCategory(row[cols.category], lang) || clean(row[cols.stage]) || "Other",
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
      byId.get(cardId).abilities.push({
        name: abilityName(moveName || effect),
        effect
      });
    } else if (moveName || effect) {
      byId.get(cardId).moves.push({
        name: moveName,
        cost: clean(row[cols.cost]),
        damage: clean(row[cols.damage]),
        effect
      });
    }
  }

  const cards = [...byId.values()].sort((a, b) => a.id - b.id);
  cardsCache.set(lang, cards);
  return cards;
}

function loadSampleDeck() {
  const lines = readOptionalZipText(["sample_submission/deck.csv", "sample_submission_deck.csv"])
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 60);
  const counts = new Map();
  for (const line of lines) {
    const id = Number(line);
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([cardId, count]) => ({ cardId, count }));
}

const app = express();

app.get("/api/status", (_req, res) => {
  try {
    const entries = getZip().getEntries().map((entry) => entry.entryName);
    res.json({ ok: true, zipPath: dataZipPath, entries });
  } catch (error) {
    res.status(500).json({ ok: false, zipPath: dataZipPath, error: String(error) });
  }
});

app.get("/api/cards", (req, res) => {
  try {
    res.json(loadCards(String(req.query.lang || "ja")));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get("/api/sample-deck", (_req, res) => {
  try {
    res.json({ cards: loadSampleDeck() });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get("/api/card-index/:cardId", (req, res) => {
  const cardId = Number(req.params.cardId);
  if (!Number.isInteger(cardId) || cardId < 1) {
    res.status(400).json({ error: "cardId must be a positive integer" });
    return;
  }
  res.json({
    cardId,
    tablePage: Math.floor((cardId - 1) / 33) + 1,
    tableRow: ((cardId - 1) % 33) + 1,
    imagePage: cardId + 39
  });
});

app.get("/api/card-sheet/:lang", (req, res) => {
  try {
    const lang = req.params.lang === "en" ? "en" : "ja";
    const entryName = lang === "en" ? "Card_ID List_EN.pdf" : "Card_ID List_JP.pdf";
    res.type("application/pdf");
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.send(readZipBuffer(entryName));
  } catch (error) {
    res.status(500).send(String(error));
  }
});

const vite = await createViteServer({
  root: __dirname,
  server: { middlewareMode: true, host, hmr: { host } },
  appType: "spa"
});

app.use(vite.middlewares);

app.listen(port, host, () => {
  console.log(`Deck builder: http://${host}:${port}`);
  console.log(`Data zip: ${dataZipPath}`);
});
