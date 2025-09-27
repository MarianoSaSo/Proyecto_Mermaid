"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";

interface CreateFolderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (folderName: string) => Promise<void> | void;
  existingFolders: string[];
}

export function CreateFolderForm({
  isOpen,
  onClose,
  onSubmit,
  existingFolders,
}: CreateFolderFormProps) {
  const [folderName, setFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Evitar hidratación no coincidente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!folderName.trim()) {
      setError("El nombre de la carpeta no puede estar vacío");
      return;
    }

    const sanitizedName = folderName.trim().replace(/\s+/g, "_");
    
    // Verificar si ya existe
    if (existingFolders.includes(sanitizedName)) {
      setError("Ya existe una carpeta con ese nombre");
      return;
    }

    setError("");
    setIsSubmitting(true);
    
    try {
      await onSubmit(sanitizedName);
      setFolderName("");
      onClose(); // Cerrar el modal después de enviar exitosamente
    } catch (err) {
      setError("Error al crear la carpeta. Inténtalo de nuevo.");
      console.error("Error creating folder:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // No renderizar en el servidor
  if (!isMounted) return null;

  // Estilos para el modal
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
      zIndex: 50,
    },
    content: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      width: '100%',
      maxWidth: '425px',
      margin: '1rem',
      padding: '1.5rem',
      position: 'relative' as const,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 600,
      margin: 0,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.25rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151',
    },
    input: {
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      fontSize: '0.875rem',
      width: '100%',
      boxSizing: 'border-box' as const,
    },
    error: {
      color: '#ef4444',
      fontSize: '0.75rem',
      marginTop: '0.25rem',
    },
    hint: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem',
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.5rem',
      paddingTop: '1rem',
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s',
    },
    buttonPrimary: {
      backgroundColor: '#000000',
      color: 'white',
      border: '1px solid transparent',
      opacity: 1,
      ':hover': {
        backgroundColor: '#ffffff',
        color: '#000000',
        border: '1px solid #000000',
      },
    },
    buttonPrimaryDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      border: '1px solid #d1d5db',
      color: '#374151',
    },
    buttonSecondaryHover: {
      backgroundColor: '#f3f4f6',
    },
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Crear nueva carpeta</h2>
          <button 
            onClick={onClose}
            style={modalStyles.closeButton}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={modalStyles.form}>
          <div style={modalStyles.formGroup}>
            <label htmlFor="folderName" style={modalStyles.label}>
              Nombre de la carpeta
            </label>
            <input
              type="text"
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Escribe el nombre de la carpeta"
              style={modalStyles.input}
              disabled={isSubmitting}
              autoFocus
            />
            {error && (
              <p style={modalStyles.error}>{error}</p>
            )}
            <p style={modalStyles.hint}>
              Los espacios serán reemplazados por guiones bajos (_)
            </p>
          </div>
          
          <div style={modalStyles.footer}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                ...modalStyles.button,
                ...modalStyles.buttonSecondary,
                ...(isSubmitting ? {} : { ':hover': modalStyles.buttonSecondaryHover })
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !folderName.trim()}
              style={{
                ...modalStyles.button,
                ...modalStyles.buttonPrimary,
                ...((isSubmitting || !folderName.trim()) ? {
                  ...modalStyles.buttonPrimaryDisabled,
                  ':hover': {}
                } : {}),
                opacity: (isSubmitting || !folderName.trim()) ? 0.7 : 1,
                cursor: (isSubmitting || !folderName.trim()) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && folderName.trim()) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#000000';
                  e.currentTarget.style.border = '1px solid #000000';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && folderName.trim()) {
                  e.currentTarget.style.backgroundColor = '#000000';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.border = '1px solid transparent';
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Creando...</span>
                </>
              ) : (
                'Crear carpeta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
