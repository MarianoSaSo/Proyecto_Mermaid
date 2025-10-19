from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.endpoints import upload

app = FastAPI()

# --- Configuración CORS ---
origins = [
    "http://localhost:5173",  # React (puerto típico de Vite)
    # "http://localhost:3000",  # Si usas create-react-app
    # "https://tudominio.com",  # Puedes añadir tu dominio cuando hagas deploy
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Permite estos orígenes
    allow_credentials=True,
    allow_methods=["*"],         # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],         # Permite todos los headers
)

# --- Endpoints ---
app.include_router(upload.router, prefix="/upload", tags=["Upload"])

@app.get("/")
def root():
    return {"message": "Backend funcionando correctamente"}

# Endpoint de prueba de CORS
@app.get("/test-cors")
def test_cors():
    return {"message": "CORS funciona correctamente ✅"}