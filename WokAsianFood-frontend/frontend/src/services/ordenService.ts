import api from './api';
import { IOrdenDTO } from '../models/IOrden';

const API_URL = '/api/ordenes';

export interface IOrdenInputDTO {
    mesaId: number;
    clienteId?: number;
    meseroId: number;
    tipoOrden: 'MESA' | 'PARA_LLEVAR' | 'DOMICILIO';
    notasGenerales?: string;
    direccionEntrega?: string;
    telefonoContacto?: string;
    numeroPersonas: number;
    platillos: Array<{
        platilloId: number;
        cantidad: number;
        notasPlatillo?: string;
    }>;
}

export const createOrden = async (ordenData: IOrdenInputDTO): Promise<IOrdenDTO> => {
    console.log('📤 Enviando orden al backend:', ordenData);
    const response = await api.post<IOrdenDTO>(API_URL, ordenData);
    console.log('✅ Respuesta del backend:', response.data);
    return response.data;
};

export const getOrdenes = async (params?: {
    estados?: string;
    mesaId?: number;
    meseroId?: number;
}): Promise<IOrdenDTO[]> => {
    const response = await api.get<IOrdenDTO[]>(API_URL, { params });
    return response.data;
};

export const getOrdenById = async (ordenId: number): Promise<IOrdenDTO> => {
    const response = await api.get<IOrdenDTO>(`${API_URL}/${ordenId}`);
    return response.data;
};

export const marcarOrdenComoServida = async (ordenId: number, meseroId: number): Promise<IOrdenDTO> => {
    const response = await api.patch<IOrdenDTO>(`${API_URL}/${ordenId}/servida`, {}, {
        params: { meseroId }
    });
    return response.data;
};

export const solicitarPagoOrden = async (ordenId: number): Promise<IOrdenDTO> => {
    const response = await api.patch<IOrdenDTO>(`${API_URL}/${ordenId}/solicitar-pago`);
    return response.data;
};