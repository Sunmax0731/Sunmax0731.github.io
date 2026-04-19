# 工程別プロンプトシート（I2I / Webアプリ前提）

**プロジェクト名**: I2I工程支援Webアプリ  
**版数**: v0.1  
**用途**: イラスト制作工程 No.4〜No.9 を、工程ごとの I2I で進めるためのプロンプト設計資料  
**想定利用者**: 制作者、実装者、AIエージェント

---

## 1. 本書の目的

本書は、イラスト制作工程の各段階で利用する **工程別プロンプトテンプレート**、**差し込み項目**、**タグ候補語**、**避けたい表現** を整理し、I2I 前提の Web アプリに組み込みやすい形で定義することを目的とする。

本書は以下を対象とする。

- 工程ごとの目的整理
- 工程ごとのテンプレート定義
- 入力項目の変数化
- タグ / 単語リストのカテゴリ整理
- ネガティブ寄り観点の整理
- Webアプリでのプロンプト生成UIに載せやすい構造化

---

## 2. 全工程共通の考え方

### 2.1 I2I 運用の基本
I2I では、前工程の画像を次工程の入力に使う。  
そのため、各工程では **何を固定して、何を変えるか** を明確にする必要がある。

### 2.2 共通の基本方針
- キャラクターの同一性を保つ
- 服装、髪型、体型、背景テーマなどの重要要素は必要に応じて固定する
- 工程ごとに目的を絞る
- 1回の生成で全要素を決めようとしない
- 構図段階では構図を優先し、仕上げ段階では描き込みを優先する

### 2.3 共通テンプレートの土台

```text
[subject], [character], [pose], [composition], [camera angle], [outfit], [hairstyle], [facial expression], [background], [art style], [render stage keywords], [quality keywords]
```

日本語での変数表現例:

```text
[主題]、[キャラクター属性]、[ポーズ]、[構図]、[画角]、[服装]、[髪型]、[表情]、[背景]、[絵柄]、[工程用キーワード]、[品質キーワード]
```

---

## 3. 差し込み項目テンプレート

Webアプリでは、以下の差し込み項目を共通入力として扱えるようにすることが望ましい。

```text
主題:
キャラクター:
年齢表現:
体型:
髪型:
髪色:
表情:
服装:
ポーズ:
構図:
画角:
背景:
絵柄:
色味:
光源:
工程キーワード:
品質キーワード:
```

### 3.1 記入例

```text
主題: 海辺に立つ成人女性
キャラクター: 大人っぽい落ち着いた雰囲気の女性
年齢表現: adult woman
体型: slender, height 169cm
髪型: long straight hair
髪色: dark brown
表情: gentle smile
服装: white summer one-piece dress
ポーズ: standing naturally, one hand touching hair
構図: full body, centered composition
画角: eye level
背景: sandy beach, summer sea, bright sky
絵柄: anime illustration
色味: soft summer palette
光源: daylight
```

---

## 4. 工程 No.4 構図ラフ

### 4.1 工程の目的
- 構図を決める
- ポーズと視線誘導を決める
- 細部より画面全体の見え方を優先する

### 4.2 固定要素の例
- 主題
- キャラクターの基本属性
- 背景テーマ

### 4.3 可変要素の例
- 構図
- 画角
- ポーズ
- 余白の取り方

### 4.4 テンプレート

```text
rough composition sketch, character concept pose, simple silhouette, clear focal point, [subject], [pose], [composition], [camera angle], [outfit], [background], monochrome rough sketch, loose lines, thumbnail sketch style, visual balance, emphasis on composition
```

日本語寄り:

```text
構図ラフ、粗いスケッチ、シンプルなシルエット、主役が明確、[主題]、[ポーズ]、[構図]、[画角]、[服装]、[背景]、モノクロラフ、緩い線、サムネイルスケッチ風、構図重視
```

### 4.5 推奨キーワード候補
#### 構図
- dynamic composition
- centered composition
- asymmetrical composition
- triangular composition
- cinematic framing
- strong silhouette
- visual hierarchy
- clear focal point

#### 画角
- full body
- upper body
- bust shot
- wide shot
- low angle
- high angle
- eye level
- close-up

#### ラフ感
- rough sketch
- loose drawing
- gesture drawing
- thumbnail sketch
- simple line draft
- monochrome draft

### 4.6 避けたい方向
- 描き込みすぎ
- 色が強すぎる
- 背景が主張しすぎる
- 顔が確定しすぎる

### 4.7 ネガティブ寄り観点
- over-detailed
- overly rendered
- strong textures
- excessive background detail

---

## 5. 工程 No.5 大ラフ / ポーズラフ

### 5.1 工程の目的
- 体のバランスを整える
- 表情、衣装の形、主要な背景要素を決める
- キャラの印象を固める

### 5.2 固定要素の例
- 構図
- キャラクターの方向性
- 服装の種類
- 背景テーマ

### 5.3 可変要素の例
- 表情差分
- 細かなポーズ修正
- 小物の有無
- 背景の主要物

### 5.4 テンプレート

```text
clean rough sketch, refined pose sketch, character design draft, [subject], [character], [pose], [composition], [camera angle], [outfit details], [hairstyle], [facial expression], [background main elements], readable anatomy, refined silhouette, refined proportions, sketch stage illustration
```

日本語寄り:

```text
大ラフ、整理されたラフ、キャラクターデザイン草案、[主題]、[キャラクター]、[ポーズ]、[構図]、[画角]、[服装の詳細]、[髪型]、[表情]、[背景の主要要素]、人体バランスが自然、シルエット整理、プロポーション調整済み
```

### 5.5 推奨キーワード候補
#### 人体・ポーズ
- readable anatomy
- natural pose
- dynamic pose
- balanced proportions
- expressive hands
- stable body balance

#### 表情
- calm expression
- confident smile
- serious face
- gentle expression
- determined expression

#### 衣装
- outfit folds indicated
- accessory placement defined
- costume shape clarified
- layered clothing design

#### ラフ精度
- clean rough
- refined sketch
- organized draft
- clarified form

### 5.6 この段階で固定したい要素
- 髪型
- 服の種類
- 体型
- 顔立ちの方向性
- ポーズの大枠
- 小物の有無

---

## 6. 工程 No.6 線画寄り / クリーンアップ

### 6.1 工程の目的
- 形を確定させる
- 輪郭を整理する
- 色を乗せやすくする

### 6.2 固定要素の例
- 構図
- ポーズ
- 服装
- 髪型
- 主要パーツ配置

### 6.3 可変要素の例
- 線の太さ
- 輪郭の整理度
- 背景線の省略度

### 6.4 テンプレート

```text
clean linework, refined line art, clear outlines, [subject], [character], [pose], [composition], [outfit], [hairstyle], [facial expression], [background simplified], precise contour lines, clean drawing, readable details, illustration line art
```

日本語寄り:

```text
整理された線画、クリーンな線、明瞭な輪郭、[主題]、[キャラクター]、[ポーズ]、[構図]、[服装]、[髪型]、[表情]、[簡略化した背景]、正確な輪郭線、読みやすいディテール、線画イラスト
```

### 6.5 推奨キーワード候補
#### 線の品質
- clean line art
- crisp outlines
- controlled line weight
- refined contours
- neat linework

#### ディテール
- separated shapes
- readable accessories
- clear facial features
- hair strands defined
- clothing seams visible

#### 背景
- minimal background lines
- background indicated lightly
- clean subject separation

### 6.6 避けたい方向
- 塗り込み風になる
- 線が溶ける
- 影が強すぎる
- 輪郭が曖昧

### 6.7 ネガティブ寄り観点
- blurry lines
- muddy contours
- painterly blur
- heavy shading

---

## 7. 工程 No.7 カラーラフ

### 7.1 工程の目的
- 配色を決める
- 明暗の大まかな設計を決める
- 質感はまだ軽めに留める

### 7.2 固定要素の例
- 線や形
- 服装構造
- キャラクター同一性

### 7.3 可変要素の例
- 髪色
- 服色
- 背景色味
- 光の方向性の大枠

### 7.4 テンプレート

```text
color rough, flat colors, early color study, [subject], [character], [pose], [composition], [outfit colors], [hair color], [eye color], [background color mood], harmonious palette, simple shading, color blocking, illustration color draft
```

日本語寄り:

```text
カラーラフ、色設計、フラットカラー、[主題]、[キャラクター]、[ポーズ]、[構図]、[服装の色]、[髪色]、[目の色]、[背景の色味]、調和した配色、軽い陰影、色分け重視
```

### 7.5 推奨キーワード候補
#### 配色
- harmonious palette
- muted colors
- vibrant colors
- warm tones
- cool tones
- pastel palette
- high contrast palette
- natural skin tones

#### 色の設計
- flat color blocking
- early shading
- simple shadow shapes
- color design focus
- mood color study

#### 雰囲気
- summer seaside palette
- dusk lighting palette
- soft daylight palette
- dramatic sunset colors

### 7.6 チェックポイント
- 髪色は合っているか
- 服と背景が競合していないか
- 主役が埋もれていないか
- 肌色が不自然でないか

### 7.7 ネガティブ寄り観点
- oversaturated
- muddy colors
- inconsistent palette
- skin tone mismatch

---

## 8. 工程 No.8 塗り込み / 描き込み

### 8.1 工程の目的
- 光と影を入れる
- 質感を出す
- 立体感を作る
- 情報量を増やす

### 8.2 固定要素の例
- 構図
- 服装
- キャラクターの顔立ち
- 髪型
- 背景テーマ

### 8.3 可変要素の例
- 光の強さ
- 影の硬さ
- 質感の方向性
- 背景ディテール量

### 8.4 テンプレート

```text
fully rendered illustration, refined shading, detailed painting, [subject], [character], [pose], [composition], [outfit materials], [hairstyle], [facial expression], [background details], soft lighting, defined shadows, material rendering, depth, polished anime illustration
```

日本語寄り:

```text
描き込み済みイラスト、丁寧な陰影、詳細な塗り、[主題]、[キャラクター]、[ポーズ]、[構図]、[服の素材感]、[髪型]、[表情]、[背景ディテール]、柔らかな光、はっきりした影、質感表現、奥行き感
```

### 8.5 推奨キーワード候補
#### 塗り
- soft shading
- detailed shading
- painterly rendering
- cel shading
- semi-realistic shading
- polished rendering

#### 質感
- glossy hair
- soft skin
- fabric texture
- metallic details
- translucent highlights
- sand texture
- water reflections

#### 光
- soft daylight
- rim light
- ambient light
- warm sunlight
- strong directional light

#### 奥行き
- atmospheric depth
- layered background
- subtle depth of field
- spatial separation

---

## 9. 工程 No.9 仕上げ

### 9.1 工程の目的
- 全体の完成度を上げる
- 空気感、演出、視線誘導を整える
- 最終出力に近づける

### 9.2 固定要素の例
- 構図
- キャラクター同一性
- 服装
- 背景テーマ
- 色の方向性

### 9.3 可変要素の例
- ハイライト
- 空気感の強さ
- 色調整
- 演出の量

### 9.4 テンプレート

```text
finished illustration, polished artwork, final render, [subject], [character], [pose], [composition], [outfit], [hairstyle], [facial expression], [background], cinematic lighting, atmospheric effects, subtle highlights, color balance, visual focus, professional quality illustration
```

日本語寄り:

```text
完成イラスト、最終仕上げ、 polished artwork、[主題]、[キャラクター]、[ポーズ]、[構図]、[服装]、[髪型]、[表情]、[背景]、シネマティックな光、空気感の演出、繊細なハイライト、色調整、視線誘導、完成度の高いイラスト
```

### 9.5 推奨キーワード候補
#### 仕上げ演出
- cinematic lighting
- atmospheric effects
- soft glow
- subtle bloom
- rim light accents
- finishing highlights
- color grading
- dramatic contrast
- refined focal emphasis

#### 最終品質
- polished artwork
- final render
- production quality
- professional illustration
- highly cohesive image

#### 空気感
- summer breeze atmosphere
- luminous air
- sparkling light
- soft depth haze

### 9.6 ネガティブ寄り観点
- overexposed highlights
- too much bloom
- cluttered details
- anatomy drift
- face inconsistency

---

## 10. 単語リストのカテゴリ整理

### 10.1 主題
- character illustration
- portrait
- full body character
- standing character
- seaside scene
- fantasy character

### 10.2 キャラクター属性
- adult woman
- adult man
- elegant
- energetic
- calm
- cool
- mature
- youthful-looking adult

### 10.3 体型
- slender
- athletic
- average build
- tall
- petite adult
- graceful proportions

### 10.4 顔・表情
- gentle smile
- neutral face
- confident look
- soft eyes
- sharp eyes
- relaxed expression

### 10.5 髪型
- long straight hair
- short bob
- ponytail
- twin tails
- wavy hair
- side bangs
- braided hair

### 10.6 服装
- summer dress
- school uniform style
- fantasy armor
- casual wear
- formal dress
- swimsuit with outerwear
- one-piece dress

### 10.7 構図・画角
- full body
- upper body
- wide shot
- close-up
- low angle
- eye level
- dynamic composition
- centered composition

### 10.8 背景
- beach
- city street
- classroom
- forest
- sunset sky
- room interior
- fantasy town

### 10.9 光
- soft daylight
- sunset light
- overcast lighting
- dramatic light
- backlighting
- rim light

### 10.10 工程用
- rough sketch
- clean rough
- line art
- color rough
- fully rendered
- polished artwork

---

## 11. Webアプリに載せる際の入力カテゴリ案

Webアプリでは、以下のカテゴリ単位でタグ選択UIを構成することを推奨する。

1. 主題
2. キャラクター属性
3. 体型
4. 顔 / 表情
5. 髪型
6. 服装
7. ポーズ
8. 構図
9. 画角
10. 背景
11. 光
12. 絵柄
13. 工程用
14. 品質

### 11.1 UI上の推奨対応
- 工程ごとに表示優先カテゴリを変える
- 例: 構図ラフでは「構図」「画角」「ポーズ」を上位表示
- 例: 仕上げでは「光」「品質」「空気感」を上位表示

---

## 12. 工程カード形式の管理推奨

実装や運用では、各工程を以下のようなカード形式で管理するのが望ましい。

### No.4 構図ラフ
- 目的: 構図とポーズ決定
- 固定する要素: 主題、キャラ、背景テーマ
- 変えてよい要素: 線の勢い、背景の省略度
- 推奨キーワード: rough sketch, thumbnail sketch, clear focal point
- 避けたい要素: over-detailed, fully rendered

### No.5 大ラフ
- 目的: 体型・衣装・表情の整理
- 固定する要素: 構図、キャラ、服装の種類
- 変えてよい要素: 表情差分、小物
- 推奨キーワード: clean rough, refined pose, readable anatomy

### No.6 線画寄り
- 目的: 輪郭と形の確定
- 固定する要素: 構図、ポーズ、服装
- 変えてよい要素: 線の整理度
- 推奨キーワード: clean line art, refined contours

### No.7 カラーラフ
- 目的: 配色決定
- 固定する要素: 線、形、構図
- 変えてよい要素: 色味、明暗設計
- 推奨キーワード: flat colors, harmonious palette

### No.8 塗り込み
- 目的: 質感・陰影・奥行き付与
- 固定する要素: 構図、服装、顔立ち
- 変えてよい要素: 質感、光、背景ディテール
- 推奨キーワード: refined shading, material rendering

### No.9 仕上げ
- 目的: 最終品質向上
- 固定する要素: 全体の方向性
- 変えてよい要素: ハイライト、空気感、色調整
- 推奨キーワード: polished artwork, atmospheric effects

---

## 13. まとめ

本書の運用上の要点は以下である。

- 工程ごとに目的を分ける
- テンプレートとタグを分離して扱う
- 固定要素 / 可変要素を明示する
- Webアプリではカテゴリ単位で入力させる
- I2I は段階的に育てる前提で設計する

本書は、今後 `SKILL.md`、JSON 定義、画面設計、タグデータ定義へ展開可能なベース資料として扱う。
