import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token enviado:', token.substring(0, 20) + '...');
      
      // ✅ AGREGAR ESTO: Decodificar y mostrar el payload del token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📦 Payload del token:', payload);
        console.log('👤 Rol en el token:', payload.rol || payload.authorities || 'NO ENCONTRADO');
      } catch (e) {
        console.error('⚠️ Error decodificando token:', e);
      }
    } else {
      console.warn('⚠️ No hay token en localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor mejorado para errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ 401: Token inválido o expirado');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('❌ 403: No tienes permisos para esta acción');
      alert('No tienes permisos para realizar esta acción. Contacta al administrador.');
    }
    return Promise.reject(error);
  }
);

export default api;