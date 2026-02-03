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
    // Evitar mover una carpeta dentro de sí misma o de sus subcarpetas
    if (destination.startsWith(source)) {
      return NextResponse.json(
        { error: "No puedes mover una carpeta dentro de sí misma o de sus subcarpetas" },
        { status: 400 }
      );
    }
    // Listar todos los objetos bajo la carpeta origen
    const objectsStream = minioClient.listObjectsV2(BUCKET_NAME, source + '/', true);
    const objectsToMove = [];
    for await (const obj of objectsStream) {
      objectsToMove.push(obj.name);
    }
    // Copiar cada objeto a la nueva ruta
    for (const objName of objectsToMove) {
      const relativePath = objName.substring(source.length);
      const destPath = destination + relativePath;
      await minioClient.copyObject(
        BUCKET_NAME,
        destPath,
        `/${BUCKET_NAME}/${objName}`
      );
      await minioClient.removeObject(BUCKET_NAME, objName);
    }

    // --- Lógica para preservar la carpeta contenedora del origen ---
    const lastSlashIndex = source.lastIndexOf("/");
    if (lastSlashIndex !== -1) {
      const parentPath = source.substring(0, lastSlashIndex + 1);
      const keepFilePath = `${parentPath}.keep`;

      // Listar objetos en el padre (no recursivo) para ver si ha quedado vacío
      const objects: string[] = [];
      const parentStream = minioClient.listObjectsV2(BUCKET_NAME, parentPath, false);
      for await (const obj of parentStream) {
        objects.push(obj.name);
      }

      // Si no quedan archivos (ni .keep), creamos el .keep
      const hasKeep = objects.includes(keepFilePath);
      const otherObjects = objects.filter(name => name !== keepFilePath);

      if (!hasKeep && otherObjects.length === 0) {
        console.log(`Preservando carpeta padre: Creando .keep en ${parentPath}`);
        await minioClient.putObject(BUCKET_NAME, keepFilePath, Buffer.from(""), 0);
      }
    }
    return NextResponse.json({ message: "Carpeta movida correctamente" });
  } catch (error) {
    console.error("Error moviendo carpeta en MinIO:", error);
    return NextResponse.json(
      { error: "Error al mover la carpeta en MinIO" },
      { status: 500 }
    );
  }
}
