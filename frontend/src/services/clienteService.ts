import api from './api';
import { ICliente } from '../models/ICliente';

const API_URL = '/api/clientes';

export const getClientes = async (telefono?: string): Promise<ICliente[]> => {
    const params = telefono ? { telefono } : {};
    const response = await api.get<ICliente[]>(API_URL, { params });
    return response.data;
};

export const createCliente = async (clienteData: Omit<ICliente, 'clienteId' | 'fechaRegistro' | 'totalOrdenes' | 'clienteFrecuente'>): Promise<ICliente> => {
    const response = await api.post<ICliente>(API_URL, clienteData);
    return response.data;
};

export const updateCliente = async (id: number, clienteData: Partial<ICliente>): Promise<ICliente> => {
    const response = await api.put<ICliente>(`${API_URL}/${id}`, clienteData);
    return response.data;
};

export const deleteCliente = async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
};
