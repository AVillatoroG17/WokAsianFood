import api from './api';
import { IOrdenDTO } from '../models/IOrden';

const API_URL = '/api/pagos';

export const getOrdenesFacturables = async (): Promise<IOrdenDTO[]> => {
    const response = await api.get<IOrdenDTO[]>(`${API_URL}/ordenes-facturables`);
    return response.data;
};

export const crearPago = async (pagoData: any): Promise<any> => {
    const response = await api.post(API_URL, pagoData);
    return response.data;
};