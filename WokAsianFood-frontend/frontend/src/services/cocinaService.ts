import api from './api'; // Asumo que esta es la instancia de Axios configurada
import { IPlatilloCocina } from '../models/IPlatilloCocina';

export const getPlatillosCocina = async (): Promise<IPlatilloCocina[]> => {
    try {
        const response = await api.get('/api/cocina/platillos');
        return response.data;
    } catch (error) {
        console.error('Error al obtener platillos de cocina:', error);
        throw error;
    }
};

export const iniciarPreparacionPlatillo = async (ordenPlatilloId: number, cocineroId: number): Promise<void> => {
    try {
        await api.patch(`/api/cocina/platillos/${ordenPlatilloId}/iniciar?cocineroId=${cocineroId}`);
    } catch (error) {
        console.error('Error al iniciar preparación:', error);
        throw error;
    }
};

export const marcarPlatilloListo = async (ordenPlatilloId: number): Promise<void> => {
    try {
        await api.patch(`/api/cocina/platillos/${ordenPlatilloId}/listo`);
    } catch (error) {
        console.error('Error al marcar platillo como listo:', error);
        throw error;
    }
};