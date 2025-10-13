import api from './api';
import { IPlatillo } from '../models/IPlatillo';

const API_URL = '/api/platillos';

export const getPlatillos = async (): Promise<IPlatillo[]> => {
    const response = await api.get<IPlatillo[]>(API_URL);
    return response.data;
};

export const createPlatillo = async (platilloData: Omit<IPlatillo, 'platilloId' | 'nombreCategoria'>): Promise<IPlatillo> => {
    const response = await api.post<IPlatillo>(API_URL, platilloData);
    return response.data;
};

export const updatePlatillo = async (id: number, platilloData: Partial<IPlatillo>): Promise<IPlatillo> => {
    const response = await api.put<IPlatillo>(`${API_URL}/${id}`, platilloData);
    return response.data;
};

export const deletePlatillo = async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
};
