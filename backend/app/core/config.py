import os
from dotenv import load_dotenv
# Archivo de configuración para la aplicación Mermaid AI. Todas las variables de entorno deben estar aqui
# para facilitar su gestión y acceso en toda la aplicación.
load_dotenv()

class Settings:
    PROJECT_NAME: str = "Mermaid AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")

    # MinIO
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "127.0.0.1")
    MINIO_PORT: str = os.getenv("MINIO_PORT", "9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "mermaidAI")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "mermaidAI123")
    MINIO_BUCKET_NAME: str = os.getenv("MINIO_BUCKET_NAME", "mermaid")
    
    @property
    def MINIO_FULL_ENDPOINT(self) -> str:
        return f"{self.MINIO_ENDPOINT}:{self.MINIO_PORT}"

    # Pinecone
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY")
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "asignaturas")

    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")

settings = Settings()
