from sqlalchemy import Column, Integer, String, Boolean, text
from sqlalchemy.dialects.postgresql import INET, TIMESTAMP, UUID
from app.database import Base


class Personero(Base):
    __tablename__ = "personeros"

    id = Column(Integer, primary_key=True, index=True)
    codigo_registro = Column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
        index=True,
    )
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    dni = Column(String(8), unique=True, nullable=False, index=True)
    telefono = Column(String(9), nullable=False)
    email = Column(String(255), nullable=True)
    departamento = Column(String(50), nullable=False, index=True)
    provincia = Column(String(50), nullable=False)
    distrito = Column(String(50), nullable=False)
    local_votacion = Column(String(255), nullable=True)
    dni_verificado = Column(Boolean, default=False, nullable=False)
    ip_registro = Column(INET, nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("NOW()"),
        nullable=False,
    )
