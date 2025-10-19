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

// DELETE /api/files/delete-folder
export async function DELETE(req: NextRequest) {
  try {
    const { folderPrefix } = await req.json();
    if (!folderPrefix) {
      return NextResponse.json(
        { error: "Folder prefix is required" },
        { status: 400 }
      );
    }
    // Normalizar prefijo
    let prefix = folderPrefix;
    if (!prefix.endsWith("/")) prefix += "/";

    // Listar todos los objetos bajo ese prefijo
    const objectsToDelete: string[] = [];
    const stream = minioClient.listObjectsV2(BUCKET_NAME, prefix, true);
    for await (const obj of stream) {
      objectsToDelete.push(obj.name);
    }

    if (objectsToDelete.length === 0) {
      return NextResponse.json(
        { message: "No files found in folder." },
        { status: 200 }
      );
    }

    // Borrar todos los objetos
    await minioClient.removeObjects(BUCKET_NAME, objectsToDelete);

    return NextResponse.json(
      { message: `Folder and all contents deleted (${objectsToDelete.length} items)` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting folder from MinIO:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
