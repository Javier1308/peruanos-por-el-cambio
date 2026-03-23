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
            <a href="#nosotros" className="hover:text-white transition-colors">Nosotros</a>
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

      {/* Nosotros Section */}
      <section id="nosotros" className="bg-white">
        {/* Quiénes somos */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Imagen */}
            <div className="relative">
              <div className="absolute -inset-2 bg-brand-red opacity-10 rounded-2xl" />
              <img
                src="/RunaChay2.jpeg"
                alt="Guerrero patriota"
                className="relative w-full max-w-sm mx-auto rounded-2xl shadow-xl object-cover"
              />
            </div>

            {/* Texto */}
            <div>
              <span className="inline-block text-brand-red text-xs font-bold uppercase tracking-widest mb-3">
                ¿Quiénes somos?
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy leading-tight mb-5">
                Demócratas, liberales<br />y patriotas
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Somos peruanos que amamos nuestro país, defendemos la vida y la libertad, y creemos
                en la igualdad de oportunidades. No buscamos favorecer a ningún partido —
                buscamos <strong className="text-brand-navy">cuidar nuestro voto</strong>, que está en riesgo.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Nos roban en las calles, en los ministerios, en las alcaldías y en los gobiernos
                regionales. <strong className="text-brand-navy">No dejemos que nos roben también los votos.</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {['Democracia', 'Libertad', 'Transparencia', 'Propiedad privada', 'Anticorrupción'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-brand-navy text-white text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lo que queremos */}
        <div className="bg-gray-50 py-14 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="inline-block text-brand-red text-xs font-bold uppercase tracking-widest mb-2">
                Nuestra misión
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-brand-navy">
                Lo que queremos para el Perú
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: '💧', title: 'Agua y desagüe', desc: 'Para todos los peruanos que hoy carecen de estos servicios básicos.' },
                { icon: '📚', title: 'Educación de calidad', desc: 'Mejores aulas y oportunidades reales para los niños en situación de pobreza.' },
                { icon: '🏥', title: 'Salud y nutrición', desc: 'Reducir la anemia y que los hospitales funcionen para quien más lo necesita.' },
                { icon: '🛣️', title: 'Infraestructura', desc: 'Carreteras terminadas y obras que realmente lleguen a las regiones.' },
                { icon: '⚖️', title: 'Justicia real', desc: 'Los corruptos en prisión, no en cargos públicos tomando decisiones.' },
                { icon: '🗳️', title: 'Voto protegido', desc: 'Elecciones limpias y transparentes. Que cada voto cuente, sin trampas.' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-red transition-all duration-200"
                >
                  <span className="text-3xl mb-3 block">{item.icon}</span>
                  <h4 className="font-bold text-brand-navy mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vallejo quote */}
        <div className="bg-brand-navy-dark bg-brand-navy py-12 sm:py-16 relative overflow-hidden">
          {/* Imagen de fondo decorativa */}
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: 'url(/RunaChay.jpeg)' }}
          />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-8">
            <img
              src="/Vallejo1.jpeg"
              alt="César Vallejo"
              className="w-36 sm:w-44 flex-shrink-0 rounded-xl shadow-2xl opacity-90"
            />
            <div>
              <blockquote className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-4 italic">
                "Hay hermanos, muchísimo ke hacer…<br />
                <span className="text-red-400">y no has hecho ni mierda."</span>
              </blockquote>
              <p className="text-blue-300 text-sm font-medium">
                César Vallejo, 1892–1937
              </p>
              <p className="text-blue-200 text-base mt-4 max-w-lg">
                Este <strong className="text-white">12 de abril</strong>, regálale un día a tu Perú.
                Cuida el voto en tu mesa — no importa tu color político, mientras seas demócrata y patriota.
                Todos somos peruanos y queremos vivir en un país seguro y con oportunidades.
              </p>
            </div>
          </div>
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
