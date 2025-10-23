
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';

const Navbar: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();

    // Si no está autenticado, no mostrar nada o un navbar mínimo.
    if (!isAuthenticated || !user) {
        return null; // O un navbar de "página pública"
    }

    return (
        <nav className="bg-gray-800 p-4 text-white shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="font-bold text-xl">Wok Asian Food</Link>
                
                {/* Enlaces dinámicos basados en el rol */}
                <div className="hidden md:flex items-center space-x-4">
                    {(user.rol.trim() === 'ADMIN') && <Link to="/admin/estadisticas" className="hover:text-orange-400">Estadísticas</Link>}
                    {(user.rol.trim() === 'ADMIN') && <Link to="/admin/usuarios" className="hover:text-orange-400">Usuarios</Link>}
                    {(user.rol.trim() === 'ADMIN' || user.rol.trim() === 'MESERO') && <Link to="/mesero/ordenes" className="hover:text-orange-400">Órdenes</Link>}
                    {(user.rol.trim() === 'ADMIN' || user.rol.trim() === 'COCINERO') && <Link to="/cocina/pedidos" className="hover:text-orange-400">Cocina</Link>}
                    {(user.rol.trim() === 'ADMIN' || user.rol.trim() === 'ENCARGADO') && <Link to="/inventario/suministros" className="hover:text-orange-400">Inventario</Link>}
                    {(user.rol.trim() === 'ADMIN' || user.rol.trim() === 'COCINERO') && <Link to="/platillos" className="hover:text-orange-400">Platillos</Link>}
                    {(user.rol.trim() === 'ADMIN' || user.rol.trim() === 'MESERO') && <Link to="/clientes" className="hover:text-orange-400">Clientes</Link>}
                </div>

                {/* Información de Usuario y Logout */}
                <div className="flex items-center">
                    <span className="mr-4 flex items-center">
                        <UserCircle className="mr-2"/> {user.nombreCompleto || user.nombreUsuario}
                    </span>
                    <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center">
                        <LogOut size={16} className="mr-2"/> Salir
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

