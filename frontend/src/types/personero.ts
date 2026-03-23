export interface Departamento {
  id: string
  nombre: string
}

export interface Provincia {
  id: string
  nombre: string
}

export interface Distrito {
  id: string
  nombre: string
}

export interface PersoneroFormData {
  nombres: string
  apellidos: string
  dni: string
  telefono: string
  email: string
  departamento: string
  departamento_id: string
  provincia: string
  provincia_id: string
  distrito: string
  local_votacion?: string
  turnstile_token: string
}

export interface PersoneroResponse {
  id: number
  codigo_registro: string
  nombres: string
  apellidos: string
  dni: string
  departamento: string
  provincia: string
  distrito: string
  dni_verificado: boolean
  created_at: string
}

export interface ApiError {
  detail: string | { msg: string; loc: string[] }[]
}
