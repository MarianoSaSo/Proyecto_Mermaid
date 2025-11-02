"use client";

import Head from "next/head";
import Link from "next/link";

export default function HeroCard() {
  return (
    <div
      className="relative bg-no-repeat py-20 md:py-36 px-4"
      style={{
        backgroundImage: "url('/sirena_initial.png')",
        backgroundSize: "70%", // Imagen 30% más pequeña
        backgroundPosition: "95% center", // Más a la derecha
      }}
    >
      {/* Contenido centrado */}
      <div className="relative max-w-3xl mx-auto text-center">
        {/* Título principal */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight text-blue-400">
          Automátiza tu día a día con <br />
          <span className="text-gray-600">MermaidAI</span>
        </h1>

        {/* Descripción */}
        <p className="text-gray-500 mt-6 text-lg md:text-xl">
          🌊✨ Sumérgete en <strong>MermaidAI</strong>, donde los Agentes de
          Inteligencia Artificial ayudan a estudiantes y profesores a
          automatizar tareas y descubrir nuevas formas de aprender. Un proyecto
          vivo, en evolución constante. 🧜‍♀️💡
        </p>

        {/* Botones */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/Home">
            <button className="bg-blue-400 hover:bg-blue-700 text-white rounded-full px-6 py-3 font-medium transition">
              Empezamos
            </button>
          </Link>

          <Link href="#about">
            <button className="bg-blue-400 hover:bg-blue-700 text-white rounded-full px-6 py-3 font-medium transition">
              Sobre nosotros
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
