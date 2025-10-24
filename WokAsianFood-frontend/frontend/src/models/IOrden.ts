import { IOrdenPlatillo } from "./IOrdenPlatillo";

export interface IOrdenDTO {
    ordenId?: number; 
    numeroOrden?: string;
    mesaId: number;
    numeroMesa?: string;
    clienteId?: number;
    nombreCliente?: string;
    meseroId: number;
    nombreMesero?: string;
    estadoOrden: 'abierta' | 'enviada_cocina' | 'en_preparacion' | 'lista' | 'lista_para_servir' | 'entregada' | 'servida' | 'pagada' | 'cancelada';
    tipoOrden?: 'mesa' | 'para_llevar' | 'domicilio';
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