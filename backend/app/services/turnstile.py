import httpx
from app.config import settings

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_turnstile(token: str, ip: str | None = None) -> bool:
    """
    Verifica el token de Cloudflare Turnstile.
    Retorna True si es válido, False en caso contrario.
    """
    payload = {
        "secret": settings.TURNSTILE_SECRET_KEY,
        "response": token,
    }
    if ip:
        payload["remoteip"] = ip

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(TURNSTILE_VERIFY_URL, data=payload)
            response.raise_for_status()
            result = response.json()
            return bool(result.get("success", False))
    except Exception:
        # Si falla la verificación de Turnstile, rechazamos por seguridad
        return False
