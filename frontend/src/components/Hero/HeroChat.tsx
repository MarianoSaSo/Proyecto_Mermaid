"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AgentResponse {
  message: string;
  user_id: string;
  login: string;
  name: string | null;
}

const LoadingDots = () => (
  <div className="flex space-x-1.5 items-center">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
  </div>
);

interface HeroChatProps {
  onLoginSuccess?: () => void;
}

export default function HeroChat({ onLoginSuccess }: HeroChatProps) {
  const { user, login } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // URL del webhook de N8N (debería estar en variables de entorno)
  const WEBHOOK_URL =
    process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
    "http://localhost:5678/webhook/4d0142f3-af3e-41f9-96c8-91d0898bfd26";

  // Scroll automático al final
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus en el input cuando no está cargando
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // Añadir mensaje del usuario
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_message: input.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: AgentResponse = await response.json();

      // Normalizar el valor de login (puede venir como string "true"/"false")
      const loginValue =
        typeof data.login === "string" ? data.login.trim() : String(data.login);
      const isLoggedIn = loginValue === "true";

      // Actualizar información del usuario si hay login exitoso
      if (isLoggedIn) {
        const userId = data.user_id?.trim() || "";
        // Solo actualizar si tenemos un user_id válido (no solo "\n" o vacío)
        if (userId && userId !== "\n" && userId.length > 0) {
          login({
            user_id: userId,
            name: data.name || null,
          });

          // Notificar al padre que el login ha sido correcto
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }
      }

      // Crear mensaje del asistente
      const botMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message || "No se recibió respuesta del agente",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error al comunicarse con el agente:", error);

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Lo siento, ha ocurrido un error al comunicarse con el agente. Por favor, inténtalo de nuevo.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text: string) => {
    // Reemplazar **texto** con <strong>texto</strong>
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  };

  return (
    <div className="flex flex-col h-[300px] bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center">
            <span className="text-white text-lg">🧜‍♀️</span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Mermaid AI</h3>
            {user.isLoggedIn && user.name && (
              <p className="text-white/80 text-xs">👤 {user.name}</p>
            )}
          </div>
        </div>
        {user.isLoggedIn && (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Conectado
          </span>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg font-semibold mb-2">¡Hola! 👋 Soy EN 🧜‍♀️</p>
            <p className="text-sm">
              Puedes registrarte o iniciar sesión para comenzar
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center">
                <span className="text-white text-sm">🧜‍♀️</span>
              </div>
            )}
            <div
              className={`max-w-[75%] py-2 px-3 rounded-lg text-sm shadow-sm ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
            >
              {(message.content || "").split("\n").map((line, i) => (
                <p
                  key={i}
                  className="whitespace-pre-wrap mb-1 last:mb-0"
                  dangerouslySetInnerHTML={{ __html: formatText(line) }}
                />
              ))}
            </div>
            {message.role === "user" && (
              <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-blue-100">
                <div className="w-full h-full flex items-center justify-center text-blue-500 font-semibold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center">
              <span className="text-white text-sm">🧜‍♀️</span>
            </div>
            <div className="bg-white py-2 px-3 rounded-lg text-sm shadow-sm border border-gray-200">
              <LoadingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              user.isLoggedIn
                ? "Escribe tu mensaje..."
                : "Escribe para registrarte o iniciar sesión..."
            }
            className="flex-1 p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
            disabled={isLoading}
            ref={inputRef}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white border border-transparent hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
