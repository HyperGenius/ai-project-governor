# Google Gemini API Key の発行と設定手順

本プロジェクト (`ai-project-governor`) のAI機能（JTC構文変換など）を利用するために必要な、Google Gemini APIキーの取得方法を記述します。

## 1. Google AI Studio にアクセス

Googleの生成AI開発者向けコンソールである **Google AI Studio** を使用します。
（Google Cloud Platform コンソールよりも手順が簡単で、無料枠の利用設定も容易です）

* **URL:** [https://aistudio.google.com/](https://aistudio.google.com/)
* Googleアカウントでログインしてください。

## 2. APIキーの作成

1. 画面左下の **「Get API key」** ボタンをクリックします。
2. **「APIキーを作成」** をクリックします。
3. 以下のどちらかを選択します：
* **Create API key in new project** (推奨): 新しく専用のGoogle Cloudプロジェクトが裏で作られます。
* **Create API key in existing project**: 既存のGCPプロジェクトがある場合は選択可能です。


4. 生成されたAPIキー（`AIza` から始まる文字列）をコピーします。

> **⚠️ 注意:** APIキーはパスワードと同じです。他人に教えたり、GitHubのパブリックリポジトリにコミットしたりしないでください。

## 3. プロジェクトへの設定

取得したAPIキーを、本プロジェクトの環境変数に設定します。

### 手順

1. プロジェクトルートにある `.env` ファイルを開きます（なければ作成します）。
2. 以下の行を追加、または書き換えてください。

```bash
# .env

# Gemini API Key
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

```

> **Note:** `.gitignore` ファイルに `.env` が含まれていることを確認し、このキーがGitにコミットされないように管理してください。

## 4. 利用料金と制限について (参考)

Google AI Studio経由で利用する場合、以下のプランが適用されます（2025年時点）。

* **Gemini 1.5 Flash / Pro (Free Tier)**
* **コスト:** 無料
* **制限:**
* 1分あたり15リクエスト (15 RPM)
* 1日あたり1,500リクエスト (1,500 RPD)


* **注意点:** 無料枠のデータは、Googleによるモデルの改善（学習）に使用される可能性があります。機密性の高い個人情報や顧客データは入力しないように設計・運用してください。

