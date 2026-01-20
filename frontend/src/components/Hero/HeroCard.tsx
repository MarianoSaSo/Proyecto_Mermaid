"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import HeroChat from "./HeroChat";

export default function HeroCard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const router = useRouter();

  const handleLoginSuccess = () => {
    // Esperar 5 segundos antes de ocultar el chat y mostrar los botones
    setTimeout(() => {
      setShowChat(false);
    }, 5000);
  };

  const handleNavigate = (path: string) => {
    setLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 5000); // 5 segundos
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white-50">
        <div
          className="w-45 h-45 rounded-xl overflow-hidden relative"
          style={{
            border: "4px solid rgba(255, 223, 186, 0.7)", // borde crema/dorado
            boxShadow: "0 0 40px 10px rgba(255, 223, 186, 0.4)", // difuminado cálido
          }}
        >
          <video
            src="/loading_hero.mp4"
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform translate-y-[-2%]"
          />
        </div>
        <p className="mt-6 text-gray-700 font-medium">Cargando...</p>
      </div>
    );
  }

  return (
    <div
      className="relative h-screen overflow-hidden flex items-center justify-center px-4 bg-no-repeat"
      style={{
        backgroundImage: "url('/sirena_initial.png')",
        backgroundSize: "70%",
        backgroundPosition: "95% center",
      }}
    >
      <div className="relative max-w-3xl w-full mx-auto text-center flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight text-blue-400">
          Automátiza tu día a día con <br />
          <span className="text-gray-600">MermaidAI</span>
        </h1>
        <p className="text-gray-500 mt-6 text-lg md:text-xl">
          🌊✨ Sumérgete en <strong>MermaidAI</strong>, donde los Agentes de
          Inteligencia Artificial ayudan a estudiantes y profesores a
          automatizar tareas y descubrir nuevas formas de aprender. 🧜‍♀️💡
        </p>

        {showChat && (
          <div className="mt-6 flex justify-center w-full">
            <div className="w-full max-w-md">
              <HeroChat onLoginSuccess={handleLoginSuccess} />
            </div>
          </div>
        )}

        {!showChat && user.isLoggedIn && (
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => handleNavigate("/Home")}
              className="bg-blue-400 hover:bg-blue-700 text-white rounded-full px-6 py-3 font-medium transition"
            >
              Empezamos
            </button>

            <button
              onClick={() => handleNavigate("#about")}
              className="bg-blue-400 hover:bg-blue-700 text-white rounded-full px-6 py-3 font-medium transition"
            >
              Sobre nosotros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
