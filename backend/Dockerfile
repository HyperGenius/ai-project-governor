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

# 5. ポートの公開
ENV PORT=8000
EXPOSE 8000

# 6. アプリケーション起動コマンド
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
