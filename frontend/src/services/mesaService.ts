import api from './api';
import { IMesa } from '../models/IMesa'; // Crearemos este modelo

const API_URL = '/api/mesas';

export const getMesas = async (): Promise<IMesa[]> => {
    const response = await api.get<IMesa[]>(API_URL);
    return response.data;
};
