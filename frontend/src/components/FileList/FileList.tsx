"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Plus,
  Upload,
  ChevronLeft,
} from "lucide-react";
import { Tooltip } from "react-tooltip";
import { CreateFolderForm } from "../CreateFolderForm/CreateFolderForm";
import { DeleteConfirmPanel } from "../DeleteConfirmPanel/DeleteConfirmPanel";
import GlosarioVisualizer from "../GlosarioVisualizer/GlosarioVisualizer";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; // <--- Añadido
import Notification from "../Notification/Notification";

type FileListProps = {
  list_path_name: string;
  subject_name?: string;
  asignatura?: string;
};

export interface File {
  name: string;
  path: string;
  filepath: string;
  timestamp: string;
  filename_json: String;
  selected: boolean;
  type: string;
}
export interface NotificationData {
  type: "success" | "error";
  message: string;
}

const ITEMS_PER_PAGE = 10;

const getFileStatus = (file: File) => {
  return "Procesado";
  // const exists = await checkFileExists(file.filename_json);
  // return exists ? "Procesado" : "Pendiente";
};

const processFile = async (file: File) => {
  console.log(file);
  try {
    const response = await fetch(
      "http://localhost:8005/api/v1/automatizaciones/run/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auto_name: "asignaturas",
          auto_args: {
            doc_origen: file.name,
            minio: true,
          },
        }),
      }
    );

    if (response.ok) {
      alert("Fichero procesándose OK");
    } else {
      alert("Error al procesar el fichero");
    }
  } catch (error) {
    console.error("Error al procesar el fichero:", error);
    alert("Error al procesar el fichero");
  }
};

export const deleteFile = async (
  fileName: string,
  setFiles: Function,
  showNotification: (type: "success" | "error", message: string) => void
) => {
  try {
    const res = await fetch("/api/files", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileName }),
    });

    if (res.ok) {
      setFiles((prevFiles: File[]) =>
        prevFiles.filter((file) => file.filepath !== fileName)
      );
      showNotification("success", "Archivo eliminado exitosamente");
    } else {
      showNotification("error", "Error al eliminar el archivo");
    }
  } catch (error) {
    console.error("Error eliminando archivo:", error);
    showNotification("error", "Error al eliminar el archivo");
  }
};

export default function FileList({
  list_path_name,
  subject_name,
  asignatura,
}: FileListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<File[]>([]);
  const [searcherFiles, setSearcherFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [subject, setSubject] = useState(subject_name);
  // Estado para controlar el spinner en el botón "Procesar"
  const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});
  const [notification, setNotification] = useState<NotificationData | null>(
    null
  );
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "file" | "folder";
    item: File;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
  };

  // Leer el path actual de la URL
  const urlPath = searchParams.get("path") || `${list_path_name}/${subject}`; // El searchParams coge la url del navegador y en caso de que no la coja entonces la crea seria; SUBJECTS+PROGRAMACION
  const relativePath = urlPath;

  // Función para cargar los archivos
  const loadFiles = async (path: string) => {
    setLoading(true);
    try {
      // Llamada al endpoint ListFiles para obtener la lista completa
      const [filesRes, searcherRes] = await Promise.all([
        fetch(`/api/listFiles?bucketname=mermaid&path=${path}/`),
        fetch(`/api/searcher-files?path=${path}`),
      ]);

      const filesData = await filesRes.json();
      const searcherData = await searcherRes.json();

      if (Array.isArray(filesData)) {
        setFiles(
          filesData.map((item) => {
            if (item.type === "folder") {
              return {
                path: item.name,
                name: item.name.split("/").filter(Boolean).pop(),
                filepath: item.name,
                timestamp: "",
                filename_json: "",
                selected: false,
                type: "folder",
              };
            } else {
              const parts = item.name.split("/");
              const path = parts.slice(0, -1).join("/");
              const name = parts.pop();
              const filename_json = item.name.replace(
                /(.*\/)?([^/.]+)\.[^/.]+$/,
                "$1$2_glosario.json"
              );
              return {
                path: path,
                name: name,
                filepath: item.name,
                timestamp: item.lastModified,
                filename_json: filename_json,
                selected: false,
                type: "file",
              };
            }
          })
        );
      }

      if (Array.isArray(searcherData)) {
        setSearcherFiles(
          searcherData.map((item: any) => {
            const parts = item.name.split("/");
            const path = parts.slice(0, -1).join("/");
            const name = parts.pop();
            return {
              path: path,
              name: name,
              filepath: item.name,
              timestamp: item.lastModified,
              filename_json: item.name.replace(
                /(.*\/)?([^/.]+)\.[^/.]+$/,
                "$1$2_glosario.json"
              ),
              selected: false,
              type: "file",
            };
          })
        );
      }
    } catch (error) {
      console.error("Error loading files:", error);
      showNotification("error", "Error al cargar los archivos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar archivos cuando cambia la URL
  useEffect(() => {
    loadFiles(urlPath);
  }, [urlPath, list_path_name, subject]);

  const toggleSelection = (fileName: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.name === fileName ? { ...file, selected: !file.selected } : file
      )
    );
  };

  const handleProcess = (file: File) => {
    if (processing[file.filepath]) return; // Evita múltiples pulsaciones
    setProcessing((prev) => ({ ...prev, [file.filepath]: true }));
    // Muestra el spinner durante 1 segundo antes de ejecutar processFile
    setTimeout(() => {
      processFile(file);
      setProcessing((prev) => ({ ...prev, [file.filepath]: false }));
    }, 1000);
  };

  const filteredFiles = searchQuery
    ? searcherFiles.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : files;

  // Separar carpetas y archivos
  const folders = filteredFiles.filter((f) => f.type === "folder");
  const onlyFiles = filteredFiles.filter((f) => f.type === "file");

  // Clave para drag & drop
  const DRAG_FILE_KEY = "draggedFilePath";
  const DRAG_FOLDER_KEY = "draggedFolderPath";

  // Drag & Drop handlers
  const handleDragStart = (event: React.DragEvent, file: File) => {
    event.dataTransfer.setData(DRAG_FILE_KEY, file.filepath);
  };

  const handleFolderDragStart = (event: React.DragEvent, folder: File) => {
    event.dataTransfer.setData(DRAG_FOLDER_KEY, folder.path);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Handler unificado para drop en carpetas
  const handleUnifiedDrop = async (event: React.DragEvent, folder: File) => {
    event.preventDefault();
    const draggedFilePath = event.dataTransfer.getData(DRAG_FILE_KEY);
    const draggedFolderPath = event.dataTransfer.getData(DRAG_FOLDER_KEY);
    if (draggedFilePath) {
      // Drop de archivo
      if (draggedFilePath.startsWith(folder.path + "/")) return;
      await moveFile(draggedFilePath, folder.path);
      return;
    }
    if (draggedFolderPath) {
      // Drop de carpeta
      if (
        folder.path === draggedFolderPath ||
        folder.path.startsWith(draggedFolderPath + "/")
      )
        return;
      await moveFolder(draggedFolderPath, folder.path);
      return;
    }
  };

  // Mover archivo en el backend
  const moveFile = async (filepath: string, targetFolder: string) => {
    try {
      // Construye el nuevo path (solo nombre del archivo al final)
      const filename = filepath.split("/").pop();
      const newPath = `${targetFolder}/${filename}`;
      const res = await fetch("/api/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: filepath,
          destination: newPath,
        }),
      });
      if (!res.ok) {
        showNotification("error", "Error al mover el archivo");
        return;
      }
      showNotification("success", "Archivo movido correctamente");
      loadFiles(urlPath);
    } catch (e) {
      showNotification("error", "Error al mover el archivo");
    }
  };

  // Mover carpeta en el backend
  const moveFolder = async (source: string, destination: string) => {
    try {
      // El destino será la carpeta destino + '/' + nombre de la carpeta origen
      const folderName = source.split("/").pop();
      const destPath = `${destination}/${folderName}`;
      const res = await fetch("/api/move-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination: destPath }),
      });
      if (!res.ok) {
        showNotification("error", "Error al mover la carpeta");
        return;
      }
      showNotification("success", "Carpeta movida correctamente");
      loadFiles(urlPath);
    } catch (e) {
      showNotification("error", "Error al mover la carpeta");
    }
  };

  // Paginación solo para archivos, las carpetas siempre se muestran arriba
  const totalPages = Math.ceil(onlyFiles.length / ITEMS_PER_PAGE);
  const paginatedFiles = onlyFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  //Funcion para formatear la salida del nombre de las unidades
  /*function formatName(name: string) {
    const match = name.match(/([a-zA-Z]+)(\d+)/);
    if (!match) return name;

    const text = match[1];
    const number = match[2];

    return `${text.charAt(0).toUpperCase()}${text.slice(1)} ${number}`;
  }*/

  //Funcion para formatear la salida de las carpetas
  function formatFolderName(name: string) {
    return name.replace(/_/g, " ");
  }

  if (selectedFile) {
    console.log("FileListGlosario props:", { asignatura, selectedFile });
    return (
      <GlosarioVisualizer
        file={selectedFile}
        asignatura={asignatura}
        onClose={() => setSelectedFile(null)}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl">
      <Tooltip id="buho-tooltip" />

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar archivos..."
          className="px-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-gray-500"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-md shadow-md 
                         hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-200"
            data-tooltip-content="Vuelve al menú anterior"
            data-tooltip-id="buho-tooltip"
            data-tooltip-place="top"
          >
            <span className="flex items-center">
              <ArrowLeft size={16} className="mr-1" />
              <span>Volver</span>
            </span>
          </button>

          {/* Botón para crear carpeta */}
          <button
            onClick={() => setIsCreateFolderOpen(true)}
            className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-md shadow-md hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-200 flex items-center gap-2"
            data-tooltip-id="buho-tooltip"
            data-tooltip-content="Crea una nueva carpeta vacía"
            data-tooltip-place="top"
          >
            <Plus size={16} />
            <span>Crear carpeta</span>
          </button>

          {/* Formulario de creación de carpeta */}
          <CreateFolderForm
            isOpen={isCreateFolderOpen}
            onClose={() => setIsCreateFolderOpen(false)}
            existingFolders={files
              .filter((f) => f.type === "folder")
              .map((f) => f.name as string)}
            onSubmit={async (folderName) => {
              try {
                // Construir el path completo
                let basePath = urlPath;
                if (basePath && !basePath.endsWith("/")) {
                  basePath += "/";
                }
                const folderPrefix = basePath + folderName;

                // Crear la carpeta
                const res = await fetch("/api/create-folder", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ folderPrefix }),
                });

                if (!res.ok) {
                  // Intentar obtener el mensaje de error del cuerpo de la respuesta
                  let errorMessage = `Error al crear la carpeta "${folderName}"`;
                  try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                  } catch (e) {
                    // Si no se puede analizar como JSON, usar el estado del error
                    errorMessage = `Error al crear la carpeta. Error ${res.status}: ${res.statusText}`;
                  }
                  showNotification("error", errorMessage);
                  throw new Error(errorMessage);
                }

                // Mostrar notificación de éxito
                showNotification(
                  "success",
                  `Carpeta "${folderName}" creada correctamente`
                );
                // Cerrar el modal
                setIsCreateFolderOpen(false);

                // Recargar la lista de archivos después de un breve retraso
                // para asegurar que el servidor haya terminado de procesar
                setTimeout(() => {
                  loadFiles(urlPath);
                }, 500);
              } catch (error) {
                console.error("Error al crear la carpeta:", error);
                throw error; // Esto se mostrará en el formulario
              }
            }}
          />

          {notification && (
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}

          {/* Botón para subir archivos */}
          <Link href={`/upload/${relativePath}`}>
            <button
              className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-md shadow-md 
                         hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-200"
              data-tooltip-id="buho-tooltip"
              data-tooltip-content="Añade los ficheros a procesar"
              data-tooltip-place="top"
            >
              <span className="flex items-center">
                <Upload size={16} className="mr-1" />
                <span>Subir fichero</span>
              </span>
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p>Cargando archivos...</p>
      ) : files.length === 0 ? (
        <p className="text-gray-500">No hay archivos subidos.</p>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-center w-12">✔</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Time Stamp</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {/* Mostrar carpetas primero */}
                {folders.map((folder, idx) => (
                  <tr
                    key={"folder-" + idx}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    draggable
                    onDragStart={(e) => handleFolderDragStart(e, folder)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleUnifiedDrop(e, folder)}
                  >
                    <td className="p-3 text-center"></td>
                    <td
                      className="p-3 font-semibold flex items-center"
                      style={{ color: "#4B4B4B" }}
                      onClick={() => {
                        router.push(`?path=${folder.path}`);
                      }}
                    >
                      📁 {formatFolderName(folder.name)}
                    </td>
                    <td className="p-3 text-gray-700">—</td>
                    <td className="p-3">Carpeta</td>
                    <td className="p-3 flex gap-2">
                      {" "}
                      <button
                        className="px-3 py-1 rounded-md shadow-md text-sm transition-all duration-200 border border-transparent bg-black bg-opacity-80 text-white hover:bg-gradient-to-r hover:from-black hover:to-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({
                            type: "folder",
                            item: folder,
                          });
                        }}
                        title="Eliminar carpeta y todo su contenido"
                      >
                        Eliminar carpeta
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Luego los archivos paginados */}
                {paginatedFiles.map((file, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-100"
                    draggable
                    onDragStart={(e) => handleDragStart(e, file)}
                    // Opcional: estilo visual de arrastre
                    style={{ cursor: "grab" }}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={file.selected}
                        onChange={() => toggleSelection(file.name)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="p-3">{file.name}</td>
                    <td className="p-3 text-gray-700">
                      {new Date(file.timestamp).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3">{getFileStatus(file)}</td>
                    <td className="p-3 flex gap-2">
                      {[
                        { action: "Ver", onClick: () => setSelectedFile(file) },
                        {
                          action: "Procesar",
                          onClick: () => handleProcess(file),
                        },
                        {
                          action: "Eliminar",
                          onClick: () => {
                            setDeleteTarget({
                              type: "file",
                              item: file,
                            });
                          },
                        },
                      ].map(({ action, onClick }, idx) => (
                        <button
                          key={idx}
                          onClick={onClick}
                          className={`px-3 py-1 rounded-md shadow-md text-sm transition-all duration-200 border border-transparent 
                                      bg-black bg-opacity-80 text-white hover:bg-opacity-100 
                                      ${
                                        action === "Eliminar"
                                          ? "hover:bg-gradient-to-r hover:from-black hover:to-red-600"
                                          : ""
                                      } 
                                      ${
                                        action === "Procesar"
                                          ? "hover:bg-gradient-to-r hover:from-black hover:to-yellow-600"
                                          : ""
                                      }`}
                        >
                          {action === "Procesar" ? (
                            <span className="inline-flex items-center">
                              Procesar
                              {processing[file.filepath] && (
                                <Loader2
                                  className="animate-spin ml-2"
                                  size={16}
                                />
                              )}
                            </span>
                          ) : (
                            action
                          )}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Panel de confirmación de borrado */}
      <DeleteConfirmPanel
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        itemName={deleteTarget?.item?.name || ""}
        isFolder={deleteTarget?.type === "folder"}
        deleting={deleting}
        onConfirm={async () => {
          setDeleting(true);
          if (deleteTarget?.type === "file") {
            await deleteFile(
              deleteTarget.item.filepath,
              setFiles,
              showNotification
            );
            setDeleteTarget(null);
          } else if (deleteTarget?.type === "folder") {
            try {
              const res = await fetch("/api/delete-folder", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folderPrefix: deleteTarget.item.path }),
              });
              if (res.ok) {
                setFiles((prevFiles) =>
                  prevFiles.filter((f) => f.path !== deleteTarget.item.path)
                );
                showNotification("success", "Carpeta eliminada con éxito.");
              } else {
                showNotification("error", "Error al eliminar la carpeta.");
              }
            } catch (error) {
              showNotification("error", "Error al eliminar la carpeta.");
            }
            setDeleteTarget(null);
          }
          setDeleting(false);
        }}
      />

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={goToPreviousPage}
            className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-md shadow-md 
                       hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-200"
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-md shadow-md 
                       hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-200"
            disabled={currentPage === totalPages}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
