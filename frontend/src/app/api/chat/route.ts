import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, user_id, user_name, asignatura, nombreDoc } = body;

        // URL específica para el Agente RAG (Documentos)
        const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_RAG_WEBHOOK_URL || "URL_DEL_AGENTE_RAG_AQUI";

        // Construimos el payload con los nombres de variables que espera n8n
        const payload = {
            chatInput: message,
            user_id: user_id || null,
            user_name: user_name || "Estudiante",
            // Estas variables coinciden con lo que tienes en el nodo de n8n
            fileInfo_path: nombreDoc || "",
            fileInfo_asignatura: asignatura || "",
            context: {
                role: "profesor_especialista"
            }
        };

        console.log("Reenviando a n8n:", payload);

        const response = await fetch(n8nWebhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`n8n responded with status: ${response.status}`);
        }

        const data = await response.json();

        // n8n suele devolver la respuesta en un campo 'output' o 'message' 
        // Dependiendo de cómo tengas configurado el nodo AI Agent.
        // Ajustamos para que el frontend reciba lo que espera.
        return NextResponse.json({
            response: data.output || data.message || data.response || "No se pudo obtener una respuesta del asistente."
        });

    } catch (error) {
        console.error("Error in chat bridge:", error);
        return NextResponse.json(
            { response: "Lo siento, el servicio de tutoría no está disponible en este momento." },
            { status: 500 }
        );
    }
}
