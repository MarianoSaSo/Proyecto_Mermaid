import { FileText, Bookmark, GraduationCap, BookOpenText, FileBarChart, GitBranch, Library, Code, Globe, Server, Database, Laptop2, Cpu } from "lucide-react";

//Arrays de objetos con las opciones para el menu lateral
export const profesoradoMenu = [
  { icon: GraduationCap, text: "Asistente profesor", link: "/profesorado/asistente", description: "Asistente que ayuda al profesor con la informacion disponible y a reservar aulas para sus lecciones" },
  { icon:  BookOpenText, text: "Asignaturas", link: "/profesorado/asignaturas", description: "Muestra los temarios y documentos de cada asignatura." },
  { icon: FileBarChart, text: "Resumidor", link: "/profesorado/resumidor", description: "Proceso para resumir un temario o documento" },
  { icon: GitBranch, text: "Enviar email", link: "/profesorado/email", description: "Proceso para enviar email de forma inteligente" },

];
export const alumno = [
  { icon: Library, text: "Mis colecciones", link: "/alumno/colecciones", description: "Accede a colecciones de archivos subidos por el alumno." },
];

export const asignaturas = [
  { icon: Code, text: "Programacion", link: "/profesorado/asignaturas/programacion", description: "Accede a los documentos de Programacion." },
  { icon: Globe, text: "Entorno cliente", link: "/profesorado/asignaturas/cliente", description: "Accede a los documentos de Entorno Cliente." },
  { icon: Server, text: "Entorno servidor", link: "/profesorado/asignaturas/servidor", description: "Accede a los documentos de Entorno Servidor." },
  { icon: Database, text: "Bases de datos", link: "/profesorado/asignaturas/basesDatos", description: "Accede a los documentos de Base de datos." },
  { icon: Laptop2, text: "Entornos de Desarrollo", link: "/profesorado/asignaturas/entornos", description: "Accede a los documentos de Entornos de desarrollo." },
  { icon: Cpu, text: "Sistemas Informáticos", link: "/profesorado/asignaturas/sistemas", description: "Accede a los documentos de Sistemas Informáticos." },
];
