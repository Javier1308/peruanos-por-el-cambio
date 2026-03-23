from collections import Counter


def validate_dni_local(dni: str) -> dict:
    """
    Valida un DNI peruano con reglas heurísticas locales.
    No consulta APIs externas.

    Retorna dict con:
      - valid: bool
      - reason: "suspicious" | "format_ok"
      - message: descripción del resultado
    """
    # 1. Todos los dígitos iguales: 00000000, 11111111, 99999999
    if len(set(dni)) == 1:
        return {
            "valid": False,
            "reason": "suspicious",
            "message": "DNI inválido: todos los dígitos son iguales",
        }

    digits = [int(d) for d in dni]
    diffs = [digits[i + 1] - digits[i] for i in range(7)]

    # 2. Secuencia ascendente estricta: 12345678, 23456789
    if all(d == 1 for d in diffs):
        return {
            "valid": False,
            "reason": "suspicious",
            "message": "DNI inválido: secuencia ascendente consecutiva",
        }

    # 3. Secuencia descendente estricta: 98765432, 87654321
    if all(d == -1 for d in diffs):
        return {
            "valid": False,
            "reason": "suspicious",
            "message": "DNI inválido: secuencia descendente consecutiva",
        }

    # 4. Primera mitad repetida en segunda mitad: 12341234, 56785678
    if dni[:4] == dni[4:]:
        return {
            "valid": False,
            "reason": "suspicious",
            "message": "DNI inválido: patrón repetido (ABCDABCD)",
        }

    # 5. Par alternado: 12121212, 34343434, 56565656
    pares = len(set(dni[i] for i in range(0, 8, 2))) == 1
    impares = len(set(dni[i] for i in range(1, 8, 2))) == 1
    if pares and impares and dni[0] != dni[1]:
        return {
            "valid": False,
            "reason": "suspicious",
            "message": "DNI inválido: patrón alternado (ABABABAB)",
        }

    # 6. Demasiados dígitos iguales (6 o más del mismo dígito)
    if max(Counter(dni).values()) >= 6:
        return {
            "valid": False,
            "reason": "suspicious",
            "message": "DNI inválido: demasiados dígitos repetidos",
        }

    # 7. Rango numérico inválido
    #    - Mínimo: 1,000,000 (por debajo son números no emitidos o de prueba)
    #    - Máximo: 87,000,000 (estimado de DNIs emitidos en Perú a 2026)
    num = int(dni)
    if num < 1_000_000:
        return {
            "valid": False,
            "reason": "suspicious",
            "message": "DNI inválido: número por debajo del rango emitido",
        }
    if num > 87_000_000:
        return {
            "valid": False,
            "reason": "suspicious",
            "message": "DNI inválido: número por encima del rango emitido",
        }

    return {"valid": True, "reason": "format_ok", "message": "DNI con formato válido"}
