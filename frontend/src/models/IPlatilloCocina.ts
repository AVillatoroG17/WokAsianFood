export interface IPlatilloCocina {
    ordenPlatilloId: number;
    ordenId: number;
    numeroOrden: string;
    numeroMesa?: string;
    nombrePlatillo: string;
    cantidad: number;
    nombreCategoria: string;
    colorCategoria?: string;
    estadoPreparacion: 'pendiente' | 'en_preparacion' | 'listo';
    prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
    tiempoPreparacionEstimado: number;
    horaEnvioCocina: string;
    horaInicioPreparacion?: string;
    nombreCocinero?: string;
    notasPlatillo?: string;
}
