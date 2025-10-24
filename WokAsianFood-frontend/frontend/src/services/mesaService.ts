import api from './api';
import { IMesa } from '../models/IMesa';

const API_URL = '/api/mesas';

// ✅ Interfaz para el formulario de entrada (sin mesaId)
export interface IMesaInput {
    numeroMesa: string;
    capacidad: number;
    ubicacion: 'interior' | 'terraza' | 'barra';
    activa: boolean;
}

// ✅ Obtener todas las mesas
export const getMesas = async (): Promise<IMesa[]> => {
    try {
        const response = await api.get<IMesa[]>(API_URL);
        return response.data;
    } catch (error: any) {
        console.error('Error al obtener mesas:', error);
        throw new Error(error.response?.data?.message || 'Error al cargar las mesas');
    }
};

// ✅ Obtener mesa por ID
export const getMesaById = async (id: number): Promise<IMesa> => {
    try {
        const response = await api.get<IMesa>(`${API_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error('Mesa no encontrada');
        }
        throw new Error('Error al obtener la mesa');
    }
};

// ✅ Crear nueva mesa (con manejo específico de duplicados)
export const createMesa = async (mesaData: IMesaInput): Promise<IMesa> => {
    try {
        const response = await api.post<IMesa>(API_URL, mesaData);
        return response.data;
    } catch (error: any) {
        // 🎯 Manejo específico del error 400 (número de mesa duplicado)
        if (error.response?.status === 400) {
            throw new Error(`El número de mesa "${mesaData.numeroMesa}" ya existe. Por favor, usa otro número.`);
        }
        
        // 🔒 Manejo de error 403 (sin permisos)
        if (error.response?.status === 403) {
            throw new Error('No tienes permisos para crear mesas. Contacta al administrador.');
        }
        
        throw new Error(error.response?.data?.message || 'Error al crear la mesa');
    }
};

// ✅ Actualizar mesa existente (con manejo de duplicados)
export const updateMesa = async (id: number, mesaData: IMesaInput): Promise<IMesa> => {
    try {
        const response = await api.put<IMesa>(`${API_URL}/${id}`, mesaData);
        return response.data;
    } catch (error: any) {
        // 🎯 Error 404: La mesa fue eliminada por otro usuario
        if (error.response?.status === 404) {
            throw new Error('La mesa que intentas actualizar ya no existe. Puede que haya sido eliminada.');
        }
        
        // 🎯 Error 400: Nuevo número de mesa duplicado
        if (error.response?.status === 400) {
            throw new Error(`El número de mesa "${mesaData.numeroMesa}" ya está en uso.`);
        }
        
        // 🔒 Error 403: Sin permisos
        if (error.response?.status === 403) {
            throw new Error('No tienes permisos para actualizar mesas.');
        }
        
        throw new Error('Error al actualizar la mesa');
    }
};

// ✅ Eliminar mesa
export const deleteMesa = async (id: number): Promise<void> => {
    try {
        await api.delete(`${API_URL}/${id}`);
    } catch (error: any) {
        // 🎯 Error 404: La mesa ya fue eliminada
        if (error.response?.status === 404) {
            throw new Error('La mesa ya no existe. Puede que haya sido eliminada.');
        }
        
        // 🔒 Error 403: Sin permisos
        if (error.response?.status === 403) {
            throw new Error('No tienes permisos para eliminar mesas.');
        }
        
        // ⚠️ Agregar validación personalizada si tienes órdenes abiertas
        if (error.response?.data?.message?.includes('orden')) {
            throw new Error('No se puede eliminar la mesa porque tiene órdenes activas.');
        }
        
        throw new Error('Error al eliminar la mesa');
    }
};

// ✅ Obtener solo mesas activas (útil para meseros)
export const getMesasActivas = async (): Promise<IMesa[]> => {
    try {
        const todasLasMesas = await getMesas();
        return todasLasMesas.filter(mesa => mesa.activa);
    } catch (error) {
        throw error;
    }
};