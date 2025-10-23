import api from './api'; // Importa la instancia configurada
import { IPlatilloCocina } from '../models/IPlatilloCocina';

export const getPlatillosCocina = async (): Promise<IPlatilloCocina[]> => {
  try {
    const response = await api.get('/api/cocina/platillos'); // Usa 'api' en lugar de 'axios'
    return response.data;
  } catch (error) {
    console.error('Error al obtener platillos de cocina:', error);
    throw error;
  }
};

export const iniciarPreparacionPlatillo = async (ordenPlatilloId: number, cocineroId: number): Promise<void> => {
  try {
    await api.post(`/api/cocina/platillos/${ordenPlatilloId}/iniciar`, { cocineroId });
  } catch (error) {
    console.error('Error al iniciar preparación:', error);
    throw error;
  }
};

export const marcarPlatilloListo = async (ordenPlatilloId: number): Promise<void> => {
  try {
    await api.post(`/api/cocina/platillos/${ordenPlatilloId}/listo`);
  } catch (error) {
    console.error('Error al marcar platillo como listo:', error);
    throw error;
  }
};