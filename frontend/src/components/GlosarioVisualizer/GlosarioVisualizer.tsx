"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Define the File type directly if the module is missing
export type File = {
  name: string;
  filepath: string;
  // Add other properties as needed
};
import ChatInterface from "../ChatInterface/ChatInterface";
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "mermaid";

export default function GlosarioVisualizer({ file, asignatura, onClose }: { file: File; asignatura?: string; onClose: () => void; }) {
  // Obtener extensión del archivo
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const [pdfVisible, setPdfVisible] = useState(true);
  const [fileUrl, setFileUrl] = useState("");
  const [glossaryText, setGlossaryText] = useState("");
  const [downloading, setDownloading] = useState(false);

  const defaultLayoutPluginInstance = defaultLayoutPlugin(); // Plugin para el visor de PDF

  // Cargar el PDF, TXT o DOCX
  useEffect(() => {
    if (fileExtension === "pdf") {
      fetch(`/api/presigned-url?file=${file.filepath}&bucket=${BUCKET_NAME}`)
        .then((res) => res.json())
        .then((data) => setFileUrl(data.url))
        .catch((err) => console.error("Error obteniendo la URL del PDF:", err));
    } else if (fileExtension === "txt") {
      fetch(`/api/presigned-url?file=${file.filepath}&bucket=${BUCKET_NAME}`)
        .then((res) => res.json())
        .then((presignedData) => {
          if (presignedData.url) {
            return fetch(presignedData.url);
          } else {
            throw new Error("No se recibió una URL válida para el TXT");
          }
        })
        .then((res) => res.text())
        .then((text) => setGlossaryText(text))
        .catch((err) => console.error("Error cargando el TXT:", err));
    } else if (fileExtension === "docx") {
      fetch(`/api/presigned-url?file=${file.filepath}&bucket=${BUCKET_NAME}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            setFileUrl(`https://docs.google.com/gview?url=${encodeURIComponent(data.url)}&embedded=true`);
          } else {
            throw new Error("No se recibió una URL válida para el DOCX");
          }
        })
        .catch((err) => console.error("Error obteniendo la URL del DOCX:", err));
    }
  }, [file, fileExtension]);

  // Cargar el fichero .txt asociado al PDF (solo si es PDF)
  useEffect(() => {
    if (fileExtension === "pdf") {
      const txtFilePath = file.filepath.replace(/\.[^/.]+$/, "_glosarioIA.txt");
      fetch(`/api/presigned-url?file=${txtFilePath}&bucket=${BUCKET_NAME}`)
        .then((res) => res.json())
        .then((presignedData) => {
          if (presignedData.url) {
            return fetch(presignedData.url);
          } else {
            throw new Error("No se recibió una URL válida para el glosario");
          }
        })
        .then((res) => res.text())
        .then((text) => setGlossaryText(text))
        .catch((err) => console.error("Error cargando el glosario:", err));
    }
  }, [file, fileExtension]);


  // Descargar el glosario con animación de spinner
  const handleDownloadGlossary = () => {
    setDownloading(true);
    const element = document.createElement("a");
    const blob = new Blob([glossaryText], { type: "text/plain" });
    element.href = URL.createObjectURL(blob);
    const downloadName = file.filepath.replace(/\.[^/.]+$/, ".txt");
    element.download = downloadName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div className="flex flex-col h-screen w-full">
      <Tooltip id="buho-tooltip" />

      {/* Barra superior */}
      <div className="w-full bg-white shadow-md flex items-center justify-between px-4 py-3">
        {/* Botón volver */}
        <button
          onClick={onClose}
          className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-md shadow-md transition-all duration-200 hover:bg-white hover:text-black border border-transparent hover:border-black"
        >
          ← Volver
        </button>

        {/* Nombre del fichero (centrado, normal y sin negrita) */}
        <h2 className="flex-1 text-center text-gray-800 font-normal">
          {file.name}
        </h2>

        {/* Botón para descargar el glosario con spinner */}
        <button
          onClick={handleDownloadGlossary}
          className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-md shadow-md transition-all duration-200 hover:bg-white hover:text-black border border-transparent hover:border-black"
          data-tooltip-id="buho-tooltip"
          data-tooltip-content="Descarga el glosario en formato .txt"
          data-tooltip-place="top"
        >
          {downloading ? (
            <span className="inline-flex items-center">
              Descargar Glosario
              <svg
                className="animate-spin ml-2 h-5 w-5 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </span>
          ) : (
            "Descargar Glosario"
          )}
        </button>
      </div>

      {/* Contenido Principal */}
      <div className="flex flex-grow w-full p-4 gap-4">
        {fileExtension === "pdf" ? (
          <>
            {/* Visor de PDF */}
            <div className={`transition-all duration-300 ${pdfVisible ? "w-2/3" : "w-0"} overflow-hidden`}>
              {pdfVisible && (
                <div className="flex flex-col h-full bg-white shadow-lg p-4 rounded-lg border">
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <div style={{ border: "1px solid rgba(0, 0, 0, 0.3)", height: "750px" }}>
                      {fileUrl ? (
                        <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
                      ) : (
                        <p>Cargando documento...</p>
                      )}
                    </div>
                  </Worker>
                </div>
              )}
            </div>

            {/* Botón para colapsar/expandir PDF */}
            <div className="flex items-center">
              <button
                onClick={() => setPdfVisible(!pdfVisible)}
                className="bg-black bg-opacity-80 text-white p-2 rounded-full shadow-md transition-all duration-200 hover:bg-white hover:text-black border border-transparent hover:border-black"
              >
                {pdfVisible ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>

            {/* Visor de Texto (.txt) del glosario */}
            <div className={`transition-all duration-300 ${pdfVisible ? "w-1/3" : "w-full"} bg-white shadow-lg p-4 rounded-lg border`}>
              <ChatInterface asignatura={asignatura} nombreDoc={file.name} />
            </div>
          </>
        ) : fileExtension === "txt" ? (
          <div className="w-full bg-white shadow-lg p-4 rounded-lg border flex gap-5">
            <div className="w-full">
              <h2 className="text-lg font-normal mb-4 text-gray-800">Contenido del archivo TXT</h2>
              <textarea
                value={glossaryText}
                readOnly
                className="w-full h-[80vh] p-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div className={`transition-all duration-300 ${pdfVisible ? "w-1/3" : "w-full"} bg-white shadow-lg p-4 rounded-lg border`}>
              <ChatInterface asignatura={asignatura} nombreDoc={file.name} />
            </div>
          </div>
        ) : fileExtension === "docx" ? (
          <div className="w-full bg-white shadow-lg p-4 rounded-lg border flex flex-col items-center">
            <h2 className="text-lg font-normal mb-4 text-gray-800">Vista previa del archivo DOCX</h2>
            {fileUrl ? (
              <div className="flex gap-5">
              <iframe
                src={fileUrl}
                title="Vista previa DOCX"
                width="100%"
                height="700px"
                style={{ border: '1px solid #ccc', background: 'white' }}
                />
                <div className={`transition-all duration-300 ${pdfVisible ? "w-1/3" : "w-full"} bg-white shadow-lg p-4 rounded-lg border`}>
              <ChatInterface asignatura={asignatura} nombreDoc={file.name} />
            </div>
                </div>
              
            ) : (
              <p>Cargando documento...</p>
            )}
            <p className="mt-4 text-sm text-gray-500">Si no ves el documento, asegúrate de que el archivo es accesible públicamente y que Google Docs Viewer lo soporta.</p>
          </div>
        ) : (
          <div className="w-full text-center text-red-600">Tipo de archivo no soportado para previsualización.</div>
        )}
      </div>
    </div>
  );
}