"use client";//Esto solo significa:“Este código se ejecuta en el navegador”

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
/*Nombre	    Qué es
createContext	crea la caja central
useContext	    permite abrir la caja
useState	    guarda datos
useEffect	    ejecuta código al iniciar
ReactNode	    hijos (componentes dentro)*/

interface User {
  user_id: string;
  name: string | null;
  isLoggedIn: boolean;
}

//¿Qué va a tener el Context?
interface AuthContextType {
  user: User;//Información del usuario
  login: (userData: Omit<User, 'isLoggedIn'>) => void;//Función para iniciar sesión
  logout: () => void;//Función para cerrar sesión
  isLoading: boolean;//Indica si se está cargando
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({
    user_id: '',
    name: null,
    isLoggedIn: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mermaid_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem('mermaid_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar en localStorage cuando cambia el usuario
  useEffect(() => {
    if (!isLoading) {
      try {
        if (user.isLoggedIn) {
          localStorage.setItem('mermaid_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('mermaid_user');
        }
      } catch (error) {
        console.error('Error saving user to localStorage:', error);
      }
    }
  }, [user, isLoading]);

  const login = (userData: Omit<User, 'isLoggedIn'>) => {
    setUser({
      ...userData,
      isLoggedIn: true,
    });
  };

  const logout = () => {
    setUser({
      user_id: '',
      name: null,
      isLoggedIn: false,
    });
    localStorage.removeItem('mermaid_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
