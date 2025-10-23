import api from './api';

// Asumo que tienes estas interfaces definidas en otro lugar
interface IOrdenInput {
    mesaId: number;
    meseroId: number;
    // ... otros campos del DTO
}

interface IOrdenOutput {
    ordenId: number;
    numeroOrden: string;
    // ... otros campos
}

const API_URL = '/api/ordenes';

export const createOrden = async (ordenData: IOrdenInput): Promise<IOrdenOutput> => {
    const response = await api.post<IOrdenOutput>(API_URL, ordenData);
    return response.data;
};
