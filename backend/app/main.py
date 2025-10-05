
from fastapi import FastAPI
from app.endpoints import upload  # Esto debería funcionar ahora


app = FastAPI()
app.include_router(upload.router, prefix="/upload", tags=["Upload"])

@app.get("/")
def root():
    return {"message": "Backend funcionando"}