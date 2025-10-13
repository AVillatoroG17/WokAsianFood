import api from './api';
import { ILogin, ILoginResponse } from '../models/IAuth';

export const login = async (credentials: ILogin): Promise<ILoginResponse> => {
    const response = await api.post<ILoginResponse>('/api/auth/login', credentials);
    
    if (response.data.exito && response.data.token && response.data.rol && response.data.usuarioId && response.data.nombreCompleto) {
        // Guarda los datos en localStorage
        localStorage.setItem('token', response.data.token!);
        localStorage.setItem('userRole', response.data.rol!);
        localStorage.setItem('userId', response.data.usuarioId!.toString());
        localStorage.setItem('userName', response.data.nombreCompleto!);
    } else if (response.data.exito) {
        console.error('Login exitoso pero faltan datos en la respuesta del servidor');
    }
    
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
};

export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token');
};