import DashboardLayout from "@/app/dashboard-layout";
import { asignaturas } from "@/lib/constantes-sidebar";
import FileList from "@/components/FileList/FileList";

const auto_name = "Programación"
const subject_name = "Programación" //Same name as the folder in MinIo.

export default function Home() {
  return (
    <DashboardLayout title={auto_name}>
      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <FileList subject_name ={subject_name} list_path_name="subjects" asignatura={auto_name}></FileList>
      </div>
    </DashboardLayout>
  );
}
