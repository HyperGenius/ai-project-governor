## 1. プロダクトコンセプト

### 背景 (The Pain)

伝統的な日本企業（JTC）における「週報」は、事実の報告以上に「角が立たない表現」「頑張っている感の演出」「空気を読んだ報告」といった**本質的でない作業（Toil）**に多大な精神的・時間的コストが支払われている。

### 解決策 (The Solution)

「事実は人間が、建前はAIが」

エンジニアはただ「やったこと（事実）」を箇条書きにするだけ。あとはAIとシステムが、上司が満足する完璧な「JTC構文」へ昇華させ、提出までを自動化する。

------

## 2. MVP（最小構成）アーキテクチャ

個人利用〜小規模チームでの検証フェーズ。

### ワークフロー

1. **Input:**
   - ユーザーはSlack/Teams/LINE等のチャット、またはシンプルなWeb画面から「今日のやったこと（事実のみ）」を箇条書きで投げる。
2. **Logic (FastAPI + LLM):**
   - **構造化:** Pydantic (`BaseModel`) で入力を構造化データへ変換。
   - **清書 (JTC Filter):** LLM (OpenAI/Gemini) が「上司ウケする、角の立たない、かつ仕事してる感が出るビジネス日本語」へ変換。
3. **Storage:**
   - Supabase (PostgreSQL) に「Rawデータ（事実）」と「Polishedデータ（清書）」を蓄積。
4. **Output:**
   - 金曜日の夕方に、1週間分を要約・統合し、指定されたフォーマットの「週報」を自動生成して通知。

### 技術スタック

- **Backend:** Python (FastAPI)
- **Validation:** Pydantic
- **AI:** OpenAI API / Gemini API
- **Database:** Supabase (PostgreSQL + Auth)
- **Automation:** GitHub Actions (週次バッチ処理)

------

## 3. SaaSへの進化（マルチテナント化）

組織単位での導入を見据えたスケーラビリティの確保。

### Architecture: Supabase RLS

- **Row Level Security (RLS):** アプリケーションロジックではなく、DBレイヤーでセキュリティを担保。
- **Tenant Isolation:** 全テーブルに `tenant_id` を付与し、「自分のチームのデータしか見えない」ポリシーを徹底。これにより開発工数を削減しつつ堅牢性を維持する。

### Killer Feature: チーム週報の自動生成

- **Input:** チームメンバー全員の1週間分の清書済み日報。
- **Process:** LLMがコンテキスト全体を読み込み、「課全体としての主要トピック」「遅延リスク」「リソースの偏り」を抽出。
- **Output:** 部長・本部長報告にそのまま転送できるレベルの「組織用週報」を生成。

### Infra link (IaC)

- **Terraform / GitHub Actions:** 新規テナント契約時に、専用環境やスキーマ設定を自動プロビジョニング（将来的なEnterprise対応への布石）。

------

## 4. 進化系：AI Project Governor (仮)

事後報告ツールから、未来を制御するプロジェクト管理ツールへ。

- **Mission to WBS:**
  - 「今期の目標（ふわっとした概念）」をAIが解析し、具体的なマイルストーンとタスク（WBS）へ数秒で分解。
- **Skill-based Auto-Assign:**
  - Supabase上の「過去の実績データ」と「スキルタグ」に基づき、AIが最適なメンバーへタスクを仮アサイン。管理職は承認するのみ。
- **Zero-Micromanagement:**
  - 日報（進捗）更新と連動してガントチャートを自動更新。遅延発生時のみAIが適切な強度でアラートを発出し、管理職の「進捗どう？」を抹殺する。

------

## 5. 開発ロードマップと習得スキル

| **Phase**  | **テーマ** | **実装機能**                | **習得できる技術 (転職・独立の武器)**       |
| ---------- | ---------- | --------------------------- | ------------------------------------------- |
| **Step 1** | **蓄積**   | 日報のCRUD、Auth、DB設計    | **FastAPI, Supabase (Auth/DB), SQL設計**    |
| **Step 2** | **変換**   | AIによるJTC構文変換、構造化 | **LLM API, Pydantic (AI Agent設計)**        |
| **Step 3** | **自動化** | 週報自動生成、定期実行      | **GitHub Actions, CI/CD, Batch Processing** |
| **Step 4** | **提供**   | ダッシュボード、検索UI      | **React, Netlify/Vercel, Frontend**         |
| **Future** | **拡大**   | マルチテナント、IaC連携     | **RLS, Terraform, SaaS Architecture**       |

------
