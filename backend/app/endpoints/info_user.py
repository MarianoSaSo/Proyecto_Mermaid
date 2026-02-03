from fastapi import APIRouter, HTTPException, status
from typing import List
from app.core.config import settings
from app.schemas.user import UserResponse, UserLogoutResponse
from supabase import create_client, Client

router = APIRouter()

# Cliente de Supabase centralizado
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

@router.get("/info_user/{user_id}", response_model=UserResponse)
async def get_user_info(user_id: str):
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Usuario no encontrado"
            )
            
        return response.data[0]
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error al obtener información del usuario: {str(e)}"
        )

import logging
logger = logging.getLogger(__name__)

@router.post("/logout/{user_id}", response_model=UserLogoutResponse)
async def logout_user(user_id: str):
    try:
        # Actualizar el campo 'conectado' a false
        supabase.table("users").update({"conectado": False}).eq("id", user_id).execute()
        
        return {"message": "Usuario desconectado correctamente"}
    
    except Exception as e:
        logger.error(f"Error al desconectar usuario {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Error interno al procesar el logout"
        )
