import { NextRequest, NextResponse } from "next/server";
import { Client } from "minio";


// Configuración del cliente de MinIO
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "mermaid";





//Subir archivos
export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();

    const file = data.get("file") as File;
    const ruta_prefix = (data.get("ruta_prefix") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convertir el archivo a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar un nombre único para evitar sobrescribir archivos
    // const fileName = `${Date.now()}-${file.name}`; de momento comentado - julian
    const fileName = `${file.name}`;

    // Subir archivo a MinIO
    await minioClient.putObject(BUCKET_NAME, ruta_prefix + fileName, buffer);

    // Construir la URL del archivo
    const fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${fileName}`;

    return NextResponse.json({
      message: "File uploaded successfully",
      fileUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}