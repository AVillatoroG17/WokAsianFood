import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    usuarioId: number;
    nombreUsuario: string;
    nombreCompleto: string;
    rol: 'ADMIN' | 'MESERO' | 'COCINERO' | 'ENCARGADO' | string; 
    activo: boolean; 
    token: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean; // ✅ AGREGAR ESTA LÍNEA
    login: (nombreUsuario: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ AGREGAR ESTA LÍNEA - calcula si está autenticado
    const isAuthenticated = !!user && !!token;

    const login = async (nombreUsuario: string, password: string) => {
        setLoading(true);

        try {
            const apiUrl = 'http://localhost:8080/api/auth/login'; 
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombreUsuario, password })
            });

            if (!response.ok) {
                let errorMessage = 'Credenciales inválidas o error de servidor.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.mensaje || errorMessage;
                } catch (e) {
                    if (response.status === 401) {
                         errorMessage = 'Usuario o contraseña incorrectos.';
                    } else if (response.status === 403) {
                         errorMessage = 'Acceso denegado. Faltan permisos.';
                    } else if (response.status >= 500) {
                        errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            const loggedInUser: User = { 
                usuarioId: data.usuarioId,
                nombreUsuario: data.nombreUsuario,
                nombreCompleto: data.nombreCompleto,
                rol: data.rol ? data.rol.toUpperCase() : 'MESERO', 
                activo: data.activo === undefined ? true : data.activo, 
                token: data.token 
            };
            
            setUser(loggedInUser);
            setToken(loggedInUser.token);
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            localStorage.setItem('token', loggedInUser.token);

        } catch (err) {
            console.error("Login failed:", err);
            throw new Error((err as Error).message || 'Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch (e) {
                console.error("Error al parsear usuario de localStorage", e);
                logout();
            }
        }
        setLoading(false);
    }, []);

    // ✅ AGREGAR isAuthenticated al value
    const value = { user, token, loading, isAuthenticated, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};