import api from './api';
import { ISuministro } from '../models/ISuministro';

const API_URL = '/api/suministros';

export const getSuministros = async (): Promise<ISuministro[]> => {
    const response = await api.get<ISuministro[]>(API_URL);
    return response.data;
};

export const createSuministro = async (suministroData: Omit<ISuministro, 'suministroId' | 'fechaActualizacion'>): Promise<ISuministro> => {
    const response = await api.post<ISuministro>(API_URL, suministroData);
    return response.data;
};

export const updateSuministro = async (id: number, suministroData: Partial<ISuministro>): Promise<ISuministro> => {
    const response = await api.put<ISuministro>(`${API_URL}/${id}`, suministroData);
    return response.data;
};

export const deleteSuministro = async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
};
