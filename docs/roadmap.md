# Product Roadmap

本ドキュメントでは、AI Project Governorの機能拡張計画と、各機能が提供されるプラン（Monetization Strategy）を定義する。

---

## Phase 1: MVP (Current Status)
**「入力と報告の自動化」**
* [x] 日報のAI清書 & 保存 (Free)
* [x] 箇条書きからのWBS自動生成 (Free)
* [x] 週報の自動生成 (Free: 月2回制限 / Pro: 無制限)
* [x] 工数ログの自動抽出 (Free)

---

## Phase 2: User Value Enhancement (Next Step)
**「思考の整理と高度なカスタマイズ」**

### 1. 対話型プロジェクト要件定義 (Interactive Scoping)
* **Target:** **Pro Plan / Team Plan**
* **課題:**
    * ユーザーが最初に入力する「プロジェクト概要」が曖昧だと、生成されるWBSの精度も低くなる。
    * ユーザー自身、何を決めるべきか整理できていないことが多い。
* **解決策:**
    * チャットUIを通じてAIが「壁打ち相手」になる。
    * AIが能動的に質問（「ターゲットは誰ですか？」「必達の納期はありますか？」「技術スタックの制約は？」など）を行い、情報を引き出す。
    * 対話完了後、整理された「要件定義テキスト」を出力し、そこから高精度のWBSを生成する。
* **技術要件:**
    * Backend: 会話履歴を考慮して次の質問を生成する `chain` 構造の実装 (LangChain等検討)。
    * Frontend: チャット形式のインターフェース (`ChatInterface` コンポーネント) の追加。

### 2. プロンプトカスタマイズ (Prompt Tuning)
* **Target:** **Pro Plan**
* **概要:** 日報や週報の生成に使用するシステムプロンプト（AIの人格や制約）をユーザーが編集・保存できる機能。
* **ユースケース:** 「もっと箇条書きを多用してほしい」「関西弁で出力したい」などのこだわりに対応。

---

## Phase 3: Team Collaboration & Expansion
**「組織の生産性最大化」**

### 1. チーム週報 (Team Summary)
* **Target:** **Team Plan**
* **概要:** テナント内のメンバー全員の日報を集約し、マネージャー向けの「課全体の週報」を自動生成する。

### 2. スキルベース自動アサイン
* **Target:** **Team / Enterprise**
* **概要:** 過去の工数ログとプロフィール情報から、生成されたタスクに最適な担当者をAIが推薦する。

---

## Phase 4: Autonomous Operations (Future)
**「システム自身による自己修復と改善」**

### 1. 自律型インシデント対応 (Automated Incident Response)
* **Target:** **Enterprise / Internal Dev**
* **課題:**
    * エラーログの監視と、Issueへの転記作業が面倒。
    * エラー発生から修正着手までのリードタイムが長い。
* **解決策:**
    * **Log to Cloud:** フロントエンド・バックエンドのログをクラウド統合監視基盤（Sentry/GCP）に集約。
    * **Auto Issue:** 異常検知時、スタックトレースと発生状況を含んだGitHub Issueを自動作成。
    * **AI Fix:** Issue起票をトリガーにAIエージェント（Copilot）がコードを解析し、修正パッチ（Pull Request）を自動提案。人間はレビューしてマージするだけ。
* **技術要件:**
    * Logging: Sentry, Cloud Logging (Structured Logging)
    * Automation: GitHub Actions, GitHub Copilot API

### 2. ログベースのUX改善提案
* **Target:** **Pro / Team**
* **概要:** ユーザーの操作ログやエラーログをAIが定期分析し、「この画面で離脱が多いのはUIが分かりにくいからでは？」といった改善提案を自動でIssue化する。
