import { useState, useEffect } from 'react'
import { getDepartamentos, getProvincias, getDistritos } from '../services/api'
import type { Departamento, Provincia, Distrito } from '../types/personero'

export function useUbicacion() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [provincias, setProvincias] = useState<Provincia[]>([])
  const [distritos, setDistritos] = useState<Distrito[]>([])

  const [selectedDeptId, setSelectedDeptId] = useState('')
  const [selectedProvId, setSelectedProvId] = useState('')

  const [loadingDept, setLoadingDept] = useState(true)
  const [loadingProv, setLoadingProv] = useState(false)
  const [loadingDist, setLoadingDist] = useState(false)

  useEffect(() => {
    getDepartamentos()
      .then(setDepartamentos)
      .finally(() => setLoadingDept(false))
  }, [])

  useEffect(() => {
    if (!selectedDeptId) {
      setProvincias([])
      setDistritos([])
      setSelectedProvId('')
      return
    }
    setLoadingProv(true)
    setProvincias([])
    setDistritos([])
    setSelectedProvId('')
    getProvincias(selectedDeptId)
      .then(setProvincias)
      .finally(() => setLoadingProv(false))
  }, [selectedDeptId])

  useEffect(() => {
    if (!selectedProvId) {
      setDistritos([])
      return
    }
    setLoadingDist(true)
    setDistritos([])
    getDistritos(selectedProvId)
      .then(setDistritos)
      .finally(() => setLoadingDist(false))
  }, [selectedProvId])

  return {
    departamentos,
    provincias,
    distritos,
    selectedDeptId,
    selectedProvId,
    setSelectedDeptId,
    setSelectedProvId,
    loadingDept,
    loadingProv,
    loadingDist,
  }
}
