import json
from pathlib import Path
from functools import lru_cache
from fastapi import APIRouter, HTTPException, Request
from app.middleware.rate_limiter import limiter

router = APIRouter(tags=["ubicacion"])

DATA_PATH = Path(__file__).parent.parent / "data" / "ubigeo.json"


@lru_cache(maxsize=1)
def load_ubigeo() -> dict:
    with open(DATA_PATH, encoding="utf-8") as f:
        return json.load(f)


@router.get("/departamentos")
@limiter.limit("60/minute")
async def get_departamentos(request: Request):
    data = load_ubigeo()
    return data["departamentos"]


@router.get("/provincias/{departamento_id}")
@limiter.limit("60/minute")
async def get_provincias(request: Request, departamento_id: str):
    data = load_ubigeo()
    provincias = data["provincias"].get(departamento_id)
    if provincias is None:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    return provincias


@router.get("/distritos/{provincia_id}")
@limiter.limit("60/minute")
async def get_distritos(request: Request, provincia_id: str):
    data = load_ubigeo()
    distritos = data["distritos"].get(provincia_id)
    if distritos is None:
        raise HTTPException(status_code=404, detail="Provincia no encontrada")
    return distritos
