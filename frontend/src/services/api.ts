import axios from 'axios'
import type { Departamento, Provincia, Distrito, PersoneroResponse } from '../types/personero'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

export interface RegistroPayload {
  nombres: string
  apellidos: string
  dni: string
  telefono: string
  email: string
  departamento: string
  provincia: string
  distrito: string
  local_votacion?: string
  turnstile_token: string
}

export async function getDepartamentos(): Promise<Departamento[]> {
  const { data } = await api.get<Departamento[]>('/api/v1/departamentos')
  return data
}

export async function getProvincias(departamentoId: string): Promise<Provincia[]> {
  const { data } = await api.get<Provincia[]>(`/api/v1/provincias/${departamentoId}`)
  return data
}

export async function getDistritos(provinciaId: string): Promise<Distrito[]> {
  const { data } = await api.get<Distrito[]>(`/api/v1/distritos/${provinciaId}`)
  return data
}

export async function registrarPersonero(payload: RegistroPayload): Promise<PersoneroResponse> {
  const { data } = await api.post<PersoneroResponse>('/api/v1/personeros', payload)
  return data
}

export async function validarDni(dni: string): Promise<{
  valid: boolean
  duplicado: boolean
  message?: string
}> {
  const { data } = await api.post('/api/v1/validar-dni', { dni })
  return data
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((e: { msg: string }) => e.msg).join(', ')
    }
    if (error.response?.status === 429) {
      return 'Demasiadas solicitudes. Por favor espera unos minutos antes de intentar nuevamente.'
    }
    if (error.response?.status === 409) {
      return 'Ya existe un registro con este DNI.'
    }
  }
  return 'Ocurrió un error inesperado. Por favor intenta nuevamente.'
}
