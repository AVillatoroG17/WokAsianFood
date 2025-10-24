export interface IPlatilloCocina {
    ordenPlatilloId: number;
    ordenId: number;
    numeroOrden: string;
    numeroMesa?: string;
    nombrePlatillo: string;
    cantidad: number;
    nombreCategoria: string;
    colorCategoria?: string;
    estadoPreparacion: 'LISTO' | 'PENDIENTE' | 'EN_COCINA' | 'SERVIDO' | 'CANCELADO'; 
    prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
    tiempoPreparacionEstimado: number;
    horaEnvioCocina: string;
    horaInicioPreparacion?: string;
    nombreCocinero?: string;
    notasPlatillo?: string;
}
