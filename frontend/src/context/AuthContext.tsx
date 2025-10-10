import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { decodeToken, isTokenExpired } from '../utils/jwt';

// Define la estructura del usuario y el tipo del contexto
interface User {
   userId: number;
   nombreUsuario: string;
   nombreCompleto: string;
   rol: 'ADMIN' | 'MESERO' | 'COCINERO' | 'ENCARGADO';
}

interface AuthContextType {
   isAuthenticated: boolean;
   user: User | null;
   login: (token: string) => void;
   logout: () => void;
   loading: boolean;
}

// Crea el contexto con un valor por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define el componente Proveedor
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
   const [user, setUser] = useState<User | null>(null);
   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
   const [loading, setLoading] = useState<boolean>(true);

   useEffect(() => {
      // Al montar, verifica el token en localStorage
      try {
         const token = localStorage.getItem('authToken');
         if (token && !isTokenExpired(token)) {
            const decoded = decodeToken(token);
            setUser({
               userId: decoded.userId,
               nombreUsuario: decoded.username,
               nombreCompleto: decoded.nombreCompleto,
               rol: decoded.role, // Aquí se lee el rol del token
            });
            setIsAuthenticated(true);
         } else {
            // Si el token no existe o es inválido, limpia el storage
            localStorage.removeItem('authToken');
         }
      } catch (error) {
         console.error("Error al procesar el token inicial:", error);
         localStorage.removeItem('authToken');
      } finally {
         setLoading(false);
      }
   }, []);

   const login = (token: string) => {
      const decoded = decodeToken(token);
      if (decoded && !isTokenExpired(token)) {
         localStorage.setItem('authToken', token);
         setUser({
            userId: decoded.userId,
            nombreUsuario: decoded.username,
            nombreCompleto: decoded.nombreCompleto,
            rol: decoded.role, // Aquí se asigna el rol del token
         });
         setIsAuthenticated(true);
      } else {
          console.error("Intento de login con token inválido o expirado.");
      }
   };

   const logout = () => {
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
   };

   return (
      <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
         {children}
      </AuthContext.Provider>
   );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
   const context = useContext(AuthContext);
   if (context === undefined) {
      throw new Error('useAuth debe ser usado dentro de un AuthProvider');
   }
   return context;
};
