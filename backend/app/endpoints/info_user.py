from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

# If you want to use Supabase in Python, install and import the Python client:
# pip install supabase
from supabase import create_client, Client


# Carga el .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter()

class User(BaseModel):
    id: str
    nombre: str
    apellidos: str
    telefono: Optional[str]
    email: Optional[str]
    nacionalidad: Optional[str]
    conectado: Optional[bool]
    codigo_verificacion: Optional[str]
    password: Optional[str]
    created_at: Optional[str]
    
@router.get("/info_user/{user_id}", response_model=User)
def get_user_info(user_id: str):
    try:
        # Hacemos la query a Supabase
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            user_data = response.data[0]
            return User(**user_data)  # lo convierte en el modelo User
        else:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/ /{user_id}")
def logout_user(user_id: str):
    try:
        # Actualizar el campo 'conectado' a false
        response = supabase.table("users").update({"conectado": False}).eq("id", user_id).execute()
        
        # Verificar si se actualizó algún registro (opcional, pero buena práctica)
        # Supabase suele devolver los datos actualizados en response.data
        
        return {"message": "Usuario desconectado correctamente"}
    
    except Exception as e:
        print(f"Error al desconectar usuario {user_id}: {e}")
        # No queremos bloquear el logout del frontend si falla la DB, 
        # pero devolvemos 500 para informar
        raise HTTPException(status_code=500, detail=str(e))
    
