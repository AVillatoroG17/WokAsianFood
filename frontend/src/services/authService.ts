import api from './api';
import { ILogin, ILoginResponse } from '../models/IUsuario';

export const login = async (credentials: ILogin): Promise<ILoginResponse> => {
    const response = await api.post<ILoginResponse>('/api/auth/login', credentials);
    if (response.data.exito) {
        localStorage.setItem('token', response.data.token); // Asumiendo que el token también se devuelve
        localStorage.setItem('userRole', response.data.rol);
        localStorage.setItem('userId', response.data.usuarioId.toString());
        localStorage.setItem('userName', response.data.nombreCompleto);
    }
    return response.data;
};
