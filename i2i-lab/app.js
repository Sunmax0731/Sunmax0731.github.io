import {
  BUILT_IN_TAGS,
  DEFAULT_PARAMETERS,
  ERROR_GUIDES,
  FORM_FIELDS,
  PROMPT_SHEETS,
  PROVIDERS,
  STORAGE_KEY,
  STAGES,
  TAG_CATEGORIES,
  VIEW_ITEMS,
} from "./app-data.js";

const API_KEY_STORAGE_KEY = "sunmax.i2iLab.apiKey";
const MAIN_VIEW_IDS = ["overview", "workspaces", "studio", "results", "tags"];
const SETTINGS_TABS = new Set(["settings", "guide"]);
const SUPPORTED_LOCALES = new Set(["ja", "en"]);
const STAGE_FIELDS = {
  "stage-04": ["subject", "pose", "composition", "cameraAngle", "background", "stageKeywords"],
  "stage-05": ["character", "pose", "outfit", "outfitDetails", "hairstyle", "facialExpression"],
  "stage-06": ["subject", "character", "outfit", "hairstyle", "facialExpression", "qualityKeywords"],
  "stage-07": ["outfitColors", "hairColor", "eyeColor", "colorMood", "lighting", "background"],
  "stage-08": ["materialNotes", "backgroundDetails", "lighting", "artStyle", "stageKeywords", "qualityKeywords"],
  "stage-09": ["background", "backgroundDetails", "lighting", "artStyle", "stageKeywords", "qualityKeywords"],
};
const TEXT = {
  "views.overview": { ja: "概要", en: "Overview" },
  "views.workspaces": { ja: "ワークスペース", en: "Workspaces" },
  "views.studio": { ja: "スタジオ", en: "Studio" },
  "views.results": { ja: "結果", en: "Results" },
  "views.tags": { ja: "タグ", en: "Tags" },
  "views.settings": { ja: "設定", en: "Settings" },
  "views.guide": { ja: "ガイド", en: "Guide" },
  "actions.create": { ja: "作成", en: "Create" },
  "actions.copy": { ja: "コピー", en: "Copy" },
  "actions.save": { ja: "保存", en: "Save" },
  "actions.clear": { ja: "クリア", en: "Clear" },
  "actions.close": { ja: "閉じる", en: "Close" },
  "actions.remove": { ja: "削除", en: "Remove" },
  "actions.duplicate": { ja: "複製", en: "Duplicate" },
  "actions.delete": { ja: "削除", en: "Delete" },
  "actions.open": { ja: "開く", en: "Open" },
  "header.subtitle": { ja: "段階制作のコックピット", en: "Stage cockpit for image-to-image production" },
  "header.currentStage": { ja: "現在の工程", en: "Current stage" },
  "header.toggleSidebar": { ja: "サイドメニューを切り替え", en: "Toggle sidebar" },
  "sidebar.workspace": { ja: "ワークスペース", en: "Workspace" },
  "sidebar.views": { ja: "表示", en: "Views" },
  "sidebar.stageFocus": { ja: "工程フォーカス", en: "Stage focus" },
  "context.live": { ja: "現在の状況", en: "Live context" },
  "overview.kicker": { ja: "概要", en: "Overview" },
  "overview.title": { ja: "進行状況", en: "Flow at a glance" },
  "overview.pipeline": { ja: "パイプライン", en: "Pipeline" },
  "overview.currentWorkspace": { ja: "現在のワークスペース", en: "Current workspace" },
  "overview.latestOutput": { ja: "最新出力", en: "Latest output" },
  "overview.noWorkspace": { ja: "ワークスペースを作成してください。", en: "Create or select a workspace to begin." },
  "overview.noResult": { ja: "まだ結果はありません。", en: "No output yet." },
  "overview.activeThreads": { ja: "進行中フロー", en: "Active threads" },
  "overview.flow": { ja: "進行度", en: "Flow" },
  "overview.resultPasses": { ja: "保存済み結果", en: "Results" },
  "workspace.kicker": { ja: "ワークスペース", en: "Workspace" },
  "workspace.title": { ja: "ワークスペース管理", en: "Workspace control" },
  "workspace.description": { ja: "テーマごとに制作フローを分けて管理します。", en: "Split production flows by theme and manage them independently." },
  "workspace.create": { ja: "ワークスペースを作成", en: "Create workspace" },
  "workspace.name": { ja: "名前", en: "Name" },
  "workspace.namePlaceholder": { ja: "例: 海辺のキービジュアル", en: "Example: Seaside key visual" },
  "workspace.descriptionLabel": { ja: "説明", en: "Description" },
  "workspace.descriptionPlaceholder": { ja: "ビジュアルの狙いや制作メモを書く", en: "Describe the visual goal or production notes" },
  "workspace.saved": { ja: "保存済みワークスペース", en: "Saved workspaces" },
  "workspace.manage": { ja: "管理", en: "Manage" },
  "workspace.switcher": { ja: "ワークスペース切り替え", en: "Workspace switcher" },
  "workspace.active": { ja: "選択中", en: "Active" },
  "workspace.noDescription": { ja: "説明はまだありません。", en: "No description yet." },
  "workspace.completed": { ja: "完了工程", en: "Completed" },
  "workspace.results": { ja: "結果", en: "Results" },
  "studio.kicker": { ja: "スタジオ", en: "Studio" },
  "studio.title": { ja: "制作スタジオ", en: "Production studio" },
  "studio.description": { ja: "工程入力、タグ、プロンプト、パラメータ、結果確認を 1 つのワークスペースで扱います。", en: "Adjust stage input, tags, prompts, parameters, and results from one workspace." },
  "studio.resetStage": { ja: "工程を初期化", en: "Reset stage" },
  "studio.inputImage": { ja: "入力画像", en: "Input image" },
  "studio.inputPlaceholder": { ja: "クリックまたはドロップで現在工程の入力画像を設定します。", en: "Click or drop an image to seed the current stage." },
  "studio.inputCarryForward": { ja: "前工程の結果を次工程へ自動で引き継ぐこともできます。", en: "A previous stage result can be carried forward automatically." },
  "studio.stageForm": { ja: "工程フォーム", en: "Stage form" },
  "studio.presetTags": { ja: "プリセットタグ", en: "Preset tags" },
  "studio.promptNotes": { ja: "プロンプト補足", en: "Prompt notes" },
  "studio.extraPrompt": { ja: "追加プロンプト", en: "Extra prompt" },
  "studio.extraPromptPlaceholder": { ja: "工程ごとの追加指示や補足を書く", en: "Add stage-specific direction or notes" },
  "studio.negativePrompt": { ja: "ネガティブプロンプト", en: "Negative prompt" },
  "studio.negativePromptPlaceholder": { ja: "避けたい要素や崩したくない条件を書く", en: "Describe traits to avoid" },
  "studio.promptPreview": { ja: "プロンプトプレビュー", en: "Prompt preview" },
  "studio.showRequestJson": { ja: "request JSON を表示", en: "Show request JSON" },
  "studio.copyJson": { ja: "JSON をコピー", en: "Copy JSON" },
  "studio.parameters": { ja: "生成パラメータ", en: "Generation parameters" },
  "studio.resultViewer": { ja: "結果ビューア", en: "Result viewer" },
  "studio.noResult": { ja: "まだ結果はありません。現在の工程を実行してプレビューを生成してください。", en: "No result yet. Run the current stage to generate a preview." },
  "studio.statusIdleTitle": { ja: "生成待機中", en: "Ready to generate" },
  "studio.statusIdleDetail": { ja: "Run I2I を押すと、この工程の結果がここに表示されます。", en: "Press Run I2I to display the result for this stage here." },
  "studio.statusRunningTitle": { ja: "生成中", en: "Generating" },
  "studio.statusRunningDetail": { ja: "画像を生成しています。完了するとここに自動で反映されます。", en: "Generating the image now. The result will appear here automatically." },
  "studio.statusCompletedTitle": { ja: "生成完了", en: "Generation complete" },
  "studio.statusCompletedDetail": { ja: "最新結果を反映済みです。必要なら結果ページで詳細を確認できます。", en: "The latest result is ready. Open Results for the full detail view if needed." },
  "studio.statusErrorTitle": { ja: "生成エラー", en: "Generation error" },
  "studio.statusErrorDetail": { ja: "生成に失敗しました。設定、モデル、API キーを確認してください。", en: "Generation failed. Check the settings, model, and API key." },
  "studio.run": { ja: "I2I を実行", en: "Run I2I" },
  "studio.advanceStage": { ja: "次工程へ進む", en: "Advance stage" },
  "studio.openResults": { ja: "結果を開く", en: "Open results" },
  "results.kicker": { ja: "結果", en: "Results" },
  "results.title": { ja: "結果と履歴", en: "Results and history" },
  "results.description": { ja: "実行履歴の確認と、選択した結果の詳細確認を 1 画面で行います。", en: "Review the run log and inspect the selected result from one page." },
  "results.runLog": { ja: "実行履歴", en: "Run log" },
  "results.localLog": { ja: "ローカルログ", en: "local log" },
  "results.detail": { ja: "結果詳細", en: "Result detail" },
  "results.emptyHistory": { ja: "まだ履歴はありません。", en: "No run history yet." },
  "results.emptyDetail": { ja: "履歴から結果を選ぶか、スタジオで生成を実行してください。", en: "Select a result from the log or generate one in Studio." },
  "results.previewMissing": { ja: "画像プレビューはありません。", en: "Result image not available." },
  "results.detailSummary": { ja: "工程結果の詳細です。", en: "Details for the selected stage result." },
  "tags.kicker": { ja: "タグ", en: "Tags" },
  "tags.title": { ja: "プリセットとカスタムタグ", en: "Preset and custom tags" },
  "tags.description": { ja: "よく使う演出方針を 1 クリックで再利用できるようにします。", en: "Keep reusable art-direction choices one click away." },
  "tags.create": { ja: "カスタムタグを作成", en: "Create custom tag" },
  "tags.category": { ja: "カテゴリ", en: "Category" },
  "tags.label": { ja: "表示名", en: "Label" },
  "tags.labelPlaceholder": { ja: "例: 夕方の空気感", en: "Example: Evening atmosphere" },
  "tags.promptValue": { ja: "プロンプト値", en: "Prompt value" },
  "tags.valuePlaceholder": { ja: "例: 暖かい夕方の空気感", en: "Example: warm evening atmosphere" },
  "tags.library": { ja: "タグライブラリ", en: "Tag library" },
  "tags.tagsCount": { ja: "{count} 件", en: "{count} tags" },
  "settings.kicker": { ja: "設定", en: "Settings" },
  "settings.title": { ja: "設定とガイド", en: "Settings and guide" },
  "settings.tabs": { ja: "設定タブ", en: "Settings tabs" },
  "settings.close": { ja: "設定を閉じる", en: "Close settings" },
  "settings.language": { ja: "言語", en: "Language" },
  "settings.languageLabel": { ja: "表示言語", en: "Display language" },
  "settings.behavior": { ja: "挙動", en: "Behavior" },
  "settings.provider": { ja: "プロバイダー", en: "Provider" },
  "settings.apiKey": { ja: "API キー", en: "API key" },
  "settings.storageMode": { ja: "保存モード", en: "Storage mode" },
  "settings.sessionOnly": { ja: "このセッションのみ", en: "Session only" },
  "settings.saveInBrowser": { ja: "ブラウザに保存", en: "Save in browser" },
  "settings.apiKeyLabel": { ja: "API キー", en: "API key" },
  "settings.apiKeyPlaceholder": { ja: "必要な場合だけ外部 API キーを貼り付ける", en: "Paste your external API key when needed" },
  "settings.importExport": { ja: "状態の入出力", en: "Import / export state" },
  "settings.exportJson": { ja: "JSON を書き出す", en: "Export JSON" },
  "settings.importJson": { ja: "JSON を取り込む", en: "Import JSON" },
  "settings.statePlaceholder": { ja: "書き出した state JSON を貼り付けると、ワークスペースの状態を復元できます。", en: "Paste exported state JSON here to restore a workspace snapshot." },
  "settings.whatRunsHere": { ja: "この画面でできること", en: "What runs here" },
  "settings.runLocalMock": { ja: "Browser Mock は公開サイトでも安全に動く既定モードです。", en: "Browser Mock keeps the public site static-safe." },
  "settings.runI2I": { ja: "Run I2I は選択中の provider に応じて mock または実画像生成を行い、結果を state に保存します。", en: "Run I2I creates either a mock or a live image result depending on the selected provider, then stores it in state." },
  "settings.externalDraft": { ja: "OpenAI Live は API キーがあれば実画像生成、キーが無ければ request JSON の確認に使います。", en: "OpenAI Live runs a real image request when an API key is available, and falls back to request-JSON draft mode without one." },
  "settings.autoCarry": { ja: "最新の完了結果を次工程の入力へ自動で引き継ぐ。", en: "Carry the latest completed result into the next stage input." },
  "settings.compactHistory": { ja: "結果ログをより密なレイアウトで表示する。", en: "Use a denser layout for the results log." },
  "settings.model": { ja: "モデル", en: "Model" },
  "settings.strength": { ja: "強度", en: "Strength" },
  "settings.guidance": { ja: "ガイダンス", en: "Guidance" },
  "settings.steps": { ja: "ステップ", en: "Steps" },
  "settings.seed": { ja: "シード", en: "Seed" },
  "settings.apiKeyNotNeeded": { ja: "Browser Mock では API キーは不要です。", en: "Browser Mock does not require an API key." },
  "settings.apiKeyMissing": { ja: "まだ API キーは保存されていません。", en: "No API key saved yet." },
  "settings.lastUpdated": { ja: "最終更新: {value}", en: "Last updated: {value}" },
  "guide.kicker": { ja: "ガイド", en: "Guide" },
  "guide.title": { ja: "ガイドとエラーヒント", en: "Guide and error hints" },
  "guide.description": { ja: "ブラウザだけで使うときの制約や、よくある詰まりどころを確認できます。", en: "Use this tab to troubleshoot common browser-only workflow issues." },
  "status.idle": { ja: "待機中", en: "Idle" },
  "status.running": { ja: "実行中", en: "Running" },
  "status.completed": { ja: "完了", en: "Completed" },
  "status.error": { ja: "エラー", en: "Error" },
  "common.stage": { ja: "工程", en: "Stage" },
  "common.current": { ja: "現在", en: "Current" },
  "common.progress": { ja: "進行", en: "Progress" },
  "common.outputs": { ja: "出力", en: "Outputs" },
  "common.mode": { ja: "モード", en: "Mode" },
  "common.tags": { ja: "タグ", en: "Tags" },
  "common.workspace": { ja: "ワークスペース", en: "Workspace" },
  "common.notSelected": { ja: "未選択", en: "Not selected" },
  "common.noStage": { ja: "工程なし", en: "No stage" },
  "common.noWorkspaceSelected": { ja: "ワークスペース未選択", en: "No workspace selected" },
  "common.selectStage": { ja: "工程を選択してください", en: "Select a stage" },
  "common.stageGoalFallback": { ja: "工程の目的と注力カテゴリをここに表示します。", en: "Stage goal and focus categories appear here." },
  "common.resultCount": { ja: "{count} 件", en: "{count} results" },
  "messages.workspaceCreated": { ja: "ワークスペースを追加しました。", en: "Workspace created." },
  "messages.workspaceDuplicated": { ja: "ワークスペースを複製しました。", en: "Workspace duplicated." },
  "messages.cannotDeleteLastWorkspace": { ja: "最後の 1 件は削除できません。", en: "The last workspace cannot be deleted." },
  "messages.workspaceDeleted": { ja: "ワークスペースを削除しました。", en: "Workspace deleted." },
  "messages.customTagAdded": { ja: "カスタムタグを追加しました。", en: "Custom tag added." },
  "messages.apiUpdated": { ja: "API キー設定を更新しました。", en: "API key settings updated." },
  "messages.apiCleared": { ja: "API キーをクリアしました。", en: "API key cleared." },
  "messages.inputUpdated": { ja: "入力画像を更新しました。", en: "Input image updated." },
  "messages.promptCopied": { ja: "プロンプトをコピーしました。", en: "Prompt copied." },
  "messages.requestCopied": { ja: "request JSON をコピーしました。", en: "Request JSON copied." },
  "messages.clipboardFailed": { ja: "クリップボードへコピーできませんでした。", en: "Could not copy to the clipboard." },
  "messages.mockStarted": { ja: "ローカル mock 実行を開始しました。", en: "Local mock generation started." },
  "messages.liveStarted": { ja: "OpenAI 画像生成を開始しました。", en: "Started OpenAI image generation." },
  "messages.resultUpdated": { ja: "生成結果を更新しました。", en: "Generation result updated." },
  "messages.apiKeyRequired": { ja: "OpenAI Live を使うには Settings で API キーを設定してください。", en: "Set an API key in Settings to use OpenAI Live." },
  "messages.liveFailed": { ja: "画像生成に失敗しました。設定、モデル、API キーを確認してください。", en: "Image generation failed. Check the model, API key, and request settings." },
  "messages.storageQuotaExceeded": { ja: "ブラウザ保存容量の上限に達しました。次工程への自動引き継ぎ画像は参照保存に切り替えましたが、不要な結果を整理してください。", en: "Browser storage reached its quota. Carry-forward now uses references, but you should remove older results to free space." },
  "messages.noMoreStages": { ja: "これ以上進める工程はありません。", en: "There are no more stages to advance to." },
  "messages.advancedStage": { ja: "次工程「{name}」へ進みました。", en: "Moved to the next stage: {name}." },
  "messages.currentStageReset": { ja: "現在の工程を初期化しました。", en: "Current stage reset." },
  "messages.stateExported": { ja: "現在の状態を JSON に書き出しました。", en: "Current state exported as JSON." },
  "messages.stateImported": { ja: "状態を取り込みました。", en: "State imported." },
  "messages.stateImportFailed": { ja: "JSON の取り込みに失敗しました。", en: "Failed to import JSON." },
  "messages.languageChanged": { ja: "表示言語を切り替えました。", en: "Display language updated." },
  "confirm.deleteWorkspace": { ja: "「{name}」を削除しますか？", en: "Delete \"{name}\"?" },
  "confirm.resetStage": { ja: "現在の工程入力を初期状態に戻しますか？", en: "Reset the current stage input to its default state?" },
};

TEXT["actions.refresh"] = { ja: "再取得", en: "Refresh" };
TEXT["settings.modelStatusMock"] = {
  ja: "Browser Mock ではライブのモデル一覧は取得しません。",
  en: "Browser Mock does not query live model availability.",
};
TEXT["settings.modelStatusNoKey"] = {
  ja: "API キーを保存すると、このキーで使える画像モデルを読み込みます。",
  en: "Save an API key to load the image models available to this key.",
};
TEXT["settings.modelStatusLoading"] = {
  ja: "利用可能な画像モデルを読み込んでいます。",
  en: "Loading available image models.",
};
TEXT["settings.modelStatusReady"] = {
  ja: "この API キーで使える画像モデルを {count} 件読み込みました。",
  en: "Loaded {count} image models available to this API key.",
};
TEXT["settings.modelStatusError"] = {
  ja: "モデル一覧を取得できなかったため、既定モデルへフォールバックしています。",
  en: "Could not load the model list, so the UI is using a fallback model.",
};

TEXT["studio.inputCarryForward"] = {
  ja: "前工程の結果は、次工程へ進んだときにだけ次工程の入力画像として引き継がれます。",
  en: "The previous stage result is only carried into the next stage input when you advance.",
};
TEXT["settings.autoCarry"] = {
  ja: "次工程へ進むときに、直前工程の最新完了結果を次工程入力へ自動で引き継ぐ。",
  en: "When advancing, automatically carry the latest completed result into the next stage input.",
};
TEXT["settings.runI2I"] = {
  ja: "Run I2I は現在工程の結果を入力画像として再利用せず、その工程の新しい結果だけを保存します。",
  en: "Run I2I saves a fresh result for the current stage without reusing that stage's existing result as input.",
};
TEXT["results.selectItem"] = { ja: "選択", en: "Select" };
TEXT["results.selectAll"] = { ja: "全選択", en: "Select all" };
TEXT["results.clearSelection"] = { ja: "選択解除", en: "Clear selection" };
TEXT["results.deleteSelected"] = { ja: "選択削除", en: "Delete selected" };
TEXT["results.deleteAll"] = { ja: "全削除", en: "Delete all" };
TEXT["results.selectionSummary"] = {
  ja: "{selected} 件選択中 / 全 {total} 件",
  en: "{selected} selected / {total} total",
};
TEXT["messages.resultDeleted"] = { ja: "結果を削除しました。", en: "Result deleted." };
TEXT["messages.resultsDeleted"] = { ja: "{count} 件の結果を削除しました。", en: "Deleted {count} results." };
TEXT["confirm.deleteResult"] = { ja: "この結果を削除しますか？", en: "Delete this result?" };
TEXT["confirm.deleteSelectedResults"] = {
  ja: "選択した {count} 件の結果を削除しますか？",
  en: "Delete the selected {count} results?",
};
TEXT["confirm.deleteAllResults"] = {
  ja: "現在のワークスペースの結果をすべて削除しますか？",
  en: "Delete all results in the current workspace?",
};
/*

TEXT["studio.inputImage"] = { ja: "繝吶・繧ｹ逕ｻ蜒・, en: "Base image" };
TEXT["studio.inputPlaceholder"] = {
  ja: "繧ｯ繝ｪ繝・け縺ｾ縺溘・繝峨Ο繝・・縺ｧ縲∬ｿ・ｦ√・繝吶・繧ｹ逕ｻ蜒上ｒ險ｭ螳壹＠縺ｾ縺吶・,
  en: "Click or drop an image to set the base image for the current stage.",
};
TEXT["studio.referenceImages"] = { ja: "霑ｽ蜉蜿ｯ閭ｽ逕ｻ蜒・, en: "Reference images" };
TEXT["studio.referencePlaceholder"] = {
  ja: "驛ｨ蛻・ｿ・ｦ√ｄ雉・ｹｴ蜿ｯ閭ｽ逕ｨ縺ｮ逕ｻ蜒上ｒ霑ｽ蜉縺励∪縺吶・,
  en: "Add images for targeted fixes or reference material.",
};
TEXT["studio.referenceHint"] = {
  ja: "霑ｽ蜉蜿ｯ閭ｽ逕ｻ蜒上・譛螟ｧ {count} 譫懊〒縺吶ョpenAI Live 縺ｧ縺ｯ繝吶・繧ｹ逕ｻ蜒上・蜷後↓騾∽ｿ｡縺励∪縺吶・,
  en: "You can add up to {count} reference images. OpenAI Live sends them after the base image.",
};
TEXT["studio.referenceEmpty"] = {
  ja: "霑ｽ蜉蜿ｯ閭ｽ逕ｻ蜒上・縺ｾ縺縺ゅｊ縺ｾ縺帙ｓ縲・,
  en: "No additional reference images yet.",
};
TEXT["studio.baseCarryHint"] = {
  ja: "蜑榊ｷ･遞九・邨先棡縺ｯ縲∵ｬ｡蟾･遞九∈騾ｲ繧薙□縺ｨ縺阪縺 縺代・繝吶・繧ｹ逕ｻ蜒上→縺励※蠑輔″邯吶°繧後∪縺吶・,
  en: "The previous stage result is carried only as the base image when you advance.",
};
TEXT["actions.addImages"] = { ja: "逕ｻ蜒上ｒ霑ｽ蜉", en: "Add images" };
TEXT["messages.baseImageUpdated"] = { ja: "繝吶・繧ｹ逕ｻ蜒上ｒ譖ｴ譁ｰ縺励∪縺励◆縲・, en: "Base image updated." };
TEXT["messages.referenceImagesUpdated"] = {
  ja: "霑ｽ蜉蜿ｯ閭ｽ逕ｻ蜒上ｒ譖ｴ譁ｰ縺励∪縺励◆縲・,
  en: "Reference images updated.",
};
TEXT["messages.referenceImageRemoved"] = {
  ja: "霑ｽ蜉蜿ｯ閭ｽ逕ｻ蜒上ｒ蜑企勁縺励∪縺励◆縲・,
  en: "Reference image removed.",
};
TEXT["messages.referenceImagesLimit"] = {
  ja: "霑ｽ蜉蜿ｯ閭ｽ逕ｻ蜒上・譛螟ｧ {count} 譫懊∪縺ｧ縺ｧ縺吶・,
  en: "You can add up to {count} reference images.",
};
TEXT["common.baseImage"] = { ja: "繝吶・繧ｹ", en: "Base" };
TEXT["common.referenceImages"] = { ja: "蜿ｯ閭ｽ", en: "References" };

*/
TEXT["studio.inputImage"] = { ja: "\u30d9\u30fc\u30b9\u753b\u50cf", en: "Base image" };
TEXT["studio.baseImage"] = { ja: "\u30d9\u30fc\u30b9\u753b\u50cf", en: "Base image" };
TEXT["studio.inputPlaceholder"] = {
  ja: "\u30af\u30ea\u30c3\u30af\u307e\u305f\u306f\u30c9\u30ed\u30c3\u30d7\u3067\u3001\u73fe\u5728\u5de5\u7a0b\u306e\u30d9\u30fc\u30b9\u753b\u50cf\u3092\u8a2d\u5b9a\u3057\u307e\u3059\u3002",
  en: "Click or drop an image to set the base image for the current stage.",
};
TEXT["studio.referenceImages"] = { ja: "\u8ffd\u52a0\u53c2\u7167\u753b\u50cf", en: "Reference images" };
TEXT["studio.referencePlaceholder"] = {
  ja: "\u90e8\u5206\u4fee\u6b63\u3084\u8cc7\u6599\u53c2\u7167\u7528\u306e\u753b\u50cf\u3092\u8ffd\u52a0\u3057\u307e\u3059\u3002",
  en: "Add images for targeted fixes or reference material.",
};
TEXT["studio.referenceHint"] = {
  ja: "\u8ffd\u52a0\u53c2\u7167\u753b\u50cf\u306f\u6700\u5927 {count} \u679a\u3067\u3059\u3002OpenAI Live \u3067\u306f\u30d9\u30fc\u30b9\u753b\u50cf\u306e\u5f8c\u306b\u53c2\u7167\u753b\u50cf\u3092\u9001\u4fe1\u3057\u307e\u3059\u3002",
  en: "You can add up to {count} reference images. OpenAI Live sends them after the base image.",
};
TEXT["studio.referenceEmpty"] = {
  ja: "\u8ffd\u52a0\u53c2\u7167\u753b\u50cf\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093\u3002",
  en: "No additional reference images yet.",
};
TEXT["studio.baseCarryHint"] = {
  ja: "\u524d\u5de5\u7a0b\u306e\u7d50\u679c\u306f\u3001\u6b21\u5de5\u7a0b\u3078\u9032\u3093\u3060\u3068\u304d\u3060\u3051\u30d9\u30fc\u30b9\u753b\u50cf\u3068\u3057\u3066\u5f15\u304d\u7d99\u304c\u308c\u307e\u3059\u3002",
  en: "The previous stage result is carried only as the base image when you advance.",
};
TEXT["actions.addImages"] = { ja: "\u753b\u50cf\u3092\u8ffd\u52a0", en: "Add images" };
TEXT["actions.pasteImage"] = { ja: "\u753b\u50cf\u3092\u8cbc\u308a\u4ed8\u3051", en: "Paste image" };
TEXT["actions.pasteImages"] = { ja: "\u753b\u50cf\u3092\u8cbc\u308a\u4ed8\u3051", en: "Paste images" };
TEXT["settings.storageCleanup"] = { ja: "\u4fdd\u5b58\u6574\u7406", en: "Storage cleanup" };
TEXT["settings.storageCleanupDescription"] = {
  ja: "\u30d7\u30ed\u30f3\u30d7\u30c8\u3068\u5b9f\u884c\u5c65\u6b74\u306f\u6b8b\u3057\u305f\u307e\u307e\u3001\u751f\u6210\u7d50\u679c\u306e\u30d7\u30ec\u30d3\u30e5\u30fc\u3068\u5de5\u7a0b\u5165\u529b\u753b\u50cf\u3092\u30d6\u30e9\u30a6\u30b6\u4fdd\u5b58\u304b\u3089\u524a\u9664\u3057\u307e\u3059\u3002",
  en: "Clear generated previews and stored stage input images from browser storage while keeping prompts and run history.",
};
TEXT["settings.clearResultCache"] = { ja: "\u4fdd\u5b58\u753b\u50cf\u3092\u524a\u9664", en: "Clear stored images" };
TEXT["settings.resultCacheSummary"] = {
  ja: "\u4fdd\u5b58\u6e08\u307f\u753b\u50cf: \u7d50\u679c {resultCount} \u4ef6 / \u5de5\u7a0b\u5165\u529b {stageCount} \u4ef6 / \u7d04 {size}",
  en: "Stored images: {resultCount} results / {stageCount} stage inputs / approx {size}",
};
TEXT["settings.resultCacheEmpty"] = {
  ja: "\u4fdd\u5b58\u6e08\u307f\u753b\u50cf\u306f\u3042\u308a\u307e\u305b\u3093\u3002",
  en: "There are no stored images to clear.",
};
TEXT["studio.pasteHint"] = {
  ja: "\u300c\u753b\u50cf\u3092\u8cbc\u308a\u4ed8\u3051\u300d\u307e\u305f\u306f\u3053\u306e\u9818\u57df\u3092\u9078\u629e\u3057\u3066 Ctrl+V \u3067\u8cbc\u308a\u4ed8\u3051\u3067\u304d\u307e\u3059\u3002",
  en: "Use Paste image or focus this area and press Ctrl+V.",
};
TEXT["studio.referencePasteHint"] = {
  ja: "\u300c\u753b\u50cf\u3092\u8cbc\u308a\u4ed8\u3051\u300d\u307e\u305f\u306f\u3053\u306e\u9818\u57df\u3092\u9078\u629e\u3057\u3066 Ctrl+V \u3067\u53c2\u7167\u753b\u50cf\u3092\u8ffd\u52a0\u3067\u304d\u307e\u3059\u3002",
  en: "Use Paste images or focus this area and press Ctrl+V.",
};
TEXT["messages.baseImageUpdated"] = { ja: "\u30d9\u30fc\u30b9\u753b\u50cf\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f\u3002", en: "Base image updated." };
TEXT["messages.referenceImagesUpdated"] = {
  ja: "\u8ffd\u52a0\u53c2\u7167\u753b\u50cf\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f\u3002",
  en: "Reference images updated.",
};
TEXT["messages.referenceImageRemoved"] = {
  ja: "\u8ffd\u52a0\u53c2\u7167\u753b\u50cf\u3092\u524a\u9664\u3057\u307e\u3057\u305f\u3002",
  en: "Reference image removed.",
};
TEXT["messages.referenceImagesLimit"] = {
  ja: "\u8ffd\u52a0\u53c2\u7167\u753b\u50cf\u306f\u6700\u5927 {count} \u679a\u307e\u3067\u3067\u3059\u3002",
  en: "You can add up to {count} reference images.",
};
TEXT["messages.clipboardReadUnsupported"] = {
  ja: "\u3053\u306e\u30d6\u30e9\u30a6\u30b6\u3067\u306f\u30ef\u30f3\u30af\u30ea\u30c3\u30af\u306e\u8cbc\u308a\u4ed8\u3051\u304c\u4f7f\u3048\u307e\u305b\u3093\u3002Studio \u3067\u8cbc\u308a\u4ed8\u3051\u5148\u3092\u9078\u3093\u3067 Ctrl+V \u3092\u4f7f\u3063\u3066\u304f\u3060\u3055\u3044\u3002",
  en: "One-click clipboard paste is not available here. Choose a Studio target and use Ctrl+V instead.",
};
TEXT["messages.clipboardReadFailed"] = {
  ja: "\u30af\u30ea\u30c3\u30d7\u30dc\u30fc\u30c9\u3092\u8aad\u307f\u53d6\u308c\u307e\u305b\u3093\u3067\u3057\u305f\u3002Ctrl+V \u3067\u306e\u8cbc\u308a\u4ed8\u3051\u3092\u8a66\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
  en: "Could not read the clipboard. Try pasting with Ctrl+V instead.",
};
TEXT["messages.clipboardImageMissing"] = {
  ja: "\u30af\u30ea\u30c3\u30d7\u30dc\u30fc\u30c9\u306b\u753b\u50cf\u304c\u3042\u308a\u307e\u305b\u3093\u3002",
  en: "No image was found in the clipboard.",
};
TEXT["messages.resultCacheCleared"] = {
  ja: "\u30d6\u30e9\u30a6\u30b6\u4fdd\u5b58\u304b\u3089 {count} \u4ef6\u306e\u753b\u50cf\u3092\u524a\u9664\u3057\u307e\u3057\u305f\u3002",
  en: "Cleared {count} stored images from browser storage.",
};
TEXT["messages.storageQuotaExceeded"] = {
  ja: "\u30d6\u30e9\u30a6\u30b6\u4fdd\u5b58\u5bb9\u91cf\u306e\u4e0a\u9650\u306b\u9054\u3057\u307e\u3057\u305f\u3002Settings \u306e\u4fdd\u5b58\u6574\u7406\u304b\u3089\u4fdd\u5b58\u753b\u50cf\u3092\u524a\u9664\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
  en: "Browser storage reached its quota. Clear stored images from Settings > Storage cleanup.",
};
TEXT["confirm.clearResultCache"] = {
  ja: "{count} \u4ef6\u306e\u4fdd\u5b58\u753b\u50cf\u3092\u524a\u9664\u3057\u307e\u3059\u304b\uff1f\u30d7\u30ed\u30f3\u30d7\u30c8\u3068\u5c65\u6b74\u306f\u6b8b\u308a\u307e\u3059\u304c\u3001\u7d50\u679c\u30d7\u30ec\u30d3\u30e5\u30fc\u3068\u8cbc\u308a\u4ed8\u3051\u6e08\u307f\u306e\u5de5\u7a0b\u753b\u50cf\u3001\u5f15\u304d\u7d99\u304e\u53c2\u7167\u306f\u5931\u308f\u308c\u307e\u3059\u3002",
  en: "Clear {count} stored images? Prompts and history stay, but result previews, pasted stage images, and carry references will be removed.",
};
TEXT["results.previewMissing"] = {
  ja: "\u753b\u50cf\u30d7\u30ec\u30d3\u30e5\u30fc\u306f\u3042\u308a\u307e\u305b\u3093\u3002\u30d6\u30e9\u30a6\u30b6\u4fdd\u5b58\u304b\u3089\u524a\u9664\u3055\u308c\u305f\u53ef\u80fd\u6027\u304c\u3042\u308a\u307e\u3059\u3002",
  en: "Result image not available. It may have been cleared from browser storage.",
};
TEXT["studio.parameterHelpLabel"] = {
  ja: "\u9805\u76ee\u306e\u610f\u5473",
  en: "Parameter guide",
};
TEXT["studio.parameterHelpDefaultTitle"] = {
  ja: "\u9805\u76ee\u3092\u9078\u629e",
  en: "Select a parameter",
};
TEXT["studio.parameterHelpDefaultDetail"] = {
  ja: "\u30d1\u30e9\u30e1\u30fc\u30bf\u306b\u30d5\u30a9\u30fc\u30ab\u30b9\u3059\u308b\u3068\u3001\u3069\u3053\u3092\u8abf\u6574\u3059\u308b\u9805\u76ee\u304b\u3092\u3053\u3053\u306b\u8868\u793a\u3057\u307e\u3059\u3002",
  en: "Focus a parameter to see what it changes and when to adjust it.",
};
TEXT["studio.parameterHelpProviderDetail"] = {
  ja: "\u751f\u6210\u306e\u5b9f\u884c\u5148\u3092\u9078\u3073\u307e\u3059\u3002Browser Mock \u306f\u30d6\u30e9\u30a6\u30b6\u5185\u306e\u30e2\u30c3\u30af\u751f\u6210\u3001OpenAI Live \u306f\u4fdd\u5b58\u3057\u305f API \u30ad\u30fc\u3067\u5b9f\u753b\u50cf\u751f\u6210\u3092\u884c\u3044\u307e\u3059\u3002",
  en: "Choose where generation runs. Browser Mock stays local, while OpenAI Live uses the saved API key for real image generation.",
};
TEXT["studio.parameterHelpModelDetail"] = {
  ja: "\u751f\u6210\u306b\u4f7f\u3046\u753b\u50cf\u30e2\u30c7\u30eb\u3092\u9078\u3073\u307e\u3059\u3002OpenAI Live \u3067\u306f\u3001\u4fdd\u5b58\u3057\u305f API \u30ad\u30fc\u3067\u5229\u7528\u53ef\u80fd\u306a\u30e2\u30c7\u30eb\u4e00\u89a7\u304c\u8aad\u307f\u8fbc\u307e\u308c\u307e\u3059\u3002",
  en: "Select the image model used for generation. In OpenAI Live, the list is loaded from the models available to the saved API key.",
};
TEXT["studio.parameterHelpStrengthDetail"] = {
  ja: "\u30d9\u30fc\u30b9\u753b\u50cf\u304b\u3089\u3069\u308c\u3060\u3051\u5909\u5316\u3092\u8a31\u3059\u304b\u3092\u8abf\u6574\u3057\u307e\u3059\u3002\u4f4e\u3044\u3068\u5143\u753b\u50cf\u3092\u6b8b\u3057\u3084\u3059\u304f\u3001\u9ad8\u3044\u3068\u5909\u66f4\u5e45\u304c\u5927\u304d\u304f\u306a\u308a\u307e\u3059\u3002",
  en: "Controls how far the edit can move away from the base image. Lower values preserve the source more closely, while higher values allow larger changes.",
};
TEXT["studio.parameterHelpGuidanceDetail"] = {
  ja: "\u30d7\u30ed\u30f3\u30d7\u30c8\u306b\u3069\u308c\u3060\u3051\u5f37\u304f\u5f93\u3046\u304b\u3092\u8abf\u6574\u3057\u307e\u3059\u3002\u9ad8\u3044\u307b\u3069\u6307\u793a\u306b\u5fe0\u5b9f\u306b\u306a\u308a\u307e\u3059\u304c\u3001\u753b\u9762\u304c\u786c\u304f\u306a\u308b\u5834\u5408\u304c\u3042\u308a\u307e\u3059\u3002",
  en: "Controls how strictly the model follows the prompt. Higher guidance enforces the prompt more strongly, but can make the result feel stiffer.",
};
TEXT["studio.parameterHelpStepsDetail"] = {
  ja: "\u751f\u6210\u306e\u5185\u90e8\u53cd\u5fa9\u56de\u6570\u3092\u8abf\u6574\u3057\u307e\u3059\u3002\u5897\u3084\u3059\u3068\u5b89\u5b9a\u6027\u3084\u5bc6\u5ea6\u304c\u4e0a\u304c\u308b\u3053\u3068\u304c\u3042\u308a\u307e\u3059\u304c\u3001\u51e6\u7406\u306f\u9577\u304f\u306a\u308a\u307e\u3059\u3002",
  en: "Controls how many refinement passes the generation uses. More steps can improve stability or detail, but they also take longer.",
};
TEXT["studio.parameterHelpSeedDetail"] = {
  ja: "\u4e71\u6570\u306e\u51fa\u767a\u70b9\u3092\u6c7a\u3081\u307e\u3059\u3002\u540c\u3058\u30b7\u30fc\u30c9\u3092\u4f7f\u3044\u7d9a\u3051\u308b\u3068\u3001\u8fd1\u3044\u8a66\u884c\u3092\u518d\u73fe\u3057\u3084\u3059\u304f\u306a\u308a\u307e\u3059\u3002",
  en: "Controls the random starting point. Reusing the same seed makes it easier to reproduce similar variations.",
};
TEXT["common.baseImage"] = { ja: "\u30d9\u30fc\u30b9", en: "Base" };
TEXT["common.referenceImages"] = { ja: "\u53c2\u7167", en: "References" };
TEXT["actions.optimizePrompt"] = {
  ja: "OpenAI \u3067\u6574\u7406",
  en: "Optimize with OpenAI",
};
TEXT["actions.clearOptimizedPrompt"] = {
  ja: "\u6574\u7406\u3092\u89e3\u9664",
  en: "Clear optimized prompt",
};
TEXT["studio.promptOptimizeDefault"] = {
  ja: "\u9078\u629e\u3057\u305f\u30bf\u30b0\u3068\u5165\u529b\u5185\u5bb9\u304b\u3089 OpenAI \u3067\u30d7\u30ed\u30f3\u30d7\u30c8\u3092\u6574\u7406\u3067\u304d\u307e\u3059\u3002",
  en: "Use OpenAI to refine the draft prompt from the selected tags and stage inputs.",
};
TEXT["studio.promptOptimizeNoKey"] = {
  ja: "OpenAI \u3067\u6574\u7406\u3059\u308b\u306b\u306f Settings \u3067 API \u30ad\u30fc\u3092\u4fdd\u5b58\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
  en: "Save an API key in Settings to optimize prompts with OpenAI.",
};
TEXT["studio.promptOptimizeRunning"] = {
  ja: "OpenAI \u3067\u30d7\u30ed\u30f3\u30d7\u30c8\u3092\u6574\u7406\u3057\u3066\u3044\u307e\u3059\u3002",
  en: "Optimizing the prompt with OpenAI.",
};
TEXT["studio.promptOptimizeActive"] = {
  ja: "OpenAI \u6574\u7406\u30d7\u30ed\u30f3\u30d7\u30c8\u3092\u9069\u7528\u4e2d\u3002\u66f4\u65b0: {value}",
  en: "OpenAI-optimized prompt active. Updated: {value}",
};
TEXT["messages.promptOptimized"] = {
  ja: "\u30d7\u30ed\u30f3\u30d7\u30c8\u3092 OpenAI \u3067\u6574\u7406\u3057\u307e\u3057\u305f\u3002",
  en: "Prompt optimized with OpenAI.",
};
TEXT["messages.promptOptimizationCleared"] = {
  ja: "\u6574\u7406\u6e08\u307f\u30d7\u30ed\u30f3\u30d7\u30c8\u3092\u89e3\u9664\u3057\u307e\u3057\u305f\u3002",
  en: "Cleared the optimized prompt.",
};
TEXT["messages.promptOptimizationFailed"] = {
  ja: "\u30d7\u30ed\u30f3\u30d7\u30c8\u6574\u7406\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002API \u30ad\u30fc\u3068 OpenAI \u306e\u5fdc\u7b54\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
  en: "Prompt optimization failed. Check the API key and the OpenAI response.",
};
TEXT["messages.promptOptimizationStale"] = {
  ja: "\u5165\u529b\u5185\u5bb9\u304c\u5909\u66f4\u3055\u308c\u305f\u305f\u3081\u3001\u53e4\u3044\u6574\u7406\u7d50\u679c\u306f\u9069\u7528\u3057\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u3082\u3046\u4e00\u5ea6\u5b9f\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
  en: "The prompt changed while optimizing, so the older result was not applied. Run it again.",
};
TEXT["studio.stagePresets"] = {
  ja: "\u5de5\u7a0b\u30d7\u30ea\u30bb\u30c3\u30c8",
  en: "Stage presets",
};
TEXT["studio.stagePresetDescription"] = {
  ja: "\u5f53\u524d\u5de5\u7a0b\u5411\u3051\u306e\u5b9a\u756a\u30bb\u30c3\u30c8\u3092\u5373\u5ea7\u306b\u547c\u3073\u51fa\u3057\u307e\u3059\u3002",
  en: "Load a tuned starting set for the current stage.",
};
TEXT["messages.stagePresetApplied"] = {
  ja: "\u5de5\u7a0b\u30d7\u30ea\u30bb\u30c3\u30c8\u300c{name}\u300d\u3092\u9069\u7528\u3057\u307e\u3057\u305f\u3002",
  en: "Applied stage preset: {name}.",
};

const EXTRA_TAG_CATEGORIES = [
  {
    id: "icon",
    nameJa: "アイコン",
    nameEn: "Icon",
    descriptionJa: "ゲームUIや単体アイコン向けの可読性プリセット",
    descriptionEn: "Readability presets for game UI and standalone icons.",
  },
  {
    id: "object",
    nameJa: "物体",
    nameEn: "Object",
    descriptionJa: "非キャラクターのプロップや単体物体向けのプリセット",
    descriptionEn: "Presets for non-character props and standalone objects.",
  },
];
const EXTRA_BUILT_IN_TAGS = [
  { id: "tag-character-03", categoryId: "character", labelJa: "ヒロイック", labelEn: "Heroic", valueJa: "ヒロイックな主人公感", valueEn: "heroic protagonist presence", isBuiltIn: true },
  { id: "tag-character-04", categoryId: "character", labelJa: "マスコット寄り", labelEn: "Mascot-like", valueJa: "単純化されたマスコット感", valueEn: "simple mascot-like character", isBuiltIn: true },
  { id: "tag-background-03", categoryId: "background", labelJa: "遺跡背景", labelEn: "Ruins", valueJa: "ファンタジー遺跡の背景", valueEn: "fantasy ruins background", isBuiltIn: true },
  { id: "tag-background-04", categoryId: "background", labelJa: "スタジオ背景", labelEn: "Studio backdrop", valueJa: "単純なスタジオ背景", valueEn: "plain studio backdrop", isBuiltIn: true },
  { id: "tag-icon-01", categoryId: "icon", labelJa: "ゲームUIアイコン", labelEn: "Game UI icon", valueJa: "ゲームUI向けの単体アイコン", valueEn: "single game UI icon", isBuiltIn: true },
  { id: "tag-icon-02", categoryId: "icon", labelJa: "小サイズ可読", labelEn: "Readable small", valueJa: "小さい表示でも判別しやすい", valueEn: "readable at small size", isBuiltIn: true },
  { id: "tag-icon-03", categoryId: "icon", labelJa: "シルエット明快", labelEn: "Clear silhouette", valueJa: "シルエットが明快", valueEn: "clear silhouette", isBuiltIn: true },
  { id: "tag-icon-04", categoryId: "icon", labelJa: "高コントラスト縁", labelEn: "High-contrast edge", valueJa: "輪郭のコントラストが高い", valueEn: "high-contrast icon edges", isBuiltIn: true },
  { id: "tag-object-01", categoryId: "object", labelJa: "ハードサーフェス", labelEn: "Hard surface", valueJa: "ハードサーフェスの単体物体", valueEn: "hard-surface prop", isBuiltIn: true },
  { id: "tag-object-02", categoryId: "object", labelJa: "魔法の遺物", labelEn: "Magic artifact", valueJa: "魔法の遺物", valueEn: "magical artifact", isBuiltIn: true },
  { id: "tag-object-03", categoryId: "object", labelJa: "消費アイテム", labelEn: "Consumable item", valueJa: "消費アイテム", valueEn: "consumable item", isBuiltIn: true },
  { id: "tag-object-04", categoryId: "object", labelJa: "機械装置", labelEn: "Mechanical device", valueJa: "機械装置", valueEn: "mechanical device", isBuiltIn: true },
];
const ALL_TAG_CATEGORIES = [...TAG_CATEGORIES, ...EXTRA_TAG_CATEGORIES];
const ALL_BUILT_IN_TAGS = [...BUILT_IN_TAGS, ...EXTRA_BUILT_IN_TAGS];
const STUDIO_TAG_CATEGORY_IDS = ["character", "background", "icon", "object"];
const STAGE_PRESETS = {
  "stage-04": [
    {
      id: "preset-stage-04-character",
      labelJa: "キャラクターKV",
      labelEn: "Character key art",
      descriptionJa: "主役の立ち位置と視線導線を先に固めます。",
      descriptionEn: "Lock the hero placement and focal flow first.",
      fields: {
        subject: "全身キャラクターキーアート",
        pose: "立ち姿、視線誘導が明確",
        composition: "中央構図",
        cameraAngle: "アイレベル",
        background: "シンプルな環境ラフ",
        stageKeywords: "ラフ構図、視線誘導、主役が読みやすい",
      },
      tagIds: ["tag-character-03", "tag-composition-01", "tag-camera-01", "tag-quality-01"],
      extraPrompt: "キャラクターが主役、全身が読みやすい",
    },
    {
      id: "preset-stage-04-background",
      labelJa: "背景シーン",
      labelEn: "Background scene",
      descriptionJa: "景観と遠近の流れを見せるラフに寄せます。",
      descriptionEn: "Bias the stage toward scenery and depth flow.",
      fields: {
        subject: "背景キービジュアル",
        pose: "人物なし、遠景から中景へ流れる構図",
        composition: "横長で奥行きが出る構図",
        cameraAngle: "広角アイレベル",
        background: "景観と光の流れを見せる",
        stageKeywords: "ラフ構図、遠近感、空気感",
      },
      tagIds: ["tag-background-03", "tag-composition-02", "tag-lighting-01"],
      extraPrompt: "背景主役、環境の抜けと視線誘導を優先",
    },
    {
      id: "preset-stage-04-icon",
      labelJa: "ゲームアイコン",
      labelEn: "Game icon",
      descriptionJa: "単体アイコン用に余白とシルエットを優先します。",
      descriptionEn: "Prioritize whitespace and silhouette for a standalone icon.",
      fields: {
        subject: "ゲームアイテムアイコン",
        pose: "単体を正面寄りに見せる",
        composition: "中央構図、余白多め",
        cameraAngle: "正面寄り",
        background: "無地または極簡単な下地",
        stageKeywords: "シンプルなシルエット、可読性、小サイズで認識しやすい",
      },
      tagIds: ["tag-icon-01", "tag-icon-02", "tag-icon-03", "tag-icon-04"],
      extraPrompt: "非キャラクター、単体アイコン、余計な背景要素なし",
    },
    {
      id: "preset-stage-04-object",
      labelJa: "単体物体",
      labelEn: "Single object",
      descriptionJa: "用途と形状が一目で分かる物体ラフです。",
      descriptionEn: "Start from a single object rough with obvious function and shape.",
      fields: {
        subject: "単体プロップデザイン",
        pose: "3/4ビューで形状が分かる",
        composition: "中央構図",
        cameraAngle: "3/4 view",
        background: "プレーンな背景",
        stageKeywords: "形状把握、シルエット重視、工業デザイン",
      },
      tagIds: ["tag-object-01", "tag-object-04", "tag-icon-03"],
      extraPrompt: "物体主役、用途と形状が一目で分かる",
    },
  ],
  "stage-05": [
    {
      id: "preset-stage-05-character",
      labelJa: "キャラクターKV",
      labelEn: "Character key art",
      descriptionJa: "ポーズとキャラ印象を読みやすく整理します。",
      descriptionEn: "Refine pose clarity and character impression.",
      fields: {
        subject: "全身キャラクターキーアート",
        character: "ヒロイックな主人公",
        pose: "立ち姿、体重移動が分かる",
        outfitDetails: "衣装の大きい面とアクセントを整理",
        hairstyle: "シルエットが明快な髪型",
        facialExpression: "落ち着いた自信",
        background: "主役を邪魔しない環境ラフ",
      },
      tagIds: ["tag-character-03", "tag-pose-01", "tag-quality-01"],
      extraPrompt: "キャラクターの印象とシルエットを優先",
    },
    {
      id: "preset-stage-05-background",
      labelJa: "背景シーン",
      labelEn: "Background scene",
      descriptionJa: "人物なしで景観の導線を詰めます。",
      descriptionEn: "Refine a no-character scene with environment flow.",
      fields: {
        subject: "背景シーンラフ",
        character: "人物なし",
        pose: "遠景から中景へ流れる導線",
        outfitDetails: "建築や自然物の密度差",
        hairstyle: "",
        facialExpression: "",
        background: "空気遠近と光源を見せる背景",
      },
      tagIds: ["tag-background-03", "tag-background-04", "tag-composition-02"],
      extraPrompt: "背景主役、景観の流れを整える",
    },
    {
      id: "preset-stage-05-icon",
      labelJa: "ゲームアイコン",
      labelEn: "Game icon",
      descriptionJa: "単体アイコンの向きと主要面を整理します。",
      descriptionEn: "Refine viewing angle and major surfaces for an icon.",
      fields: {
        subject: "単体ゲームアイテム",
        character: "非キャラクターの単体オブジェクト",
        pose: "浮遊した3/4ビュー",
        outfitDetails: "材質の切り替えと輪郭のアクセント",
        hairstyle: "",
        facialExpression: "",
        background: "フラットなアイコン用背景",
      },
      tagIds: ["tag-icon-01", "tag-icon-02", "tag-icon-03", "tag-object-03"],
      extraPrompt: "小サイズ表示で判別しやすいシルエット",
    },
    {
      id: "preset-stage-05-object",
      labelJa: "単体物体",
      labelEn: "Single object",
      descriptionJa: "用途が伝わる角度と面構成を優先します。",
      descriptionEn: "Prioritize a view angle and surfaces that explain the object.",
      fields: {
        subject: "単体メカ/プロップ",
        character: "非キャラクターの物体",
        pose: "用途が伝わる角度",
        outfitDetails: "パネルラインや接合部",
        hairstyle: "",
        facialExpression: "",
        background: "プレーン背景",
      },
      tagIds: ["tag-object-01", "tag-object-04", "tag-icon-03"],
      extraPrompt: "物体の構造と用途を読みやすく見せる",
    },
  ],
  "stage-06": [
    {
      id: "preset-stage-06-character",
      labelJa: "キャラクターKV",
      labelEn: "Character key art",
      descriptionJa: "線の整理と顔周りの読みやすさを優先します。",
      descriptionEn: "Focus cleanup on line clarity and face readability.",
      fields: {
        subject: "全身キャラクター線画",
        character: "ヒロイックな主人公",
        pose: "シルエットが明快",
        outfit: "大きな形が読みやすい衣装",
        hairstyle: "輪郭が明快な髪型",
        facialExpression: "穏やかな自信",
        qualityKeywords: "輪郭明快、整理された線、主役が読みやすい",
      },
      tagIds: ["tag-character-03", "tag-quality-01"],
      extraPrompt: "顔周りと手元の線を特に整理する",
    },
    {
      id: "preset-stage-06-background",
      labelJa: "背景シーン",
      labelEn: "Background scene",
      descriptionJa: "背景線画の遠近と輪郭整理を優先します。",
      descriptionEn: "Focus cleanup on perspective and environmental contours.",
      fields: {
        subject: "背景線画",
        character: "人物なし",
        pose: "パースラインが明快",
        outfit: "建築や地形の大きな面",
        hairstyle: "",
        facialExpression: "",
        qualityKeywords: "遠近感、読みやすい輪郭、密度差",
      },
      tagIds: ["tag-background-03", "tag-composition-02"],
      extraPrompt: "大中小の形を分けて背景線を整理する",
    },
    {
      id: "preset-stage-06-icon",
      labelJa: "ゲームアイコン",
      labelEn: "Game icon",
      descriptionJa: "輪郭と主要パーツ分割をアイコン向けに整えます。",
      descriptionEn: "Cleanup icon contours and major part separation.",
      fields: {
        subject: "ゲームアイコン線画",
        character: "非キャラクターオブジェクト",
        pose: "単体3/4ビュー",
        outfit: "主要パーツを簡潔に分割",
        hairstyle: "",
        facialExpression: "",
        qualityKeywords: "アイコン可読性、輪郭明快、面の整理",
      },
      tagIds: ["tag-icon-01", "tag-icon-02", "tag-icon-03", "tag-icon-04"],
      extraPrompt: "輪郭と内側の形を小サイズ向けに単純化する",
    },
    {
      id: "preset-stage-06-object",
      labelJa: "単体物体",
      labelEn: "Single object",
      descriptionJa: "構造線と面の切り替えを優先します。",
      descriptionEn: "Prioritize structural lines and plane transitions.",
      fields: {
        subject: "単体物体線画",
        character: "非キャラクターの物体",
        pose: "用途が分かる3/4ビュー",
        outfit: "構造面の切り替えが明快",
        hairstyle: "",
        facialExpression: "",
        qualityKeywords: "構造線、面の整理、硬質感",
      },
      tagIds: ["tag-object-01", "tag-object-04"],
      extraPrompt: "接合部と大きい形の関係を明瞭にする",
    },
  ],
  "stage-07": [
    {
      id: "preset-stage-07-character",
      labelJa: "キャラクターKV",
      labelEn: "Character key art",
      descriptionJa: "キャラ配色と肌・髪・衣装の差を整えます。",
      descriptionEn: "Tune character palette separation across skin, hair, and outfit.",
      fields: {
        subject: "全身キャラクターカラー",
        character: "ヒロイックな主人公",
        outfitColors: "ベース1色 + アクセント1色",
        hairColor: "暗めの主色",
        eyeColor: "差し色になる高彩度色",
        colorMood: "主役が立つ整理された配色",
        lighting: "柔らかい主光源",
      },
      tagIds: ["tag-character-03", "tag-quality-02", "tag-lighting-01"],
      extraPrompt: "主役が背景に埋もれない配色差を作る",
    },
    {
      id: "preset-stage-07-background",
      labelJa: "背景シーン",
      labelEn: "Background scene",
      descriptionJa: "空気感と時間帯の色を優先します。",
      descriptionEn: "Prioritize atmosphere and time-of-day palette.",
      fields: {
        subject: "背景カラースタディ",
        character: "人物なし",
        outfitColors: "地面・建築・空の配色",
        hairColor: "",
        eyeColor: "",
        colorMood: "空気遠近が出る配色",
        lighting: "時間帯が伝わる光",
      },
      tagIds: ["tag-background-03", "tag-background-04", "tag-lighting-01"],
      extraPrompt: "空と地面の色差で奥行きを出す",
    },
    {
      id: "preset-stage-07-icon",
      labelJa: "ゲームアイコン",
      labelEn: "Game icon",
      descriptionJa: "識別しやすい色差と発光差を優先します。",
      descriptionEn: "Emphasize readable color separation and glow contrast.",
      fields: {
        subject: "ゲームアイテムアイコンカラー",
        character: "非キャラクターオブジェクト",
        outfitColors: "主色 + 発光アクセント + 影色",
        hairColor: "",
        eyeColor: "",
        colorMood: "高コントラストで小サイズ向き",
        lighting: "エッジが立つライティング",
      },
      tagIds: ["tag-icon-01", "tag-icon-02", "tag-icon-04"],
      extraPrompt: "シルエットと発光差で小サイズでも認識できるようにする",
    },
    {
      id: "preset-stage-07-object",
      labelJa: "単体物体",
      labelEn: "Single object",
      descriptionJa: "材質差が伝わる配色設計に寄せます。",
      descriptionEn: "Bias the color pass toward material separation.",
      fields: {
        subject: "単体物体カラー",
        character: "非キャラクターの物体",
        outfitColors: "材質ごとに色温度差をつける",
        hairColor: "",
        eyeColor: "",
        colorMood: "機能別に色が分かれる",
        lighting: "立体感が出る主光源",
      },
      tagIds: ["tag-object-01", "tag-object-04", "tag-lighting-01"],
      extraPrompt: "材質ごとに明度差と色温度差をつける",
    },
  ],
  "stage-08": [
    {
      id: "preset-stage-08-character",
      labelJa: "キャラクターKV",
      labelEn: "Character key art",
      descriptionJa: "肌・布・髪の材質差と奥行きを強めます。",
      descriptionEn: "Increase depth and material separation across skin, cloth, and hair.",
      fields: {
        subject: "全身キャラクターレンダー",
        character: "ヒロイックな主人公",
        pose: "主役が読みやすい立ち姿",
        materialNotes: "肌、布、金属アクセントの差を出す",
        backgroundDetails: "主役を邪魔しない密度",
        lighting: "主光源 + 弱いリムライト",
        artStyle: "アニメ寄りの密度感",
      },
      tagIds: ["tag-character-03", "tag-lighting-02", "tag-quality-01"],
      extraPrompt: "顔周りと手元を一段上の密度で描く",
    },
    {
      id: "preset-stage-08-background",
      labelJa: "背景シーン",
      labelEn: "Background scene",
      descriptionJa: "背景の奥行きと空気層を強めます。",
      descriptionEn: "Increase environmental depth and atmospheric layers.",
      fields: {
        subject: "背景レンダーパス",
        character: "人物なし",
        pose: "視線が奥へ流れる",
        materialNotes: "石、植物、空気層の差を出す",
        backgroundDetails: "前景・中景・遠景の密度差",
        lighting: "時間帯が分かる光",
        artStyle: "背景美術寄り",
      },
      tagIds: ["tag-background-03", "tag-lighting-01", "tag-quality-02"],
      extraPrompt: "前景中景遠景でコントラスト差をつける",
    },
    {
      id: "preset-stage-08-icon",
      labelJa: "ゲームアイコン",
      labelEn: "Game icon",
      descriptionJa: "材質と発光でアイコンの存在感を上げます。",
      descriptionEn: "Raise icon presence with material and glow treatment.",
      fields: {
        subject: "ゲームアイテムアイコンレンダー",
        character: "非キャラクターオブジェクト",
        pose: "単体3/4ビュー",
        materialNotes: "金属、ガラス、発光部を分ける",
        backgroundDetails: "背景要素は最小限",
        lighting: "エッジが立つライティング",
        artStyle: "ゲームUI向けの高コントラスト",
      },
      tagIds: ["tag-icon-01", "tag-icon-02", "tag-icon-04", "tag-object-02"],
      extraPrompt: "小サイズでも主要面と発光部が読めるようにする",
    },
    {
      id: "preset-stage-08-object",
      labelJa: "単体物体",
      labelEn: "Single object",
      descriptionJa: "ハードサーフェスや材質差を描き込みます。",
      descriptionEn: "Push hard-surface and material rendering for the object.",
      fields: {
        subject: "単体物体レンダー",
        character: "非キャラクターの物体",
        pose: "用途が伝わる3/4ビュー",
        materialNotes: "金属、樹脂、塗装面の差を出す",
        backgroundDetails: "物体が埋もれない簡潔な背景",
        lighting: "立体感を強調する主光源",
        artStyle: "工業デザイン寄り",
      },
      tagIds: ["tag-object-01", "tag-object-04", "tag-lighting-02"],
      extraPrompt: "機能パーツごとの材質差を明瞭にする",
    },
  ],
  "stage-09": [
    {
      id: "preset-stage-09-character",
      labelJa: "キャラクターKV",
      labelEn: "Character key art",
      descriptionJa: "主役の見栄えと空気感を最終調整します。",
      descriptionEn: "Finalize hero readability and atmosphere.",
      fields: {
        subject: "全身キャラクター最終仕上げ",
        character: "ヒロイックな主人公",
        pose: "主役が読みやすい立ち姿",
        background: "主役を支える簡潔な背景",
        lighting: "主光源 + 控えめなハイライト",
        artStyle: "仕上げ重視のアニメイラスト",
      },
      tagIds: ["tag-character-03", "tag-quality-01", "tag-lighting-02"],
      extraPrompt: "顔周りとシルエットの見栄えを最後に整える",
    },
    {
      id: "preset-stage-09-background",
      labelJa: "背景シーン",
      labelEn: "Background scene",
      descriptionJa: "景観の空気感と視線誘導を最終調整します。",
      descriptionEn: "Finalize atmosphere and visual flow in the scene.",
      fields: {
        subject: "背景シーン最終仕上げ",
        character: "人物なし",
        pose: "視線が奥へ流れる",
        background: "空気層が見える景観",
        lighting: "時間帯を締める光",
        artStyle: "背景美術仕上げ",
      },
      tagIds: ["tag-background-03", "tag-background-04", "tag-quality-02"],
      extraPrompt: "空気遠近と焦点位置を最後に整える",
    },
    {
      id: "preset-stage-09-icon",
      labelJa: "ゲームアイコン",
      labelEn: "Game icon",
      descriptionJa: "小サイズでの読め方を最終調整します。",
      descriptionEn: "Finalize icon readability at small sizes.",
      fields: {
        subject: "ゲームアイテムアイコン最終仕上げ",
        character: "非キャラクターオブジェクト",
        pose: "単体3/4ビュー",
        background: "背景要素なし",
        lighting: "エッジと発光を強調する光",
        artStyle: "ゲームUI仕上げ",
      },
      tagIds: ["tag-icon-01", "tag-icon-02", "tag-icon-03", "tag-icon-04"],
      extraPrompt: "縮小表示でも輪郭と主要情報が潰れないようにする",
    },
    {
      id: "preset-stage-09-object",
      labelJa: "単体物体",
      labelEn: "Single object",
      descriptionJa: "用途と材質感が伝わる最終整えです。",
      descriptionEn: "Finalize clarity of function and material finish.",
      fields: {
        subject: "単体物体最終仕上げ",
        character: "非キャラクターの物体",
        pose: "用途が伝わる3/4ビュー",
        background: "物体を支える簡潔な背景",
        lighting: "面の切り替えが見える光",
        artStyle: "プロップ仕上げ",
      },
      tagIds: ["tag-object-01", "tag-object-02", "tag-object-04", "tag-icon-03"],
      extraPrompt: "用途が一目で伝わる見栄えに整える",
    },
  ],
};
const stageById = new Map(STAGES.map((stage) => [stage.id, stage]));
const promptSheetByStageId = new Map(PROMPT_SHEETS.map((sheet) => [sheet.stageId, sheet]));
const categoryById = new Map(ALL_TAG_CATEGORIES.map((category) => [category.id, category]));
const providerById = new Map(PROVIDERS.map((provider) => [provider.id, provider]));
const fieldByName = new Map(FORM_FIELDS.map((field) => [field.name, field]));
const LIVE_IMAGE_MODEL_PREFERENCE = ["gpt-image-1.5", "gpt-image-1", "gpt-image-1-mini"];
const PROMPT_OPTIMIZER_MODEL_PREFERENCE = ["gpt-5.4-mini", "gpt-5-mini", "gpt-4o-mini", "gpt-4o"];
const PROMPT_OPTIMIZER_MAX_OUTPUT_TOKENS = 260;
const MAX_REFERENCE_IMAGES = 4;
const IMAGE_DB_NAME = "sunmax.i2iLab.images";
const IMAGE_DB_VERSION = 1;
const IMAGE_STORE_NAME = "payloads";
const PARAMETER_SPECS = {
  strength: { min: 0, max: 1, step: 0.01, digits: 2 },
  guidance: { min: 1, max: 20, step: 0.1, digits: 1 },
  steps: { min: 8, max: 60, step: 1, digits: 0 },
  seed: { min: 0, max: 9999, step: 1, digits: 0 },
};
const PARAMETER_HELP_COPY = {
  provider: {
    titleKey: "settings.provider",
    detailKey: "studio.parameterHelpProviderDetail",
  },
  model: {
    titleKey: "settings.model",
    detailKey: "studio.parameterHelpModelDetail",
  },
  strength: {
    titleKey: "settings.strength",
    detailKey: "studio.parameterHelpStrengthDetail",
  },
  guidance: {
    titleKey: "settings.guidance",
    detailKey: "studio.parameterHelpGuidanceDetail",
  },
  steps: {
    titleKey: "settings.steps",
    detailKey: "studio.parameterHelpStepsDetail",
  },
  seed: {
    titleKey: "settings.seed",
    detailKey: "studio.parameterHelpSeedDetail",
  },
};
const PARAMETER_HELP_KEYS = new Set(Object.keys(PARAMETER_HELP_COPY));
const refs = {};
let toastTimer = 0;
let sessionApiKey = "";
let modelCatalog = createModelCatalogState();
let modelCatalogRequestId = 0;
let resultSelectionIds = [];
let activeParameterHelpKey = null;
let imagePasteTarget = "base";
let imageDbPromise = null;
let imageStorageReady = false;
const imagePayloadCache = new Map();
let promptAssistState = createPromptAssistState();
let state = loadState();

document.addEventListener("DOMContentLoaded", () => {
  void initializeApp();
});

async function initializeApp() {
  bindRefs();
  bindEvents();
  await initializeImageStorage();
  ensureStateIntegrity();
  renderAll();
  void refreshAvailableModels();
}

function bindRefs() {
  refs.body = document.body;
  refs.sidebar = document.getElementById("app-sidebar");
  refs.sidebarOverlay = document.getElementById("sidebar-overlay");
  refs.sidebarToggle = document.getElementById("sidebar-toggle");
  refs.headerStageName = document.getElementById("header-stage-name");
  refs.headerStagePill = document.getElementById("header-stage-pill");
  refs.headerStageInline = document.getElementById("header-stage-inline");
  refs.headerResultCount = document.getElementById("header-result-count");
  refs.workspaceSwitcher = document.getElementById("workspace-switcher");
  refs.workspaceQuickStats = document.getElementById("workspace-quick-stats");
  refs.viewNav = document.getElementById("view-nav");
  refs.activeStageName = document.getElementById("active-stage-name");
  refs.activeStageSummary = document.getElementById("active-stage-summary");
  refs.activeStageFocus = document.getElementById("active-stage-focus");
  refs.contextChips = document.getElementById("context-chips");
  refs.viewPanes = Array.from(document.querySelectorAll("[data-view]"));
  refs.overviewMetrics = document.getElementById("overview-metrics");
  refs.stageRoadmap = document.getElementById("stage-roadmap");
  refs.overviewWorkspaces = document.getElementById("overview-workspaces");
  refs.overviewResults = document.getElementById("overview-results");
  refs.workspaceForm = document.getElementById("workspace-form");
  refs.workspaceName = document.getElementById("workspace-name");
  refs.workspaceDescription = document.getElementById("workspace-description");
  refs.workspaceList = document.getElementById("workspace-list");
  refs.stageStepper = document.getElementById("stage-stepper");
  refs.studioStageTitle = document.getElementById("studio-stage-title");
  refs.stageNumberBadge = document.getElementById("stage-number-badge");
  refs.studioStageDescription = document.getElementById("studio-stage-description");
  refs.stageFocusChips = document.getElementById("stage-focus-chips");
  refs.stagePresets = document.getElementById("stage-presets");
  refs.pasteInputImage = document.getElementById("paste-input-image");
  refs.removeInputImage = document.getElementById("remove-input-image");
  refs.imageDropzone = document.getElementById("image-dropzone");
  refs.inputImage = document.getElementById("input-image");
  refs.inputImagePreview = document.getElementById("input-image-preview");
  refs.inputImagePlaceholder = document.getElementById("input-image-placeholder");
  refs.referenceDropzone = document.getElementById("reference-dropzone");
  refs.referenceImageInput = document.getElementById("reference-image-input");
  refs.referenceImageList = document.getElementById("reference-image-list");
  refs.referenceImageHint = document.getElementById("reference-image-hint");
  refs.pasteReferenceImages = document.getElementById("paste-reference-images");
  refs.addReferenceImages = document.getElementById("add-reference-images");
  refs.stageFormGrid = document.getElementById("stage-form-grid");
  refs.tagGroups = document.getElementById("tag-groups");
  refs.extraPrompt = document.getElementById("extra-prompt");
  refs.negativePrompt = document.getElementById("negative-prompt");
  refs.optimizePrompt = document.getElementById("optimize-prompt");
  refs.clearOptimizedPrompt = document.getElementById("clear-optimized-prompt");
  refs.copyPrompt = document.getElementById("copy-prompt");
  refs.promptPreview = document.getElementById("prompt-preview");
  refs.promptOptimizeStatus = document.getElementById("prompt-optimize-status");
  refs.requestPreview = document.getElementById("request-preview");
  refs.copyRequest = document.getElementById("copy-request");
  refs.parameterGrid = document.getElementById("parameter-grid");
  refs.paramProvider = document.getElementById("param-provider");
  refs.paramModel = document.getElementById("param-model");
  refs.paramModelStatus = document.getElementById("param-model-status");
  refs.paramModelRefresh = document.getElementById("param-model-refresh");
  refs.paramStrength = document.getElementById("param-strength");
  refs.paramStrengthValue = document.getElementById("param-strength-value");
  refs.paramGuidance = document.getElementById("param-guidance");
  refs.paramGuidanceValue = document.getElementById("param-guidance-value");
  refs.paramSteps = document.getElementById("param-steps");
  refs.paramStepsValue = document.getElementById("param-steps-value");
  refs.paramSeed = document.getElementById("param-seed");
  refs.paramSeedValue = document.getElementById("param-seed-value");
  refs.parameterHelpTitle = document.getElementById("parameter-help-title");
  refs.parameterHelpDetail = document.getElementById("parameter-help-detail");
  refs.resultStatusBadge = document.getElementById("result-status-badge");
  refs.resultStatusSummary = document.getElementById("result-status-summary");
  refs.resultStatusIndicator = document.getElementById("result-status-indicator");
  refs.resultStatusTitle = document.getElementById("result-status-title");
  refs.resultStatusDetail = document.getElementById("result-status-detail");
  refs.studioResultImage = document.getElementById("studio-result-image");
  refs.studioResultPlaceholder = document.getElementById("studio-result-placeholder");
  refs.resultProgressOverlay = document.getElementById("result-progress-overlay");
  refs.resultProgressTitle = document.getElementById("result-progress-title");
  refs.resultProgressDetail = document.getElementById("result-progress-detail");
  refs.studioResultCaption = document.getElementById("studio-result-caption");
  refs.runGeneration = document.getElementById("run-generation");
  refs.advanceStage = document.getElementById("advance-stage");
  refs.viewResultDetail = document.getElementById("view-result-detail");
  refs.resetCurrentStage = document.getElementById("reset-current-stage");
  refs.historyList = document.getElementById("history-list");
  refs.resultsDetail = document.getElementById("results-detail");
  refs.resultsSelectionSummary = document.getElementById("results-selection-summary");
  refs.resultsSelectAll = document.getElementById("results-select-all");
  refs.resultsDeleteSelected = document.getElementById("results-delete-selected");
  refs.resultsDeleteAll = document.getElementById("results-delete-all");
  refs.customTagForm = document.getElementById("custom-tag-form");
  refs.customTagCategory = document.getElementById("custom-tag-category");
  refs.customTagLabel = document.getElementById("custom-tag-label");
  refs.customTagValue = document.getElementById("custom-tag-value");
  refs.tagLibrary = document.getElementById("tag-library");
  refs.settingsModal = document.getElementById("settings-modal");
  refs.settingsModalOverlay = document.getElementById("settings-modal-overlay");
  refs.closeSettingsModal = document.getElementById("close-settings-modal");
  refs.modalTabs = Array.from(document.querySelectorAll("[data-modal-tab]"));
  refs.modalPaneSettings = document.getElementById("settings-modal-pane-settings");
  refs.modalPaneGuide = document.getElementById("settings-modal-pane-guide");
  refs.settingLanguage = document.getElementById("setting-language");
  refs.settingAutoCarry = document.getElementById("setting-auto-carry");
  refs.settingCompactHistory = document.getElementById("setting-compact-history");
  refs.providerCards = document.getElementById("provider-cards");
  refs.apiStorageMode = document.getElementById("api-storage-mode");
  refs.apiKeyInput = document.getElementById("api-key-input");
  refs.saveApiKey = document.getElementById("save-api-key");
  refs.clearApiKey = document.getElementById("clear-api-key");
  refs.apiKeyStatus = document.getElementById("api-key-status");
  refs.exportState = document.getElementById("export-state");
  refs.importState = document.getElementById("import-state");
  refs.stateJson = document.getElementById("state-json");
  refs.resultCacheSummary = document.getElementById("result-cache-summary");
  refs.clearResultCache = document.getElementById("clear-result-cache");
  refs.errorGuideList = document.getElementById("error-guide-list");
  refs.toast = document.getElementById("app-toast");
}

function bindEvents() {
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("change", handleDocumentChange);
  document.addEventListener("keydown", handleDocumentKeydown);
  document.addEventListener("paste", handleDocumentPaste);
  refs.sidebarToggle.addEventListener("click", toggleSidebar);
  refs.sidebarOverlay.addEventListener("click", closeSidebar);
  refs.workspaceForm.addEventListener("submit", handleWorkspaceSubmit);
  refs.customTagForm.addEventListener("submit", handleCustomTagSubmit);
  refs.stageFormGrid.addEventListener("input", handleStageFormInput);
  refs.extraPrompt.addEventListener("input", handlePromptNotesInput);
  refs.negativePrompt.addEventListener("input", handlePromptNotesInput);
  refs.optimizePrompt.addEventListener("click", () => {
    void optimizePromptWithOpenAI();
  });
  refs.clearOptimizedPrompt.addEventListener("click", clearOptimizedPromptOverride);
  refs.paramProvider.addEventListener("change", handleParameterInput);
  refs.paramModel.addEventListener("change", handleParameterInput);
  refs.paramStrength.addEventListener("input", handleParameterInput);
  refs.paramGuidance.addEventListener("input", handleParameterInput);
  refs.paramSteps.addEventListener("input", handleParameterInput);
  refs.paramSeed.addEventListener("input", handleParameterInput);
  refs.paramModelRefresh.addEventListener("click", () => {
    void refreshAvailableModels({ force: true });
  });
  bindParameterHelpEvents();
  refs.copyPrompt.addEventListener("click", () => copyText(refs.promptPreview.value, "messages.promptCopied"));
  refs.copyRequest.addEventListener("click", () => copyText(refs.requestPreview.textContent, "messages.requestCopied"));
  refs.runGeneration.addEventListener("click", runGeneration);
  refs.advanceStage.addEventListener("click", advanceStage);
  refs.resetCurrentStage.addEventListener("click", resetCurrentStage);
  refs.resultsSelectAll.addEventListener("click", toggleAllResultSelection);
  refs.resultsDeleteSelected.addEventListener("click", deleteSelectedResults);
  refs.resultsDeleteAll.addEventListener("click", deleteAllResults);
  refs.pasteInputImage.addEventListener("click", () => {
    void pasteImagesFromClipboard("base");
  });
  refs.removeInputImage.addEventListener("click", () => {
    setImagePasteTarget("base");
    removeInputImage();
  });
  refs.inputImage.addEventListener("change", handleInputImageChange);
  refs.referenceImageInput.addEventListener("change", handleReferenceImagesChange);
  refs.imageDropzone.addEventListener("dragover", handleImageDragOver);
  refs.imageDropzone.addEventListener("drop", handleImageDrop);
  refs.imageDropzone.addEventListener("click", () => setImagePasteTarget("base"));
  refs.imageDropzone.addEventListener("focus", () => setImagePasteTarget("base"));
  refs.referenceDropzone.addEventListener("dragover", handleImageDragOver);
  refs.referenceDropzone.addEventListener("drop", handleReferenceImageDrop);
  refs.referenceDropzone.addEventListener("click", () => setImagePasteTarget("reference"));
  refs.referenceDropzone.addEventListener("focus", () => setImagePasteTarget("reference"));
  refs.pasteReferenceImages.addEventListener("click", () => {
    void pasteImagesFromClipboard("reference");
  });
  refs.addReferenceImages.addEventListener("click", () => {
    setImagePasteTarget("reference");
    refs.referenceImageInput.click();
  });
  refs.settingLanguage.addEventListener("change", handleLanguageChange);
  refs.settingAutoCarry.addEventListener("change", handleSettingsToggle);
  refs.settingCompactHistory.addEventListener("change", handleSettingsToggle);
  refs.apiStorageMode.addEventListener("change", handleApiStorageModeChange);
  refs.saveApiKey.addEventListener("click", saveApiKey);
  refs.clearApiKey.addEventListener("click", clearApiKey);
  refs.exportState.addEventListener("click", exportStateToTextarea);
  refs.importState.addEventListener("click", importStateFromTextarea);
  refs.clearResultCache.addEventListener("click", clearResultImageCache);
  refs.settingsModalOverlay.addEventListener("click", closeSettingsModal);
  refs.closeSettingsModal.addEventListener("click", closeSettingsModal);
}

function handleDocumentClick(event) {
  const button = event.target.closest("[data-view-target]");
  if (button) {
    openView(button.dataset.viewTarget);
    return;
  }

  const modalTab = event.target.closest("[data-modal-tab]");
  if (modalTab) {
    setSettingsModalTab(modalTab.dataset.modalTab);
    return;
  }

  const workspaceSwitch = event.target.closest("[data-workspace-id]");
  if (workspaceSwitch && workspaceSwitch.dataset.workspaceAction === "switch") {
    setActiveWorkspace(workspaceSwitch.dataset.workspaceId);
    openView("studio");
    closeSidebar();
    return;
  }

  const workspaceAction = event.target.closest("[data-workspace-action]");
  if (workspaceAction) {
    handleWorkspaceAction(workspaceAction.dataset.workspaceAction, workspaceAction.dataset.workspaceId);
    return;
  }

  const stageButton = event.target.closest("[data-stage-id]");
  if (stageButton && stageButton.dataset.stageAction === "open") {
    setCurrentStage(stageButton.dataset.stageId);
    openView("studio");
    closeSidebar();
    return;
  }

  const stagePresetButton = event.target.closest("[data-stage-preset-id]");
  if (stagePresetButton) {
    applyStagePreset(getCurrentStageId(), stagePresetButton.dataset.stagePresetId);
    return;
  }

  const tagButton = event.target.closest("[data-tag-id]");
  if (tagButton) {
    toggleTagSelection(tagButton.dataset.tagId, tagButton.dataset.stageId || getCurrentStageId());
    return;
  }

  const resultButton = event.target.closest("[data-result-id]");
  if (resultButton) {
    selectResult(resultButton.dataset.resultId);
    openView("results");
    return;
  }

  const resultDeleteButton = event.target.closest("[data-result-delete-id]");
  if (resultDeleteButton) {
    deleteResult(resultDeleteButton.dataset.resultDeleteId);
    return;
  }

  const referenceDeleteButton = event.target.closest("[data-reference-remove-index]");
  if (referenceDeleteButton) {
    removeReferenceImage(Number(referenceDeleteButton.dataset.referenceRemoveIndex));
    return;
  }

  const providerButton = event.target.closest("[data-provider-id]");
  if (providerButton) {
    updateProvider(providerButton.dataset.providerId);
  }
}

function handleDocumentChange(event) {
  const resultSelectionToggle = event.target.closest("[data-result-select-id]");
  if (resultSelectionToggle) {
    setResultSelected(resultSelectionToggle.dataset.resultSelectId, resultSelectionToggle.checked);
  }
}

function handleDocumentKeydown(event) {
  if (event.key === "Escape") {
    if (isSettingsModalOpen()) {
      closeSettingsModal();
      return;
    }
    closeSidebar();
  }
}

function handleWorkspaceSubmit(event) {
  event.preventDefault();
  const name = refs.workspaceName.value.trim();
  const description = refs.workspaceDescription.value.trim();
  if (!name) {
    refs.workspaceName.focus();
    return;
  }
  const workspace = createWorkspace(name, description);
  workspace.parameters.providerId = state.settings.defaultProviderId;
  state.workspaces.push(workspace);
  state.activeWorkspaceId = workspace.id;
  state.activeView = "studio";
  refs.workspaceForm.reset();
  persistState();
  renderAll();
  showToast("messages.workspaceCreated");
}

function handleCustomTagSubmit(event) {
  event.preventDefault();
  const categoryId = refs.customTagCategory.value;
  const label = refs.customTagLabel.value.trim();
  const value = refs.customTagValue.value.trim();
  if (!categoryId || !label || !value) {
    return;
  }
  const customTag = {
    id: createId("tag"),
    categoryId,
    labelJa: label,
    labelEn: label,
    valueJa: value,
    valueEn: value,
    isBuiltIn: false,
  };
  state.customTags.push(customTag);
  refs.customTagForm.reset();
  persistState();
  renderAll();
  showToast("messages.customTagAdded");
}

function handleStageFormInput(event) {
  const fieldName = event.target.dataset.stageField;
  if (!fieldName) {
    return;
  }
  const stageState = getCurrentStageState();
  stageState.fields[fieldName] = event.target.value;
  markPromptSourceChanged(stageState);
  touchWorkspace();
  persistState();
  refreshDerivedUi();
}

function handlePromptNotesInput(event) {
  const stageState = getCurrentStageState();
  stageState.extraPrompt = refs.extraPrompt.value;
  stageState.negativePrompt = refs.negativePrompt.value;
  if (event?.target === refs.extraPrompt) {
    markPromptSourceChanged(stageState);
  }
  touchWorkspace();
  persistState();
  refreshDerivedUi();
}

function handleParameterInput() {
  const workspace = getActiveWorkspace();
  if (!workspace) {
    return;
  }
  const previousProviderId = workspace.parameters.providerId;
  workspace.parameters.providerId = refs.paramProvider.value;
  workspace.parameters.model = getModelForProvider(workspace.parameters.providerId, refs.paramModel.value.trim());
  workspace.parameters.strength = clampNumber(
    refs.paramStrength.value,
    PARAMETER_SPECS.strength.min,
    PARAMETER_SPECS.strength.max,
    DEFAULT_PARAMETERS.strength
  );
  workspace.parameters.guidance = clampNumber(
    refs.paramGuidance.value,
    PARAMETER_SPECS.guidance.min,
    PARAMETER_SPECS.guidance.max,
    DEFAULT_PARAMETERS.guidance
  );
  workspace.parameters.steps = clampNumber(
    refs.paramSteps.value,
    PARAMETER_SPECS.steps.min,
    PARAMETER_SPECS.steps.max,
    DEFAULT_PARAMETERS.steps,
    true
  );
  workspace.parameters.seed = clampNumber(
    refs.paramSeed.value,
    PARAMETER_SPECS.seed.min,
    PARAMETER_SPECS.seed.max,
    DEFAULT_PARAMETERS.seed,
    true
  );
  state.settings.defaultProviderId = workspace.parameters.providerId;
  touchWorkspace();
  persistState();
  refreshDerivedUi();
  if (workspace.parameters.providerId === "external-draft" && previousProviderId !== "external-draft") {
    void refreshAvailableModels();
  }
}

function setActiveParameterHelp(key) {
  activeParameterHelpKey = PARAMETER_HELP_KEYS.has(key) ? key : null;
  renderParameterHelp();
}

function bindParameterHelpEvents() {
  for (const [control, key] of getParameterHelpControls()) {
    if (!control) {
      continue;
    }
    control.addEventListener("focus", () => {
      setActiveParameterHelp(key);
    });
    control.addEventListener("mouseenter", () => {
      if (!isParameterHelpFocusLocked()) {
        setActiveParameterHelp(key);
      }
    });
    control.addEventListener("click", () => {
      setActiveParameterHelp(key);
    });
    control.addEventListener("input", () => {
      setActiveParameterHelp(key);
    });
    control.addEventListener("change", () => {
      setActiveParameterHelp(key);
    });
    control.addEventListener("blur", () => {
      window.requestAnimationFrame(() => {
        if (!isParameterHelpFocusLocked()) {
          setActiveParameterHelp(null);
        }
      });
    });
  }
  refs.parameterGrid.addEventListener("mouseleave", () => {
    if (!isParameterHelpFocusLocked()) {
      setActiveParameterHelp(null);
    }
  });
}

function getParameterHelpControls() {
  return [
    [refs.paramProvider, "provider"],
    [refs.paramModel, "model"],
    [refs.paramModelRefresh, "model"],
    [refs.paramStrength, "strength"],
    [refs.paramGuidance, "guidance"],
    [refs.paramSteps, "steps"],
    [refs.paramSeed, "seed"],
  ];
}

function isParameterHelpFocusLocked() {
  return getParameterHelpControls().some(([control]) => control === document.activeElement);
}

function handleInputImageChange(event) {
  const files = Array.from(event.target.files || []);
  void setBaseImageFromFiles(files)
    .catch((error) => {
      showToast(getGenerationErrorToastKey(error));
    })
    .finally(() => {
      refs.inputImage.value = "";
    });
}

function handleImageDragOver(event) {
  event.preventDefault();
}

function handleImageDrop(event) {
  event.preventDefault();
  setImagePasteTarget("base");
  const files = Array.from(event.dataTransfer?.files || []);
  void setBaseImageFromFiles(files).catch((error) => {
    showToast(getGenerationErrorToastKey(error));
  });
}

function handleReferenceImageDrop(event) {
  event.preventDefault();
  setImagePasteTarget("reference");
  const files = Array.from(event.dataTransfer?.files || []);
  void addReferenceImagesFromFiles(files).catch((error) => {
    showToast(getGenerationErrorToastKey(error));
  });
}

function handleReferenceImagesChange(event) {
  const files = Array.from(event.target.files || []);
  void addReferenceImagesFromFiles(files)
    .catch((error) => {
      showToast(getGenerationErrorToastKey(error));
    })
    .finally(() => {
      refs.referenceImageInput.value = "";
    });
}

function handleDocumentPaste(event) {
  const files = getImageFilesFromClipboardData(event.clipboardData);
  if (!files.length) {
    return;
  }
  const target = resolveImagePasteTarget(event.target);
  if (!target) {
    return;
  }
  event.preventDefault();
  if (target === "reference") {
    void addReferenceImagesFromFiles(files).catch((error) => {
      showToast(getClipboardErrorToastKey(error));
    });
    return;
  }
  void setBaseImageFromFiles(files).catch((error) => {
    showToast(getClipboardErrorToastKey(error));
  });
}

function setImagePasteTarget(target) {
  imagePasteTarget = target === "reference" ? "reference" : "base";
}

function resolveImagePasteTarget(target) {
  const element = target instanceof Element ? target : null;
  if (element?.closest("#reference-dropzone, #paste-reference-images, #add-reference-images, .reference-image-panel, #reference-image-list")) {
    return "reference";
  }
  if (element?.closest("#image-dropzone, #paste-input-image")) {
    return "base";
  }
  if (isEditableElement(element) || state.activeView !== "studio") {
    return null;
  }
  return imagePasteTarget;
}

function isEditableElement(element) {
  return Boolean(element?.closest("input:not([type='hidden']):not([type='file']), textarea, select, [contenteditable='true']"));
}

function supportsClipboardRead() {
  return window.isSecureContext && typeof navigator.clipboard?.read === "function";
}

async function pasteImagesFromClipboard(target) {
  setImagePasteTarget(target);
  try {
    const files = await readClipboardImageFiles();
    if (target === "reference") {
      await addReferenceImagesFromFiles(files);
      return;
    }
    await setBaseImageFromFiles(files);
  } catch (error) {
    showToast(getClipboardErrorToastKey(error));
  }
}

async function readClipboardImageFiles() {
  if (!supportsClipboardRead()) {
    throw new Error("clipboardReadUnsupported");
  }
  try {
    const clipboardItems = await navigator.clipboard.read();
    const files = [];
    for (const [itemIndex, item] of clipboardItems.entries()) {
      for (const type of item.types) {
        if (!type.startsWith("image/")) {
          continue;
        }
        const blob = await item.getType(type);
        files.push(createClipboardImageFile(blob, type, itemIndex));
        break;
      }
    }
    if (!files.length) {
      throw new Error("clipboardImageMissing");
    }
    return files;
  } catch (error) {
    if (error?.message === "clipboardImageMissing") {
      throw error;
    }
    throw new Error("clipboardReadFailed");
  }
}

function createClipboardImageFile(blob, type = "image/png", index = 0) {
  const safeType = typeof type === "string" && type.startsWith("image/") ? type : "image/png";
  const extension = safeType.split("/")[1] || "png";
  const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  return new File([blob], `clipboard-${stamp}-${index + 1}.${extension}`, { type: safeType });
}

function getImageFilesFromClipboardData(clipboardData) {
  if (!clipboardData?.items) {
    return [];
  }
  return Array.from(clipboardData.items)
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item, index) => {
      const file = item.getAsFile();
      if (!file) {
        return null;
      }
      return file.name ? file : createClipboardImageFile(file, file.type, index);
    })
    .filter(Boolean);
}

async function setBaseImageFromFiles(files) {
  const [file] = Array.from(files || []).filter((candidate) => candidate?.type?.startsWith("image/"));
  const stageState = getCurrentStageState();
  if (!stageState || !file) {
    return false;
  }
  const image = await readImageFile(file);
  const snapshot = snapshotStageImages(stageState);
  try {
    stageState.baseImage = image;
    touchWorkspace();
    persistStateOrThrow();
    renderAll();
    showToast("messages.baseImageUpdated");
    return true;
  } catch (error) {
    restoreStageImages(stageState, snapshot);
    renderAll();
    await deleteUnreferencedImagePayloads([image.storageKey]);
    throw error;
  }
}

async function addReferenceImagesFromFiles(files) {
  const stageState = getCurrentStageState();
  const imageFiles = Array.from(files || []).filter((candidate) => candidate?.type?.startsWith("image/"));
  if (!stageState || !imageFiles.length) {
    return false;
  }
  const remainingSlots = Math.max(0, MAX_REFERENCE_IMAGES - stageState.referenceImages.length);
  if (!remainingSlots) {
    showToast("messages.referenceImagesLimit", { count: MAX_REFERENCE_IMAGES });
    return false;
  }
  const images = await Promise.all(imageFiles.slice(0, remainingSlots).map(readImageFile));
  const snapshot = snapshotStageImages(stageState);
  try {
    stageState.referenceImages.push(...images);
    touchWorkspace();
    persistStateOrThrow();
    renderAll();
    showToast("messages.referenceImagesUpdated");
  } catch (error) {
    restoreStageImages(stageState, snapshot);
    renderAll();
    await deleteUnreferencedImagePayloads(images.map((image) => image.storageKey));
    throw error;
  }
  if (imageFiles.length > remainingSlots) {
    showToast("messages.referenceImagesLimit", { count: MAX_REFERENCE_IMAGES });
  }
  return true;
}

function snapshotStageImages(stageState) {
  return {
    baseImage: stageState?.baseImage ? { ...stageState.baseImage } : null,
    referenceImages: Array.isArray(stageState?.referenceImages)
      ? stageState.referenceImages.map((image) => ({ ...image }))
      : [],
  };
}

function restoreStageImages(stageState, snapshot) {
  if (!stageState || !snapshot) {
    return;
  }
  stageState.baseImage = snapshot.baseImage ? { ...snapshot.baseImage } : null;
  stageState.referenceImages = snapshot.referenceImages.map((image) => ({ ...image }));
}

function handleLanguageChange() {
  const nextLocale = normalizeLocale(refs.settingLanguage.value);
  if (state.locale === nextLocale) {
    return;
  }
  state.locale = nextLocale;
  clearAllOptimizedPrompts();
  promptAssistState = createPromptAssistState();
  persistState();
  renderAll();
  showToast("messages.languageChanged");
}

function handleSettingsToggle() {
  state.settings.autoCarry = refs.settingAutoCarry.checked;
  state.settings.compactHistory = refs.settingCompactHistory.checked;
  persistState();
  renderAll();
}

function handleApiStorageModeChange() {
  state.settings.apiStorageMode = refs.apiStorageMode.value === "local" ? "local" : "session";
  persistState();
  renderAll();
  void refreshAvailableModels({ force: true });
}

function ensureStateIntegrity() {
  state = normalizeState(state);
  persistState();
}

function createDefaultState() {
  const workspace = createWorkspace(
    "海辺キービジュアル",
    "I2I Forge の流れを確認するためのサンプルワークスペースです。"
  );
  return {
    version: 3,
    locale: "ja",
    activeView: "studio",
    activeWorkspaceId: workspace.id,
    selectedResultId: null,
    customTags: [],
    settings: {
      autoCarry: true,
      compactHistory: false,
      apiStorageMode: "session",
      defaultProviderId: DEFAULT_PARAMETERS.providerId,
    },
    settingsModal: {
      open: false,
      tab: "settings",
    },
    apiKeyMeta: {
      savedAt: null,
    },
    workspaces: [workspace],
  };
}

function createWorkspace(name, description = "") {
  return {
    id: createId("ws"),
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStageId: STAGES[0].id,
    parameters: { ...DEFAULT_PARAMETERS },
    stages: Object.fromEntries(STAGES.map((stage) => [stage.id, createStageState(stage.id)])),
    results: [],
  };
}

function createStageState(stageId) {
  const fields = Object.fromEntries(FORM_FIELDS.map((field) => [field.name, ""]));
  return {
    fields,
    extraPrompt: "",
    negativePrompt: "",
    activePresetId: "",
    optimizedPrompt: "",
    optimizedPromptUpdatedAt: null,
    baseImage: null,
    referenceImages: [],
    selectedTagIds: [],
    status: "idle",
    lastResultId: null,
    lastError: "",
  };
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }
    return JSON.parse(raw);
  } catch (error) {
    return createDefaultState();
  }
}

function normalizeState(candidate) {
  const base = createDefaultState();
  if (!candidate || typeof candidate !== "object") {
    return base;
  }
  const activeView = normalizeView(candidate.activeView || candidate.currentView || base.activeView);
  const locale = normalizeLocale(candidate.locale || base.locale);
  const customTags = Array.isArray(candidate.customTags) ? candidate.customTags.map(normalizeTag) : [];
  const workspaces = Array.isArray(candidate.workspaces) && candidate.workspaces.length
    ? candidate.workspaces.map(normalizeWorkspace)
    : base.workspaces;
  const activeWorkspaceId = workspaces.some((workspace) => workspace.id === candidate.activeWorkspaceId)
    ? candidate.activeWorkspaceId
    : workspaces[0].id;
  const selectedResultId = normalizeSelectedResultId(candidate.selectedResultId, workspaces, activeWorkspaceId);

  return {
    version: 3,
    locale,
    activeView,
    activeWorkspaceId,
    selectedResultId,
    customTags,
    settings: normalizeSettings(candidate.settings),
    settingsModal: {
      open: false,
      tab: SETTINGS_TABS.has(candidate.settingsModal?.tab) ? candidate.settingsModal.tab : "settings",
    },
    apiKeyMeta: {
      savedAt: typeof candidate.apiKeyMeta?.savedAt === "string" ? candidate.apiKeyMeta.savedAt : null,
    },
    workspaces,
  };
}

function normalizeWorkspace(candidate) {
  const workspace = createWorkspace(
    sanitizeText(candidate?.name, "ワークスペース"),
    sanitizeText(candidate?.description, "")
  );
  workspace.id = sanitizeText(candidate?.id, workspace.id);
  workspace.createdAt = typeof candidate?.createdAt === "string" ? candidate.createdAt : workspace.createdAt;
  workspace.updatedAt = typeof candidate?.updatedAt === "string" ? candidate.updatedAt : workspace.updatedAt;
  workspace.currentStageId = stageById.has(candidate?.currentStageId) ? candidate.currentStageId : workspace.currentStageId;
  workspace.parameters = normalizeParameters(candidate?.parameters);
  workspace.parameters.model = getModelForProvider(workspace.parameters.providerId, workspace.parameters.model);
  const legacyStages = candidate?.stages || candidate?.stageStates || {};
  workspace.stages = Object.fromEntries(
    STAGES.map((stage) => [stage.id, normalizeStageState(legacyStages[stage.id], stage.id)])
  );
  workspace.results = Array.isArray(candidate?.results) ? candidate.results.map(normalizeResult).filter(Boolean) : [];
  for (const stage of STAGES) {
    const stageState = workspace.stages[stage.id];
    if (!stageState.lastResultId || !workspace.results.some((result) => result.id === stageState.lastResultId)) {
      const latest = workspace.results.find((result) => result.stageId === stage.id);
      stageState.lastResultId = latest?.id || null;
    }
  }
  return workspace;
}

function normalizeStageState(candidate, stageId) {
  const stageState = createStageState(stageId);
  const source = candidate || {};
  const fields = source.fields || source.formValues || {};
  for (const field of FORM_FIELDS) {
    stageState.fields[field.name] = sanitizeText(fields[field.name], stageState.fields[field.name]);
  }
  stageState.extraPrompt = sanitizeText(source.extraPrompt, "");
  stageState.negativePrompt = sanitizeText(source.negativePrompt, "");
  stageState.activePresetId = sanitizeText(source.activePresetId, "");
  stageState.optimizedPrompt = sanitizeText(source.optimizedPrompt, "");
  stageState.optimizedPromptUpdatedAt = typeof source.optimizedPromptUpdatedAt === "string"
    ? source.optimizedPromptUpdatedAt
    : null;
  stageState.baseImage = normalizeImage(source.baseImage || source.inputBaseImage || source.inputImage || source.inputImageData || null);
  stageState.referenceImages = Array.isArray(source.referenceImages || source.inputReferenceImages)
    ? (source.referenceImages || source.inputReferenceImages).map(normalizeImage).filter(Boolean).slice(0, MAX_REFERENCE_IMAGES)
    : [];
  stageState.selectedTagIds = Array.isArray(source.selectedTagIds)
    ? source.selectedTagIds.map((id) => sanitizeText(id, "")).filter(Boolean)
    : [];
  stageState.status = source.status === "running"
    ? "idle"
    : ["idle", "completed", "error"].includes(source.status) ? source.status : "idle";
  stageState.lastResultId = sanitizeText(source.lastResultId, null);
  stageState.lastError = sanitizeText(source.lastError, "");
  return stageState;
}

function normalizeSettings(candidate) {
  return {
    autoCarry: candidate?.autoCarry !== false,
    compactHistory: Boolean(candidate?.compactHistory),
    apiStorageMode: candidate?.apiStorageMode === "local" ? "local" : "session",
    defaultProviderId: providerById.has(candidate?.defaultProviderId) ? candidate.defaultProviderId : DEFAULT_PARAMETERS.providerId,
  };
}

function normalizeParameters(candidate) {
  const providerId = providerById.has(candidate?.providerId) ? candidate.providerId : DEFAULT_PARAMETERS.providerId;
  return {
    providerId,
    model: getModelForProvider(providerId, candidate?.model),
    strength: clampNumber(candidate?.strength, PARAMETER_SPECS.strength.min, PARAMETER_SPECS.strength.max, DEFAULT_PARAMETERS.strength),
    guidance: clampNumber(candidate?.guidance, PARAMETER_SPECS.guidance.min, PARAMETER_SPECS.guidance.max, DEFAULT_PARAMETERS.guidance),
    steps: clampNumber(candidate?.steps, PARAMETER_SPECS.steps.min, PARAMETER_SPECS.steps.max, DEFAULT_PARAMETERS.steps, true),
    seed: clampNumber(candidate?.seed, PARAMETER_SPECS.seed.min, PARAMETER_SPECS.seed.max, DEFAULT_PARAMETERS.seed, true),
  };
}

function normalizeResult(candidate) {
  if (!candidate || !stageById.has(candidate.stageId)) {
    return null;
  }
  const imageDataUrl = sanitizeText(candidate.imageDataUrl, "");
  return {
    id: sanitizeText(candidate.id, createId("result")),
    workspaceId: sanitizeText(candidate.workspaceId, ""),
    workspaceName: sanitizeText(candidate.workspaceName, ""),
    stageId: candidate.stageId,
    status: ["idle", "running", "completed"].includes(candidate.status) ? candidate.status : "completed",
    prompt: sanitizeText(candidate.prompt, ""),
    negativePrompt: sanitizeText(candidate.negativePrompt, ""),
    request: typeof candidate.request === "object" && candidate.request ? candidate.request : {},
    imageStorageKey: sanitizeText(candidate.imageStorageKey, null),
    imageByteSize: clampImageByteSize(candidate.imageByteSize, imageDataUrl),
    imageDataUrl,
    createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : new Date().toISOString(),
    note: sanitizeText(candidate.note, ""),
  };
}

function normalizeImage(candidate) {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }
  const dataUrl = sanitizeText(candidate.dataUrl, "");
  const storageKey = sanitizeText(candidate.storageKey, null);
  const source = sanitizeText(candidate.source, "manual");
  const resultId = sanitizeText(candidate.resultId, null);
  if (!dataUrl && !storageKey && !(source === "carry" && resultId)) {
    return null;
  }
  return {
    name: sanitizeText(candidate.name, "image"),
    dataUrl,
    storageKey,
    byteSize: clampImageByteSize(candidate.byteSize, dataUrl),
    source,
    resultId,
    sourceStageId: stageById.has(candidate.sourceStageId) ? candidate.sourceStageId : null,
    createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : new Date().toISOString(),
  };
}

function normalizeSelectedResultId(resultId, workspaces, activeWorkspaceId) {
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);
  if (!activeWorkspace || !activeWorkspace.results.length) {
    return null;
  }
  if (activeWorkspace.results.some((result) => result.id === resultId)) {
    return resultId;
  }
  return activeWorkspace.results[0].id;
}

async function initializeImageStorage() {
  try {
    await openImageDatabase();
    imageStorageReady = true;
    const migrated = await migrateLegacyImagePayloads();
    await hydrateImagePayloadCache();
    if (migrated) {
      persistState();
    }
  } catch (error) {
    console.error("IndexedDB image storage initialization failed.", error);
    imageStorageReady = false;
  }
}

function openImageDatabase() {
  if (!window.indexedDB) {
    return Promise.reject(new Error("indexedDbUnavailable"));
  }
  if (!imageDbPromise) {
    imageDbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(IMAGE_DB_NAME, IMAGE_DB_VERSION);
      request.addEventListener("upgradeneeded", () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(IMAGE_STORE_NAME)) {
          database.createObjectStore(IMAGE_STORE_NAME, { keyPath: "id" });
        }
      });
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error || new Error("indexedDbOpenFailed")));
    });
  }
  return imageDbPromise;
}

async function putImagePayload(storageKey, dataUrl) {
  const database = await openImageDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE_NAME, "readwrite");
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    transaction.addEventListener("complete", resolve);
    transaction.addEventListener("error", () => reject(transaction.error || new Error("indexedDbWriteFailed")));
    store.put({
      id: storageKey,
      dataUrl,
      updatedAt: new Date().toISOString(),
    });
  });
  imagePayloadCache.set(storageKey, dataUrl);
}

async function getImagePayload(storageKey) {
  if (!storageKey) {
    return "";
  }
  if (imagePayloadCache.has(storageKey)) {
    return imagePayloadCache.get(storageKey) || "";
  }
  const database = await openImageDatabase();
  const dataUrl = await new Promise((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE_NAME, "readonly");
    const request = transaction.objectStore(IMAGE_STORE_NAME).get(storageKey);
    request.addEventListener("success", () => resolve(request.result?.dataUrl || ""));
    request.addEventListener("error", () => reject(request.error || new Error("indexedDbReadFailed")));
  });
  if (dataUrl) {
    imagePayloadCache.set(storageKey, dataUrl);
  }
  return dataUrl;
}

async function getImagePayloadMap(storageKeys) {
  const uniqueKeys = [...new Set(storageKeys.filter(Boolean))];
  if (!uniqueKeys.length) {
    return new Map();
  }
  const entries = await Promise.all(uniqueKeys.map(async (storageKey) => [storageKey, await getImagePayload(storageKey)]));
  return new Map(entries.filter(([, dataUrl]) => dataUrl));
}

async function deleteImagePayloads(storageKeys) {
  const uniqueKeys = [...new Set(storageKeys.filter(Boolean))];
  if (!uniqueKeys.length || !imageStorageReady) {
    uniqueKeys.forEach((storageKey) => imagePayloadCache.delete(storageKey));
    return;
  }
  const database = await openImageDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE_NAME, "readwrite");
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    transaction.addEventListener("complete", resolve);
    transaction.addEventListener("error", () => reject(transaction.error || new Error("indexedDbDeleteFailed")));
    uniqueKeys.forEach((storageKey) => {
      imagePayloadCache.delete(storageKey);
      store.delete(storageKey);
    });
  });
}

async function storeImagePayload(dataUrl, storageKey = createId("img")) {
  const byteSize = estimateStringBytes(dataUrl);
  if (!imageStorageReady) {
    return {
      storageKey: null,
      dataUrl,
      byteSize,
    };
  }
  await putImagePayload(storageKey, dataUrl);
  return {
    storageKey,
    dataUrl: "",
    byteSize,
  };
}

async function migrateLegacyImagePayloads() {
  let changed = false;
  for (const workspace of state.workspaces) {
    for (const result of workspace.results) {
      if (result.imageDataUrl) {
        const storageKey = result.imageStorageKey || createId("img");
        await putImagePayload(storageKey, result.imageDataUrl);
        result.imageStorageKey = storageKey;
        result.imageByteSize = clampImageByteSize(result.imageByteSize, result.imageDataUrl);
        result.imageDataUrl = "";
        changed = true;
      }
    }
    for (const stage of STAGES) {
      const stageState = workspace.stages[stage.id];
      if (stageState.baseImage?.dataUrl) {
        const image = stageState.baseImage;
        const storageKey = image.storageKey || createId("img");
        await putImagePayload(storageKey, image.dataUrl);
        image.storageKey = storageKey;
        image.byteSize = clampImageByteSize(image.byteSize, image.dataUrl);
        image.dataUrl = "";
        changed = true;
      }
      for (const image of stageState.referenceImages) {
        if (!image?.dataUrl) {
          continue;
        }
        const storageKey = image.storageKey || createId("img");
        await putImagePayload(storageKey, image.dataUrl);
        image.storageKey = storageKey;
        image.byteSize = clampImageByteSize(image.byteSize, image.dataUrl);
        image.dataUrl = "";
        changed = true;
      }
    }
  }
  return changed;
}

async function hydrateImagePayloadCache() {
  if (!imageStorageReady && imageDbPromise == null) {
    return;
  }
  const keys = collectReferencedImageStorageKeys();
  const payloads = await getImagePayloadMap([...keys]);
  for (const [storageKey, dataUrl] of payloads.entries()) {
    imagePayloadCache.set(storageKey, dataUrl);
  }
}

function collectReferencedImageStorageKeys(candidateState = state) {
  const keys = new Set();
  for (const workspace of candidateState.workspaces || []) {
    for (const result of workspace.results || []) {
      if (result.imageStorageKey) {
        keys.add(result.imageStorageKey);
      }
    }
    for (const stage of STAGES) {
      const stageState = workspace.stages?.[stage.id];
      if (!stageState) {
        continue;
      }
      if (stageState.baseImage?.storageKey) {
        keys.add(stageState.baseImage.storageKey);
      }
      for (const image of stageState.referenceImages || []) {
        if (image?.storageKey) {
          keys.add(image.storageKey);
        }
      }
    }
  }
  return keys;
}

async function deleteUnreferencedImagePayloads(storageKeys) {
  const uniqueKeys = [...new Set(storageKeys.filter(Boolean))];
  if (!uniqueKeys.length) {
    return;
  }
  const referencedKeys = collectReferencedImageStorageKeys();
  const removableKeys = uniqueKeys.filter((storageKey) => !referencedKeys.has(storageKey));
  await deleteImagePayloads(removableKeys);
}

function serializeStateForStorage(candidateState = state) {
  return {
    version: 3,
    locale: candidateState.locale,
    activeView: candidateState.activeView,
    activeWorkspaceId: candidateState.activeWorkspaceId,
    selectedResultId: candidateState.selectedResultId,
    customTags: (candidateState.customTags || []).map((tag) => ({ ...tag })),
    settings: { ...candidateState.settings },
    settingsModal: {
      open: false,
      tab: candidateState.settingsModal?.tab || "settings",
    },
    apiKeyMeta: {
      savedAt: candidateState.apiKeyMeta?.savedAt || null,
    },
    workspaces: (candidateState.workspaces || []).map(serializeWorkspaceForStorage),
  };
}

function serializeWorkspaceForStorage(workspace) {
  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
    currentStageId: workspace.currentStageId,
    parameters: { ...workspace.parameters },
    stages: Object.fromEntries(STAGES.map((stage) => [stage.id, serializeStageStateForStorage(workspace.stages[stage.id])])),
    results: workspace.results.map(serializeResultForStorage),
  };
}

function serializeStageStateForStorage(stageState) {
  return {
    fields: { ...stageState.fields },
    extraPrompt: stageState.extraPrompt,
    negativePrompt: stageState.negativePrompt,
    activePresetId: stageState.activePresetId,
    optimizedPrompt: stageState.optimizedPrompt,
    optimizedPromptUpdatedAt: stageState.optimizedPromptUpdatedAt,
    baseImage: serializeImageForStorage(stageState.baseImage),
    referenceImages: stageState.referenceImages.map(serializeImageForStorage).filter(Boolean),
    selectedTagIds: [...stageState.selectedTagIds],
    status: stageState.status,
    lastResultId: stageState.lastResultId,
    lastError: stageState.lastError,
  };
}

function serializeResultForStorage(result) {
  return {
    id: result.id,
    workspaceId: result.workspaceId,
    workspaceName: result.workspaceName,
    stageId: result.stageId,
    status: result.status,
    prompt: result.prompt,
    negativePrompt: result.negativePrompt,
    request: result.request,
    imageStorageKey: result.imageStorageKey,
    imageByteSize: result.imageByteSize,
    createdAt: result.createdAt,
    note: result.note,
  };
}

function serializeImageForStorage(image) {
  if (!image) {
    return null;
  }
  return {
    name: image.name,
    storageKey: image.storageKey || null,
    byteSize: image.byteSize || 0,
    source: image.source,
    resultId: image.resultId,
    sourceStageId: image.sourceStageId,
    createdAt: image.createdAt,
  };
}

function persistState() {
  const value = imageStorageReady
    ? serializeStateForStorage(state)
    : state;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function openView(viewId) {
  if (viewId === "settings" || viewId === "guide") {
    openSettingsModal(viewId === "guide" ? "guide" : "settings");
    return;
  }
  state.activeView = normalizeView(viewId);
  persistState();
  renderAll();
}

function normalizeView(viewId) {
  if (viewId === "history") {
    return "results";
  }
  if (["setup", "help", "settings"].includes(viewId)) {
    return "studio";
  }
  return MAIN_VIEW_IDS.includes(viewId) ? viewId : "studio";
}

function setActiveWorkspace(workspaceId) {
  if (!state.workspaces.some((workspace) => workspace.id === workspaceId)) {
    return;
  }
  state.activeWorkspaceId = workspaceId;
  state.selectedResultId = getActiveWorkspace()?.results[0]?.id || null;
  resultSelectionIds = [];
  persistState();
  renderAll();
}

function handleWorkspaceAction(action, workspaceId) {
  const workspace = state.workspaces.find((item) => item.id === workspaceId);
  if (!workspace) {
    return;
  }
  if (action === "activate") {
    setActiveWorkspace(workspaceId);
    openView("studio");
    return;
  }
  if (action === "duplicate") {
    const copy = normalizeWorkspace({
      ...workspace,
      id: createId("ws"),
      name: `${workspace.name} ${state.locale === "ja" ? "コピー" : "Copy"}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      results: workspace.results.map((result) => ({
        ...result,
        id: createId("result"),
        workspaceId: "",
      })),
    });
    copy.results = copy.results.map((result) => ({ ...result, workspaceId: copy.id, workspaceName: copy.name }));
    state.workspaces.unshift(copy);
    state.activeWorkspaceId = copy.id;
    state.selectedResultId = copy.results[0]?.id || null;
    resultSelectionIds = [];
    persistState();
    renderAll();
    showToast("messages.workspaceDuplicated");
    return;
  }
  if (action === "delete") {
    if (state.workspaces.length === 1) {
      showToast("messages.cannotDeleteLastWorkspace");
      return;
    }
    if (!window.confirm(t("confirm.deleteWorkspace", { name: workspace.name }))) {
      return;
    }
    const removedKeys = collectReferencedImageStorageKeys({ workspaces: [workspace] });
    state.workspaces = state.workspaces.filter((item) => item.id !== workspaceId);
    state.activeWorkspaceId = state.workspaces[0].id;
    state.selectedResultId = state.workspaces[0].results[0]?.id || null;
    resultSelectionIds = [];
    persistState();
    renderAll();
    void deleteUnreferencedImagePayloads([...removedKeys]);
    showToast("messages.workspaceDeleted");
  }
}

function setCurrentStage(stageId) {
  const workspace = getActiveWorkspace();
  if (!workspace || !stageById.has(stageId)) {
    return;
  }
  workspace.currentStageId = stageId;
  touchWorkspace();
  persistState();
  renderAll();
}

function openSettingsModal(tab = "settings") {
  state.settingsModal.open = true;
  state.settingsModal.tab = SETTINGS_TABS.has(tab) ? tab : "settings";
  renderAll();
}

function closeSettingsModal() {
  state.settingsModal.open = false;
  renderAll();
}

function setSettingsModalTab(tab) {
  state.settingsModal.tab = SETTINGS_TABS.has(tab) ? tab : "settings";
  renderAll();
}

function isSettingsModalOpen() {
  return Boolean(state.settingsModal.open);
}

function toggleSidebar() {
  refs.sidebar.classList.toggle("sidebar-open");
  const isOpen = refs.sidebar.classList.contains("sidebar-open");
  refs.sidebarOverlay.hidden = !isOpen;
  refs.sidebarOverlay.classList.toggle("sidebar-overlay-visible", isOpen);
}

function closeSidebar() {
  refs.sidebar.classList.remove("sidebar-open");
  refs.sidebarOverlay.hidden = true;
  refs.sidebarOverlay.classList.remove("sidebar-overlay-visible");
}

async function removeInputImage() {
  const stageState = getCurrentStageState();
  if (!stageState?.baseImage) {
    return;
  }
  const removedKeys = [stageState.baseImage.storageKey];
  stageState.baseImage = null;
  refs.inputImage.value = "";
  touchWorkspace();
  persistStateOrThrow();
  renderAll();
  await deleteUnreferencedImagePayloads(removedKeys);
}

async function removeReferenceImage(index) {
  const stageState = getCurrentStageState();
  if (!stageState || index < 0 || index >= stageState.referenceImages.length) {
    return;
  }
  const removedKeys = [stageState.referenceImages[index].storageKey];
  stageState.referenceImages.splice(index, 1);
  touchWorkspace();
  persistStateOrThrow();
  renderAll();
  await deleteUnreferencedImagePayloads(removedKeys);
  showToast("messages.referenceImageRemoved");
}

function applyStagePreset(stageId, presetId) {
  const workspace = getActiveWorkspace();
  const stageState = workspace?.stages?.[stageId];
  const preset = getStagePreset(stageId, presetId);
  if (!workspace || !stageState || !preset) {
    return;
  }
  for (const fieldName of STAGE_FIELDS[stageId] || []) {
    stageState.fields[fieldName] = "";
  }
  for (const [fieldName, value] of Object.entries(preset.fields || {})) {
    if (fieldByName.has(fieldName)) {
      stageState.fields[fieldName] = value;
    }
  }
  if (typeof preset.extraPrompt === "string") {
    stageState.extraPrompt = preset.extraPrompt;
  }
  stageState.selectedTagIds = preset.tagIds.filter((tagId) => getAllTags().some((tag) => tag.id === tagId));
  stageState.activePresetId = preset.id;
  clearOptimizedPromptForStage(stageState);
  if (promptAssistState.workspaceId === workspace.id && promptAssistState.stageId === stageId) {
    promptAssistState = createPromptAssistState();
  }
  touchWorkspace();
  persistState();
  renderAll();
  showToast("messages.stagePresetApplied", { name: getStagePresetLabel(preset) });
}

async function saveApiKey() {
  const value = refs.apiKeyInput.value.trim();
  const mode = state.settings.apiStorageMode;
  if (!value) {
    clearApiKey();
    return;
  }
  if (mode === "local") {
    window.localStorage.setItem(API_KEY_STORAGE_KEY, value);
    sessionApiKey = "";
  } else {
    sessionApiKey = value;
    window.localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
  state.apiKeyMeta.savedAt = new Date().toISOString();
  refs.apiKeyInput.value = "";
  resetModelCatalog();
  persistState();
  renderAll();
  showToast("messages.apiUpdated");
  await refreshAvailableModels({ force: true });
}

function clearApiKey() {
  sessionApiKey = "";
  window.localStorage.removeItem(API_KEY_STORAGE_KEY);
  state.apiKeyMeta.savedAt = null;
  refs.apiKeyInput.value = "";
  resetModelCatalog();
  persistState();
  renderAll();
  showToast("messages.apiCleared");
}

function clearOptimizedPromptOverride() {
  const stageState = getCurrentStageState();
  if (!stageState?.optimizedPrompt) {
    return;
  }
  clearOptimizedPromptForStage(stageState);
  promptAssistState = createPromptAssistState();
  touchWorkspace();
  persistState();
  refreshDerivedUi();
  showToast("messages.promptOptimizationCleared");
}

function clearOptimizedPromptForStage(stageState) {
  if (!stageState) {
    return false;
  }
  const changed = Boolean(stageState.optimizedPrompt || stageState.optimizedPromptUpdatedAt);
  stageState.optimizedPrompt = "";
  stageState.optimizedPromptUpdatedAt = null;
  return changed;
}

function clearAllOptimizedPrompts() {
  let changed = false;
  for (const workspace of state.workspaces) {
    for (const stage of STAGES) {
      changed = clearOptimizedPromptForStage(workspace.stages[stage.id]) || changed;
    }
  }
  return changed;
}

function markPromptSourceChanged(stageState, workspaceId = state.activeWorkspaceId, stageId = getCurrentStageId()) {
  clearOptimizedPromptForStage(stageState);
  stageState.activePresetId = "";
  if (promptAssistState.workspaceId === workspaceId && promptAssistState.stageId === stageId) {
    promptAssistState = createPromptAssistState();
  }
}

async function exportStateToTextarea() {
  const exportState = serializeStateForStorage(state);
  const imagePayloads = await collectExportImagePayloads(exportState);
  refs.stateJson.value = JSON.stringify(
    imagePayloads.size
      ? { ...exportState, imagePayloads: Object.fromEntries(imagePayloads) }
      : exportState,
    null,
    2
  );
  showToast("messages.stateExported");
}

async function importStateFromTextarea() {
  try {
    const nextState = JSON.parse(refs.stateJson.value);
    const previousKeys = [...collectReferencedImageStorageKeys()];
    state = normalizeState(nextState);
    await importImagePayloadBundle(nextState?.imagePayloads);
    if (imageStorageReady) {
      await migrateLegacyImagePayloads();
      await hydrateImagePayloadCache();
    }
    resultSelectionIds = [];
    promptAssistState = createPromptAssistState();
    persistState();
    renderAll();
    await deleteUnreferencedImagePayloads(previousKeys);
    showToast("messages.stateImported");
    void refreshAvailableModels({ force: true });
  } catch (error) {
    showToast("messages.stateImportFailed");
  }
}

function updateProvider(providerId) {
  const workspace = getActiveWorkspace();
  if (!workspace || !providerById.has(providerId)) {
    return;
  }
  workspace.parameters.providerId = providerId;
  workspace.parameters.model = getModelForProvider(providerId, workspace.parameters.model);
  state.settings.defaultProviderId = providerId;
  touchWorkspace();
  persistState();
  renderAll();
  if (providerId === "external-draft") {
    void refreshAvailableModels();
  }
}

async function resetCurrentStage() {
  const workspace = getActiveWorkspace();
  if (!workspace) {
    return;
  }
  if (!window.confirm(t("confirm.resetStage"))) {
    return;
  }
  const removedKeys = collectImageKeysFromStageState(workspace.stages[workspace.currentStageId]);
  workspace.stages[workspace.currentStageId] = createStageState(workspace.currentStageId);
  promptAssistState = createPromptAssistState();
  touchWorkspace();
  refs.inputImage.value = "";
  refs.referenceImageInput.value = "";
  persistStateOrThrow();
  renderAll();
  await deleteUnreferencedImagePayloads(removedKeys);
  showToast("messages.currentStageReset");
}

async function runGeneration() {
  const workspace = getActiveWorkspace();
  const stage = getCurrentStage();
  const stageState = getCurrentStageState();
  if (!workspace || !stage || !stageState) {
    return;
  }
  const providerId = workspace.parameters.providerId;
  const prompt = buildPrompt(workspace, stage.id);
  const request = buildRequestPayload(workspace, stage.id, prompt);
  let result = null;

  try {
    stageState.status = "running";
    stageState.lastError = "";
    persistStateOrThrow();
    renderAll();
    showToast(providerId === "browser-mock" ? "messages.mockStarted" : "messages.liveStarted");

    const imageDataUrl = providerId === "browser-mock"
      ? await generateMockImage(workspace, stage, prompt)
      : await generateLiveImage(workspace, stage, prompt, request);
    const storedImage = await storeImagePayload(imageDataUrl);
    result = {
      id: createId("result"),
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      stageId: stage.id,
      status: "completed",
      prompt,
      negativePrompt: stageState.negativePrompt,
      request,
      imageStorageKey: storedImage.storageKey,
      imageByteSize: storedImage.byteSize,
      imageDataUrl: storedImage.dataUrl,
      createdAt: new Date().toISOString(),
      note: getStageLabel(stage),
    };
    workspace.results.unshift(result);
    stageState.status = "completed";
    stageState.lastResultId = result.id;
    state.selectedResultId = result.id;
    touchWorkspace();
    persistStateOrThrow();
    renderAll();
    showToast("messages.resultUpdated");
  } catch (error) {
    console.error(error);
    if (result) {
      void deleteUnreferencedImagePayloads([result.imageStorageKey]);
      workspace.results = workspace.results.filter((item) => item.id !== result.id);
      state.selectedResultId = workspace.results[0]?.id || null;
    }
    stageState.status = "error";
    stageState.lastError = getGenerationErrorMessage(error);
    touchWorkspace();
    renderAll();
    try {
      persistState();
    } catch (persistError) {
      console.error(persistError);
    }
    showToast(getGenerationErrorToastKey(error));
    if (error?.message === "apiKeyRequired") {
      openSettingsModal("settings");
    }
  }
}

async function generateMockImage(workspace, stage, prompt) {
  await wait(180);
  return buildMockResultImage(workspace, stage, prompt);
}

async function optimizePromptWithOpenAI() {
  const workspace = getActiveWorkspace();
  const stage = getCurrentStage();
  const stageState = getCurrentStageState();
  if (!workspace || !stage || !stageState || stageState.status === "running" || promptAssistState.status === "running") {
    return;
  }
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    showToast("messages.apiKeyRequired");
    openSettingsModal("settings");
    return;
  }

  const sourceSignature = getPromptOptimizationSourceSignature(stageState);
  const draftPrompt = buildDraftPrompt(workspace, stage.id);
  promptAssistState = {
    status: "running",
    workspaceId: workspace.id,
    stageId: stage.id,
    error: "",
  };
  renderPromptPreviewPanel(workspace, stage, stageState);

  try {
    const optimizedPrompt = await requestOptimizedPromptFromOpenAI({
      apiKey,
      workspace,
      stage,
      stageState,
      draftPrompt,
    });
    const currentWorkspace = state.workspaces.find((item) => item.id === workspace.id);
    const currentStageState = currentWorkspace?.stages?.[stage.id];
    if (!currentStageState || getPromptOptimizationSourceSignature(currentStageState) !== sourceSignature) {
      promptAssistState = createPromptAssistState();
      refreshDerivedUi();
      showToast("messages.promptOptimizationStale");
      return;
    }
    currentStageState.optimizedPrompt = optimizedPrompt;
    currentStageState.optimizedPromptUpdatedAt = new Date().toISOString();
    currentWorkspace.updatedAt = new Date().toISOString();
    promptAssistState = createPromptAssistState();
    persistStateOrThrow();
    refreshDerivedUi();
    showToast("messages.promptOptimized");
  } catch (error) {
    console.error(error);
    promptAssistState = {
      status: "error",
      workspaceId: workspace.id,
      stageId: stage.id,
      error: getPromptOptimizationErrorMessage(error),
    };
    if (state.activeWorkspaceId === workspace.id && getCurrentStageId() === stage.id) {
      renderPromptPreviewPanel(workspace, stage, stageState);
    } else {
      refreshDerivedUi();
    }
    showToast(getPromptOptimizationErrorToastKey(error));
    if (error?.message === "apiKeyRequired") {
      openSettingsModal("settings");
    }
  }
}

async function requestOptimizedPromptFromOpenAI({ apiKey, workspace, stage, stageState, draftPrompt }) {
  let lastError = null;
  for (const model of PROMPT_OPTIMIZER_MODEL_PREFERENCE) {
    try {
      return await requestOptimizedPromptForModel({
        apiKey,
        model,
        workspace,
        stage,
        stageState,
        draftPrompt,
      });
    } catch (error) {
      lastError = error;
      if (!shouldRetryPromptOptimizerModel(error)) {
        throw error;
      }
    }
  }
  throw lastError || new Error("Prompt optimization failed.");
}

async function requestOptimizedPromptForModel({ apiKey, model, workspace, stage, stageState, draftPrompt }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "X-Client-Request-Id": createId("promptopt"),
    },
    body: JSON.stringify({
      model,
      input: buildPromptOptimizationInput(workspace, stage, stageState, draftPrompt),
      max_output_tokens: PROMPT_OPTIMIZER_MAX_OUTPUT_TOKENS,
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Prompt optimization failed.");
  }
  const optimizedPrompt = normalizeOptimizedPromptText(extractResponseText(payload));
  if (!optimizedPrompt) {
    throw new Error("Empty prompt optimization response.");
  }
  return optimizedPrompt;
}

function shouldRetryPromptOptimizerModel(error) {
  const message = String(error?.message || "").toLowerCase();
  return [
    "model",
    "not found",
    "does not exist",
    "unsupported",
    "permission",
    "access",
    "not available",
  ].some((keyword) => message.includes(keyword));
}

async function generateLiveImage(workspace, stage, prompt, request) {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error("apiKeyRequired");
  }

  const stageState = workspace.stages[stage.id];
  const model = getModelForProvider(workspace.parameters.providerId, workspace.parameters.model);
  workspace.parameters.model = model;
  request.model = model;

  const promptForApi = buildLivePrompt(prompt, stageState.negativePrompt);
  const inputImages = getInputImagesForStage(workspace, stageState, stage.id);

  if (inputImages.allImages.length) {
    return generateOpenAIImageEdit({
      apiKey,
      model,
      prompt: promptForApi,
      images: inputImages.allImages,
    });
  }

  return generateOpenAIImage({
    apiKey,
    model,
    prompt: promptForApi,
  });
}

async function generateOpenAIImage({ apiKey, model, prompt }) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      size: "1024x1024",
      quality: "medium",
      output_format: "png",
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "OpenAI image generation failed.");
  }
  return extractImageDataUrl(payload, "png");
}

async function generateOpenAIImageEdit({ apiKey, model, prompt, images }) {
  const formData = new FormData();
  formData.append("model", model);
  formData.append("prompt", prompt);
  formData.append("size", "1024x1024");
  formData.append("quality", "medium");
  formData.append("output_format", "png");
  formData.append("input_fidelity", "high");
  for (const [index, image] of images.entries()) {
    formData.append("image[]", await dataUrlToFile(image.dataUrl, image.name || `input-${index + 1}.png`));
  }

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
    body: formData,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "OpenAI image edit failed.");
  }
  return extractImageDataUrl(payload, "png");
}

function extractImageDataUrl(payload, fallbackFormat) {
  const item = payload?.data?.[0];
  if (!item) {
    throw new Error("Empty image response.");
  }
  if (item.b64_json) {
    return `data:image/${fallbackFormat};base64,${item.b64_json}`;
  }
  if (item.url) {
    return item.url;
  }
  throw new Error("Image response did not include an image.");
}

function buildLivePrompt(prompt, negativePrompt) {
  const base = prompt.trim();
  const negative = negativePrompt.trim();
  if (!negative) {
    return base;
  }
  return state.locale === "ja"
    ? `${base}\n避けたい要素: ${negative}`
    : `${base}\nAvoid: ${negative}`;
}

function advanceStage() {
  const workspace = getActiveWorkspace();
  if (!workspace) {
    return;
  }
  const index = STAGES.findIndex((stage) => stage.id === workspace.currentStageId);
  if (index === -1 || index === STAGES.length - 1) {
    showToast("messages.noMoreStages");
    return;
  }
  const currentStageId = workspace.currentStageId;
  const nextStage = STAGES[index + 1];
  if (state.settings.autoCarry) {
    const latestResult = getLatestStageResult(workspace, currentStageId);
    if (latestResult && hasStoredResultImage(latestResult)) {
      carryResultForward(workspace, currentStageId, latestResult);
    }
  }
  workspace.currentStageId = nextStage.id;
  touchWorkspace();
  persistState();
  renderAll();
  showToast("messages.advancedStage", { name: getStageLabel(nextStage) });
}

function carryResultForward(workspace, stageId, result) {
  const currentIndex = STAGES.findIndex((stage) => stage.id === stageId);
  const nextStage = STAGES[currentIndex + 1];
  if (!nextStage) {
    return null;
  }
  workspace.stages[nextStage.id].baseImage = {
    name: `${result.note}.png`,
    dataUrl: "",
    source: "carry",
    resultId: result.id,
    sourceStageId: stageId,
    createdAt: new Date().toISOString(),
  };
  return nextStage.id;
}

function renderAll() {
  document.documentElement.lang = state.locale;
  document.title = state.locale === "ja" ? "I2I Forge | Sunmax" : "I2I Forge | Sunmax";
  applyStaticTranslations();
  syncViewVisibility();
  syncSettingsModalVisibility();
  renderViewNav();
  renderHeader();
  renderSidebar();
  renderOverview();
  renderWorkspaces();
  renderStudio();
  renderResults();
  renderTagLibrary();
  renderSettingsModal();
}

function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
  });
}

function syncViewVisibility() {
  for (const pane of refs.viewPanes) {
    pane.hidden = pane.dataset.view !== state.activeView;
  }
}

function syncSettingsModalVisibility() {
  const isOpen = isSettingsModalOpen();
  refs.settingsModal.hidden = !isOpen;
  refs.body.classList.toggle("modal-open", isOpen);
  refs.modalPaneSettings.hidden = state.settingsModal.tab !== "settings";
  refs.modalPaneGuide.hidden = state.settingsModal.tab !== "guide";
  for (const tab of refs.modalTabs) {
    const active = tab.dataset.modalTab === state.settingsModal.tab;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  }
}

function renderViewNav() {
  refs.viewNav.innerHTML = VIEW_ITEMS.map((item) => {
    const isActive = item.id === state.activeView;
    return `
      <button
        type="button"
        class="app-nav-button${isActive && item.id !== "settings" ? " active" : ""}"
        data-view-target="${item.id}"
      >
        ${t(item.labelKey)}
      </button>
    `;
  }).join("");
}

function renderHeader() {
  const workspace = getActiveWorkspace();
  const stage = getCurrentStage();
  const resultCount = workspace?.results.length || 0;
  refs.headerStageName.textContent = stage ? getStageLabel(stage) : t("common.noStage");
  refs.headerStagePill.textContent = stage ? `${t("common.stage")} ${stage.number}` : t("common.noStage");
  refs.headerStageInline.textContent = stage
    ? `${getStageLabel(stage)} / ${t("common.stage")} ${stage.number}`
    : t("common.noStage");
  refs.headerResultCount.textContent = t("common.resultCount", { count: resultCount });
}

function renderSidebar() {
  const workspace = getActiveWorkspace();
  const stage = getCurrentStage();
  refs.workspaceSwitcher.innerHTML = state.workspaces.map((item) => {
    const active = item.id === state.activeWorkspaceId;
    return `
      <button
        type="button"
        class="workspace-switch-button${active ? " active" : ""}"
        data-workspace-id="${item.id}"
        data-workspace-action="switch"
      >
        <strong>${escapeHtml(item.name)}</strong>
        <span>${getStageLabel(stageById.get(item.currentStageId))}</span>
      </button>
    `;
  }).join("");

  refs.workspaceQuickStats.innerHTML = workspace
    ? `
      <div class="compact-stat">
        <span>${t("common.current")}</span>
        <strong>${escapeHtml(workspace.name)}</strong>
      </div>
      <div class="compact-stat">
        <span>${t("common.progress")}</span>
        <strong>${getCompletedStageCount(workspace)} / ${STAGES.length}</strong>
      </div>
      <div class="compact-stat">
        <span>${t("common.outputs")}</span>
        <strong>${workspace.results.length}</strong>
      </div>
    `
    : "";

  refs.activeStageName.textContent = stage ? getStageLabel(stage) : t("common.noStage");
  refs.activeStageSummary.textContent = stage ? getStageDescription(stage) : t("common.stageGoalFallback");
  refs.activeStageFocus.innerHTML = stage
    ? stage.focusCategoryIds
        .map((id) => `<span class="tag-chip tag-chip-static">${escapeHtml(getCategoryName(categoryById.get(id)))}</span>`)
        .join("")
    : "";

  refs.contextChips.innerHTML = workspace
    ? [
        buildContextChip(t("common.workspace"), workspace.name),
        buildContextChip(t("common.stage"), stage ? getStageLabel(stage) : t("common.noStage")),
        buildContextChip(t("common.mode"), getProviderLabel(providerById.get(workspace.parameters.providerId))),
        buildContextChip(t("common.outputs"), String(workspace.results.length)),
      ].join("")
    : buildContextChip(t("common.workspace"), t("common.noWorkspaceSelected"));
}

function renderOverview() {
  const workspace = getActiveWorkspace();
  const stage = getCurrentStage();
  const latestResult = getSelectedOrLatestResult();
  refs.overviewMetrics.innerHTML = workspace
    ? `
      <div class="metric-card">
        <span>${t("overview.activeThreads")}</span>
        <strong>1</strong>
        <span>${getStageLabel(stage)}</span>
      </div>
      <div class="metric-card">
        <span>${t("overview.flow")}</span>
        <strong>${Math.round((getCompletedStageCount(workspace) / STAGES.length) * 100)}%</strong>
        <span>${getCompletedStageCount(workspace)} / ${STAGES.length}</span>
      </div>
      <div class="metric-card">
        <span>${t("overview.resultPasses")}</span>
        <strong>${workspace.results.length}</strong>
        <span>${workspace.parameters.model}</span>
      </div>
    `
    : "";

  refs.stageRoadmap.innerHTML = STAGES.map((item) => renderStageButton(item, workspace, "stage-roadmap-card")).join("");
  refs.overviewWorkspaces.innerHTML = workspace
    ? `
      <div class="overview-workspace-summary">
        <p class="overview-workspace-name">${escapeHtml(workspace.name)}</p>
        <p class="helper-text overview-clamped-copy">${escapeHtml(workspace.description || t("workspace.noDescription"))}</p>
        <div class="overview-stage-strip">${renderOverviewStageStrip(workspace)}</div>
      </div>
    `
    : `<p class="helper-text">${t("overview.noWorkspace")}</p>`;

  refs.overviewResults.innerHTML = latestResult
    ? `
      <div class="overview-result-summary">
        <p class="overview-result-title">${escapeHtml(getStageLabel(stageById.get(latestResult.stageId)))}</p>
        <p class="helper-text">${escapeHtml(formatDateTime(latestResult.createdAt))}</p>
      </div>
      <div class="overview-result-media">
        <img src="${escapeHtml(getResultImageUrl(latestResult))}" alt="${escapeHtml(getStageLabel(stageById.get(latestResult.stageId)))}" />
      </div>
    `
    : `<div class="overview-result-media overview-result-media-empty"><p class="overview-result-placeholder">${t("overview.noResult")}</p></div>`;
}

function renderWorkspaces() {
  refs.workspaceList.innerHTML = state.workspaces.map((workspace) => {
    const isActive = workspace.id === state.activeWorkspaceId;
    return `
      <article class="workspace-card${isActive ? " current" : ""}">
        <div class="card-toolbar">
          <div>
            <strong>${escapeHtml(workspace.name)}</strong>
            <p class="workspace-meta">${escapeHtml(workspace.description || t("workspace.noDescription"))}</p>
          </div>
          <span class="badge-inline">${isActive ? t("workspace.active") : getStageLabel(stageById.get(workspace.currentStageId))}</span>
        </div>
        <div class="overview-stage-strip">${renderOverviewStageStrip(workspace)}</div>
        <div class="card-toolbar">
          <span class="workspace-meta">${t("workspace.completed")}: ${getCompletedStageCount(workspace)} / ${STAGES.length}</span>
          <span class="workspace-meta">${t("workspace.results")}: ${workspace.results.length}</span>
        </div>
        <div class="inline-actions">
          <button type="button" class="secondary-button" data-workspace-action="activate" data-workspace-id="${workspace.id}">
            ${t("actions.open")}
          </button>
          <button type="button" class="secondary-button" data-workspace-action="duplicate" data-workspace-id="${workspace.id}">
            ${t("actions.duplicate")}
          </button>
          <button type="button" class="secondary-button" data-workspace-action="delete" data-workspace-id="${workspace.id}">
            ${t("actions.delete")}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function renderStudio() {
  const workspace = getActiveWorkspace();
  const stage = getCurrentStage();
  const stageState = getCurrentStageState();
  if (!workspace || !stage || !stageState) {
    return;
  }

  refs.stageStepper.innerHTML = STAGES.map((item) => renderStageButton(item, workspace, "stage-step-button")).join("");
  refs.studioStageTitle.textContent = getStageLabel(stage);
  refs.stageNumberBadge.textContent = `${t("common.stage")} ${stage.number}`;
  refs.studioStageDescription.textContent = getStageDescription(stage);
  refs.stageFocusChips.innerHTML = stage.focusCategoryIds
    .map((id) => `<span class="tag-chip tag-chip-static">${escapeHtml(getCategoryName(categoryById.get(id)))}</span>`)
    .join("");

  renderInputImage(workspace, stage.id, stageState);
  renderStagePresets(stage, stageState);
  renderStageForm(stage, stageState);
  renderStageTags(stage, stageState);
  refs.extraPrompt.value = stageState.extraPrompt;
  refs.negativePrompt.value = stageState.negativePrompt;
  renderPromptPreviewPanel(workspace, stage, stageState);
  syncParameterUi(workspace);
  renderParameterHelp();

  const latestStageResult = getLatestStageResult(workspace, stage.id);
  refs.resultStatusBadge.textContent = t(`status.${stageState.status}`);
  refs.resultStatusBadge.className = `badge-inline status-${stageState.status}`;
  refs.resultStatusSummary.className = `result-status-summary status-${stageState.status}`;
  refs.resultStatusIndicator.className = `result-status-indicator status-${stageState.status}`;
  refs.resultProgressTitle.textContent = t("studio.statusRunningTitle");
  refs.resultProgressDetail.textContent = t("studio.statusRunningDetail");
  refs.resultProgressOverlay.hidden = stageState.status !== "running";
  refs.runGeneration.disabled = stageState.status === "running";
  refs.advanceStage.disabled = stageState.status === "running";
  refs.viewResultDetail.disabled = stageState.status === "running" && !latestStageResult;
  refs.studioResultCaption.textContent = latestStageResult
    ? `${getStageLabel(stage)} / ${formatDateTime(latestStageResult.createdAt)}`
    : stageState.lastError;
  const statusCopy = getResultStatusCopy(stageState, latestStageResult);
  refs.resultStatusTitle.textContent = statusCopy.title;
  refs.resultStatusDetail.textContent = statusCopy.detail;
  refs.resultStatusSummary.setAttribute("aria-live", stageState.status === "running" ? "polite" : "off");
  const latestStageResultUrl = getResultImageUrl(latestStageResult);
  if (latestStageResultUrl) {
    refs.studioResultImage.hidden = false;
    refs.studioResultImage.src = latestStageResultUrl;
    refs.studioResultPlaceholder.hidden = true;
  } else {
    refs.studioResultImage.hidden = true;
    refs.studioResultPlaceholder.hidden = false;
  }
}

function renderInputImage(workspace, stageId, stageState) {
  const inputImages = getInputImagesForStage(workspace, stageState, stageId);
  const clipboardSupported = supportsClipboardRead();
  if (inputImages.baseImage?.dataUrl) {
    refs.inputImagePreview.hidden = false;
    refs.inputImagePreview.src = inputImages.baseImage.dataUrl;
    refs.inputImagePlaceholder.hidden = true;
  } else {
    refs.inputImagePreview.hidden = true;
    refs.inputImagePreview.removeAttribute("src");
    refs.inputImagePlaceholder.hidden = false;
  }
  refs.pasteInputImage.title = clipboardSupported ? t("actions.pasteImage") : t("messages.clipboardReadUnsupported");
  refs.removeInputImage.disabled = !inputImages.baseImage;
  refs.referenceImageHint.textContent = t("studio.referenceHint", { count: MAX_REFERENCE_IMAGES });
  refs.referenceImageList.innerHTML = inputImages.referenceImages.length
    ? inputImages.referenceImages.map((image, index) => renderReferenceImageCard(image, index)).join("")
    : `<p class="helper-text">${t("studio.referenceEmpty")}</p>`;
  refs.pasteReferenceImages.title = clipboardSupported ? t("actions.pasteImages") : t("messages.clipboardReadUnsupported");
  refs.pasteReferenceImages.disabled = stageState.referenceImages.length >= MAX_REFERENCE_IMAGES;
  refs.addReferenceImages.disabled = stageState.referenceImages.length >= MAX_REFERENCE_IMAGES;
}

function renderReferenceImageCard(image, index) {
  return `
    <article class="reference-image-card">
      <div class="preview-frame reference-image-frame">
        <img src="${escapeHtml(image.dataUrl)}" alt="${escapeHtml(image.name || t("common.referenceImages"))}" />
      </div>
      <div class="reference-image-meta">
        <div>
          <strong>${t("common.referenceImages")} ${index + 1}</strong>
          <p class="reference-image-name">${escapeHtml(image.name || "reference.png")}</p>
        </div>
        <button
          type="button"
          class="secondary-button"
          data-reference-remove-index="${index}"
        >
          ${t("actions.remove")}
        </button>
      </div>
    </article>
  `;
}

function renderStageForm(stage, stageState) {
  const fields = STAGE_FIELDS[stage.id] || [];
  refs.stageFormGrid.innerHTML = fields.map((fieldName) => {
    const field = fieldByName.get(fieldName);
    const value = stageState.fields[field.name] || "";
    const multiline = Boolean(field.multiline);
    return `
      <label class="field-stack${multiline ? " field-span-2" : ""}">
        <span>${escapeHtml(getFieldLabel(field))}</span>
        ${
          multiline
            ? `<textarea rows="3" data-stage-field="${field.name}" placeholder="${escapeHtml(getFieldPlaceholder(field))}">${escapeHtml(value)}</textarea>`
            : `<input type="text" data-stage-field="${field.name}" value="${escapeHtml(value)}" placeholder="${escapeHtml(getFieldPlaceholder(field))}" />`
        }
      </label>
    `;
  }).join("");
}

function renderStagePresets(stage, stageState) {
  const presets = getStagePresets(stage.id);
  refs.stagePresets.innerHTML = presets.map((preset) => `
    <button
      type="button"
      class="stage-preset-button${stageState.activePresetId === preset.id ? " active" : ""}"
      data-stage-preset-id="${preset.id}"
    >
      <strong>${escapeHtml(getStagePresetLabel(preset))}</strong>
      <p class="helper-text">${escapeHtml(getStagePresetDescription(preset))}</p>
    </button>
  `).join("");
}

function renderStageTags(stage, stageState) {
  const availableTags = getAllTags();
  refs.tagGroups.innerHTML = getVisibleStageTagCategoryIds(stage).map((categoryId) => {
    const category = categoryById.get(categoryId);
    const tags = availableTags.filter((tag) => tag.categoryId === categoryId);
    return `
      <section class="tag-category-card">
        <div class="card-toolbar">
          <div>
            <strong>${escapeHtml(getCategoryName(category))}</strong>
            <p class="helper-text">${escapeHtml(getCategoryDescription(category))}</p>
          </div>
          <span class="badge-inline">${tags.length}</span>
        </div>
        <div class="tag-chip-row">
          ${tags
            .map((tag) => `
              <button
                type="button"
                class="tag-chip${stageState.selectedTagIds.includes(tag.id) ? " active" : ""}"
                data-tag-id="${tag.id}"
                data-stage-id="${stage.id}"
              >
                ${escapeHtml(getTagLabel(tag))}
              </button>
            `)
            .join("")}
        </div>
      </section>
    `;
  }).join("");
}

function getVisibleStageTagCategoryIds(stage) {
  return [...new Set([...(stage?.focusCategoryIds || []), ...STUDIO_TAG_CATEGORY_IDS])]
    .filter((categoryId) => categoryById.has(categoryId));
}

function renderResults() {
  const workspace = getActiveWorkspace();
  const results = workspace?.results || [];
  syncResultSelection(results);
  const allSelected = results.length > 0 && resultSelectionIds.length === results.length;
  refs.historyList.classList.toggle("history-list-compact", state.settings.compactHistory);
  refs.resultsSelectionSummary.textContent = t("results.selectionSummary", {
    selected: resultSelectionIds.length,
    total: results.length,
  });
  refs.resultsSelectAll.textContent = t(allSelected ? "results.clearSelection" : "results.selectAll");
  refs.resultsSelectAll.disabled = !results.length;
  refs.resultsDeleteSelected.disabled = !resultSelectionIds.length;
  refs.resultsDeleteAll.disabled = !results.length;
  refs.historyList.innerHTML = results.length
    ? results.map((result) => renderResultEntry(result)).join("")
    : `<p class="helper-text">${t("results.emptyHistory")}</p>`;
  refs.resultsDetail.innerHTML = renderResultDetail(getSelectedOrLatestResult());
}

function renderResultEntry(result) {
  const stage = stageById.get(result.stageId);
  const active = result.id === state.selectedResultId;
  const selected = resultSelectionIds.includes(result.id);
  return `
    <article class="history-entry${active ? " active" : ""}">
      <div class="history-entry-head">
        <label class="history-select-toggle">
          <input type="checkbox" data-result-select-id="${result.id}" ${selected ? "checked" : ""} />
          <span>${t("results.selectItem")}</span>
        </label>
        <button
          type="button"
          class="history-action history-action-danger"
          data-result-delete-id="${result.id}"
        >
          ${t("actions.delete")}
        </button>
      </div>
      <button type="button" class="history-entry-open" data-result-id="${result.id}">
        <div class="card-toolbar">
          <strong>${escapeHtml(getStageLabel(stage))}</strong>
          <span class="badge-inline">${escapeHtml(stage.code)}</span>
        </div>
        <p class="history-meta">${escapeHtml(formatDateTime(result.createdAt))}</p>
        <p class="helper-text overview-clamped-copy">${escapeHtml(result.prompt || t("results.detailSummary"))}</p>
      </button>
    </article>
  `;
}

function renderResultDetail(result) {
  if (!result) {
    return `<p class="helper-text">${t("results.emptyDetail")}</p>`;
  }
  const stage = stageById.get(result.stageId);
  return `
    <article class="result-detail-card">
      <div class="card-toolbar">
        <div>
          <strong>${escapeHtml(getStageLabel(stage))}</strong>
          <p class="result-meta">${escapeHtml(formatDateTime(result.createdAt))}</p>
        </div>
        <div class="history-actions">
          <span class="badge-inline">${escapeHtml(result.workspaceName || getActiveWorkspace()?.name || "")}</span>
          <button
            type="button"
            class="history-action history-action-danger"
            data-result-delete-id="${result.id}"
          >
            ${t("actions.delete")}
          </button>
        </div>
      </div>
        <div class="result-frame">
          ${
          getResultImageUrl(result)
            ? `<img src="${escapeHtml(getResultImageUrl(result))}" alt="${escapeHtml(getStageLabel(stage))}" />`
            : `<div class="result-placeholder">${t("results.previewMissing")}</div>`
        }
      </div>
      <div class="result-detail-copy">
        <div>
          <strong>${t("studio.promptPreview")}</strong>
          <p class="helper-text">${escapeHtml(result.prompt || t("results.detailSummary"))}</p>
        </div>
        <div>
          <strong>${t("studio.negativePrompt")}</strong>
          <p class="helper-text">${escapeHtml(result.negativePrompt || (state.locale === "ja" ? "なし" : "None"))}</p>
        </div>
        <div>
          <strong>${t("studio.showRequestJson")}</strong>
          <pre class="request-preview">${escapeHtml(JSON.stringify(result.request, null, 2))}</pre>
        </div>
      </div>
    </article>
  `;
}

function renderTagLibrary() {
  refs.customTagCategory.innerHTML = ALL_TAG_CATEGORIES.map((category) => `
    <option value="${category.id}">${escapeHtml(getCategoryName(category))}</option>
  `).join("");

  const allTags = getAllTags();
  refs.tagLibrary.innerHTML = ALL_TAG_CATEGORIES.map((category) => {
    const tags = allTags.filter((tag) => tag.categoryId === category.id);
    return `
      <section class="tag-category-card">
        <div class="card-toolbar">
          <div>
            <strong>${escapeHtml(getCategoryName(category))}</strong>
            <p class="helper-text">${escapeHtml(getCategoryDescription(category))}</p>
          </div>
          <span class="badge-inline">${t("tags.tagsCount", { count: tags.length })}</span>
        </div>
        <div class="tag-chip-row">
          ${tags
            .map((tag) => `
              <button type="button" class="tag-chip${isTagSelectedAnywhere(tag.id) ? " active" : ""}" data-tag-id="${tag.id}">
                ${escapeHtml(getTagLabel(tag))}
              </button>
            `)
            .join("")}
        </div>
      </section>
    `;
  }).join("");

  refs.errorGuideList.innerHTML = ERROR_GUIDES.map((guide) => {
    const title = state.locale === "ja" ? guide.titleJa : guide.titleEn;
    const description = state.locale === "ja" ? guide.descriptionJa : guide.descriptionEn;
    const checks = state.locale === "ja" ? guide.checksJa : guide.checksEn;
    return `
      <article class="guide-card">
        <strong>${escapeHtml(title)}</strong>
        <p class="helper-text">${escapeHtml(description)}</p>
        <ul class="plain-list">
          ${checks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>
    `;
  }).join("");
}

function renderSettingsModal() {
  refs.settingLanguage.value = state.locale;
  refs.settingAutoCarry.checked = state.settings.autoCarry;
  refs.settingCompactHistory.checked = state.settings.compactHistory;
  refs.apiStorageMode.value = state.settings.apiStorageMode;
  refs.providerCards.innerHTML = PROVIDERS.map((provider) => `
    <button
      type="button"
      class="provider-card-button${provider.id === getActiveWorkspace()?.parameters.providerId ? " active" : ""}"
      data-provider-id="${provider.id}"
    >
      <strong>${escapeHtml(getProviderLabel(provider))}</strong>
      <span>${escapeHtml(getProviderDescription(provider))}</span>
    </button>
  `).join("");
  refs.apiKeyStatus.textContent = getApiKeyStatusText();
  const resultCacheSummary = summarizeStoredImageCache();
  refs.resultCacheSummary.textContent = resultCacheSummary.count
    ? t("settings.resultCacheSummary", {
        resultCount: resultCacheSummary.resultCount,
        stageCount: resultCacheSummary.stageCount,
        size: formatStorageBytes(resultCacheSummary.bytes),
      })
    : t("settings.resultCacheEmpty");
  refs.clearResultCache.disabled = !resultCacheSummary.count;
}

function syncResultSelection(results) {
  const validIds = new Set(results.map((result) => result.id));
  resultSelectionIds = resultSelectionIds.filter((id) => validIds.has(id));
}

function setResultSelected(resultId, selected) {
  const workspace = getActiveWorkspace();
  if (!workspace?.results.some((result) => result.id === resultId)) {
    return;
  }
  const next = new Set(resultSelectionIds);
  if (selected) {
    next.add(resultId);
  } else {
    next.delete(resultId);
  }
  resultSelectionIds = Array.from(next);
  renderResults();
}

function toggleAllResultSelection() {
  const workspace = getActiveWorkspace();
  const results = workspace?.results || [];
  if (!results.length) {
    return;
  }
  const allSelected = results.every((result) => resultSelectionIds.includes(result.id));
  resultSelectionIds = allSelected ? [] : results.map((result) => result.id);
  renderResults();
}

function deleteResult(resultId) {
  const workspace = getActiveWorkspace();
  if (!workspace?.results.some((result) => result.id === resultId)) {
    return;
  }
  if (!window.confirm(t("confirm.deleteResult"))) {
    return;
  }
  const removal = removeResultsByIds([resultId]);
  if (!removal.count) {
    return;
  }
  persistState();
  renderAll();
  void deleteUnreferencedImagePayloads(removal.storageKeys);
  showToast("messages.resultDeleted");
}

function deleteSelectedResults() {
  const workspace = getActiveWorkspace();
  syncResultSelection(workspace?.results || []);
  if (!workspace || !resultSelectionIds.length) {
    return;
  }
  if (!window.confirm(t("confirm.deleteSelectedResults", { count: resultSelectionIds.length }))) {
    return;
  }
  const removal = removeResultsByIds(resultSelectionIds);
  if (!removal.count) {
    return;
  }
  persistState();
  renderAll();
  void deleteUnreferencedImagePayloads(removal.storageKeys);
  showToast(removal.count === 1 ? "messages.resultDeleted" : "messages.resultsDeleted", { count: removal.count });
}

function deleteAllResults() {
  const workspace = getActiveWorkspace();
  if (!workspace?.results.length) {
    return;
  }
  if (!window.confirm(t("confirm.deleteAllResults"))) {
    return;
  }
  const removal = removeResultsByIds(workspace.results.map((result) => result.id));
  if (!removal.count) {
    return;
  }
  persistState();
  renderAll();
  void deleteUnreferencedImagePayloads(removal.storageKeys);
  showToast("messages.resultsDeleted", { count: removal.count });
}

function clearResultImageCache() {
  const summary = summarizeStoredImageCache();
  if (!summary.count) {
    return;
  }
  if (!window.confirm(t("confirm.clearResultCache", { count: summary.count }))) {
    return;
  }
  const snapshot = JSON.stringify({
    workspaces: state.workspaces,
    selectedResultId: state.selectedResultId,
  });
  const cleared = clearResultImageCacheAcrossWorkspaces();
  if (!cleared.count) {
    return;
  }
  try {
    persistStateOrThrow();
    renderAll();
    void deleteUnreferencedImagePayloads(cleared.storageKeys);
    showToast("messages.resultCacheCleared", { count: cleared.count });
  } catch (error) {
    const restored = JSON.parse(snapshot);
    state.workspaces = restored.workspaces;
    state.selectedResultId = restored.selectedResultId;
    renderAll();
    showToast(getGenerationErrorToastKey(error));
  }
}

function clearResultImageCacheAcrossWorkspaces() {
  let resultCount = 0;
  let stageCount = 0;
  const removedStorageKeys = [];
  for (const workspace of state.workspaces) {
    const clearedResultsById = new Map();
    let workspaceStageCount = 0;
    for (const result of workspace.results) {
      if (!result.imageStorageKey && !result.imageDataUrl) {
        continue;
      }
      clearedResultsById.set(result.id, { ...result });
      removedStorageKeys.push(result.imageStorageKey);
      result.imageStorageKey = null;
      result.imageByteSize = 0;
      result.imageDataUrl = "";
      resultCount += 1;
    }
    for (const stage of STAGES) {
      const stageState = workspace.stages[stage.id];
      if (stageState.baseImage?.storageKey || stageState.baseImage?.dataUrl) {
        removedStorageKeys.push(stageState.baseImage.storageKey);
        stageState.baseImage = null;
        workspaceStageCount += 1;
      }
      if (Array.isArray(stageState.referenceImages) && stageState.referenceImages.length) {
        const nextReferenceImages = stageState.referenceImages.filter((image) => {
          if (image?.storageKey || image?.dataUrl) {
            removedStorageKeys.push(image.storageKey);
            workspaceStageCount += 1;
            return false;
          }
          return true;
        });
        stageState.referenceImages = nextReferenceImages;
      }
    }
    stageCount += workspaceStageCount;
    if (!clearedResultsById.size && !workspaceStageCount) {
      continue;
    }
    syncWorkspaceResultLinks(workspace, clearedResultsById);
    workspace.updatedAt = new Date().toISOString();
  }
  return {
    resultCount,
    stageCount,
    count: resultCount + stageCount,
    storageKeys: removedStorageKeys,
  };
}

function removeResultsByIds(resultIds) {
  const workspace = getActiveWorkspace();
  if (!workspace) {
    return 0;
  }
  const removableIds = new Set(
    resultIds.filter((resultId) => workspace.results.some((result) => result.id === resultId))
  );
  if (!removableIds.size) {
    return 0;
  }
  const removedResultsById = new Map(
    workspace.results
      .filter((result) => removableIds.has(result.id))
      .map((result) => [result.id, result])
  );
  const removedStorageKeys = [...removedResultsById.values()].map((result) => result.imageStorageKey);
  workspace.results = workspace.results.filter((result) => !removableIds.has(result.id));
  syncResultSelection(workspace.results);
  syncWorkspaceResultLinks(workspace, removedResultsById);
  if (!workspace.results.some((result) => result.id === state.selectedResultId)) {
    state.selectedResultId = workspace.results[0]?.id || null;
  }
  touchWorkspace();
  return {
    count: removableIds.size,
    storageKeys: removedStorageKeys,
  };
}

function syncWorkspaceResultLinks(workspace, removedResultsById) {
  const validResultIds = new Set(workspace.results.map((result) => result.id));
  for (const stage of STAGES) {
    const stageState = workspace.stages[stage.id];
    const latestStageResult = workspace.results.find((result) => result.stageId === stage.id) || null;
    if (!stageState.lastResultId || !validResultIds.has(stageState.lastResultId)) {
      stageState.lastResultId = latestStageResult?.id || null;
    }
    if (stageState.status === "completed" && !latestStageResult) {
      stageState.status = "idle";
    }
    stageState.baseImage = resolveCarryImageReference(workspace, stageState.baseImage, validResultIds, removedResultsById);
    stageState.referenceImages = stageState.referenceImages
      .map((image) => resolveCarryImageReference(workspace, image, validResultIds, removedResultsById))
      .filter(Boolean);
  }
}

function resolveCarryImageReference(workspace, image, validResultIds, changedResultsById) {
  if (!image || image.source !== "carry" || !image.resultId) {
    return image;
  }
  const sourceResult = workspace.results.find((result) => result.id === image.resultId) || null;
  if (sourceResult && hasStoredResultImage(sourceResult)) {
    return image;
  }
  if (sourceResult && validResultIds.has(sourceResult.id) && !hasStoredResultImage(sourceResult)) {
    const fallback = findReplacementCarryResult(workspace, image, sourceResult.stageId);
    return fallback ? buildCarryImageReference(image, fallback) : null;
  }
  if (validResultIds.has(image.resultId)) {
    return image;
  }
  const changedSource = changedResultsById.get(image.resultId);
  const fallback = findReplacementCarryResult(workspace, image, changedSource?.stageId || null);
  return fallback ? buildCarryImageReference(image, fallback) : null;
}

function findReplacementCarryResult(workspace, image, sourceStageId) {
  const fallbackStageId = image.sourceStageId || sourceStageId || null;
  return fallbackStageId
    ? workspace.results.find((result) => result.stageId === fallbackStageId && hasStoredResultImage(result)) || null
    : null;
}

function buildCarryImageReference(image, replacement) {
  return {
    ...image,
    name: `${replacement.note}.png`,
    dataUrl: "",
    resultId: replacement.id,
    sourceStageId: replacement.stageId,
    createdAt: new Date().toISOString(),
  };
}

function toggleTagSelection(tagId, stageId) {
  const workspace = getActiveWorkspace();
  if (!workspace || !workspace.stages[stageId]) {
    return;
  }
  const stageState = workspace.stages[stageId];
  const selected = stageState.selectedTagIds;
  const next = selected.includes(tagId) ? selected.filter((id) => id !== tagId) : [...selected, tagId];
  stageState.selectedTagIds = next;
  markPromptSourceChanged(stageState, workspace.id, stageId);
  touchWorkspace();
  persistState();
  renderAll();
}

function selectResult(resultId) {
  const workspace = getActiveWorkspace();
  if (!workspace?.results.some((result) => result.id === resultId)) {
    return;
  }
  state.selectedResultId = resultId;
  persistState();
  renderAll();
}

function buildDraftPrompt(workspace, stageId) {
  const stageState = workspace.stages[stageId];
  const stage = stageById.get(stageId);
  const sheet = promptSheetByStageId.get(stageId);
  const template = state.locale === "ja" ? sheet.promptTemplateJa : sheet.promptTemplateEn;
  const values = {
    "subject": stageState.fields.subject,
    "character": stageState.fields.character,
    "pose": stageState.fields.pose,
    "composition": stageState.fields.composition,
    "camera angle": stageState.fields.cameraAngle,
    "outfit": stageState.fields.outfit,
    "outfit details": stageState.fields.outfitDetails,
    "hairstyle": stageState.fields.hairstyle,
    "facial expression": stageState.fields.facialExpression,
    "background": stageState.fields.background,
    "background details": stageState.fields.backgroundDetails,
    "art style": stageState.fields.artStyle,
    "lighting": stageState.fields.lighting,
    "color mood": stageState.fields.colorMood,
    "background color mood": stageState.fields.colorMood,
    "hair color": stageState.fields.hairColor,
    "eye color": stageState.fields.eyeColor,
    "outfit colors": stageState.fields.outfitColors,
    "material notes": stageState.fields.materialNotes,
    "render stage keywords": stageState.fields.stageKeywords || getRecommendedKeywords(stage),
    "quality keywords": stageState.fields.qualityKeywords,
  };
  let prompt = template;
  for (const [token, value] of Object.entries(values)) {
    prompt = prompt.replaceAll(`[${token}]`, value || "");
  }
  const tagValues = stageState.selectedTagIds
    .map((id) => getAllTags().find((tag) => tag.id === id))
    .filter(Boolean)
    .map((tag) => getTagPromptValue(tag));
  const parts = [...splitPromptParts(prompt), ...tagValues.flatMap((item) => splitPromptParts(item)), ...splitPromptParts(stageState.extraPrompt)];
  return [...new Set(parts)].join(", ");
}

function buildPrompt(workspace, stageId) {
  const stageState = workspace.stages[stageId];
  return sanitizeText(stageState?.optimizedPrompt, "") || buildDraftPrompt(workspace, stageId);
}

function buildPromptOptimizationInput(workspace, stage, stageState, draftPrompt) {
  const localeLabel = state.locale === "ja" ? "Japanese" : "English";
  const fieldLines = FORM_FIELDS
    .map((field) => {
      const value = stageState.fields[field.name];
      if (!value) {
        return "";
      }
      return `- ${getFieldLabel(field)}: ${value}`;
    })
    .filter(Boolean)
    .join("\n") || "- none";
  const selectedTags = stageState.selectedTagIds
    .map((id) => getAllTags().find((tag) => tag.id === id))
    .filter(Boolean)
    .map((tag) => `- ${getTagLabel(tag)}: ${getTagPromptValue(tag)}`)
    .join("\n") || "- none";
  return [
    "You improve prompts for image-to-image illustration workflows.",
    "Rewrite the draft prompt into one stronger prompt string for image generation.",
    "Requirements:",
    `- Keep the output in ${localeLabel}.`,
    "- Preserve concrete subject, character names, pose, composition, camera, outfit, lighting, mood, props, and stage-specific constraints.",
    "- Remove duplicates, contradictions, weak filler, and repeated tokens.",
    "- Keep the result concise, visual, and directly usable as an image prompt.",
    "- Do not add markdown, explanations, labels, numbering, or quotation marks.",
    "- Return only the final prompt string.",
    "",
    `Workspace: ${workspace.name}`,
    `Stage: ${getStageLabel(stage)} (${stage.code})`,
    `Stage goal: ${getStageDescription(stage) || "-"}`,
    "",
    "Stage fields:",
    fieldLines,
    "",
    "Selected tags:",
    selectedTags,
    "",
    `Extra prompt: ${stageState.extraPrompt || "-"}`,
    "",
    `Current draft prompt: ${draftPrompt || "-"}`,
  ].join("\n");
}

function getPromptOptimizationSourceSignature(stageState) {
  return JSON.stringify({
    locale: state.locale,
    fields: stageState?.fields || {},
    extraPrompt: stageState?.extraPrompt || "",
    selectedTagIds: [...(stageState?.selectedTagIds || [])],
  });
}

function buildRequestPayload(workspace, stageId, prompt) {
  const stageState = workspace.stages[stageId];
  const providerId = workspace.parameters.providerId;
  const inputImages = getInputImagesForStage(workspace, stageState, stageId);
  return {
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    stageId,
    stageName: getStageLabel(stageById.get(stageId)),
    locale: state.locale,
    providerId,
    providerLabel: getProviderLabel(providerById.get(providerId)),
    model: getModelForProvider(providerId, workspace.parameters.model),
    prompt,
    negativePrompt: stageState.negativePrompt,
    parameters: {
      strength: workspace.parameters.strength,
      guidance: workspace.parameters.guidance,
      steps: workspace.parameters.steps,
      seed: workspace.parameters.seed,
    },
    executionMode: providerId === "browser-mock" ? "mock" : getStoredApiKey() ? "openai-live" : "draft-only",
    imageAction: inputImages.allImages.length ? "edit" : "generate",
    inputImages: {
      baseImage: inputImages.baseImage?.name || stageState.baseImage?.name || null,
      referenceImages: inputImages.referenceImages.map((image) => image.name),
      total: inputImages.allImages.length,
    },
  };
}

function buildMockResultImage(workspace, stage, prompt) {
  const encoded = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${stage.accent}" />
          <stop offset="100%" stop-color="#f6e4b7" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)" />
      <rect x="72" y="72" width="1056" height="756" rx="32" fill="rgba(255,255,255,0.76)" />
      <text x="120" y="190" font-size="54" font-family="Segoe UI, sans-serif" font-weight="700" fill="#38280b">${escapeSvg(workspace.name)}</text>
      <text x="120" y="280" font-size="110" font-family="Segoe UI, sans-serif" font-weight="800" fill="#38280b">${escapeSvg(stage.code)}</text>
      <text x="120" y="350" font-size="42" font-family="Segoe UI, sans-serif" font-weight="600" fill="#5f4715">${escapeSvg(getStageLabel(stage))}</text>
      <foreignObject x="120" y="420" width="930" height="250">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Segoe UI, sans-serif; color:#4a3a16; font-size:30px; line-height:1.45;">
          ${escapeHtml(prompt.slice(0, 240))}
        </div>
      </foreignObject>
      <text x="120" y="760" font-size="28" font-family="Segoe UI, sans-serif" fill="#5f4715">${escapeSvg(formatDateTime(new Date().toISOString()))}</text>
    </svg>
  `);
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

function getActiveWorkspace() {
  return state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) || null;
}

function getCurrentStage() {
  const workspace = getActiveWorkspace();
  return workspace ? stageById.get(workspace.currentStageId) : null;
}

function getCurrentStageId() {
  return getActiveWorkspace()?.currentStageId || STAGES[0].id;
}

function getCurrentStageState() {
  const workspace = getActiveWorkspace();
  return workspace ? workspace.stages[workspace.currentStageId] : null;
}

function getLatestStageResult(workspace, stageId) {
  return workspace.results.find((result) => result.stageId === stageId) || null;
}

function getResultStatusCopy(stageState, latestStageResult) {
  if (stageState.status === "running") {
    return {
      title: t("studio.statusRunningTitle"),
      detail: t("studio.statusRunningDetail"),
    };
  }
  if (stageState.status === "completed" && latestStageResult) {
    return {
      title: t("studio.statusCompletedTitle"),
      detail: `${t("studio.statusCompletedDetail")} ${formatDateTime(latestStageResult.createdAt)}`,
    };
  }
  if (stageState.status === "error") {
    return {
      title: t("studio.statusErrorTitle"),
      detail: stageState.lastError || t("studio.statusErrorDetail"),
    };
  }
  return {
    title: t("studio.statusIdleTitle"),
    detail: t("studio.statusIdleDetail"),
  };
}

function getSelectedOrLatestResult() {
  const workspace = getActiveWorkspace();
  if (!workspace) {
    return null;
  }
  return workspace.results.find((result) => result.id === state.selectedResultId) || workspace.results[0] || null;
}

function getResolvedStageImage(workspace, image, stageId) {
  if (!image) {
    return null;
  }
  if (image.source === "carry" && image.resultId) {
    const carryResult = workspace?.results.find((result) => result.id === image.resultId);
    if (!carryResult || carryResult.stageId === stageId) {
      return null;
    }
    const resultImageUrl = getResultImageUrl(carryResult);
    if (resultImageUrl) {
      return {
        ...image,
        dataUrl: resultImageUrl,
        sourceStageId: image.sourceStageId || carryResult.stageId,
      };
    }
    return null;
  }
  const imageDataUrl = getStoredStageImageUrl(image);
  if (imageDataUrl) {
    return {
      ...image,
      dataUrl: imageDataUrl,
    };
  }
  if (image.dataUrl) {
    return image;
  }
  return null;
}

function getInputImagesForStage(workspace, stageState, stageId) {
  const baseImage = getResolvedStageImage(workspace, stageState?.baseImage, stageId);
  const referenceImages = Array.isArray(stageState?.referenceImages)
    ? stageState.referenceImages
      .map((image) => getResolvedStageImage(workspace, image, stageId))
      .filter(Boolean)
    : [];
  return {
    baseImage,
    referenceImages,
    allImages: [...(baseImage ? [baseImage] : []), ...referenceImages],
  };
}

function getStagePresets(stageId) {
  return STAGE_PRESETS[stageId] || [];
}

function getStagePreset(stageId, presetId) {
  return getStagePresets(stageId).find((preset) => preset.id === presetId) || null;
}

function getStagePresetLabel(preset) {
  return state.locale === "ja" ? preset?.labelJa || "" : preset?.labelEn || "";
}

function getStagePresetDescription(preset) {
  return state.locale === "ja" ? preset?.descriptionJa || "" : preset?.descriptionEn || "";
}

function getAllTags() {
  return [...ALL_BUILT_IN_TAGS, ...state.customTags];
}

function getCompletedStageCount(workspace) {
  return STAGES.filter((stage) => workspace.results.some((result) => result.stageId === stage.id)).length;
}

function getStageLabel(stage) {
  return state.locale === "ja" ? stage?.nameJa || "" : stage?.nameEn || "";
}

function getStageDescription(stage) {
  return state.locale === "ja" ? stage?.descriptionJa || "" : stage?.descriptionEn || "";
}

function getFieldLabel(field) {
  return state.locale === "ja" ? field.labelJa : field.labelEn;
}

function getFieldPlaceholder(field) {
  return state.locale === "ja" ? field.placeholderJa : field.placeholderEn;
}

function getCategoryName(category) {
  return state.locale === "ja" ? category?.nameJa || "" : category?.nameEn || "";
}

function getCategoryDescription(category) {
  return state.locale === "ja" ? category?.descriptionJa || "" : category?.descriptionEn || "";
}

function getTagLabel(tag) {
  return state.locale === "ja" ? tag.labelJa || tag.labelEn || "" : tag.labelEn || tag.labelJa || "";
}

function getTagPromptValue(tag) {
  return state.locale === "ja" ? tag.valueJa || tag.valueEn || "" : tag.valueEn || tag.valueJa || "";
}

function getProviderLabel(provider) {
  return state.locale === "ja" ? provider?.labelJa || "" : provider?.labelEn || "";
}

function getProviderDescription(provider) {
  return state.locale === "ja" ? provider?.descriptionJa || "" : provider?.descriptionEn || "";
}

function getDefaultModelForProvider(providerId) {
  return providerId === "browser-mock" ? "gpt-image-1" : "gpt-image-1";
}

function getModelForProvider(providerId, candidateModel) {
  const trimmed = sanitizeText(candidateModel, "");
  if (providerId === "browser-mock") {
    return trimmed || getDefaultModelForProvider(providerId);
  }
  return isLiveImageModelId(trimmed) ? trimmed : getDefaultModelForProvider(providerId);
}

function getModelLabel(modelId) {
  if (modelId === "gpt-image-1.5") {
    return state.locale === "ja" ? "gpt-image-1.5 (推奨)" : "gpt-image-1.5 (Recommended)";
  }
  return modelId;
}

function getVisibleModelOptions(workspace) {
  const providerId = workspace.parameters.providerId;
  const currentModel = getModelForProvider(providerId, workspace.parameters.model);
  if (providerId !== "external-draft") {
    return [currentModel];
  }
  const apiKey = getStoredApiKey();
  if (apiKey && modelCatalog.status === "ready" && modelCatalog.loadedForKey === apiKey && modelCatalog.options.length) {
    return modelCatalog.options;
  }
  return [...new Set([currentModel, getDefaultModelForProvider(providerId)])];
}

function chooseVisibleModel(providerId, candidateModel, options) {
  const normalized = getModelForProvider(providerId, candidateModel);
  if (options.includes(normalized)) {
    return normalized;
  }
  const fallback = getDefaultModelForProvider(providerId);
  if (options.includes(fallback)) {
    return fallback;
  }
  return options[0] || fallback;
}

function isModelSelectionLocked(providerId, options) {
  if (providerId !== "external-draft") {
    return true;
  }
  if (!getStoredApiKey()) {
    return true;
  }
  if (modelCatalog.status === "loading") {
    return true;
  }
  return options.length <= 1 && modelCatalog.status !== "ready";
}

function getModelStatusText(providerId, options) {
  if (providerId !== "external-draft") {
    return t("settings.modelStatusMock");
  }
  if (!getStoredApiKey()) {
    return t("settings.modelStatusNoKey");
  }
  if (modelCatalog.status === "loading") {
    return t("settings.modelStatusLoading");
  }
  if (modelCatalog.status === "ready" && options.length) {
    return t("settings.modelStatusReady", { count: options.length });
  }
  return t("settings.modelStatusError");
}

function formatParameterValue(name, value) {
  const spec = PARAMETER_SPECS[name];
  if (!spec) {
    return String(value);
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(spec.digits) : String(value);
}

function isLiveImageModelId(modelId) {
  return /^gpt-image-(?!latest)[a-z0-9][a-z0-9.-]*$/i.test(modelId);
}

function createModelCatalogState() {
  return {
    status: "idle",
    options: [],
    error: "",
    loadedForKey: "",
  };
}

function createPromptAssistState() {
  return {
    status: "idle",
    workspaceId: "",
    stageId: "",
    error: "",
  };
}

function resetModelCatalog() {
  modelCatalogRequestId += 1;
  modelCatalog = createModelCatalogState();
}

async function refreshAvailableModels({ force = false } = {}) {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    resetModelCatalog();
    renderAll();
    return [];
  }
  if (!force && modelCatalog.status === "ready" && modelCatalog.loadedForKey === apiKey && modelCatalog.options.length) {
    return modelCatalog.options;
  }

  const requestId = ++modelCatalogRequestId;
  modelCatalog.status = "loading";
  modelCatalog.error = "";
  renderAll();

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error?.message || "Could not load models.");
    }
    const options = getAvailableLiveImageModels(payload?.data);
    if (!options.length) {
      throw new Error("No supported image models available.");
    }
    if (requestId !== modelCatalogRequestId) {
      return modelCatalog.options;
    }
    modelCatalog.status = "ready";
    modelCatalog.options = options;
    modelCatalog.error = "";
    modelCatalog.loadedForKey = apiKey;
    syncWorkspaceModelsWithCatalog(options);
    renderAll();
    return options;
  } catch (error) {
    if (requestId !== modelCatalogRequestId) {
      return modelCatalog.options;
    }
    modelCatalog.status = "error";
    modelCatalog.options = [];
    modelCatalog.error = error?.message || "Could not load models.";
    modelCatalog.loadedForKey = "";
    renderAll();
    return [];
  }
}

function getAvailableLiveImageModels(items) {
  const ids = Array.isArray(items)
    ? items
      .map((item) => sanitizeText(item?.id, ""))
      .filter((id) => isLiveImageModelId(id))
    : [];
  return [...new Set(ids)].sort((left, right) => {
    const leftPriority = LIVE_IMAGE_MODEL_PREFERENCE.indexOf(left);
    const rightPriority = LIVE_IMAGE_MODEL_PREFERENCE.indexOf(right);
    if (leftPriority !== -1 || rightPriority !== -1) {
      return (leftPriority === -1 ? Number.MAX_SAFE_INTEGER : leftPriority)
        - (rightPriority === -1 ? Number.MAX_SAFE_INTEGER : rightPriority);
    }
    return left.localeCompare(right);
  });
}

function syncWorkspaceModelsWithCatalog(options) {
  let changed = false;
  for (const workspace of state.workspaces) {
    if (workspace.parameters.providerId !== "external-draft") {
      continue;
    }
    const nextModel = chooseVisibleModel(workspace.parameters.providerId, workspace.parameters.model, options);
    if (workspace.parameters.model !== nextModel) {
      workspace.parameters.model = nextModel;
      workspace.updatedAt = new Date().toISOString();
      changed = true;
    }
  }
  if (changed) {
    persistState();
  }
}

function getRecommendedKeywords(stage) {
  return state.locale === "ja"
    ? stage.recommendedKeywordsJa.join("、")
    : stage.recommendedKeywordsEn.join(", ");
}

function splitPromptParts(value) {
  return String(value || "")
    .split(/[,\n、]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractResponseText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }
  const fragments = [];
  for (const item of payload?.output || []) {
    if (typeof item?.text === "string" && item.text.trim()) {
      fragments.push(item.text.trim());
    }
    for (const content of item?.content || []) {
      if (typeof content?.text === "string" && content.text.trim()) {
        fragments.push(content.text.trim());
      } else if (typeof content?.output_text === "string" && content.output_text.trim()) {
        fragments.push(content.output_text.trim());
      }
    }
  }
  return fragments.join("\n").trim();
}

function normalizeOptimizedPromptText(value) {
  const lines = String(value || "")
    .replace(/^```[\w-]*\s*/i, "")
    .replace(/\s*```$/, "")
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean);
  let normalized = lines.join(", ").trim();
  if (
    (normalized.startsWith("\"") && normalized.endsWith("\""))
    || (normalized.startsWith("\u201c") && normalized.endsWith("\u201d"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized;
}

function getStoredApiKey() {
  return state.settings.apiStorageMode === "local"
    ? window.localStorage.getItem(API_KEY_STORAGE_KEY) || ""
    : sessionApiKey;
}

function getApiKeyStatusText() {
  const providerId = getActiveWorkspace()?.parameters.providerId || DEFAULT_PARAMETERS.providerId;
  if (providerId === "browser-mock") {
    return t("settings.apiKeyNotNeeded");
  }
  const storedKey = getStoredApiKey();
  if (!storedKey) {
    return t("settings.apiKeyMissing");
  }
  const timestamp = state.apiKeyMeta.savedAt ? formatDateTime(state.apiKeyMeta.savedAt) : "-";
  return t("settings.lastUpdated", { value: timestamp });
}

function touchWorkspace() {
  const workspace = getActiveWorkspace();
  if (workspace) {
    workspace.updatedAt = new Date().toISOString();
  }
}

function refreshDerivedUi() {
  const workspace = getActiveWorkspace();
  const stage = getCurrentStage();
  if (workspace && stage) {
    renderPromptPreviewPanel(workspace, stage, workspace.stages[stage.id]);
    syncParameterUi(workspace);
  }
  renderHeader();
  renderSidebar();
  renderOverview();
  renderSettingsModal();
}

function syncParameterUi(workspace) {
  refs.paramProvider.innerHTML = PROVIDERS.map((provider) => `
    <option value="${provider.id}" ${provider.id === workspace.parameters.providerId ? "selected" : ""}>
      ${escapeHtml(getProviderLabel(provider))}
    </option>
  `).join("");

  const modelOptions = getVisibleModelOptions(workspace);
  const selectedModel = chooseVisibleModel(workspace.parameters.providerId, workspace.parameters.model, modelOptions);
  workspace.parameters.model = selectedModel;
  refs.paramModel.innerHTML = modelOptions.map((modelId) => `
    <option value="${modelId}" ${modelId === selectedModel ? "selected" : ""}>
      ${escapeHtml(getModelLabel(modelId))}
    </option>
  `).join("");
  refs.paramModel.disabled = isModelSelectionLocked(workspace.parameters.providerId, modelOptions);
  refs.paramModelStatus.textContent = getModelStatusText(workspace.parameters.providerId, modelOptions);
  refs.paramModelRefresh.disabled = workspace.parameters.providerId !== "external-draft" || !getStoredApiKey() || modelCatalog.status === "loading";

  refs.paramStrength.value = String(workspace.parameters.strength);
  refs.paramStrengthValue.textContent = formatParameterValue("strength", workspace.parameters.strength);
  refs.paramGuidance.value = String(workspace.parameters.guidance);
  refs.paramGuidanceValue.textContent = formatParameterValue("guidance", workspace.parameters.guidance);
  refs.paramSteps.value = String(workspace.parameters.steps);
  refs.paramStepsValue.textContent = formatParameterValue("steps", workspace.parameters.steps);
  refs.paramSeed.value = String(workspace.parameters.seed);
  refs.paramSeedValue.textContent = formatParameterValue("seed", workspace.parameters.seed);
}

function renderPromptPreviewPanel(workspace, stage, stageState) {
  const prompt = buildPrompt(workspace, stage.id);
  refs.promptPreview.value = prompt;
  refs.requestPreview.textContent = JSON.stringify(buildRequestPayload(workspace, stage.id, prompt), null, 2);
  const isRunning = promptAssistState.status === "running"
    && promptAssistState.workspaceId === workspace.id
    && promptAssistState.stageId === stage.id;
  const hasActiveOverride = Boolean(stageState.optimizedPrompt);
  const hasError = promptAssistState.status === "error"
    && promptAssistState.workspaceId === workspace.id
    && promptAssistState.stageId === stage.id
    && !hasActiveOverride;
  refs.optimizePrompt.disabled = stageState.status === "running" || isRunning || !getStoredApiKey();
  refs.clearOptimizedPrompt.disabled = stageState.status === "running" || isRunning || !hasActiveOverride;
  refs.promptOptimizeStatus.textContent = hasError
    ? promptAssistState.error
    : getPromptOptimizationStatusText(stageState, isRunning);
}

function getPromptOptimizationStatusText(stageState, isRunning) {
  if (isRunning) {
    return t("studio.promptOptimizeRunning");
  }
  if (stageState.optimizedPrompt) {
    const updatedAt = stageState.optimizedPromptUpdatedAt ? formatDateTime(stageState.optimizedPromptUpdatedAt) : "-";
    return t("studio.promptOptimizeActive", { value: updatedAt });
  }
  if (!getStoredApiKey()) {
    return t("studio.promptOptimizeNoKey");
  }
  return t("studio.promptOptimizeDefault");
}

function renderParameterHelp() {
  const copy = activeParameterHelpKey ? PARAMETER_HELP_COPY[activeParameterHelpKey] : null;
  refs.parameterHelpTitle.textContent = copy
    ? t(copy.titleKey)
    : t("studio.parameterHelpDefaultTitle");
  refs.parameterHelpDetail.textContent = copy
    ? t(copy.detailKey)
    : t("studio.parameterHelpDefaultDetail");
}

function normalizeTag(tag) {
  return {
    id: sanitizeText(tag?.id, createId("tag")),
    categoryId: categoryById.has(tag?.categoryId) ? tag.categoryId : "style",
    labelJa: sanitizeText(tag?.labelJa || tag?.label, "カスタム"),
    labelEn: sanitizeText(tag?.labelEn || tag?.label, "Custom"),
    valueJa: sanitizeText(tag?.valueJa || tag?.value, ""),
    valueEn: sanitizeText(tag?.valueEn || tag?.value, ""),
    isBuiltIn: false,
  };
}

function renderStageButton(stage, workspace, className) {
  const isActive = workspace?.currentStageId === stage.id;
  const isCompleted = workspace?.results.some((result) => result.stageId === stage.id);
  const stateClass = isActive ? " active" : isCompleted ? " completed" : " upcoming";
  return `
    <button type="button" class="${className}${stateClass}" data-stage-id="${stage.id}" data-stage-action="open">
      <div class="stage-node-top">
        <span class="stage-node-dot"></span>
        <span class="stage-step-icon">${escapeHtml(stage.code)}</span>
      </div>
      <strong class="stage-node-label">${escapeHtml(getStageLabel(stage))}</strong>
      <small class="stage-step-number">${t("common.stage")} ${stage.number}</small>
    </button>
  `;
}

function renderOverviewStageStrip(workspace) {
  return STAGES.map((stage) => {
    const completed = workspace.results.some((result) => result.stageId === stage.id);
    const active = workspace.currentStageId === stage.id;
    return `<span class="overview-stage-chip${completed ? " completed" : active ? " active" : ""}"></span>`;
  }).join("");
}

function buildContextChip(label, value) {
  return `<span class="active-filter-chip"><strong>${escapeHtml(label)}</strong>${escapeHtml(value)}</span>`;
}

function isTagSelectedAnywhere(tagId) {
  const stageState = getCurrentStageState();
  return Boolean(stageState?.selectedTagIds.includes(tagId));
}

function t(key, vars = {}) {
  const entry = TEXT[key];
  const template = entry ? entry[state.locale] : key;
  return Object.entries(vars).reduce((result, [name, value]) => result.replaceAll(`{${name}}`, String(value)), template);
}

function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.has(locale) ? locale : "ja";
}

function sanitizeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function clampNumber(value, min, max, fallback, integer = false) {
  const parsed = Number(value);
  const next = Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
  return integer ? Math.round(next) : Math.round(next * 100) / 100;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat(state.locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function summarizeStoredImageCache() {
  let resultCount = 0;
  let stageCount = 0;
  let bytes = 0;
  for (const workspace of state.workspaces) {
    for (const result of workspace.results) {
      if (!result.imageStorageKey && !result.imageDataUrl) {
        continue;
      }
      resultCount += 1;
      bytes += result.imageByteSize || estimateStringBytes(result.imageDataUrl);
    }
    for (const stage of STAGES) {
      const stageState = workspace.stages[stage.id];
      if (stageState.baseImage?.storageKey || stageState.baseImage?.dataUrl) {
        stageCount += 1;
        bytes += stageState.baseImage.byteSize || estimateStringBytes(stageState.baseImage.dataUrl);
      }
      for (const image of stageState.referenceImages || []) {
        if (!image?.storageKey && !image?.dataUrl) {
          continue;
        }
        stageCount += 1;
        bytes += image.byteSize || estimateStringBytes(image.dataUrl);
      }
    }
  }
  return {
    resultCount,
    stageCount,
    count: resultCount + stageCount,
    bytes,
  };
}

function estimateStringBytes(value) {
  return new Blob([value || ""]).size;
}

function clampImageByteSize(value, fallbackDataUrl = "") {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return fallbackDataUrl ? estimateStringBytes(fallbackDataUrl) : 0;
}

function formatStorageBytes(bytes) {
  if (!bytes) {
    return state.locale === "ja" ? "0 B" : "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const digits = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

function hasStoredResultImage(result) {
  return Boolean(result?.imageStorageKey || result?.imageDataUrl);
}

function getResultImageUrl(result) {
  if (!result) {
    return "";
  }
  if (result.imageStorageKey && imagePayloadCache.has(result.imageStorageKey)) {
    return imagePayloadCache.get(result.imageStorageKey) || "";
  }
  return result.imageDataUrl || "";
}

function getStoredStageImageUrl(image) {
  if (!image) {
    return "";
  }
  if (image.storageKey && imagePayloadCache.has(image.storageKey)) {
    return imagePayloadCache.get(image.storageKey) || "";
  }
  return image.dataUrl || "";
}

function collectImageKeysFromStageState(stageState) {
  if (!stageState) {
    return [];
  }
  return [
    stageState.baseImage?.storageKey,
    ...(stageState.referenceImages || []).map((image) => image?.storageKey),
  ].filter(Boolean);
}

async function createStoredStageImage({ name, dataUrl, source = "manual" }) {
  const stored = await storeImagePayload(dataUrl);
  return {
    name,
    dataUrl: stored.dataUrl,
    storageKey: stored.storageKey,
    byteSize: stored.byteSize,
    source,
    resultId: null,
    sourceStageId: null,
    createdAt: new Date().toISOString(),
  };
}

async function collectExportImagePayloads(candidateState) {
  const payloads = new Map();
  const keys = [...collectReferencedImageStorageKeys(candidateState)];
  if (keys.length) {
    const storedPayloads = await getImagePayloadMap(keys);
    for (const [storageKey, dataUrl] of storedPayloads.entries()) {
      payloads.set(storageKey, dataUrl);
    }
  }
  for (const workspace of candidateState.workspaces || []) {
    for (const result of workspace.results || []) {
      if (result.imageDataUrl && result.imageStorageKey && !payloads.has(result.imageStorageKey)) {
        payloads.set(result.imageStorageKey, result.imageDataUrl);
      }
    }
    for (const stage of STAGES) {
      const stageState = workspace.stages?.[stage.id];
      if (stageState?.baseImage?.dataUrl && stageState.baseImage.storageKey && !payloads.has(stageState.baseImage.storageKey)) {
        payloads.set(stageState.baseImage.storageKey, stageState.baseImage.dataUrl);
      }
      for (const image of stageState?.referenceImages || []) {
        if (image?.dataUrl && image.storageKey && !payloads.has(image.storageKey)) {
          payloads.set(image.storageKey, image.dataUrl);
        }
      }
    }
  }
  return payloads;
}

async function importImagePayloadBundle(imagePayloads) {
  if (!imageStorageReady || !imagePayloads || typeof imagePayloads !== "object") {
    return;
  }
  const entries = Object.entries(imagePayloads).filter(([, dataUrl]) => typeof dataUrl === "string" && dataUrl);
  await Promise.all(entries.map(([storageKey, dataUrl]) => putImagePayload(storageKey, dataUrl)));
}

function createId(prefix) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function persistStateOrThrow() {
  try {
    persistState();
  } catch (error) {
    if (error?.name === "QuotaExceededError") {
      throw new Error("storageQuotaExceeded");
    }
    throw error;
  }
}

function getGenerationErrorMessage(error) {
  if (error?.message === "apiKeyRequired") {
    return t("messages.apiKeyRequired");
  }
  if (error?.message === "storageQuotaExceeded") {
    return t("messages.storageQuotaExceeded");
  }
  return error?.message || t("messages.liveFailed");
}

function getGenerationErrorToastKey(error) {
  if (error?.message === "apiKeyRequired") {
    return "messages.apiKeyRequired";
  }
  if (error?.message === "storageQuotaExceeded") {
    return "messages.storageQuotaExceeded";
  }
  return "messages.liveFailed";
}

function getPromptOptimizationErrorMessage(error) {
  if (error?.message === "apiKeyRequired") {
    return t("messages.apiKeyRequired");
  }
  if (error?.message === "storageQuotaExceeded") {
    return t("messages.storageQuotaExceeded");
  }
  return error?.message || t("messages.promptOptimizationFailed");
}

function getPromptOptimizationErrorToastKey(error) {
  if (error?.message === "apiKeyRequired") {
    return "messages.apiKeyRequired";
  }
  if (error?.message === "storageQuotaExceeded") {
    return "messages.storageQuotaExceeded";
  }
  return "messages.promptOptimizationFailed";
}

function getClipboardErrorToastKey(error) {
  if (error?.message === "clipboardReadUnsupported") {
    return "messages.clipboardReadUnsupported";
  }
  if (error?.message === "clipboardReadFailed") {
    return "messages.clipboardReadFailed";
  }
  if (error?.message === "clipboardImageMissing") {
    return "messages.clipboardImageMissing";
  }
  return getGenerationErrorToastKey(error);
}

function showToast(key, vars) {
  refs.toast.textContent = t(key, vars);
  refs.toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => refs.toast.classList.remove("visible"), 2200);
}

async function copyText(value, successMessageKey) {
  try {
    await navigator.clipboard.writeText(value);
    showToast(successMessageKey);
  } catch (error) {
    showToast("messages.clipboardFailed");
  }
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const fallbackExtension = file.type?.split("/")[1] || "png";
      resolve(
        createStoredStageImage({
          name: file.name || `image-${Date.now()}.${fallbackExtension}`,
          dataUrl: reader.result,
          source: "manual",
        })
      );
    });
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

async function dataUrlToFile(dataUrl, filename) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeSvg(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
