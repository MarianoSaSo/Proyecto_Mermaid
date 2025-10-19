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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("file");
  const bucketName = searchParams.get("bucket");

  if (!fileName || !bucketName) {
    return NextResponse.json({ error: "Missing file or bucket parameter" }, { status: 400 });
  }

  try {
    const presignedUrl = await minioClient.presignedGetObject(bucketName, fileName, 3600); // URL válida por 1 hora
    return NextResponse.json({ url: presignedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}
