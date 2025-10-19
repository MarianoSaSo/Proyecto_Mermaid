from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.process_pdf_service import procesar_pdf_service

router = APIRouter()

class FileRequest(BaseModel):
    filename: str

@router.post("/procesar-pdf")
def procesar_pdf(req: FileRequest):
    try:
        result = procesar_pdf_service(req.filename)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))