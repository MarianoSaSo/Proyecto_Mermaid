"use client";

import { useParams } from "next/navigation";
import UploadForm from "@/components/UploadForm/UploadForm";
import Image from "next/image";

export default function UploadPage() {
  const params = useParams();
  const ruta_prefix = Array.isArray(params.ruta_prefix)
    ? params.ruta_prefix.join("/")
    : params.ruta_prefix;

  if (!ruta_prefix) {
    return <p>Error: No se encontró el prefijo de la ruta.</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="grid grid-cols-2 gap-8 items-center">
        {/*<div className="flex justify-center">
          <Image
            src="/upload.png"
            alt="upload_logo"
            width={500}
            height={500}
            priority
          />
        </div>*/}

        <div className="flex justify-center">
          <video
            src="/video_upload2.mp4"
            width={500}
            height={500}
            autoPlay
            muted
            playsInline
          />
        </div>

        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-2xl font-bold">Sube tus archivos a procesar</h1>
          <UploadForm ruta_prefix={`${ruta_prefix}/`} />
        </div>
      </div>
    </div>
  );
}
