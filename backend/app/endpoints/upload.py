from fastapi import APIRouter, HTTPException
from app.schemas.upload import FileProcessRequest, FileProcessResponse, VectorDeleteResponse
from app.services.process_pdf_service import (
    procesar_pdf_service, 
    borrar_fichero_vectorial_service, 
    borrar_carpeta_vectorial_service
)



router = APIRouter()

@router.post("/procesar-pdf", response_model=FileProcessResponse)
async def procesar_pdf(req: FileProcessRequest):
    """Endpoint para extraer texto de un PDF en MinIO y vectorizarlo"""
    return procesar_pdf_service(req.filename)

@router.delete("/delete-vectors", response_model=VectorDeleteResponse)
async def delete_vectors(req: FileProcessRequest):
    """Elimina los vectores de un archivo específico"""
    return borrar_fichero_vectorial_service(req.filename)

@router.delete("/delete-folder-vectors", response_model=VectorDeleteResponse)
async def delete_folder_vectors(req: FileProcessRequest):
    """Elimina los vectores de todos los archivos dentro de una carpeta"""
    return borrar_carpeta_vectorial_service(req.filename)