
// Decodifica un token JWT para extraer su contenido (payload).
export const decodeToken = (token: string): any | null => {
  try {
    // El payload está en la segunda parte del token, codificado en Base64.
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};

// Verifica si un token JWT ha expirado.
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) {
    // Si no hay fecha de expiración, se considera inválido/expirado.
    return true;
  }
  // Compara la fecha de expiración (en segundos) con la fecha actual (en milisegundos).
  return Date.now() >= decoded.exp * 1000;
};
