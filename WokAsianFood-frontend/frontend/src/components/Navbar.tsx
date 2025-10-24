import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCircle, CreditCard } from 'lucide-react';

const Navbar: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();

    // Si no está autenticado, no mostrar nada
    if (!isAuthenticated || !user) {
        return null;
    }

    // Normalizar el rol (eliminar espacios y convertir a mayúsculas)
    const userRole = user.rol.trim().toUpperCase();

    // Verificar permisos para cada sección
    const canAccessEstadisticas = userRole === 'ADMIN';
    const canAccessUsuarios = userRole === 'ADMIN';
    const canAccessOrdenes = ['ADMIN', 'MESERO'].includes(userRole);
    const canAccessCocina = ['ADMIN', 'COCINERO'].includes(userRole);
    const canAccessInventario = ['ADMIN', 'ENCARGADO'].includes(userRole);
    const canAccessPlatillos = ['ADMIN', 'COCINERO'].includes(userRole);
    const canAccessClientes = ['ADMIN', 'MESERO'].includes(userRole);
    const canAccessCaja = ['ADMIN', 'CAJERO', 'ENCARGADO'].includes(userRole);

    return (
        <nav className="bg-gray-800 p-4 text-white shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo / Nombre del Restaurante */}
                <Link to="/" className="font-bold text-xl hover:text-orange-400 transition-colors">
                    🍜 Wok Asian Food
                </Link>
                
                {/* Enlaces dinámicos basados en el rol */}
                <div className="hidden md:flex items-center space-x-4">
                    {canAccessEstadisticas && (
                        <Link 
                            to="/admin/estadisticas" 
                            className="hover:text-orange-400 transition-colors"
                        >
                            📊 Estadísticas
                        </Link>
                    )}

                    {canAccessUsuarios && (
                        <Link 
                            to="/admin/usuarios" 
                            className="hover:text-orange-400 transition-colors"
                        >
                            👥 Usuarios
                        </Link>
                    )}

                    {canAccessOrdenes && (
                        <Link 
                            to="/mesero/ordenes" 
                            className="hover:text-orange-400 transition-colors"
                        >
                            📋 Órdenes
                        </Link>
                    )}

                    {canAccessCocina && (
                        <Link 
                            to="/cocina/pedidos" 
                            className="hover:text-orange-400 transition-colors"
                        >
                            👨‍🍳 Cocina
                        </Link>
                    )}

                    {canAccessCaja && (
                        <Link 
                            to="/caja/facturacion" 
                            className="hover:text-orange-400 transition-colors flex items-center"
                        >
                            <CreditCard size={18} className="mr-1" />
                            💳 Caja
                        </Link>
                    )}

                    {canAccessInventario && (
                        <Link 
                            to="/inventario/suministros" 
                            className="hover:text-orange-400 transition-colors"
                        >
                            📦 Inventario
                        </Link>
                    )}

                    {canAccessPlatillos && (
                        <Link 
                            to="/platillos" 
                            className="hover:text-orange-400 transition-colors"
                        >
                            🍽️ Platillos
                        </Link>
                    )}

                    {canAccessClientes && (
                        <Link 
                            to="/clientes" 
                            className="hover:text-orange-400 transition-colors"
                        >
                            👤 Clientes
                        </Link>
                    )}
                </div>

                {/* Información de Usuario y Logout */}
                <div className="flex items-center space-x-4">
                    {/* Badge del Rol */}
                    <span className={`
                        text-xs font-bold px-3 py-1 rounded-full
                        ${userRole === 'ADMIN' ? 'bg-red-500' : ''}
                        ${userRole === 'MESERO' ? 'bg-blue-500' : ''}
                        ${userRole === 'COCINERO' ? 'bg-orange-500' : ''}
                        ${userRole === 'CAJERO' ? 'bg-green-500' : ''}
                        ${userRole === 'ENCARGADO' ? 'bg-purple-500' : ''}
                    `}>
                        {userRole}
                    </span>

                    {/* Nombre del Usuario */}
                    <span className="hidden lg:flex items-center">
                        <UserCircle className="mr-2" size={20} />
                        <span className="font-medium">
                            {user.nombreCompleto || user.nombreUsuario}
                        </span>
                    </span>

                    {/* Botón de Logout */}
                    <button 
                        onClick={logout} 
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={16} className="mr-2" />
                        <span className="hidden sm:inline">Salir</span>
                    </button>
                </div>
            </div>

            {/* Menú móvil (opcional - para pantallas pequeñas) */}
            <div className="md:hidden mt-4 flex flex-wrap gap-2">
                {canAccessEstadisticas && (
                    <Link 
                        to="/admin/estadisticas" 
                        className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                    >
                        📊 Estadísticas
                    </Link>
                )}
                {canAccessUsuarios && (
                    <Link 
                        to="/admin/usuarios" 
                        className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                    >
                        👥 Usuarios
                    </Link>
                )}
                {canAccessOrdenes && (
                    <Link 
                        to="/mesero/ordenes" 
                        className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                    >
                        📋 Órdenes
                    </Link>
                )}
                {canAccessCocina && (
                    <Link 
                        to="/cocina/pedidos" 
                        className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                    >
                        👨‍🍳 Cocina
                    </Link>
                )}
                {canAccessCaja && (
                    <Link 
                        to="/caja/facturacion" 
                        className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                    >
                        💳 Caja
                    </Link>
                )}
                {canAccessInventario && (
                    <Link 
                        to="/inventario/suministros" 
                        className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                    >
                        📦 Inventario
                    </Link>
                )}
                {canAccessPlatillos && (
                    <Link 
                        to="/platillos" 
                        className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                    >
                        🍽️ Platillos
                    </Link>
                )}
                {canAccessClientes && (
                    <Link 
                        to="/clientes" 
                        className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                    >
                        👤 Clientes
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;