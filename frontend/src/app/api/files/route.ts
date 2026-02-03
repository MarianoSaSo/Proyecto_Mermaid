import { NextRequest, NextResponse } from "next/server";
import { Client } from "minio";

// Configuración del cliente de MinIO
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || "mermaidAI",
  secretKey: process.env.MINIO_SECRET_KEY || "mermaidAI123",
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "mermaid";

export async function DELETE(req: NextRequest) {
  try {
    const { fileName } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    // 1. Determinar el prefijo (carpeta) del archivo
    const lastSlashIndex = fileName.lastIndexOf("/");
    if (lastSlashIndex !== -1) {
      const folderPath = fileName.substring(0, lastSlashIndex + 1); // Incluye el /
      const keepFilePath = `${folderPath}.keep`;

      // 2. Comprobar si es el último archivo de la carpeta
      const objects: string[] = [];
      const stream = minioClient.listObjectsV2(BUCKET_NAME, folderPath, false); // No recursivo para ver solo este nivel

      for await (const obj of stream) {
        objects.push(obj.name);
      }

      // 3. Si solo está el archivo que queremos borrar (y no hay un .keep), creamos el .keep
      const hasKeep = objects.includes(keepFilePath);
      const otherFiles = objects.filter(name => name !== fileName && name !== keepFilePath);

      if (!hasKeep && otherFiles.length === 0) {
        console.log(`Creando archivo .keep en ${folderPath} para mantener la ruta.`);
        await minioClient.putObject(BUCKET_NAME, keepFilePath, Buffer.from(""), 0);
      }
    }

    // 4. Proceder a borrar el archivo en MinIO
    await minioClient.removeObject(BUCKET_NAME, fileName);

    // 5. Borrar vectores en Pinecone (Llamada al backend)
    try {
      const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${backendBaseUrl}/upload/delete-vectors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: fileName }),
      });
      console.log(`Vectores de ${fileName} eliminados del backend.`);
    } catch (vectorError) {
      console.error("Error al notificar al backend para borrar vectores:", vectorError);
      // No bloqueamos el éxito del borrado de MinIO por un fallo en vectores
    }

    return NextResponse.json({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}