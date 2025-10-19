import DashboardLayout from "@/app/dashboard-layout";
import { asignaturas } from "@/lib/constantes-sidebar";


export default function Home() {
  return (
    <DashboardLayout title="Asignaturas profesorado - MermaidKnowler">
      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {asignaturas.map((asig, index) => (
          <a
            key={index}
            href={asig.link}
            className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
          >
            <asig.icon className="w-10 h-10 text-blue-500 dark:text-blue-400 mb-4" />
            <h2 className="text-lg font-semibold text-center">{asig.text}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              {asig.description}
            </p>
          </a>
        ))}
      </div>
    </DashboardLayout>
  );
}
