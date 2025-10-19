import { NextRequest, NextResponse } from "next/server";
import { Client } from "minio";

// Configuration of the client in MinIo
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost", // si no hay variable, usa localhost
  port: Number(process.env.MINIO_PORT) || 9000,         // si no hay variable, usa 9000
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || "mermaidAI",
  secretKey: process.env.MINIO_SECRET_KEY || "mermaidAI123",
});


const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "mermaid";

export async function POST(req: NextRequest) {
  try {
    const { source, destination } = await req.json();
    if (!source || !destination) {
      return NextResponse.json(
        { error: "Source and destination are required" },
        { status: 400 }
      );
    }
    // Copiar el archivo a la nueva ruta
    await minioClient.copyObject(
      BUCKET_NAME,
      destination,
      `/${BUCKET_NAME}/${source}`
    );
    // Eliminar el archivo original
    await minioClient.removeObject(BUCKET_NAME, source);
    return NextResponse.json({ message: "Archivo movido correctamente" });
  } catch (error) {
    console.error("Error moviendo archivo en MinIO:", error);
    return NextResponse.json(
      { error: "Error al mover el archivo en MinIO" },
      { status: 500 }
    );
  }
}
