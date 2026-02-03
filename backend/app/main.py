from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.endpoints import upload, info_user

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend para la gestión de documentos y usuarios de Mermaid AI"
)

# --- Configuración CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Registro de Rutas ---
# Podríamos añadir un prefijo global si quisiéramos: app.include_router(upload.router, prefix="/api/v1")
app.include_router(upload.router, prefix="/upload", tags=["Gestión de Archivos"])
app.include_router(info_user.router, prefix="/users", tags=["Gestión de Usuarios"])

@app.get("/", tags=["Sistema"])
async def root():
    return {
        "message": f"Bienvenido a la API de {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "status": "online"
    }

@app.get("/health", tags=["Sistema"])
async def health_check():
    return {"status": "healthy"}