from pydantic import BaseModel, EmailStr, field_validator, model_validator
from datetime import datetime
from typing import Optional
from uuid import UUID
import re


LETRAS_PATTERN = re.compile(r"^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙñÑüÜ\s]+$")


class PersoneroCreate(BaseModel):
    nombres: str
    apellidos: str
    dni: str
    telefono: str
    email: EmailStr
    departamento: str
    provincia: str
    distrito: str
    local_votacion: Optional[str] = None
    turnstile_token: str

    @field_validator("nombres", "apellidos")
    @classmethod
    def validate_nombre(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Mínimo 2 caracteres")
        if not LETRAS_PATTERN.match(v):
            raise ValueError("Solo se permiten letras y espacios")
        return v

    @field_validator("dni")
    @classmethod
    def validate_dni(cls, v: str) -> str:
        if not re.match(r"^\d{8}$", v):
            raise ValueError("El DNI debe tener exactamente 8 dígitos numéricos")
        return v

    @field_validator("telefono")
    @classmethod
    def validate_telefono(cls, v: str) -> str:
        if not re.match(r"^9\d{8}$", v):
            raise ValueError("El teléfono debe tener 9 dígitos y empezar con 9")
        return v

    @field_validator("departamento", "provincia", "distrito")
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Este campo es requerido")
        return v.strip()

    @field_validator("local_votacion")
    @classmethod
    def validate_local(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return v.strip() or None
        return None

    @model_validator(mode="after")
    def validate_turnstile_not_empty(self):
        if not self.turnstile_token.strip():
            raise ValueError("Token de verificación requerido")
        return self


class PersoneroResponse(BaseModel):
    id: int
    codigo_registro: UUID
    nombres: str
    apellidos: str
    dni: str
    departamento: str
    provincia: str
    distrito: str
    dni_verificado: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PersoneroAdmin(BaseModel):
    id: int
    nombres: str
    apellidos: str
    dni: str
    telefono: str
    email: str
    departamento: str
    provincia: str
    distrito: str
    local_votacion: Optional[str]
    dni_verificado: bool
    ip_registro: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DniValidateRequest(BaseModel):
    dni: str

    @field_validator("dni")
    @classmethod
    def validate_dni(cls, v: str) -> str:
        if not re.match(r"^\d{8}$", v):
            raise ValueError("El DNI debe tener exactamente 8 dígitos numéricos")
        return v


class DniValidateResponse(BaseModel):
    valid: bool
    duplicado: bool = False
    message: Optional[str] = None


class StatsResponse(BaseModel):
    total: int
    verificados: int
    no_verificados: int
    por_departamento: dict[str, int]
