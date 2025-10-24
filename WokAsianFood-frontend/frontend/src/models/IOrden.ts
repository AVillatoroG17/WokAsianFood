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
    estadoOrden: 'ABIERTA' | 'ENVIADA_COCINA' | 'EN_PROCESO' | 'LISTA' | 'LISTA_PARA_SERVIR' | 'ENTREGADA' | 'SERVIDA' | 'PAGADA' | 'CANCELADA';
    tipoOrden?: 'MESA' | 'PARA_LLEVAR' | 'DOMICILIO';
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