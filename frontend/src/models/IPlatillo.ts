export interface IPlatillo {
    platilloId: number;
    nombrePlatillo: string;
    categoriaId: number;
    nombreCategoria: string;
    precioPlatillo: number;
    tiempoPreparacion: number;
    disponible: boolean;
    descripcion?: string;
    imagenUrl?: string;
}