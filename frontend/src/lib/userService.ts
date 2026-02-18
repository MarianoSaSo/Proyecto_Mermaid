interface UserInfo {
  id: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  email?: string;
  nacionalidad?: string;
  conectado?: boolean;
  codigo_verificacion?: string;
  password?: string;
  created_at?: string;
  codigo_qr?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const userService = {
  /**
   * Verifica si un usuario está conectado y obtiene su información completa
   * @param userId - ID del usuario a verificar
   * @returns Promise<UserInfo> - Información completa del usuario
   * @throws Error si el usuario no existe o hay error de conexión
   */
  async verifyUser(userId: string): Promise<UserInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/info_user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuario no encontrado');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const userData = await response.json();

      // Verificación adicional: el usuario debe estar conectado
      if (!userData.conectado) {
        throw new Error('Usuario no está conectado');
      }

      return userData;
    } catch (error) {
      console.error('Error verificando usuario:', error);
      throw error;
    }
  },

  /**
   * Obtiene información básica del usuario sin verificar conexión
   * @param userId - ID del usuario
   * @returns Promise<UserInfo | null>
   */
  async getUserInfo(userId: string): Promise<UserInfo | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/info_user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo información del usuario:', error);
      return null;
    }
  },

  /**
   * Desconecta al usuario en el backend (pone conectado = false)
   * @param userId - ID del usuario
   */
  async logout(userId: string): Promise<void> {
    if (!userId) return;

    try {
      // Intentamos notificar al backend, pero no bloqueamos si falla
      await fetch(`${API_BASE_URL}/users/logout/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error enviando logout al backend:', error);
      // No lanzamos error para permitir que el logout local continúe
    }
  }
};