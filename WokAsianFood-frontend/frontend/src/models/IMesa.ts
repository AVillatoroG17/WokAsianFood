// src/models/IMesa.ts

export type UbicacionMesa = 'interior' | 'terraza' | 'barra';

export interface IMesa {
    mesaId: number;
    numeroMesa: string;
    capacidad: number;
    ubicacion: UbicacionMesa; // ✅ Propiedad agregada
    activa: boolean;
    tieneOrdenAbierta?: boolean; // Campo opcional para el frontend
}