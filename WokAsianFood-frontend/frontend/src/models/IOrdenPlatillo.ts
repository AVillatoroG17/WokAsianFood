import { EstadoPreparacion } from "../enums/EstadoPreparacion";

export interface IOrdenPlatillo {
    ordenPlatilloId: number;
    platilloId: number;
    nombrePlatillo: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    estadoPreparacion: EstadoPreparacion;
    horaEnvioCocina?: string; // Usar string para fechas/horas
    horaInicioPreparacion?: string;
    horaFinPreparacion?: string;
    nombreCocinero?: string;
    notasPlatillo?: string;
    prioridad?: string; // Asumiendo que es un string para el frontend
}
