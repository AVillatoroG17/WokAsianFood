export interface ISuministro {
    suministroId: number;
    nombre: string;
    categoria: string;
    cantidad: number;
    unidadMedida: string;
    precioUnitario: number;
    stockMinimo: number;
    fechaActualizacion?: string;
}