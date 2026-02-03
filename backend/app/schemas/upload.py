from pydantic import BaseModel

class FileProcessRequest(BaseModel):
    filename: str

class FileProcessResponse(BaseModel):
    status: str
    archivo: str
    chunks_subidos: int

class VectorDeleteResponse(BaseModel):
    status: str
    message: str
