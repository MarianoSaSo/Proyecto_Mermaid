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

// POST /api/files/create-folder
export async function POST(req: NextRequest) {
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
    const keepFileName = prefix + ".keep";

    // Crear archivo vacío .keep
    await minioClient.putObject(BUCKET_NAME, keepFileName, Buffer.from(""), 0);

    return NextResponse.json(
      { message: `Carpeta creada correctamente en '${prefix}'` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando carpeta en MinIO:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
