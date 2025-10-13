export interface IMesa {
    mesaId: number;
    numeroMesa: string;
    capacidad: number;
    activa: boolean;
    // Este campo puede que no venga del backend, lo manejaremos en el frontend
    tieneOrdenAbierta?: boolean; 
}
