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
                "https://api.decolecta.com/v1/reniec/dni",
                params={"numero": dni},
                headers={
                    "Authorization": f"Bearer {settings.DNI_API_TOKEN}",
                    "Referer": "python-decolecta",
                },
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "valid": True,
                    "reason": "found",
                    "nombres": data.get("nombres", ""),
                    "apellido_paterno": data.get("apellidoPaterno", ""),
                    "apellido_materno": data.get("apellidoMaterno", ""),
                }

            if response.status_code in (404, 422):
                return {"valid": False, "reason": "not_found", "message": "DNI no encontrado en RENIEC"}

            if response.status_code == 401:
                return {"valid": False, "reason": "api_error", "message": "Token de API inválido"}

            if response.status_code == 429:
                return {"valid": False, "reason": "api_error", "message": "Límite de consultas alcanzado"}

    except httpx.TimeoutException:
        return {"valid": False, "reason": "api_error", "message": "Timeout al consultar API de DNI"}
    except Exception:
        pass

    return {"valid": False, "reason": "api_error", "message": "Error al consultar API de DNI"}
