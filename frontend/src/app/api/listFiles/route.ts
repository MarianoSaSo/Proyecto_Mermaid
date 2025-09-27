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

// Handling the GET request (List files)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let path = searchParams.get("path") || "";
    const bucketName = searchParams.get("bucketname") || BUCKET_NAME;

    if (path && !path.endsWith("/")) path += "/";

    const stream = minioClient.listObjectsV2(bucketName, path, true);
    const foldersSet = new Set<string>();
    const files: any[] = [];

    for await (const obj of stream) {
      if (!obj.name.startsWith(path)) continue;
      const rest = obj.name.substring(path.length);
      if (rest.includes("/")) {
        // Es una carpeta (primer nivel)
        const folderName = rest.split("/")[0];
        foldersSet.add(folderName);
      } else {
        // Es un archivo directamente en este nivel
        if (
          obj.name.endsWith(".pdf") ||
          obj.name.endsWith(".txt") ||
          obj.name.endsWith(".docx")
        ) {
          files.push({
            name: obj.name,
            lastModified: obj.lastModified || "Desconocido",
            type: "file",
          });
        }
      }
    }

    // List the folders
    const folders = Array.from(foldersSet).map((folder) => ({
      name: path + folder,
      type: "folder",
    }));

    // Return folders and files together
    return NextResponse.json([...folders, ...files]);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al recuperar archivos de MinIO" },
      { status: 500 }
    );
  }
}