from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from minio import Minio
from minio.error import S3Error
from dotenv import load_dotenv
import os
import fitz  # PyMuPDF
from io import BytesIO
import re
import unicodedata

from langchain.schema import Document
# from langchain.text_splitter import RecursiveCharacterTextSplitter  # Ya no hace falta aquí
from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone

# ----- CARGA VARIABLES DE ENTORNO -----
load_dotenv()

# ----- INICIAR FASTAPI -----
app = FastAPI()

# ----------- CORS -----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambia esto a ["http://localhost:3000"] si quieres restringir
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

# ----- UTILIDADES -----
class FileRequest(BaseModel):
    filename: str

def ascii_safe_id(text):
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    return re.sub(r'[^a-zA-Z0-9._-]', '_', text)

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

# ----- ENDPOINT UNIFICADO: DESCARGA + PROCESADO + PINECONE -----
@app.post("/procesar-pdf")
def procesar_pdf_service(req: FileRequest):
    filename = req.filename

    # 1. Guardar archivo en disco (para depuración)
    ruta_local = os.path.join("descargas", filename)
    descargar_y_guardar_archivo(MINIO_BUCKET_NAME, filename, ruta_local)

    # 2. Descargar archivo en memoria
    try:
        response = minio_client.get_object(MINIO_BUCKET_NAME, filename)
        file_bytes = BytesIO(response.read())
        response.close()
        response.release_conn()
    except S3Error as e:
        raise HTTPException(status_code=404, detail=f"Error al descargar desde MinIO: {e}")

    # 3. Extraer texto del PDF con coordenadas por span (sin dividir más)
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
                                documents.append(Document(
                                    page_content=text,
                                    metadata={
                                        "page": page_num + 1,
                                        "file": filename,
                                        # bbox como lista de strings para no tener problemas en Pinecone
                                        "bbox": [str(coord) for coord in span["bbox"]]
                                    }
                                ))
        pdf.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar PDF: {e}")

    # 4. No dividimos en chunks, usamos cada span como chunk
    chunks = documents

    # 5. Embeddings + Pinecone
    try:
        embeddings = OpenAIEmbeddings(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model="text-embedding-3-small",
            dimensions=1536
        )
        pinecone_client = Pinecone(api_key=PINECONE_API_KEY)
        index = pinecone_client.Index(PINECONE_INDEX_NAME)

        upserts = []
        vector_ids = []

        for i, chunk in enumerate(chunks):
            vector_id = ascii_safe_id(f"{filename}_chunk_{i}")
            vector_ids.append(vector_id)
            embedding = embeddings.embed_query(chunk.page_content)

            metadata = {
                "text": chunk.page_content,
                "source": filename,
                "chunk": i,
                **chunk.metadata,
                # bbox sigue siendo lista de strings
                "bbox": [str(coord) for coord in chunk.metadata.get("bbox", [])]
            }

            upserts.append((vector_id, embedding, metadata))

        if upserts:
            index.upsert(vectors=upserts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir a Pinecone: {e}")

    return {
        "status": "ok",
        "archivo": filename,
        "archivo_guardado_en": ruta_local,
        "chunks_subidos": len(upserts),
        "vector_ids": vector_ids[:5]  # Mostramos solo los primeros 5 IDs como ejemplo
    }
