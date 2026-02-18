'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/userService';
import {
    User,
    Mail,
    Phone,
    Globe,
    Calendar,
    ShieldCheck,
    ShieldAlert,
    Loader2,
    ArrowLeft,
    QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UserInfo {
    id: string;
    nombre: string;
    apellidos: string;
    email?: string;
    telefono?: string;
    nacionalidad?: string;
    conectado?: boolean;
    created_at?: string;
    codigo_qr?: string;
}

interface UserProfileProps {
    userId?: string;
}

export default function UserProfile({ userId }: UserProfileProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Priorizar el ID pasado por prop (para QR) sobre el del usuario logueado
    const targetUserId = userId || user.user_id;

    useEffect(() => {
        const fetchUserData = async () => {
            if (!targetUserId) return;

            try {
                setLoading(true);
                const data = await userService.getUserInfo(targetUserId);
                if (data) {
                    setUserInfo(data);
                } else {
                    setError('No se pudo encontrar la información del perfil.');
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Ocurrió un error al cargar el perfil.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [targetUserId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Cargando perfil...</p>
            </div>
        );
    }

    if (error || !userInfo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">¡Ups! Algo salió mal</h3>
                <p className="text-gray-600 mb-6 max-w-md">{error || 'No se pudo cargar la información.'}</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver atrás
                </button>
            </div>
        );
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No disponible';
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Header Profile */}
            <div className="relative mb-8">
                <div className="h-48 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-xl"></div>
                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-2xl border border-white">
                        <div className="w-full h-full rounded-xl bg-blue-500 flex items-center justify-center text-white text-5xl font-bold overflow-hidden relative">
                            {userInfo.nombre.charAt(0).toUpperCase()}
                            <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-xs bg-white/20 backdrop-blur-md rounded-lg px-2 py-1">Cambiar</span>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            {userInfo.nombre} {userInfo.apellidos}
                            {userInfo.conectado && (
                                <span className="flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    En línea
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-500 font-medium">ID: {userInfo.id}</p>
                    </div>
                </div>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Quick Stats/Details */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Información Rápida</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Nacionalidad</p>
                                    <p className="font-semibold text-sm">{userInfo.nacionalidad || 'No especificada'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Miembro desde</p>
                                    <p className="font-semibold text-sm">{formatDate(userInfo.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl shadow-xl text-white">
                        <ShieldCheck className="w-8 h-8 text-blue-400 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Seguridad activa</h3>
                        <p className="text-gray-400 text-xs mb-4">Tu cuenta está protegida con los estándares de seguridad de Mermaid AI.</p>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-xs font-semibold transition-colors">
                            Gestionar accesos
                        </button>
                    </div>

                    {/* QR Code Section */}
                    {true && (
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">Acceso Móvil Quick-Scan</h3>
                            <p className="text-xs text-gray-500 mb-6">Escanea este código con tu teléfono para acceder directamente a tu perfil desde la misma red WiFi.</p>

                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-inner mb-4">
                                <QRCodeSVG
                                    value={userInfo.codigo_qr || `http://192.168.0.91:3000/profile/${userInfo.id}`}
                                    size={160}
                                    level="H"
                                    includeMargin={false}
                                    className="rounded-lg"
                                />
                            </div>

                            <p className="text-[10px] text-gray-400 font-mono break-all px-2">
                                {userInfo.codigo_qr || `http://192.168.0.91:3000/profile/${userInfo.id}`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column - Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Detalles de la cuenta</h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Nombre</label>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-700 font-medium">{userInfo.nombre}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Apellidos</label>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-700 font-medium">{userInfo.apellidos}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Correo electrónico</label>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-700 font-medium">{userInfo.email || 'Sin correo asociado'}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Teléfono de contacto</label>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-700 font-medium">{userInfo.telefono || 'Sin teléfono asociado'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-2.5 text-gray-600 font-bold text-sm hover:underline"
                            >
                                Cerrar
                            </button>
                            <button className="px-6 py-2.5 bg-black text-white rounded-2xl font-bold text-sm shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all">
                                Editar perfil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
