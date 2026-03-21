import httpx
from app.config import settings


async def validate_dni(dni: str) -> dict:
    """
    Valida un DNI contra la API de apis.net.pe.
    Retorna dict con: valid, nombres, apellido_paterno, apellido_materno.
    Si la API no responde, retorna valid=False para permitir el registro
    sin verificación.
    """
    if not settings.DNI_API_TOKEN:
        return {"valid": False, "message": "API token no configurado"}

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                settings.DNI_API_URL,
                params={"numero": dni},
                headers={
                    "Authorization": f"Bearer {settings.DNI_API_TOKEN}",
                    "Accept": "application/json",
                },
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "valid": True,
                    "nombres": data.get("nombres", ""),
                    "apellido_paterno": data.get("apellidoPaterno", ""),
                    "apellido_materno": data.get("apellidoMaterno", ""),
                }

            if response.status_code == 404:
                return {"valid": False, "message": "DNI no encontrado en RENIEC"}

    except httpx.TimeoutException:
        return {"valid": False, "message": "Timeout al consultar API de DNI"}
    except Exception:
        pass

    return {"valid": False, "message": "Error al consultar API de DNI"}
