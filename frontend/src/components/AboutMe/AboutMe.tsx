'use client';

import {
    Github,
    Linkedin,
    Twitter,
    Mail,
    Gamepad2,
    Music,
    Dumbbell,
    MapPin,
    Globe2,
    Code2,
    Briefcase,
    GraduationCap,
    Waves,
    Heart,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutMe() {
    const socialLinks = [
        { name: 'GitHub', icon: <Github className="w-5 h-5" />, url: 'https://github.com/MarianoSaSo', color: 'hover:text-black' },
        { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, url: 'https://www.linkedin.com/in/mariano-s%C3%A1ez-soriano-6a7910117/', color: 'hover:text-blue-600' },
        { name: 'X', icon: <Twitter className="w-5 h-5" />, url: 'https://x.com/Cuzco_wiskiSS', color: 'hover:text-sky-500' },
        { name: 'Email', icon: <Mail className="w-5 h-5" />, url: 'mailto:mariano.saesor@gmail.com', color: 'hover:text-red-500' },
    ];

    const techStack = [
        { name: 'Python', category: 'Backend' },
        { name: 'JavaScript', category: 'Frontend' },
        { name: 'Java', category: 'Backend' },
        { name: 'React', category: 'Frontend' },
        { name: 'Next.js', category: 'Frontend' },
        { name: 'PHP', category: 'Backend' },
        { name: 'HTML', category: 'Frontend' },
        { name: 'CSS', category: 'Frontend' },
        { name: 'MySQL', category: 'Backend' },
        { name: 'Git', category: 'Tools' },
        { name: 'APIs/Microserv.', category: 'Architecture' },
        { name: 'SpringBoot', category: 'Backend' },
        { name: 'LangChain', category: 'AI' },
        { name: 'LangGraph', category: 'AI' },
        { name: 'n8n', category: 'Automation' },
    ];

    const hobbies = [
        { name: 'Nu-Metal & Rock', icon: <Music className="w-4 h-4" /> },
        { name: 'Series & Video Games Fanatic', icon: <Gamepad2 className="w-4 h-4" /> },
        { name: 'Sports & Fitness', icon: <Dumbbell className="w-4 h-4" /> },
        { name: 'Diving & Travel', icon: <Waves className="w-4 h-4" /> },
        { name: 'Real Madrid', icon: <Heart className="w-4 h-4 text-red-500" /> },
    ];

    const languages = [
        { name: 'Español', level: 'Nativo', code: 'es' },
        { name: 'English', level: 'B2/C1', code: 'gb' },
        { name: 'Polski', level: 'B1+', code: 'pl' },
        { name: 'Italiano', level: 'B1', code: 'it' },
    ];

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
                <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-3xl rotate-6 blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-white shadow-2xl bg-white flex items-center justify-center">
                        <img
                            src="/perfil_maniek.jpg"
                            alt="Maniek Saez"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-4 tracking-tight">
                        Maniek <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Saez</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 font-medium mb-6">
                        Junior Web Developer & Biology enthusiast turned <span className="text-black font-bold">AI Agents Builder</span>.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        {socialLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                className={`p-3 bg-white shadow-lg shadow-gray-200/50 rounded-2xl transition-all hover:-translate-y-1 ${link.color} text-gray-400`}
                            >
                                {link.icon}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Biography/Exeperience */}
                <div className="lg:col-span-7 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Code2 size={18} /></span>
                            Sobre mí
                        </h2>
                        <div className="prose prose-lg text-gray-600 leading-relaxed max-w-none">
                            <p>
                                Soy Maniek, un desarrollador web junior con una trayectoria atípica y fascinante. Empecé mi camino en el mundo de la
                                <strong> Biología y la Acuicultura</strong>, trabajando en investigación tanto en España como en Polonia e Italia.
                                Durante años, también me he forjado como <strong>profesor y manager</strong>, adquiriendo una gran experiencia en el trato con el público.
                                Sin embargo, mi curiosidad por la tecnología me llevó a dar el salto al desarrollo.
                            </p>
                            <p>
                                Actualmente, estoy especializado en la creación de aplicaciones web que integran <strong>Inteligencia Artificial</strong> para
                                automatizar procesos de negocio. Me encanta diseñar interfaces limpias (Frontend) y resolver problemas mediante
                                lógica sólida (Backend).
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><Briefcase size={18} /></span>
                            Experiencia Profesional
                        </h2>

                        <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                            {/* Buho AI */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1.5 w-9 h-9 bg-white border-2 border-purple-500 rounded-full flex items-center justify-center z-10 shadow-sm">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Web Developer Intern @ Buho AI</h3>
                                    <p className="text-xs text-purple-600 font-bold mb-2">2025 | Murcia, Spain</p>
                                    <p className="text-gray-600 text-sm leading-relaxed">Contribución al diseño y desarrollo de soluciones innovadoras integrando IA (FastAPI, React, LangChain, LangGraph) para optimizar procesos de negocio.</p>
                                </div>
                            </div>

                            {/* Garrigues & UW */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1.5 w-9 h-9 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center z-10 shadow-sm">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Teacher & Class Coordinator @ Garrigues Law Firm & UW</h3>
                                    <p className="text-xs text-gray-500 font-medium mb-2">2020 - 2025 | Warsaw, Poland</p>
                                    <p className="text-gray-600 text-sm leading-relaxed">Gestión y planificación de currículos personalizados para profesionales legales. Apoyo docente en español y biología en la Universidad de Varsovia.</p>
                                </div>
                            </div>

                            {/* Sin Fronteras */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1.5 w-9 h-9 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center z-10 shadow-sm">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Spanish Teacher @ Instituto Sin Fronteras</h3>
                                    <p className="text-xs text-gray-500 font-medium mb-2">2016 - 2025 | Warsaw, Poland</p>
                                    <p className="text-gray-600 text-sm leading-relaxed">Liderazgo de cursos de idiomas aplicando habilidades de comunicación efectiva para fomentar el aprendizaje y compromiso de los estudiantes.</p>
                                </div>
                            </div>

                            {/* Fisheries Institute */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1.5 w-9 h-9 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center z-10 shadow-sm">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Aquaculture Engineer & Biologist @ Inland Fisheries Institute</h3>
                                    <p className="text-xs text-gray-500 font-medium mb-2">2017 - 2021 | Piaseczno, Poland</p>
                                    <p className="text-gray-600 text-sm leading-relaxed">Análisis estadístico de datos fisiológicos y evaluación de efectos de tratamientos sobre el crecimiento y reproducción en peces de río.</p>
                                </div>
                            </div>

                            {/* IMIDA */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1.5 w-9 h-9 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center z-10 shadow-sm">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Research Assistant @ IMIDA</h3>
                                    <p className="text-xs text-gray-500 font-medium mb-2">2015 | Cartagena, Spain</p>
                                    <p className="text-gray-600 text-sm leading-relaxed">Investigación sobre el bienestar de la dorada (Sparus aurata). Contribución activa a la recopilación y análisis científico de datos.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><GraduationCap size={18} /></span>
                            Formación Académica
                        </h2>

                        <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                            {/* DAW */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1.5 w-9 h-9 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center z-10 shadow-sm">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Desarrollo de Aplicaciones Web (DAW)</h3>
                                    <p className="text-xs text-blue-600 font-bold mb-2">2023 - Presente | Murcia, Spain</p>
                                    <p className="text-gray-600 text-sm">CESUR - Enfoque en tecnologías Fullstack y arquitecturas modernas.</p>
                                </div>
                            </div>

                            {/* Master */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1.5 w-9 h-9 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center z-10 shadow-sm">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Master in Fish Farming & Aquaculture Management</h3>
                                    <p className="text-xs text-gray-500 font-medium mb-2">2014 - 2015 | Murcia, Spain</p>
                                    <p className="text-gray-600 text-sm">Universidad de Murcia - Facultad de Biología.</p>
                                </div>
                            </div>

                            {/* Erasmus */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1.5 w-9 h-9 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center z-10 shadow-sm">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Erasmus Program - Biology</h3>
                                    <p className="text-xs text-gray-500 font-medium mb-2">2012 - 2013 | Le Marche, Italy</p>
                                    <p className="text-gray-600 text-sm">Università Politecnica delle Marche, Ancona.</p>
                                </div>
                            </div>

                            {/* Bachelor */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1.5 w-9 h-9 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center z-10 shadow-sm">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Bachelor's Degree in Biology</h3>
                                    <p className="text-xs text-gray-500 font-medium mb-2">2009 - 2014 | Murcia, Spain</p>
                                    <p className="text-gray-600 text-sm">Universidad de Murcia - Facultad de Biología.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar/Skills & Hobbies */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Tech Box */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl text-white">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            Stack Tecnológico
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {techStack.map((tech) => (
                                <span
                                    key={tech.name}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors cursor-default border border-white/5"
                                >
                                    {tech.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Languages Box */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Globe2 className="w-5 h-5 text-blue-500" /> Idiomas
                        </h3>
                        <div className="space-y-4">
                            {languages.map((lang) => (
                                <div key={lang.name} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-6 relative rounded-sm overflow-hidden shadow-sm">
                                            <img
                                                src={`https://flagcdn.com/${lang.code}.svg`}
                                                alt={lang.name}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="font-bold text-gray-800">{lang.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg uppercase tracking-wider">
                                        {lang.level}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lifestyle Box */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Lifestyle & Pasiones</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {hobbies.map((hobby) => (
                                <div key={hobby.name} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors group relative overflow-hidden">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                        {hobby.icon}
                                    </div>
                                    <span className="font-bold text-gray-700 text-sm">{hobby.name}</span>

                                    {/* Easter Egg: Real Madrid / Cristiano Ronaldo */}
                                    {hobby.name === 'Real Madrid' && (
                                        <div className="absolute right-2 translate-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20">
                                            <img
                                                src="/siuuuuuu.jpg"
                                                alt="Siuuuuu"
                                                className="w-24 h-24 object-cover scale-110 -rotate-3 shadow-2xl rounded-xl border-2 border-white"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Spotify Playlist */}
                        <div className="mt-6">
                            <iframe
                                style={{ borderRadius: '12px' }}
                                src="https://open.spotify.com/embed/playlist/1WCRwQ0f4yT8tuIUUxP5m1?utm_source=generator"
                                width="100%"
                                height="380"
                                frameBorder="0"
                                allowFullScreen
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            ></iframe>
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 rounded-2xl">
                            <p className="text-xs text-blue-600 leading-normal font-medium italic">
                                "Me mudo de los acuarios a los LLMs, pero siempre con la misma pasión: aprender idiomas, explorar el mar y celebrar los goles del Madrid."
                            </p>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200">
                        <h3 className="text-xl font-bold mb-2">¿Colaboramos?</h3>
                        <p className="text-white/80 text-sm mb-6 leading-relaxed">
                            Busco oportunidades para seguir aprendiendo y aportar valor en todo el ciclo de desarrollo.
                        </p>
                        <Link
                            href="mailto:mariano.saesor@gmail.com"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all"
                        >
                            Contáctame <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
