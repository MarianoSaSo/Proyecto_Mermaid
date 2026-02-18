from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    nombre: str
    apellidos: str
    email: str
    telefono: Optional[str] = None
    nacionalidad: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    conectado: bool
    created_at: Optional[str] = None
    codigo_qr: Optional[str] = None

    class Config:
        from_attributes = True

class UserLogoutResponse(BaseModel):
    message: str
