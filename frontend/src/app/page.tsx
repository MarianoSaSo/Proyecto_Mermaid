import { BookOpen, BrainCog, FileText, GraduationCap } from 'lucide-react';
import DashboardLayout from './dashboard-layout';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
          Bienvenido a Mermaid AI
        </h1>

        <h2 className="text-lg text-muted-foreground mb-8 text-center">
          La plataforma de inteligencia artificial que transforma la manera en
          que los estudiantes y universidades gestionan el conocimiento, los
          estudios y la investigación académica.
        </h2>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4">
            Accede a un ecosistema completo de herramientas inteligentes para
            organizar, automatizar, colaborar y crecer en el mundo académico con
            asistencia de IA.
          </h3>

          <div className="bg-card p-6 rounded-lg border shadow-sm mt-4">
            <h2 className="text-2xl font-semibold mb-4">
              ¡Explora nuestras herramientas!
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <a
                href="/profesorado/vertodas"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 py-2 
               bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Herramientas Docente
              </a>
              <a
                href="/alumno"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 py-2 
               bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Herramientas alumnado
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Beneficios Destacados */}
      <div className="bg-white dark:bg-gray-950 px-6 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          ¿Qué puedes hacer con Mermaid AI?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow">
            <GraduationCap className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Asistencia Académica
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Planifica tus estudios, organiza tus materias y recibe
              recomendaciones inteligentes para tu día a día universitario.
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow">
            <FileText className="w-10 h-10 text-green-600 dark:text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Gestión de Documentación
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Almacena, clasifica y busca rápidamente papers, apuntes, y
              recursos académicos con IA semántica.
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow">
            <BrainCog className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Soporte para profesorado
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Organiza tus asignaturas, genera resúmenes, reserva salas y envia emails desde un solo lugar.
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow">
            <BookOpen className="w-10 h-10 text-orange-600 dark:text-orange-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Automatizaciones Inteligentes
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Usa flujos automatizados para analizar, transformar y aprovechar
              tu información académica como nunca antes.
            </p>
          </div>
        </div>
      </div>

      {/* Universidades colaboradoras */}
      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-8">
        <h3 className="text-center text-lg text-gray-700 dark:text-gray-300 mb-4">
          Ya confían en nosotros:
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-6 opacity-80">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Universidad A
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Universidad B
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Instituto de Investigación C
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Escuela Superior D
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
