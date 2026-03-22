"""
Descarga el ubigeo oficial de INEI (geodir/ubigeo-peru) y genera
backend/app/data/ubigeo.json en el formato que usa la API.

Uso:
    python backend/scripts/generar_ubigeo.py
"""

import csv
import json
import io
import urllib.request
from pathlib import Path

CSV_URL = "https://raw.githubusercontent.com/geodir/ubigeo-peru/master/geodir-ubigeo-inei.csv"
OUTPUT_PATH = Path(__file__).parent.parent / "app" / "data" / "ubigeo.json"


def main():
    print(f"Descargando ubigeo desde {CSV_URL} ...")
    with urllib.request.urlopen(CSV_URL) as response:
        content = response.read().decode("utf-8-sig")  # utf-8-sig elimina BOM si existe

    reader = csv.DictReader(io.StringIO(content))
    rows = list(reader)
    print(f"Filas descargadas: {len(rows)}")

    departamentos_map: dict[str, str] = {}   # id → nombre
    provincias_map: dict[str, dict[str, str]] = {}  # dep_id → {prov_id → nombre}
    distritos_map: dict[str, dict[str, str]] = {}   # prov_id → {dist_id → nombre}

    for row in rows:
        ubigeo = row.get("Ubigeo", "").strip().zfill(6)
        if len(ubigeo) != 6:
            continue

        dep_id   = ubigeo[:2]
        prov_id  = ubigeo[:4]
        dist_id  = ubigeo[:6]

        dep_nombre  = row.get("Departamento", "").strip().upper()
        prov_nombre = row.get("Provincia", "").strip().upper()
        dist_nombre = row.get("Distrito", "").strip().upper()

        if not dep_nombre or not prov_nombre or not dist_nombre:
            continue

        # Departamentos
        if dep_id not in departamentos_map:
            departamentos_map[dep_id] = dep_nombre

        # Provincias por departamento
        if dep_id not in provincias_map:
            provincias_map[dep_id] = {}
        if prov_id not in provincias_map[dep_id]:
            provincias_map[dep_id][prov_id] = prov_nombre

        # Distritos por provincia
        if prov_id not in distritos_map:
            distritos_map[prov_id] = {}
        if dist_id not in distritos_map[prov_id]:
            distritos_map[prov_id][dist_id] = dist_nombre

    # Construir estructura final
    result = {
        "departamentos": [
            {"id": dep_id, "nombre": nombre}
            for dep_id, nombre in sorted(departamentos_map.items())
        ],
        "provincias": {
            dep_id: [
                {"id": prov_id, "nombre": nombre}
                for prov_id, nombre in sorted(provs.items())
            ]
            for dep_id, provs in sorted(provincias_map.items())
        },
        "distritos": {
            prov_id: [
                {"id": dist_id, "nombre": nombre}
                for dist_id, nombre in sorted(dists.items())
            ]
            for prov_id, dists in sorted(distritos_map.items())
        },
    }

    total_dep  = len(result["departamentos"])
    total_prov = sum(len(v) for v in result["provincias"].values())
    total_dist = sum(len(v) for v in result["distritos"].values())
    print(f"Departamentos: {total_dep}")
    print(f"Provincias:    {total_prov}")
    print(f"Distritos:     {total_dist}")

    OUTPUT_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nArchivo generado: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
