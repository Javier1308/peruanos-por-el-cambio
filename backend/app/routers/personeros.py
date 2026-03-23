from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.personero import Personero
from app.schemas.personero import PersoneroCreate, PersoneroResponse, DniValidateRequest, DniValidateResponse
from app.services.turnstile import verify_turnstile
from app.services.dni_validator import validate_dni
from app.middleware.rate_limiter import limiter

router = APIRouter(tags=["personeros"])


@router.post("/personeros", response_model=PersoneroResponse, status_code=201)
@limiter.limit("5/10 minutes")
async def registrar_personero(
    request: Request,
    data: PersoneroCreate,
    db: AsyncSession = Depends(get_db),
):
    # 1. Verificar Turnstile
    ip = request.client.host if request.client else "unknown"
    turnstile_ok = await verify_turnstile(data.turnstile_token, ip)
    if not turnstile_ok:
        raise HTTPException(status_code=403, detail="Verificación de seguridad fallida. Recarga la página e intenta nuevamente.")

    # 2. Verificar DNI duplicado
    result = await db.execute(select(Personero).where(Personero.dni == data.dni))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Ya existe un registro con este DNI.")

    # 3. Validar DNI contra API externa
    dni_result = await validate_dni(data.dni)
    if dni_result.get("reason") == "not_found":
        raise HTTPException(status_code=422, detail="El DNI ingresado no existe en RENIEC. Verifica el número e intenta nuevamente.")
    dni_verificado = dni_result.get("valid", False)

    # 4. Crear personero
    personero = Personero(
        nombres=data.nombres,
        apellidos=data.apellidos,
        dni=data.dni,
        telefono=data.telefono,
        email=data.email,
        departamento=data.departamento,
        provincia=data.provincia,
        distrito=data.distrito,
        local_votacion=data.local_votacion,
        dni_verificado=dni_verificado,
        ip_registro=ip,
    )

    db.add(personero)
    await db.flush()
    await db.refresh(personero)
    return personero


@router.post("/validar-dni", response_model=DniValidateResponse)
@limiter.limit("10/5 minutes")
async def validar_dni(
    request: Request,
    data: DniValidateRequest,
):
    result = await validate_dni(data.dni)
    return DniValidateResponse(**result)
