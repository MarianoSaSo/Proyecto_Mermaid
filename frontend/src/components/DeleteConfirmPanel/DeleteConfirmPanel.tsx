"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";

interface DeleteConfirmPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  deleting?: boolean;
  itemName?: string;
  isFolder?: boolean;
  error?: string;
}

export function DeleteConfirmPanel({
  isOpen,
  onClose,
  onConfirm,
  deleting = false,
  itemName = "",
  isFolder = false,
  error = ""
}: DeleteConfirmPanelProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isOpen) return null;

  const modalStyles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    },
    content: {
      backgroundColor: '#f3f4f6', // Gris claro similar Tailwind gray-100/200
      border: '1.5px solid #222', // Borde fino oscuro
      borderRadius: '0.5rem',
      width: '100%',
      maxWidth: '400px',
      padding: '2rem',
      boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    },
    formGroup: {
      marginBottom: '1.5rem',
      width: '100%',
      textAlign: 'center' as const,
    },
    button: {
      margin: '0 0.5rem',
      minWidth: '100px',
    },
    error: {
      color: 'red',
      marginTop: '1rem',
      fontSize: '0.9rem',
      textAlign: 'center' as const,
    },
    image: {
      marginBottom: '1.5rem',
    },
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
        <div style={modalStyles.image}>
          <Image src="/buho-warning.png" alt="Advertencia" width={90} height={90} />
        </div>
        <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem', color: '#d97706' }}>
          ¿Seguro que quieres eliminar {isFolder ? 'la carpeta' : 'el archivo'}?
        </h2>
        <div style={modalStyles.formGroup}>
          <span style={{ color: '#333', fontWeight: 500 }}>{itemName}</span>
        </div>
        {error && <div style={modalStyles.error}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button
            onClick={onClose}
            style={{ ...modalStyles.button, background: '#eee', color: '#333', borderRadius: '0.3rem', border: '1px solid #ccc' }}
            disabled={deleting}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{ ...modalStyles.button, background: '#d97706', color: 'white', borderRadius: '0.3rem', border: 'none', fontWeight: 600 }}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="animate-spin" size={18} /> : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
