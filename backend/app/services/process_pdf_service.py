from fastapi import HTTPException
from minio import Minio
from minio.error import S3Error
from dotenv import load_dotenv
from langchain.schema import Document
from langchain_openai import OpenAIEmbeddings

from pinecone import Pinecone
import fitz  # PyMuPDF
import os
import re
import unicodedata
from io import BytesIO

load_dotenv()

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

def ascii_safe_id(text):
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    return re.sub(r'[^a-zA-Z0-9._-]', '_', text)

def procesar_pdf_service(filename: str):
    ruta_local = os.path.join("descargas", filename)

    # --- Descargar archivo desde MinIO ---
    try:
        response = minio_client.get_object(MINIO_BUCKET_NAME, filename)
        file_bytes = BytesIO(response.read())
        response.close()
        response.release_conn()
    except S3Error as e:
        raise HTTPException(status_code=404, detail=f"Error al descargar desde MinIO: {e}")

    # --- Extraer texto del PDF ---
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
                                        "bbox": [str(coord) for coord in span["bbox"]],
                                    },
                                ))
        pdf.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar PDF: {e}")

    # --- Embeddings + Pinecone ---
    try:
        embeddings = OpenAIEmbeddings(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model="text-embedding-3-small",
            dimensions=1536,
        )
        pinecone_client = Pinecone(api_key=PINECONE_API_KEY)
        index = pinecone_client.Index(PINECONE_INDEX_NAME)

        upserts = []
        vector_ids = []

        for i, chunk in enumerate(documents):
            vector_id = ascii_safe_id(f"{filename}_chunk_{i}")
            vector_ids.append(vector_id)
            embedding = embeddings.embed_query(chunk.page_content)

            metadata = {
                "text": chunk.page_content,
                "source": filename,
                "chunk": i,
                **chunk.metadata,
            }

            upserts.append((vector_id, embedding, metadata))

        if upserts:
            index.upsert(vectors=upserts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir a Pinecone: {e}")

    return {
        "status": "ok",
        "archivo": filename,
        "chunks_subidos": len(upserts),
        "vector_ids": vector_ids[:5],
    }
