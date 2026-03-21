import { FormularioPersonero } from './components/FormularioPersonero'

function PeruFlag() {
  return (
    <div className="flex gap-0.5 items-center" aria-hidden="true">
      <div className="w-3 h-5 bg-brand-red rounded-sm" />
      <div className="w-3 h-5 bg-white border border-gray-200 rounded-sm" />
      <div className="w-3 h-5 bg-brand-red rounded-sm" />
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-brand-navy shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PeruFlag />
            <div>
              <p className="text-white font-bold text-base leading-tight">Peruanos por el Cambio</p>
              <p className="text-blue-300 text-xs">Vigilancia electoral ciudadana</p>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-blue-200">
            <a href="#inscripcion" className="hover:text-white transition-colors">Inscríbete</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand-red bg-opacity-30 text-red-200 text-xs font-semibold px-3 py-1 rounded-full mb-5 uppercase tracking-wide">
              <span>Elecciones Presidenciales 2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
              Defiende tu voto.{' '}
              <span className="text-red-400">Defiende la democracia.</span>
            </h1>
            <p className="text-blue-200 text-base sm:text-lg leading-relaxed mb-8">
              Inscríbete como personero electoral y sé parte de la fiscalización
              ciudadana que garantizará elecciones limpias y transparentes en todo el Perú.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-200">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Proceso gratuito y voluntario</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Capacitación incluida</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>A nivel nacional</span>
              </div>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="overflow-hidden leading-none">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L1440 40L1440 10C1200 40 960 0 720 10C480 20 240 0 0 10L0 40Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Form Section */}
      <section id="inscripcion" className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-2">
            Formulario de inscripción
          </h2>
          <p className="text-gray-500 text-sm">
            Completa todos los campos con tus datos reales. La información es confidencial.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <FormularioPersonero />
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-brand-navy text-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-red-400">25</p>
              <p className="text-blue-300 text-xs sm:text-sm mt-1">Departamentos</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-red-400">200k+</p>
              <p className="text-blue-300 text-xs sm:text-sm mt-1">Meta de personeros</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-red-400">1</p>
              <p className="text-blue-300 text-xs sm:text-sm mt-1">Perú unido</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <PeruFlag />
            <span className="text-white font-semibold">Peruanos por el Cambio</span>
          </div>
          <p>
            Plataforma de registro de personeros electorales. Todos los derechos reservados © 2026.
          </p>
          <p className="mt-2 text-xs">
            Los datos recopilados se usarán exclusivamente para la coordinación de la fiscalización electoral.
          </p>
        </div>
      </footer>
    </div>
  )
}
