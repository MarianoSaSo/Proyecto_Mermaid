import DashboardLayout from "@/app/dashboard-layout";
import { asignaturas } from "@/lib/constantes-sidebar";
import FileList from "@/components/FileList/FileList";

const auto_name = "Programación"
const subject_name = "Programación" //Same name as the folder in MinIo.

export default function Home() {
  return (
    <DashboardLayout title={auto_name}>
       <div className="w-full mx-auto px-4 md:px-6">
        <FileList subject_name ={subject_name} list_path_name="subjects" asignatura={auto_name}></FileList>
      </div>
    </DashboardLayout>
  );
}
