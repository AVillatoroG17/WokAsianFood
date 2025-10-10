export interface ILogin {
    nombreUsuario: string;
    password: string;
}

export interface ILoginResponse {
    exito: boolean;
    mensaje: string;
    usuarioId: number;
    nombreUsuario: string;
    nombreCompleto: string;
    rol: string;
}
