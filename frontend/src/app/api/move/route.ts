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

    // --- Lógica para preservar la carpeta de origen ---
    const lastSlashIndex = source.lastIndexOf("/");
    if (lastSlashIndex !== -1) {
      const folderPath = source.substring(0, lastSlashIndex + 1);
      const keepFilePath = `${folderPath}.keep`;

      // Listar objetos en la carpeta de origen (no recursivo)
      const objects: string[] = [];
      const stream = minioClient.listObjectsV2(BUCKET_NAME, folderPath, false);
      for await (const obj of stream) {
        objects.push(obj.name);
      }

      // Si es el último archivo y no hay .keep, crearlo
      const hasKeep = objects.includes(keepFilePath);
      const otherFiles = objects.filter(name => name !== source && name !== keepFilePath);

      if (!hasKeep && otherFiles.length === 0) {
        console.log(`Preservando carpeta origen: Creando .keep en ${folderPath}`);
        await minioClient.putObject(BUCKET_NAME, keepFilePath, Buffer.from(""), 0);
      }
    }
    // --------------------------------------------------

    // Eliminar el archivo original
    await minioClient.removeObject(BUCKET_NAME, source);

    // --- Sincronización con Pinecone ---
    try {
      const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // 1. Borrar vectores de la ruta antigua
      await fetch(`${backendBaseUrl}/upload/delete-vectors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: source }),
      });

      // 2. Re-procesar en la ruta nueva (solo si es un PDF)
      if (destination.toLowerCase().endsWith(".pdf")) {
        await fetch(`${backendBaseUrl}/upload/procesar-pdf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: destination }),
        });
      }
      console.log(`Sincronización de Pinecone completada para mover ${source} -> ${destination}`);
    } catch (error) {
      console.error("Error sincronizando Pinecone al mover:", error);
    }
    // ------------------------------------

    return NextResponse.json({ message: "Archivo movido correctamente" });
  } catch (error) {
    console.error("Error moviendo archivo en MinIO:", error);
    return NextResponse.json(
      { error: "Error al mover el archivo en MinIO" },
      { status: 500 }
    );
  }
}
