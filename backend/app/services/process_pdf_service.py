import os
import fitz  # PyMuPDF
from io import BytesIO
import re
import unicodedata

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from minio import Minio
from minio.error import S3Error
from dotenv import load_dotenv

from pinecone import Pinecone, ServerlessSpec

from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

# ----- CARGA VARIABLES DE ENTORNO -----
load_dotenv()

# ----- INICIAR FASTAPI -----
app = FastAPI()

# ----------- CORS -----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuración MinIO ---
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost")
MINIO_PORT = os.getenv("MINIO_PORT", "9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "mermaidAI")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "mermaidAI123")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "mermaid")
MINIO_FULL_ENDPOINT = f"{MINIO_ENDPOINT}:{MINIO_PORT}"

minio_client = Minio(
    MINIO_FULL_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False,
)

# --- Configuración Pinecone ---
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = "asignaturas"

# ----- MODELOS -----
class FileRequest(BaseModel):
    filename: str

# ----- UTILIDADES -----
def descargar_y_guardar_archivo(bucket: str, filename: str, ruta_local: str):
    try:
        response = minio_client.get_object(bucket, filename)
        os.makedirs(os.path.dirname(ruta_local), exist_ok=True)
        with open(ruta_local, "wb") as f:
            for chunk in response.stream(32 * 1024):
                f.write(chunk)
        response.close()
        response.release_conn()
    except S3Error as e:
        raise HTTPException(status_code=500, detail=f"Error al descargar archivo: {e}")

# ----- ENDPOINT -----
@app.post("/procesar-pdf")
def procesar_pdf_service(req: FileRequest):
    filename = req.filename

    # 1. Guardar archivo local
    ruta_local = os.path.join("descargas", filename)
    descargar_y_guardar_archivo(MINIO_BUCKET_NAME, filename, ruta_local)

    # 2. Descargar archivo en memoria
    try:
        response = minio_client.get_object(MINIO_BUCKET_NAME, filename)
        file_bytes = BytesIO(response.read())
        response.close()
        response.release_conn()
    except S3Error as e:
        raise HTTPException(status_code=404, detail=str(e))

    # 3. Extraer texto del PDF
    try:
        pdf = fitz.open(stream=file_bytes, filetype="pdf")
        documents = []

        for page_num in range(len(pdf)):
            page = pdf.load_page(page_num)
            blocks = page.get_text("dict")["blocks"]

            for block in blocks:
                if "lines" in block:
                    for line in block["lines"]:
                        for span in line["spans"]:
                            text = span["text"].strip()
                            if text:
                                documents.append(
                                    Document(
                                        page_content=text,
                                        metadata={
                                            "page": page_num + 1,
                                            "file": filename,
                                            "bbox": [str(c) for c in span["bbox"]],
                                        },
                                    )
                                )
        pdf.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error PDF: {e}")

    # 4. Embeddings
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=os.getenv("OPENAI_API_KEY"),
    )

    # 5. Pinecone
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        
        # Obtener lista de índices existentes
        existing_indexes = pc.list_indexes()

        # Crear si no existe
        if PINECONE_INDEX_NAME not in existing_indexes:
            pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=1536,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )

        index = pc.Index(PINECONE_INDEX_NAME)

        vector_store = PineconeVectorStore(
            index=index,
            embedding=embeddings,
        )

        vector_store.add_documents(documents)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pinecone error: {e}")

    return {
        "status": "ok",
        "archivo": filename,
        "chunks_subidos": len(documents),
    }
