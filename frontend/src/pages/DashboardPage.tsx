import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth(); 

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!user || !user.rol) {
            navigate('/login', { replace: true });
            return;
        }

        // ******************************************************
        // CAMBIO CLAVE: Convertir el rol a MAYÚSCULAS antes del switch
        // ******************************************************
        const userRolUpper = user.rol.toUpperCase();

        // Redirigir según el rol del usuario
        switch (userRolUpper) {
            case 'ADMIN':
                navigate('/admin/estadisticas', { replace: true });
                break;
            case 'MESERO':
                navigate('/mesero/ordenes', { replace: true });
                break;
            case 'COCINERO':
                navigate('/cocina/pedidos', { replace: true });
                break;
            case 'ENCARGADO': 
                navigate('/inventario/suministros', { replace: true });
                break;
            default:
                // Si el rol es desconocido o no tiene una ruta asignada
                navigate('/unauthorized', { replace: true });
                break;
        }
    }, [navigate, user, loading]);

    // Muestra un indicador de carga mientras se procesa la redirección
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="mt-4 text-lg text-gray-600">Cargando su panel de control...</p>
        </div>
    );
};

export default DashboardPage;