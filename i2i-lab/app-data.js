export const STORAGE_KEY = "sunmax.i2iLab.state.v1";

export const VIEW_ITEMS = [
  { id: "overview", labelKey: "views.overview" },
  { id: "workspaces", labelKey: "views.workspaces" },
  { id: "studio", labelKey: "views.studio" },
  { id: "results", labelKey: "views.results" },
  { id: "tags", labelKey: "views.tags" },
  { id: "settings", labelKey: "views.settings" },
];

export const PROVIDERS = [
  {
    id: "browser-mock",
    labelJa: "Browser Mock",
    labelEn: "Browser Mock",
    descriptionJa: "GitHub Pages 上でも安全に動く既定モードです。ブラウザ内で mock 結果を生成します。",
    descriptionEn: "Default static-safe mode for GitHub Pages. Generates mock results in the browser.",
  },
  {
    id: "external-draft",
    labelJa: "OpenAI Live",
    labelEn: "OpenAI Live",
    descriptionJa: "API キーがあれば OpenAI Images API をブラウザから直接呼び出して画像生成します。キーが無い場合は request JSON の確認用モードになります。",
    descriptionEn: "With an API key, this calls the OpenAI Images API directly from the browser. Without a key, it stays in request-JSON draft mode.",
  },
];

export const DEFAULT_PARAMETERS = {
  providerId: "browser-mock",
  model: "gpt-image-1",
  strength: 0.42,
  guidance: 6.5,
  steps: 28,
  seed: 2048,
};

export const STAGES = [
  {
    id: "stage-04",
    number: 4,
    code: "LY",
    nameJa: "レイアウトラフ",
    nameEn: "Layout rough",
    descriptionJa: "構図、視線誘導、余白の取り方を決める最初の工程です。",
    descriptionEn: "First pass for locking composition, focal flow, and margin balance.",
    purposeJa: "構図とポーズを固め、描き込み前の骨格を安定させます。",
    purposeEn: "Lock composition and pose before detail rendering.",
    focusCategoryIds: ["composition", "camera", "pose"],
    recommendedKeywordsJa: ["ラフ構図", "視線誘導", "主役が読みやすい"],
    recommendedKeywordsEn: ["rough sketch", "clear focal point", "thumbnail sketch"],
    accent: "#d69c00",
  },
  {
    id: "stage-05",
    number: 5,
    code: "PS",
    nameJa: "ポーズラフ",
    nameEn: "Pose rough",
    descriptionJa: "体の重心、表情、衣装の印象を整理して主役の情報量を上げます。",
    descriptionEn: "Refine body balance, expression, and outfit impression.",
    purposeJa: "人体バランスとキャラクター性を読みやすく揃えます。",
    purposeEn: "Sharpen anatomy readability and character impression.",
    focusCategoryIds: ["character", "pose", "outfit"],
    recommendedKeywordsJa: ["読みやすい人体", "整理されたポーズ", "主役感"],
    recommendedKeywordsEn: ["clean rough", "refined pose", "readable anatomy"],
    accent: "#b8911d",
  },
  {
    id: "stage-06",
    number: 6,
    code: "CL",
    nameJa: "クリーンアップ",
    nameEn: "Cleanup",
    descriptionJa: "線と形を整え、次の彩色工程でも崩れない形状に揃えます。",
    descriptionEn: "Stabilize forms and contours before the color pass.",
    purposeJa: "輪郭とパーツの境界を明確にします。",
    purposeEn: "Clarify contours and shape boundaries.",
    focusCategoryIds: ["outfit", "hairstyle", "quality"],
    recommendedKeywordsJa: ["整理された線", "明瞭な輪郭", "破綻しない形"],
    recommendedKeywordsEn: ["clean line art", "refined contours", "clear outlines"],
    accent: "#7d5a00",
  },
  {
    id: "stage-07",
    number: 7,
    code: "CR",
    nameJa: "カラーラフ",
    nameEn: "Color rough",
    descriptionJa: "配色と光の方向を決め、雰囲気の土台を作る工程です。",
    descriptionEn: "Set palette and lighting direction to establish mood.",
    purposeJa: "色の方向性と空気感を軽く確認します。",
    purposeEn: "Validate palette and atmosphere without heavy rendering.",
    focusCategoryIds: ["lighting", "background", "style"],
    recommendedKeywordsJa: ["色ブロック", "統一感のある配色", "雰囲気確認"],
    recommendedKeywordsEn: ["color rough", "harmonious palette", "color blocking"],
    accent: "#d89a2a",
  },
  {
    id: "stage-08",
    number: 8,
    code: "RD",
    nameJa: "レンダーパス",
    nameEn: "Render pass",
    descriptionJa: "光、影、材質感、奥行きを入れて密度を引き上げます。",
    descriptionEn: "Add lighting, material feel, and depth for density.",
    purposeJa: "情報量を増やし、完成形に近づけます。",
    purposeEn: "Raise information density toward the final render.",
    focusCategoryIds: ["lighting", "outfit", "quality"],
    recommendedKeywordsJa: ["質感表現", "立体感", "陰影の整理"],
    recommendedKeywordsEn: ["refined shading", "material rendering", "depth"],
    accent: "#9b6b11",
  },
  {
    id: "stage-09",
    number: 9,
    code: "FX",
    nameJa: "フィニッシュ",
    nameEn: "Polish",
    descriptionJa: "全体の空気感、ハイライト、色調整を整える最終工程です。",
    descriptionEn: "Tune atmosphere, highlights, and final color balance.",
    purposeJa: "完成度を上げ、全体の印象を揃えます。",
    purposeEn: "Polish the overall finish and align the mood.",
    focusCategoryIds: ["lighting", "quality", "background"],
    recommendedKeywordsJa: ["仕上げ調整", "空気演出", "視線集中"],
    recommendedKeywordsEn: ["polished artwork", "atmospheric effects", "visual focus"],
    accent: "#5a4107",
  },
];

export const PROMPT_SHEETS = [
  {
    stageId: "stage-04",
    purposeJa: "構図とポーズを最小限の情報で固定します。",
    purposeEn: "Lock composition and pose with minimal detail.",
    promptTemplateJa:
      "ラフ構図、視線誘導が明確、[subject]、[pose]、[composition]、[camera angle]、[background]、モノクロラフ、シンプルなシルエット、[render stage keywords]、[quality keywords]",
    promptTemplateEn:
      "rough composition sketch, clear focal flow, [subject], [pose], [composition], [camera angle], [background], monochrome rough sketch, simple silhouette, [render stage keywords], [quality keywords]",
  },
  {
    stageId: "stage-05",
    purposeJa: "人体バランス、表情、衣装の印象を揃えます。",
    purposeEn: "Refine anatomy, expression, and outfit readability.",
    promptTemplateJa:
      "読みやすいポーズラフ、[subject]、[character]、[pose]、[outfit details]、[hairstyle]、[facial expression]、[background]、整理された人体、[render stage keywords]、[quality keywords]",
    promptTemplateEn:
      "clean pose rough, [subject], [character], [pose], [outfit details], [hairstyle], [facial expression], [background], readable anatomy, [render stage keywords], [quality keywords]",
  },
  {
    stageId: "stage-06",
    purposeJa: "輪郭と形を安定させて色工程へ渡します。",
    purposeEn: "Stabilize shapes and contours for the color pass.",
    promptTemplateJa:
      "クリーンな線画、[subject]、[character]、[pose]、[outfit]、[hairstyle]、[facial expression]、明瞭な輪郭、[render stage keywords]、[quality keywords]",
    promptTemplateEn:
      "clean line art, [subject], [character], [pose], [outfit], [hairstyle], [facial expression], clear contours, [render stage keywords], [quality keywords]",
  },
  {
    stageId: "stage-07",
    purposeJa: "配色と空気感の方向性を軽く確認します。",
    purposeEn: "Set palette and atmosphere direction.",
    promptTemplateJa:
      "カラーラフ、[subject]、[character]、[outfit colors]、[hair color]、[eye color]、[background color mood]、[lighting]、配色検討、[render stage keywords]、[quality keywords]",
    promptTemplateEn:
      "color rough, [subject], [character], [outfit colors], [hair color], [eye color], [background color mood], [lighting], color study, [render stage keywords], [quality keywords]",
  },
  {
    stageId: "stage-08",
    purposeJa: "材質感と陰影で情報量を引き上げます。",
    purposeEn: "Increase density with material feel and shading.",
    promptTemplateJa:
      "描き込み強化、[subject]、[character]、[pose]、[material notes]、[background details]、[lighting]、奥行き感、[render stage keywords]、[quality keywords]",
    promptTemplateEn:
      "render pass, [subject], [character], [pose], [material notes], [background details], [lighting], material rendering, depth, [render stage keywords], [quality keywords]",
  },
  {
    stageId: "stage-09",
    purposeJa: "最終の空気感と色調を整えて完成度を上げます。",
    purposeEn: "Finalize atmosphere and color balance.",
    promptTemplateJa:
      "最終仕上げ、[subject]、[character]、[pose]、[background]、[lighting]、ハイライト調整、空気演出、[render stage keywords]、[quality keywords]",
    promptTemplateEn:
      "final polish, [subject], [character], [pose], [background], [lighting], subtle highlights, atmospheric finish, [render stage keywords], [quality keywords]",
  },
];

export const TAG_CATEGORIES = [
  { id: "subject", nameJa: "主題", nameEn: "Subject", descriptionJa: "誰を何として描くか", descriptionEn: "Who or what is being depicted" },
  { id: "character", nameJa: "キャラクター", nameEn: "Character", descriptionJa: "年齢感や雰囲気", descriptionEn: "Age range and character vibe" },
  { id: "body", nameJa: "体格", nameEn: "Body", descriptionJa: "全身バランスやシルエット", descriptionEn: "Body balance and silhouette" },
  { id: "expression", nameJa: "表情", nameEn: "Expression", descriptionJa: "顔の感情表現", descriptionEn: "Facial emotion and expression" },
  { id: "hairstyle", nameJa: "髪型", nameEn: "Hairstyle", descriptionJa: "髪の形と印象", descriptionEn: "Hair shape and identity" },
  { id: "outfit", nameJa: "衣装", nameEn: "Outfit", descriptionJa: "服装や素材感", descriptionEn: "Costume and materials" },
  { id: "pose", nameJa: "ポーズ", nameEn: "Pose", descriptionJa: "立ち姿や動き", descriptionEn: "Posture and motion" },
  { id: "composition", nameJa: "構図", nameEn: "Composition", descriptionJa: "画面内の配置", descriptionEn: "Frame balance and placement" },
  { id: "camera", nameJa: "カメラ", nameEn: "Camera", descriptionJa: "距離と角度", descriptionEn: "Distance and viewing angle" },
  { id: "background", nameJa: "背景", nameEn: "Background", descriptionJa: "周囲の環境", descriptionEn: "Surrounding environment" },
  { id: "lighting", nameJa: "ライティング", nameEn: "Lighting", descriptionJa: "光の向きと強さ", descriptionEn: "Light direction and contrast" },
  { id: "style", nameJa: "スタイル", nameEn: "Style", descriptionJa: "絵柄と描画傾向", descriptionEn: "Rendering style and finish" },
  { id: "quality", nameJa: "品質", nameEn: "Quality", descriptionJa: "密度や仕上げ精度", descriptionEn: "Density and polish quality" },
];

export const BUILT_IN_TAGS = [
  { id: "tag-subject-01", categoryId: "subject", labelJa: "海辺の人物", labelEn: "Seaside figure", valueJa: "海辺に立つ人物", valueEn: "seaside character illustration", isBuiltIn: true },
  { id: "tag-subject-02", categoryId: "subject", labelJa: "全身キャラクター", labelEn: "Full body", valueJa: "全身が入るキャラクター", valueEn: "full body character", isBuiltIn: true },
  { id: "tag-character-01", categoryId: "character", labelJa: "落ち着いた大人", labelEn: "Calm adult", valueJa: "落ち着いた雰囲気の大人", valueEn: "calm adult woman", isBuiltIn: true },
  { id: "tag-character-02", categoryId: "character", labelJa: "上品", labelEn: "Elegant", valueJa: "上品で静かな印象", valueEn: "elegant", isBuiltIn: true },
  { id: "tag-body-01", categoryId: "body", labelJa: "細身", labelEn: "Slender", valueJa: "細身のシルエット", valueEn: "slender silhouette", isBuiltIn: true },
  { id: "tag-body-02", categoryId: "body", labelJa: "しなやか", labelEn: "Graceful", valueJa: "しなやかな体の流れ", valueEn: "graceful body line", isBuiltIn: true },
  { id: "tag-expression-01", categoryId: "expression", labelJa: "やさしい微笑み", labelEn: "Gentle smile", valueJa: "やさしい微笑み", valueEn: "gentle smile", isBuiltIn: true },
  { id: "tag-expression-02", categoryId: "expression", labelJa: "凛とした表情", labelEn: "Composed look", valueJa: "凛とした視線", valueEn: "composed expression", isBuiltIn: true },
  { id: "tag-hairstyle-01", categoryId: "hairstyle", labelJa: "ロングストレート", labelEn: "Long straight hair", valueJa: "長いストレートヘア", valueEn: "long straight hair", isBuiltIn: true },
  { id: "tag-hairstyle-02", categoryId: "hairstyle", labelJa: "ゆるいウェーブ", labelEn: "Soft waves", valueJa: "ゆるいウェーブヘア", valueEn: "soft wavy hair", isBuiltIn: true },
  { id: "tag-outfit-01", categoryId: "outfit", labelJa: "サマードレス", labelEn: "Summer dress", valueJa: "軽やかなサマードレス", valueEn: "summer dress", isBuiltIn: true },
  { id: "tag-outfit-02", categoryId: "outfit", labelJa: "ワンピース", labelEn: "One-piece dress", valueJa: "シンプルなワンピース", valueEn: "one-piece dress", isBuiltIn: true },
  { id: "tag-pose-01", categoryId: "pose", labelJa: "自然立ち", labelEn: "Natural stance", valueJa: "自然に立つポーズ", valueEn: "standing naturally", isBuiltIn: true },
  { id: "tag-pose-02", categoryId: "pose", labelJa: "髪に触れる", labelEn: "Touching hair", valueJa: "片手で髪に触れる", valueEn: "one hand touching hair", isBuiltIn: true },
  { id: "tag-composition-01", categoryId: "composition", labelJa: "中央構図", labelEn: "Centered composition", valueJa: "中央構図", valueEn: "centered composition", isBuiltIn: true },
  { id: "tag-composition-02", categoryId: "composition", labelJa: "シネマフレーム", labelEn: "Cinematic framing", valueJa: "映画的なフレーミング", valueEn: "cinematic framing", isBuiltIn: true },
  { id: "tag-camera-01", categoryId: "camera", labelJa: "アイレベル", labelEn: "Eye level", valueJa: "アイレベル", valueEn: "eye level", isBuiltIn: true },
  { id: "tag-camera-02", categoryId: "camera", labelJa: "ややローアングル", labelEn: "Low angle", valueJa: "ややローアングル", valueEn: "low angle", isBuiltIn: true },
  { id: "tag-background-01", categoryId: "background", labelJa: "砂浜", labelEn: "Beach", valueJa: "砂浜", valueEn: "beach", isBuiltIn: true },
  { id: "tag-background-02", categoryId: "background", labelJa: "夕景の空", labelEn: "Sunset sky", valueJa: "夕景の空", valueEn: "sunset sky", isBuiltIn: true },
  { id: "tag-lighting-01", categoryId: "lighting", labelJa: "柔らかい昼光", labelEn: "Soft daylight", valueJa: "柔らかい昼光", valueEn: "soft daylight", isBuiltIn: true },
  { id: "tag-lighting-02", categoryId: "lighting", labelJa: "リムライト", labelEn: "Rim light", valueJa: "輪郭に当たるリムライト", valueEn: "rim light", isBuiltIn: true },
  { id: "tag-style-01", categoryId: "style", labelJa: "アニメ塗り", labelEn: "Anime illustration", valueJa: "アニメイラスト", valueEn: "anime illustration", isBuiltIn: true },
  { id: "tag-style-02", categoryId: "style", labelJa: "セミリアル", labelEn: "Semi-realistic", valueJa: "セミリアル寄り", valueEn: "semi-realistic", isBuiltIn: true },
  { id: "tag-quality-01", categoryId: "quality", labelJa: "主役が明確", labelEn: "Clear focal point", valueJa: "主役が明確", valueEn: "clear focal point", isBuiltIn: true },
  { id: "tag-quality-02", categoryId: "quality", labelJa: "調和した配色", labelEn: "Harmonious palette", valueJa: "調和した配色", valueEn: "harmonious palette", isBuiltIn: true },
];

export const FORM_FIELDS = [
  { name: "subject", labelJa: "主題", labelEn: "Subject", placeholderJa: "例: 海辺に立つ成人女性", placeholderEn: "Example: adult woman standing by the sea" },
  { name: "character", labelJa: "キャラクター", labelEn: "Character", placeholderJa: "例: 落ち着いた雰囲気の成人女性", placeholderEn: "Example: calm adult woman" },
  { name: "pose", labelJa: "ポーズ", labelEn: "Pose", placeholderJa: "例: 自然に立ち、片手で髪に触れる", placeholderEn: "Example: standing naturally, one hand touching hair" },
  { name: "composition", labelJa: "構図", labelEn: "Composition", placeholderJa: "例: 中央構図", placeholderEn: "Example: centered composition" },
  { name: "cameraAngle", labelJa: "カメラ", labelEn: "Camera", placeholderJa: "例: アイレベル", placeholderEn: "Example: eye level" },
  { name: "outfit", labelJa: "衣装", labelEn: "Outfit", placeholderJa: "例: 白いサマードレス", placeholderEn: "Example: white summer dress" },
  { name: "outfitDetails", labelJa: "衣装詳細", labelEn: "Outfit details", placeholderJa: "例: 軽い生地、柔らかな皺", placeholderEn: "Example: light fabric, soft folds" },
  { name: "hairstyle", labelJa: "髪型", labelEn: "Hairstyle", placeholderJa: "例: ロングストレート", placeholderEn: "Example: long straight hair" },
  { name: "facialExpression", labelJa: "表情", labelEn: "Expression", placeholderJa: "例: やさしい微笑み", placeholderEn: "Example: gentle smile" },
  { name: "background", labelJa: "背景", labelEn: "Background", placeholderJa: "例: 砂浜と明るい空", placeholderEn: "Example: sandy beach, bright sky" },
  { name: "backgroundDetails", labelJa: "背景詳細", labelEn: "Background details", placeholderJa: "例: 波の反射、潮風", placeholderEn: "Example: sea breeze, reflections on wet sand" },
  { name: "artStyle", labelJa: "スタイル", labelEn: "Art style", placeholderJa: "例: アニメイラスト", placeholderEn: "Example: anime illustration" },
  { name: "lighting", labelJa: "ライティング", labelEn: "Lighting", placeholderJa: "例: 柔らかい昼光", placeholderEn: "Example: soft daylight" },
  { name: "colorMood", labelJa: "色の空気感", labelEn: "Color mood", placeholderJa: "例: 柔らかい夏色", placeholderEn: "Example: soft summer palette" },
  { name: "hairColor", labelJa: "髪色", labelEn: "Hair color", placeholderJa: "例: ダークブラウン", placeholderEn: "Example: dark brown" },
  { name: "eyeColor", labelJa: "瞳の色", labelEn: "Eye color", placeholderJa: "例: 深い青", placeholderEn: "Example: deep blue" },
  { name: "outfitColors", labelJa: "衣装配色", labelEn: "Outfit colors", placeholderJa: "例: 白と砂色", placeholderEn: "Example: white and sand beige" },
  { name: "materialNotes", labelJa: "質感メモ", labelEn: "Material notes", placeholderJa: "例: 柔らかい布、艶のある髪", placeholderEn: "Example: soft fabric, glossy hair" },
  { name: "stageKeywords", labelJa: "工程キーワード", labelEn: "Stage keywords", placeholderJa: "例: ラフ構図、視線誘導", placeholderEn: "Example: rough sketch, clear focal point" },
  { name: "qualityKeywords", labelJa: "品質キーワード", labelEn: "Quality keywords", placeholderJa: "例: 明瞭な輪郭、調和した配色", placeholderEn: "Example: refined contours, harmonious palette", multiline: true },
];

export const ERROR_GUIDES = [
  {
    titleJa: "入力画像が表示されない",
    titleEn: "Input image does not appear",
    descriptionJa: "ローカル画像はブラウザの file input 経由で選択されたものだけが扱えます。",
    descriptionEn: "Local images are only available when selected through the browser file input.",
    checksJa: ["画像を選び直す", "大きすぎる画像を避ける", "前工程の結果を入力へ引き継いでいないか確認する"],
    checksEn: ["Re-select the image", "Avoid extremely large images", "Check whether a previous stage result has already been carried forward"],
  },
  {
    titleJa: "API キーの扱いが分からない",
    titleEn: "Not sure how API keys are handled",
    descriptionJa: "OpenAI Live は API キーがあるとブラウザから直接画像生成を実行します。キーが無い場合は request JSON の確認だけに留まります。",
    descriptionEn: "OpenAI Live can generate images directly from the browser when an API key is present. Without a key, it stays in request-JSON draft mode.",
    checksJa: ["Browser Mock では API キー不要", "Session only はブラウザを閉じると消える", "OpenAI Live では有効な OpenAI API キーと利用可能なモデルが必要"],
    checksEn: ["Browser Mock does not need an API key", "Session only clears when the browser closes", "OpenAI Live needs a valid OpenAI API key and an available image model"],
  },
  {
    titleJa: "結果が次工程にうまく繋がらない",
    titleEn: "Results do not flow into the next stage",
    descriptionJa: "自動引き継ぎは最新の完了結果を入力画像として次工程へ渡します。",
    descriptionEn: "Auto carry forwards the latest completed result as the next stage input image.",
    checksJa: ["現工程で一度結果を生成する", "設定の自動引き継ぎを有効にする", "必要ならスタジオで入力画像を手動差し替えする"],
    checksEn: ["Generate a result once in the current stage", "Enable auto carry in Settings", "Replace the input image manually in Studio if needed"],
  },
];
