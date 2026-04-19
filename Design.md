# Sunmax Web Redesign Design Brief

## Supplemental References

- `design-references/i2i-webapp-design.md`: imported user-provided design specification for a separate I2I web app. Use it as an optional reference for Fluent 2 patterns, component/state coverage, token design, responsive rules, and documentation structure. Do not copy its project-specific information architecture, file references, or UX assumptions into Sunmax work unless the user explicitly asks for that adaptation.

## Header Layout Addendum (2026-04-18)

- Shared header navigation on the main site should use centered pill buttons, matching the game-page shell rather than a left-aligned utility bar.
- The `Games` control should mirror `Lab`: use a dropdown that includes the games hub and direct links to each playable title.
- On `index.html`, `games.html`, `blog/index.html`, `blog/post.html`, and `contact.html`, keep the header navigation-only. Do not place page titles, taglines, profile copy, or section intros inside the header.
- Move page-specific identity and summary copy into the first content section for each page. On the top page, the profile icon, `Sunmax`, and the short self-introduction belong inside the self-introduction section.
- `moto-catalog/`, `face-tracking/`, `i2i-lab/`, and `gungi/` remain standalone pages without an added overlay header.
- `i2i-lab/` should follow the same standalone utility-shell direction as `moto-catalog/`: app-owned header and sidebar only, with no shared site chrome above it.
- `i2i-lab/` should prioritize a compact first screen: current stage visible in the header, overview centered on visual pipeline widgets, and no text-heavy dashboard that pushes the default viewport into scrolling.
- `i2i-lab/` should default to `Studio` as the main surface. Workspace switching belongs in the sidebar, while the workspaces page is reserved for creation and management.
- `i2i-lab/` settings should open as a modal with tab switching between `Settings` and `Guide`. The modal must include the language switcher and any setup-related controls.
- `i2i-lab/` should keep `Results` and `History` merged into a single page and avoid mixed-language UI: Japanese mode should present Japanese UI copy, English mode should present English UI copy.
- `i2i-lab/` should make generation state obvious inside the Studio result area: running, completed, and error states should be visible without relying only on toast notifications.
- `i2i-lab/` OpenAI Live parameters should load image-model choices from the active API key when possible, present numeric tuning controls as bounded sliders rather than free-form number inputs, and show a focus-linked explanation panel for each parameter inside Studio.
- `i2i-lab/` results management should support single delete, multi-select delete, and delete-all from the merged results page, while keeping stage result references consistent after cleanup.
- `i2i-lab/` should keep large image payloads in `IndexedDB` and reserve `localStorage` for lightweight metadata, settings, and references so browser quota failures do not block normal use.
- `i2i-lab/` should provide a browser-storage cleanup action that removes stored image payloads, including generated previews and pasted stage input images, without deleting the run log, and should clear stale carry references after those cached previews are removed.
- `i2i-lab/` should not reuse the current stage result as input during `Run I2I`; carry-forward into the next stage should happen only when the user advances the stage.
- `i2i-lab/` stage inputs should support one base image plus multiple additional reference images for localized fixes or material guidance, and OpenAI Live should send them to image edits with the base image first.
- `i2i-lab/` stage inputs should accept clipboard screenshots from tools such as Snipping Tool: prefer a one-click paste action when the browser allows clipboard reads, and keep `Ctrl+V` image paste as the fallback path for both base and reference inputs.
- `i2i-lab/` Studio should support OpenAI-assisted prompt refinement from the selected tags, stage fields, and extra prompt, apply the refined text as a reversible stage-level override, and clear that override when the prompt source changes or the UI language switches.
- `i2i-lab/` Studio should keep the base-image panel and result viewer adjacent on desktop, and should expose per-stage quick-start presets plus reusable tag families for character, background, icon, and non-character object workflows.
- `gungi/` may keep its own dark visual theme, but no extra page overlay should be added above the game surface.

この `Design.md` は、Sunmax サイトの全面改装で人間と Codex が共有する基準書とする。別途作成済みの設計メモがある場合は、このファイルへ統合し、設計の正本を一本化する。

## 1. この改装で実現すること

- Sunmax を「自己紹介」「体験型ラボ」「知識アーカイブ」が同居する個人サイトとして再定義する。
- 初見ユーザーが 10 秒以内に「何を作っている人か」「どんな関心を持つ人か」「どこから作品を見ればよいか」を理解できる構成にする。
- `vehicle-physics`、`mathematics`、`games`、`fluid-simulation`、`blog` の見え方を統一しつつ、各領域の個性は残す。

## 2. 想定ユーザー

- 技術力と制作実績を短時間で把握したい採用担当者、協業候補、クライアント
- シミュレーション、数学、ゲーム実装に興味を持つ技術系読者
- 個別ページへ検索流入したあと、関連コンテンツを回遊したい訪問者

## 3. ブランド方向性

### キーワード

- 精密
- 探究的
- 温かみのある工房感
- 実験精神
- 信頼感

### モチーフ

「研究ノート」と「インタラクティブな実験室」を重ねた世界観を基準にする。無機質な SaaS テンプレートには寄せず、静かな熱量と手触りを感じる表現にする。

ただし、体験そのものに強い世界観がある独立アプリは例外を認める。`gungi` は全体導線の中に置きつつも、将棋盤や対局室に近い濃色の独立テーマで見せる。

### 避けるもの

- 汎用テンプレート感の強いカード並べ
- ネオンやサイバー演出に寄りすぎた世界観
- ページごとに別サイトに見える配色や余白
- 情報量の多さをそのまま一覧化しただけの導線

## 4. 情報設計

### グローバル導線

上位導線は次の 6 つを基本とする。

1. Home
2. Games
3. Lab
4. Moto Catalog
5. Blog
6. Contact

`Lab` 配下には `vehicle-physics`、`mathematics`、`fluid-simulation`、`face-tracking`、`i2i-lab` をまとめる。`moto-catalog` は独立したヘッダー項目として直接アクセスできるようにし、ページ内には追加オーバーレイヘッダーを載せない。`gungi` は `Games` 側の導線で扱う。

### ページ種別ごとの役割

- トップページ: 人物像、制作スタンス、興味分野、外部リンク、連絡導線を一画面目で伝える
- ハブページ: テーマ説明、注目コンテンツ、カテゴリ内導線を整理する
- 詳細ページ: 何が体験できるか、どう読むか、関連ページへどう進むかを先に示す
- 体験型デモ: デモ本体を優先し、上部には戻り導線だけを置く。説明文は本体の邪魔になる場合は足さない

### URL 方針

既存のリダイレクトページや別名 URL は、明示的な移行判断が出るまでは維持する。

## 5. ビジュアルシステム

### Fluent 2 の取り入れ方

Sunmax では Fluent 2 を「見た目のコピー元」ではなく、「設計原則、情報階層、状態設計、トークン運用」の参照元として使う。

- 採用するもの: Design principles、Layout、Typography、Motion、Design tokens、コンポーネント設計思想、レスポンシブ設計、アクセシビリティ配慮
- そのまま採用しないもの: Microsoft 製品の外観再現、Fluent 2 コンポーネントの固定的な全面流用、ブランド専用表現の無批判な転用

| Fluent 2 の考え方 | Sunmax での解釈 |
| --- | --- |
| Natural on every platform | Desktop、tablet、mobile のどこでも自然に読めて操作できる構成にする |
| Built for focus | 今見るべき内容、次に押すべき導線、関連ページへの移動先を明快に見せる |
| One for all, all for one | 読者の入口が違っても迷いにくく、読みやすく、回遊しやすい UI にする |
| Unmistakably Microsoft | Microsoft らしさを真似るのではなく、一貫した規則と丁寧な状態表現で信頼感を出す |

### 色

- Background: `#f5e18d`
- Surface: `#fff7dd`
- Ink: `#2f260f`
- Accent warm: `#d69c00`
- Accent deep: `#7d5a00`
- Highlight: `#f0d040`
- Border: `#d8bf63`

アイコンで使っている黄色をサイト全体の基調に据え、紙面感のある明るい黄土色と濃い琥珀色で階層を作る。補助色は最小限に留め、第一印象を黄色系で統一する。

### 文字

- 見出し: 和文対応の明朝体を第一候補にする
- 本文と UI: 可読性の高い角ゴシック体を使う
- 数値、コード、ラベル: 等幅体を部分的に使う

実装時は日本語表示の安定性を優先し、Web フォント導入の有無も含めて判断する。

- 文字設計は装飾ではなく情報階層の明示を目的にする
- 同じ役割の文字は全ページで同じ見え方に寄せる
- 強調は色だけに頼らず、サイズ、太さ、余白でも表現する
- ラベルは短く明確にし、英字タグと日本語 UI が混在しても破綻しないようにする

### レイアウト

- ハブ系ページの最大幅は 1180px 前後
- 読み物ブロックは 760px から 840px 程度で抑える
- デスクトップは 12 カラム、モバイルは 4 カラム相当の設計を前提にする
- セクション間余白は、情報の区切りが視覚的に伝わる大きさを確保する

### 余白とグリッド

- 余白は 4px ベースの spacing ramp で管理する。主要値は `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`
- ラベルと入力要素の間は 8px を基本にする
- フィールド間は 12px から 16px、カード内余白は 16px、セクション内余白は 16px から 24px を基本にする
- セクション間は 24px から 32px、主要レイアウト余白は 24px 以上を基準にする
- グリッドは desktop 12 カラム、tablet 8 カラム、mobile 4 カラム相当を基本にし、必要に応じて 1 カラムへ落とす
- グリッドは固定ルールとして崇拝せず、コンテンツ理解を優先して調整する
- 視線誘導は強い枠線や背景色の多用より、余白と情報のまとまりで作る

### 面と装飾

- 背景は単色ベタにせず、紙や資料のレイヤー感を持たせる
- 枠線、見出し下線、ラベル、注釈で「読む順番」が自然にわかるようにする
- ホバー演出は飾りではなく、押せる場所と次の行動を示すために使う

### 動き

- ページ導入時の穏やかなフェード、スライド、段差のある出現を基本にする
- 常時アニメーションは避け、注目箇所の理解を助ける場面だけに限定する

## 6. コンポーネント方針

- グローバルナビは、カテゴリの理解と回遊の両方を担う
- 代表作カードは「内容」「難度感」「見どころ」が短時間でわかる構成にする
- ハブページには、特集枠、通常カード、関連テーマ導線の 3 層を持たせる
- 詳細ページ上部には、概要、操作対象、学べること、関連リンクを集約する
- CTA は数を絞り、主要導線を強く見せる

### 再利用コンポーネントの共通ルール

- 役割が同じ要素は、見た目だけでなく挙動もできるだけ統一する
- 状態変化を持つ要素は、少なくとも `default / hover / focus / active / selected / disabled / loading` を定義する
- 成功、警告、エラーが意味を持つ要素は `success / warning / error` も定義する
- 状態表現は色だけでなく、ラベル、アイコン、境界線、影、動きも組み合わせて伝える
- 可読性と理解容易性を装飾より優先する

## 7. コンテンツトーン

- 説明は簡潔に始め、深掘りは本文側へ逃がす
- 技術的な正確さを保ちつつ、読者が試したくなる温度感を残す
- 自己紹介や実績紹介は、肩書きより制作物と関心領域で語る

## 8. 実装ガードレール

- GitHub Pages でそのまま配信できる静的構成を維持する
- 共有トークンや共通部品は `style.css` と共通スクリプト側に寄せる
- サブアプリや外部由来の生成物には無理に共通 CSS を流し込まない
- まずドキュメントを更新し、その後に UI 実装へ入る
- 日本語テキストを触るときは文字化けの有無を必ず確認する

### デザイントークン運用

- 色、余白、文字、角丸、境界線、影、モーション、z-index、ブレークポイントはハードコードを避け、トークンとして管理する
- このリポジトリでは CSS カスタムプロパティを第一候補とし、例として `--color-background-page`、`--color-text-primary`、`--space-200`、`--radius-medium`、`--shadow-card`、`--motion-duration-fast` のような命名を使う
- 同じ意味の値には同じトークンを使い、一時しのぎの直接指定を増やさない
- 将来のテーマ拡張やページ横断の統一を見越し、用途ベースで命名する

## 9. 改装の優先順

1. 共通デザインルールの確定
2. トップページと主要ハブページの刷新
3. 詳細ページのテンプレート統一
4. `blog/` や `fluid-simulation/` など独立度の高い領域への展開
5. 旧導線とリダイレクトの整理

## 10. 運用ルール

- デザイン判断を更新したら、この `Design.md` を先に直す
- Codex 向けの進め方や参照資料が変わる場合は、`.codex/skills/sunmax-site-redesign/` も同期する
- 実装前に迷いがある場合は、「どのユーザーに何を最短で伝える改装か」を基準に戻る
