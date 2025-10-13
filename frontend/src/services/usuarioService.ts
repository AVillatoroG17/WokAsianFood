import api from './api';
import { IUsuario } from '../models/IUsuario'; // Asumo que tienes un modelo IUsuario

const API_URL = '/api/v1/usuarios';

export const getUsuarios = async (): Promise<IUsuario[]> => {
    const response = await api.get<IUsuario[]>(API_URL);
    return response.data;
};

export const createUsuario = async (usuarioData: any): Promise<any> => {
    // El endpoint de registro está en /api/auth/registrar
    const response = await api.post('/api/auth/registrar', usuarioData);
    return response.data;
};

export const updateUsuario = async (id: number, usuarioData: Partial<IUsuario>): Promise<IUsuario> => {
    const response = await api.put<IUsuario>(`${API_URL}/${id}`, usuarioData);
    return response.data;
};

export const deleteUsuario = async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
};
