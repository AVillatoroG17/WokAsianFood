import api from './api';
import { IPlatillo } from '../models/IPlatillo'; // Crearemos este modelo

const API_URL = '/api/platillos';

export const getPlatillos = async (): Promise<IPlatillo[]> => {
    const response = await api.get<IPlatillo[]>(API_URL);
    return response.data;
};
