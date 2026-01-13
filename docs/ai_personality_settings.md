# AI人格・口調のカスタマイズ設定機能

## 概要

日報を清書するAIの人格（Tone & Manner）をユーザーごとにカスタマイズできる機能です。
デフォルトの「丁寧なJTC社員」だけでなく、ユーザーの職場環境や好みに合わせた様々なスタイルを選択できます。

## 機能詳細

### 利用可能なトーン（プリセット）

1. **プロフェッショナル（デフォルト）**
   - 丁寧な「です・ます」調
   - ビジネスマナーに則った標準的な日報
   - JTC企業向け、上司への報告に最適

2. **簡潔・社内向け**
   - 事実のみを短く伝える「だ・である」調または箇条書き
   - 技術チームやアジャイル開発に向いています

3. **英語（English）**
   - Professional English business report style
   - 外資系企業や国際チーム向け

4. **熱血営業マン**
   - 前向きで熱意のある表現
   - 成果を強調し、ポジティブな印象を与える
   - 営業やマーケティングチームに最適

### カスタム指示

プリセットに加えて、自由記述で追加の指示を与えることができます。

**例：**
- 「専門用語を積極的に使用してください」
- 「カジュアルな表現は避けてください」
- 「結論を最初に書いてください」

## 使い方

### 1. 設定画面へのアクセス

ダッシュボードのヘッダーにある「AI設定」ボタンをクリックします。

### 2. トーンの選択

ドロップダウンから希望のトーンを選択します。

### 3. カスタム指示の入力（任意）

必要に応じて、追加の指示を入力します。

### 4. 保存

「設定を保存」ボタンをクリックして設定を確定します。

### 5. 日報作成

次回から日報を作成する際、選択したトーンとカスタム指示が自動的に適用されます。

## 技術仕様

### データベース

```sql
-- profiles テーブルに ai_settings カラムを追加
ALTER TABLE public.profiles
ADD COLUMN ai_settings JSONB DEFAULT '{
  "tone": "professional",
  "language": "ja",
  "custom_instructions": ""
}'::jsonb;
```

### API エンドポイント

#### AI設定の取得
```
GET /api/v1/profiles/ai-settings
```

#### AI設定の更新
```
PUT /api/v1/profiles/ai-settings
Content-Type: application/json

{
  "tone": "concise",
  "language": "ja",
  "custom_instructions": "専門用語を使う"
}
```

### プロンプトのカスタマイズ

ユーザーの設定に基づいて、AIへのシステムプロンプトが動的に構築されます。

```python
# 基本プロンプト + トーン別プロンプト + カスタム指示
custom_prompt = build_custom_prompt(
    base_prompt=PROMPTS_WITH_LEVEL_DESCRIPTION[politeness_level],
    tone=user_settings['tone'],
    custom_instructions=user_settings['custom_instructions']
)
```

## 制限事項

- トーンは4種類のプリセットから選択
- カスタム指示は自由記述だが、AI側で解釈できない指示は無視される場合がある
- 言語設定は日本語（ja）と英語（en）のみ対応

## 今後の拡張予定

- [ ] 業種別プリセットの追加（医療、法律、IT、製造など）
- [ ] チームでのプリセット共有機能
- [ ] AI生成結果のプレビュー機能
- [ ] 多言語対応の拡充
