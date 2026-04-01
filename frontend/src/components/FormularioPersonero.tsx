import { useState, useCallback, forwardRef, useRef } from 'react'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SelectorUbicacion } from './SelectorUbicacion'
import { CaptchaWidget } from './CaptchaWidget'
import { registrarPersonero, getErrorMessage } from '../services/api'
import type { PersoneroResponse } from '../types/personero'

const LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙñÑüÜ\s]+$/

const soloNumeros = (e: React.FormEvent<HTMLInputElement>) => {
  e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '')
}

const PALABRAS_BLOQUEADAS = [
  // Insultos directos
  'idiota', 'imbecil', 'imbécil', 'estupido', 'estúpido', 'estupida', 'estúpida',
  'pendejo', 'pendeja', 'pendejos', 'pendejas',
  'huevon', 'huevona', 'huevones', 'huevonas', 'huevón', 'huevona',
  'cojudo', 'cojuda', 'cojudos', 'cojudas',
  'maricón', 'marica', 'maricon',
  'puta', 'putas', 'puto', 'putos', 'putita',
  'mierda', 'mierdas', 'mierdon', 'mierdoso', 'mierdosa',
  'cabrón', 'cabron', 'cabrona', 'cabrones',
  'bastardo', 'bastarda', 'bastardos',
  'hdp', 'hijodeputa', 'hijo de puta', 'hijadeputa', 'hija de puta',
  'concha', 'conchatumadre', 'conchadetumare',
  'cholo', 'chola', 'cholos', 'cholas',
  'serrano', 'serrana', 'serranos', 'serranas',
  'negro', 'negra', 'negros', 'negras',
  'indio', 'india', 'indios', 'indias',
  'mongol', 'mongola', 'mongoles',
  'retrasado', 'retrasada', 'retardo',
  'tarado', 'tarada', 'tarados',
  'animal', 'bestia', 'burro', 'burra',
  'gil', 'giles', 'otario', 'otaria',
  'pelotudo', 'pelotuda', 'pelotudos',
  'boludo', 'boluda', 'boludos',
  'forro', 'forra', 'forros',
  'sorete', 'soretes',
  'weon', 'weón', 'weon', 'weona',
  'culiao', 'culiado', 'culiada',
  'ctm', 'lacto', 'lacra',
  // Contenido sexual explícito
  'pene', 'penes', 'pija', 'pijas', 'verga', 'vergas',
  'vagina', 'vaginas', 'coño', 'cono',
  'culo', 'culos', 'nalgas', 'tetas', 'teta',
  'sexo', 'porno', 'pornografia', 'pornografía',
  'follar', 'coger', 'culiar', 'mamar',
  // Términos despectivos
  'terrorista', 'terroristas', 'narco', 'narcos',
  'comunista', 'comunistas', 'fujimorista',
  'corrupto', 'corrupta', 'corruptos',
]

function contienepalabrabloqueada(texto: string): boolean {
  const normalizado = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-z\s]/g, '')        // solo letras y espacios

  return PALABRAS_BLOQUEADAS.some((palabra) => {
    const palabraNormalizada = palabra
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    return normalizado.split(/\s+/).includes(palabraNormalizada)
  })
}

const schema = z.object({
  nombres: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .regex(LETRAS, 'Solo letras y espacios')
    .refine((v) => !contienepalabrabloqueada(v), 'El nombre ingresado no es válido'),
  apellidos: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .regex(LETRAS, 'Solo letras y espacios')
    .refine((v) => !contienepalabrabloqueada(v), 'El apellido ingresado no es válido'),
  dni: z
    .string()
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d{8}$/, 'Solo dígitos numéricos'),
  telefono: z
    .string()
    .regex(/^9\d{8}$/, 'Debe tener 9 dígitos y empezar con 9'),
  departamento: z.string().min(1, 'Selecciona un departamento'),
  departamento_id: z.string(),
  provincia: z.string().min(1, 'Selecciona una provincia'),
  provincia_id: z.string(),
  distrito: z.string().min(1, 'Selecciona un distrito'),
  local_votacion: z
    .string()
    .optional()
    .refine((v) => !v || !contienepalabrabloqueada(v), 'El local de votación ingresado no es válido'),
  turnstile_token: z.string().min(1, 'Completa la verificación de seguridad'),
})

type FormData = z.infer<typeof schema>

const REQUIRED_FIELDS: (keyof FormData)[] = [
  'nombres', 'apellidos', 'dni', 'telefono',
  'departamento', 'provincia', 'distrito', 'turnstile_token',
]

interface SuccessState {
  codigo_registro: string
  nombres: string
  apellidos: string
}

const InputField = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string
    error?: string
    required?: boolean
    hint?: string
  }
>(function InputField({ label, id, error, required, hint, ...props }, ref) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-brand-red">*</span>}
      </label>
      <input
        id={id}
        ref={ref}
        className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
})

export function FormularioPersonero() {
  const [success, setSuccess] = useState<SuccessState | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const captchaRef = useRef<TurnstileInstance>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombres: '', apellidos: '', dni: '', telefono: '',
      departamento: '', departamento_id: '',
      provincia: '', provincia_id: '', distrito: '',
      local_votacion: '', turnstile_token: '',
    },
  })

  const watchedFields = watch(REQUIRED_FIELDS)
  const completedCount = watchedFields.filter((v) => v && String(v).length > 0).length
  const progress = Math.round((completedCount / REQUIRED_FIELDS.length) * 100)

  const handleCaptchaSuccess = useCallback(
    (token: string) => setValue('turnstile_token', token, { shouldValidate: true }),
    [setValue],
  )
  const handleCaptchaExpire = useCallback(
    () => setValue('turnstile_token', '', { shouldValidate: true }),
    [setValue],
  )

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const response: PersoneroResponse = await registrarPersonero({
        nombres: data.nombres.trim(),
        apellidos: data.apellidos.trim(),
        dni: data.dni,
        telefono: data.telefono,
        departamento: data.departamento,
        provincia: data.provincia,
        distrito: data.distrito,
        local_votacion: data.local_votacion?.trim() || undefined,
        turnstile_token: data.turnstile_token,
      })
      setSuccess({
        codigo_registro: response.codigo_registro,
        nombres: response.nombres,
        apellidos: response.apellidos,
      })
    } catch (err) {
      setSubmitError(getErrorMessage(err))
      // El token de Turnstile se consume en cada request — siempre resetear
      captchaRef.current?.reset()
      setValue('turnstile_token', '')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="animate-slide-up text-center py-10 px-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-brand-navy mb-2">¡Inscripción exitosa!</h2>
        <p className="text-gray-600 mb-4">
          <strong>{success.nombres} {success.apellidos}</strong>, tu inscripción fue registrada correctamente.
        </p>
        <div className="inline-block bg-brand-navy text-white px-6 py-3 rounded-lg font-mono text-sm tracking-wide">
          {success.codigo_registro.toUpperCase()}
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Guarda este número. Te contactaremos con más información sobre tus funciones como voluntario.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Barra de progreso */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progreso del formulario</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-brand-red rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Datos personales */}
      <fieldset>
        <legend className="text-base font-semibold text-brand-navy mb-4 pb-2 border-b border-gray-200 w-full">
          Datos personales
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Nombres"
            id="nombres"
            required
            placeholder="Ej: Juan Carlos"
            autoComplete="given-name"
            error={errors.nombres?.message}
            {...register('nombres')}
          />
          <InputField
            label="Apellidos"
            id="apellidos"
            required
            placeholder="Ej: García López"
            autoComplete="family-name"
            error={errors.apellidos?.message}
            {...register('apellidos')}
          />
          <InputField
            label="DNI"
            id="dni"
            required
            placeholder="12345678"
            maxLength={8}
            inputMode="numeric"
            autoComplete="off"
            hint="8 dígitos numéricos"
            onInput={soloNumeros}
            error={errors.dni?.message}
            {...register('dni')}
          />
          <InputField
            label="Teléfono celular"
            id="telefono"
            required
            placeholder="987654321"
            maxLength={9}
            inputMode="tel"
            autoComplete="tel"
            hint="9 dígitos, empieza con 9"
            onInput={soloNumeros}
            error={errors.telefono?.message}
            {...register('telefono')}
          />
        </div>
      </fieldset>

      {/* Ubicación */}
      <fieldset>
        <legend className="text-base font-semibold text-brand-navy mb-4 pb-2 border-b border-gray-200 w-full">
          Ubicación de votación
        </legend>
        <SelectorUbicacion
          register={register}
          errors={errors}
          onDepartamentoChange={(id, nombre) => {
            setValue('departamento_id', id, { shouldValidate: false })
            setValue('departamento', nombre, { shouldValidate: true })
            setValue('provincia', '', { shouldValidate: false })
            setValue('provincia_id', '', { shouldValidate: false })
            setValue('distrito', '', { shouldValidate: false })
          }}
          onProvinciaChange={(id, nombre) => {
            setValue('provincia_id', id, { shouldValidate: false })
            setValue('provincia', nombre, { shouldValidate: true })
            setValue('distrito', '', { shouldValidate: false })
          }}
          onDistritoChange={(nombre) => {
            setValue('distrito', nombre, { shouldValidate: true })
          }}
        />

        <div className="mt-4">
          <InputField
            label="Local de votación"
            id="local_votacion"
            placeholder="Ej: I.E. San Martín de Porres (opcional)"
            hint="Si conoces el nombre de tu local de votación, ingresalo aquí"
            error={errors.local_votacion?.message}
            {...register('local_votacion')}
          />
        </div>
      </fieldset>

      {/* Verificación */}
      <fieldset>
        <legend className="text-base font-semibold text-brand-navy mb-4 pb-2 border-b border-gray-200 w-full">
          Verificación de seguridad
        </legend>
        <CaptchaWidget
          ref={captchaRef}
          onSuccess={handleCaptchaSuccess}
          onExpire={handleCaptchaExpire}
          onError={handleCaptchaExpire}
        />
        {errors.turnstile_token && (
          <p className="mt-2 text-sm text-red-600 text-center">{errors.turnstile_token.message}</p>
        )}
      </fieldset>

      {/* Error global */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 bg-brand-red hover:bg-brand-red-dark disabled:bg-gray-400 text-white font-bold text-lg rounded-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-brand-red focus:ring-opacity-40 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Registrando...
          </span>
        ) : (
          'Inscribirme como Voluntario'
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        Al inscribirte aceptas que tus datos sean utilizados exclusivamente para la coordinación de
        voluntarios electorales. No compartiremos tu información con terceros.
      </p>
    </form>
  )
}
