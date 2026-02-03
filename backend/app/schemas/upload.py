from pydantic import BaseModel

from typing import List, Optional

class FileProcessRequest(BaseModel):
    filename: str
    filenames: Optional[List[str]] = None

class FileProcessResponse(BaseModel):
    status: str
    archivo: str
    chunks_subidos: int

class VectorDeleteResponse(BaseModel):
    status: str
    message: str