import os
import fitz  # PyMuPDF
from minio import Minio
from minio.error import S3Error
from pinecone import Pinecone, ServerlessSpec
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from fastapi import HTTPException

from app.core.config import settings

# --- Clientes ---
minio_client = Minio(
    settings.MINIO_FULL_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=False,
)

def descargar_archivo_local(filename: str) -> str:
    """Descarga un archivo de MinIO a una carpeta temporal local"""
    ruta_local = os.path.join("descargas", filename)
    try:
        os.makedirs(os.path.dirname(ruta_local), exist_ok=True)
        minio_client.fget_object(settings.MINIO_BUCKET_NAME, filename, ruta_local)
        return ruta_local
    except S3Error as e:
        raise HTTPException(status_code=500, detail=f"Error al descargar de MinIO: {e}")

def procesar_pdf_service(filename: str):
    """Extrae texto de un PDF y lo sube a Pinecone"""
    
    # 1. Obtener el archivo
    ruta_local = descargar_archivo_local(filename)

    # 2. Extraer texto
    try:
        pdf = fitz.open(ruta_local)
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
        raise HTTPException(status_code=500, detail=f"Error al procesar el PDF: {e}")

    # 3. Guardar en Pinecone
    try:
        embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=settings.OPENAI_API_KEY,
        )

        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        
        # Asegurar que el índice existe
        index_names = [idx.name for idx in pc.list_indexes()]
        if settings.PINECONE_INDEX_NAME not in index_names:
            pc.create_index(
                name=settings.PINECONE_INDEX_NAME,
                dimension=1536,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )

        vector_store = PineconeVectorStore(
            index_name=settings.PINECONE_INDEX_NAME,
            embedding=embeddings,
            pinecone_api_key=settings.PINECONE_API_KEY
        )
        
        vector_store.add_documents(documents)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en base de datos vectorial: {e}")

    return {
        "status": "ok",
        "archivo": filename,
        "chunks_subidos": len(documents),
    }

def borrar_fichero_vectorial_service(filename: str):
    """Elimina los vectores asociados a un archivo"""
    try:
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX_NAME)
        index.delete(filter={"file": {"$eq": filename}})
        return {"status": "ok", "message": f"Vectores de {filename} eliminados"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al borrar vectores: {e}")

def borrar_carpeta_vectorial_service(filenames: list):
    """Elimina los vectores asociados a una lista de archivos (Batch delete)"""
    if not filenames:
        return {"status": "ok", "message": "No hay archivos para borrar en Pinecone"}
        
    try:
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX_NAME)
        
        # Pinecone Serverless NO soporta $regex, pero sí $in
        # Borramos todos los vectores cuyo metadato "file" esté en la lista enviada
        index.delete(filter={"file": {"$in": filenames}})
        
        return {"status": "ok", "message": f"Vectores de {len(filenames)} archivos eliminados"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al borrar vectores en bloque: {e}")


