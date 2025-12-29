# backend/apps/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Project Governor API")

# フロントエンド(React)からのアクセスを許可する設定
# MVP段階では全許可 ("*") 、本番ではフロントのドメインのみに限定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """ヘルスチェック用エンドポイント"""
    return {"status": "ok", "service": "ai-project-governor-backend"}


@app.get("/")
def root():
    return {"message": "Hello from Cloud Run!"}
