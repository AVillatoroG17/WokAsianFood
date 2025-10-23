export interface IUsuario {
    usuarioId: number;
    nombreUsuario: string;
    nombreCompleto: string;
    email?: string;
    rol: 'ADMIN' | 'MESERO' | 'COCINERO' | 'ENCARGADO';
    activo: boolean;
    fechaCreacion: string;
    ultimoAcceso?: string;
}
