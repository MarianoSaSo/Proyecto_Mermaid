"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Notification from "../Notification/Notification";

type UploadFormProps = {
  ruta_prefix: string;
};

export default function UploadForm({ ruta_prefix }: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastRelativePath, setLastRelativePath] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);



  const handleUpload = async () => {
    if (!selectedFile) {
      setNotification({ type: 'error', message: 'No hay archivo seleccionado' });
      return;
    }
    setUploading(true);
    setNotification(null);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("ruta_prefix", ruta_prefix);
    try {
      const response = await fetch(`/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Error al subir el archivo");
      const data = await response.json();
      // Construir el path relativo para FastAPI directamente
      const relativePath = `${ruta_prefix.replace(/\/$/, '')}/${selectedFile.name}`;
      setLastRelativePath(relativePath);
      // Llama al endpoint externo FastAPI para procesar el PDF
      try {
        const fastApiRes = await fetch('http://localhost:8000/upload/procesar-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: relativePath }),
        });
        let fastApiData = null;
        try {
          fastApiData = await fastApiRes.json();
        } catch (e) {
          fastApiData = { error: 'Respuesta no es JSON', raw: await fastApiRes.text() };
        }
        if (fastApiRes.ok) {
          setNotification({ type: 'success', message: 'Archivo subido y procesado correctamente.' });
        } else {
          setNotification({ type: 'error', message: 'Error al procesar en el backend externo: ' + JSON.stringify(fastApiData) });
        }
      } catch (error: any) {
        alert('Error al conectar con el backend externo: ' + (error?.message || JSON.stringify(error)));
        console.error('Error al conectar con FastAPI:', error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al subir el archivo");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4">
        Subir Archivo a <span className="text-blue-500">{ruta_prefix}</span>
      </h2>

      {/* Notificación visual con componente Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <input type="file" onChange={handleFileChange} className="mb-4" />

      {selectedFile && <p className="text-gray-700">{selectedFile.name}</p>}

      {lastRelativePath && (
        <div style={{marginBottom: 12, color: 'blue', fontWeight: 'bold'}}>
          RelativePath calculado: {lastRelativePath}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-md shadow-md transition-all duration-200 hover:bg-white hover:text-black border border-transparent hover:border-black"
        >
          {uploading ? "Subiendo..." : "Subir Archivo"}
        </button>

        <button
          onClick={() => router.back()}
          className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-md shadow-md transition-all duration-200 hover:bg-white hover:text-black border border-transparent hover:border-black"
        >
          ← Volver
        </button>


      </div>
    </div>
  );
}


