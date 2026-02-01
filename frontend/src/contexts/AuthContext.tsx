"use client"; //Esto solo significa:“Este código se ejecuta en el navegador”

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { userService } from "@/lib/userService";
/*useState
📌 Guarda información en memoria mientras la app está abierta
📌 Ejemplo: usuario, contador, formulario

useEffect
📌 Ejecuta código cuando pasa algo
📌 Aquí:

al arrancar la app
cuando cambia el usuario

createContext
📌 Crea una caja global
📌 Permite compartir datos sin pasarlos uno a uno

useContext
📌 Abre esa caja desde cualquier componente*/

interface User {
  // Dice las propiedades que debe de tener el usuario
  user_id: string;
  name: string | null;
  isLoggedIn: boolean;
}

//¿Qué va a tener el Context?, el contrato
/*Esto responde a:
“¿QUÉ cosas va a compartir la caja?”
📦 La caja tendrá:
    >el usuario
    >una forma de entrar
    >una forma de salir
    >un estado de carga
    >un estado de verificación*/
interface AuthContextType {
  user: User; //Información del usuario
  login: (userData: Omit<User, "isLoggedIn">) => void; //Función para iniciar sesión
  logout: () => void; //Función para cerrar sesión
  verifyAndLogin: (userId: string) => Promise<boolean>; //Función para verificar y hacer login seguro
  isLoading: boolean; //Indica si se está cargando
  isVerifying: boolean; //Indica si se está verificando el usuario
}

//Crear la caja (Context), del tipo que hemos definido antes
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//(EL GUARDIÁN DE LA CAJA) Componente que envuelve la app y da acceso al Context
/*¿Dónde se usa?
  En el nivel MÁS ALTO:

    <AuthProvider>
      <App />
    </AuthProvider>
👉 Todo lo que esté dentro puede acceder al usuario*/
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({
    user_id: "",
    name: null,
    isLoggedIn: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("mermaid_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
      localStorage.removeItem("mermaid_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar en localStorage cuando cambia el usuario
  useEffect(() => {
    if (!isLoading) {
      try {
        if (user.isLoggedIn) {
          localStorage.setItem("mermaid_user", JSON.stringify(user));
        } else {
          localStorage.removeItem("mermaid_user");
        }
      } catch (error) {
        console.error("Error saving user to localStorage:", error);
      }
    }
  }, [user, isLoading]);

  // POLL DE SEGURIDAD: Verificar periódicamente que el usuario sigue conectado en BBDD
  useEffect(() => {
    if (!user.isLoggedIn || !user.user_id) return;

    const checkUserStatus = async () => {
      try {
        // Obtenemos la info actual del usuario desde el backend
        // userService.verifyUser lanza error si conectado es false
        await userService.verifyUser(user.user_id);
        console.log("Verificación periódica: Usuario sigue conectado ✅");
      } catch (error) {
        console.warn(
          "Verificación periódica fallida: Usuario ya no está conectado ❌",
          error,
        );
        // Si falla la verificación (token expirado, conectado=false, usuario borrado), cerramos sesión
        logout();
      }
    };

    // Comprobar cada 10 segundos
    const intervalId = setInterval(checkUserStatus, 10000);

    // Ejecutar una vez inmediatamente al montar (opcional, para validación rápida)
    checkUserStatus();

    // Limpiar intervalo al desmontar o cuando cambia el usuario
    return () => clearInterval(intervalId);
  }, [user.isLoggedIn, user.user_id]);

  const login = (userData: Omit<User, "isLoggedIn">) => {
    setUser({
      ...userData,
      isLoggedIn: true,
    });
  };

  const logout = () => {
    // Si tenemos ID de usuario, notificamos al backend que se ha desconectado
    if (user.user_id) {
      userService.logout(user.user_id).catch((err) => {
        console.error("Error al notificar logout al backend", err);
      });
    }

    setUser({
      user_id: "",
      name: null,
      isLoggedIn: false,
    });
    localStorage.removeItem("mermaid_user");
  };

  // Función segura para verificar y hacer login
  const verifyAndLogin = async (userId: string): Promise<boolean> => {
    setIsVerifying(true);

    try {
      // Verificar usuario en el backend
      const userData = await userService.verifyUser(userId);

      // Si la verificación es exitosa, hacer login
      login({
        user_id: userData.id,
        name: userData.nombre,
      });

      return true;
    } catch (error) {
      console.error("Error en verificación de usuario:", error);
      logout(); // Limpiar cualquier sesión existente
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, verifyAndLogin, isLoading, isVerifying }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/*  > AuthProvider = la caja con todos los datos
    > useAuth() = la llave que abre la caja
    > La comprobación if context === undefined = que solo abras la caja si realmente existe*/
