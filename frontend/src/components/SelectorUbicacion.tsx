import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { useUbicacion } from '../hooks/useUbicacion'

type UbicacionFields = {
  departamento: string
  provincia: string
  distrito: string
  [key: string]: unknown
}

interface SelectorUbicacionProps {
  register: UseFormRegister<UbicacionFields>
  errors: FieldErrors<UbicacionFields>
  onDepartamentoChange: (id: string, nombre: string) => void
  onProvinciaChange: (id: string, nombre: string) => void
  onDistritoChange: (nombre: string) => void
}

function SelectField({
  label,
  id,
  disabled,
  loading,
  placeholder,
  error,
  children,
  required,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  loading?: boolean
  placeholder: string
  error?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-brand-red">*</span>}
      </label>
      <select
        id={id}
        disabled={disabled || loading}
        className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
        }`}
        {...props}
      >
        <option value="">{loading ? 'Cargando...' : placeholder}</option>
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function SelectorUbicacion({
  register,
  errors,
  onDepartamentoChange,
  onProvinciaChange,
  onDistritoChange,
}: SelectorUbicacionProps) {
  const {
    departamentos,
    provincias,
    distritos,
    selectedDeptId,
    setSelectedDeptId,
    setSelectedProvId,
    loadingDept,
    loadingProv,
    loadingDist,
  } = useUbicacion()

  return (
    <div className="space-y-4">
      <SelectField
        label="Departamento"
        id="departamento"
        required
        loading={loadingDept}
        placeholder="Selecciona tu departamento"
        error={errors.departamento?.message}
        {...register('departamento')}
        onChange={(e) => {
          const selected = departamentos.find((d) => d.nombre === e.target.value)
          if (selected) {
            setSelectedDeptId(selected.id)
            onDepartamentoChange(selected.id, selected.nombre)
          } else {
            setSelectedDeptId('')
            onDepartamentoChange('', '')
          }
        }}
      >
        {departamentos.map((d) => (
          <option key={d.id} value={d.nombre}>
            {d.nombre}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Provincia"
        id="provincia"
        required
        disabled={!selectedDeptId}
        loading={loadingProv}
        placeholder={selectedDeptId ? 'Selecciona tu provincia' : 'Primero selecciona departamento'}
        error={errors.provincia?.message}
        {...register('provincia')}
        onChange={(e) => {
          const selected = provincias.find((p) => p.nombre === e.target.value)
          if (selected) {
            setSelectedProvId(selected.id)
            onProvinciaChange(selected.id, selected.nombre)
          } else {
            setSelectedProvId('')
            onProvinciaChange('', '')
          }
        }}
      >
        {provincias.map((p) => (
          <option key={p.id} value={p.nombre}>
            {p.nombre}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Distrito"
        id="distrito"
        required
        disabled={!selectedDeptId}
        loading={loadingDist}
        placeholder={
          distritos.length === 0 && !loadingDist
            ? 'Selecciona tu provincia primero'
            : 'Selecciona tu distrito'
        }
        error={errors.distrito?.message}
        {...register('distrito')}
        onChange={(e) => {
          onDistritoChange(e.target.value)
        }}
      >
        {distritos.map((d) => (
          <option key={d.id} value={d.nombre}>
            {d.nombre}
          </option>
        ))}
      </SelectField>
    </div>
  )
}
