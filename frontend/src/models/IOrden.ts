import { IOrdenPlatillo } from "./IOrdenPlatillo";

export interface IOrdenDTO {
    ordenId?: number; 
    numeroOrden?: string; // Añadido para la vista de cocina
    mesaId: number;
    numeroMesa?: string; // Añadido para la vista de cocina
    clienteId?: number;
    nombreCliente?: string; // Añadido para la vista de cocina
    meseroId: number;
    nombreMesero?: string; // Añadido para la vista de cocina
    estadoOrden: 'abierta' | 'enviada_cocina' | 'en_preparacion' | 'lista' | 'entregada' | 'pagada' | 'cancelada';
    tipoOrden?: string; // Añadido para la vista de cocina
    subtotal?: number;
    impuestos?: number;
    descuento?: number;
    totalOrden: number;
    fechaOrden: string; 
    notasGenerales?: string;
    direccionEntrega?: string;
    telefonoContacto?: string;
    numeroPersonas?: number;
    platillos?: IOrdenPlatillo[];
}

