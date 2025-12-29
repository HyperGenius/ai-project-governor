# for Cloud Run
# 1. Python 3.11の軽量イメージを使用
FROM python:3.11-slim

# 2. コンテナ内の作業ディレクトリを設定
WORKDIR /app

# 3. 依存関係ファイルをコピーしてインストール
# (キャッシュを効かせるため、コード全体より先にこれだけやる)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. ソースコード全体をコピー
COPY . .

# 5. Cloud Run向けの起動コマンド
# Cloud Runが注入する環境変数 $PORT (通常8080) を受け取る
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
