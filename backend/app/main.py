from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.endpoints import upload, info_user


app = FastAPI()

# --- Configuración CORS ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
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
app.include_router(info_user.router, prefix="/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "Backend funcionando correctamente"}

# Endpoint de prueba de CORS
@app.get("/test-cors")
def test_cors():
    return {"message": "CORS funciona correctamente ✅"}