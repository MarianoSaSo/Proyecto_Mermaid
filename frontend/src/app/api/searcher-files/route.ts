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

// Manejo de la solicitud GET (Listar archivos)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");
    const bucketName = searchParams.get("bucketname")|| BUCKET_NAME;

    const stream = minioClient.listObjectsV2(bucketName, path, true);
    const searcherFiles = [];

    /*for await (const obj of stream) {
      if (obj.name.endsWith('.pdf')) {
        files.push({
          name: obj.name,
          lastModified: obj.lastModified || "Desconocido" // Convierte a string ISO
        });
      }
    }*/
      for await (const obj of stream) {
        if (
          obj.name.endsWith('.pdf') ||
          obj.name.endsWith('.txt') ||
          obj.name.endsWith('.docx')
        ) {
          searcherFiles.push({
            name: obj.name,
            lastModified: obj.lastModified || "Desconocido"
          });
        }
      }



    return NextResponse.json(searcherFiles);

  } catch (error) {

    return NextResponse.json({ error: "Error al recuperar archivos de MinIO" }, { status: 500 });
  }

}