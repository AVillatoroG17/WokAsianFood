import api from './api';

export interface IOrden {
    ordenId: number;
    numeroOrden: string;
    estadoOrden: string; // Ejemplo: 'ABIERTA', 'LISTA_PARA_SERVIR', 'SERVIDA', 'LISTA_PARA_PAGO'
    
}

const API_URL = '/api/ordenes';

export const marcarOrdenComoServida = async (ordenId: number, meseroId: number): Promise<IOrden> => {
    // Usamos PATCH y pasamos meseroId como Query Parameter
    const response = await api.patch<IOrden>(`${API_URL}/${ordenId}/servida`, {}, {
        params: { meseroId }
    });
    return response.data;
};

export const solicitarPagoOrden = async (ordenId: number): Promise<IOrden> => {
    // Usamos PATCH
    const response = await api.patch<IOrden>(`${API_URL}/${ordenId}/solicitar-pago`);
    return response.data;
};