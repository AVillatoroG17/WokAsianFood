export interface ICliente {
    clienteId: number;
    nombre: string;
    telefono?: string;
    email?: string;
    fechaRegistro: string;
    totalOrdenes: number;
    clienteFrecuente: boolean;
}