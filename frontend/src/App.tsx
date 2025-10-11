import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import EstadisticasPage from './pages/admin/EstadisticasPage';
import RegisterPage from './pages/admin/RegisterPage';
import GestionUsuariosPage from './pages/admin/GestionUsuariosPage'; 
import OrdenesPage from './pages/mesero/OrdenesPage';
import PedidosPage from './pages/cocina/PedidosPage';
import SuministrosPage from './pages/inventario/SuministrosPage';
import ClientesPage from './pages/ClientesPage';
import PlatillosCRUDPage from './pages/platillos/PlatillosCRUDPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './router/ProtectedRoute';

// Layout principal que incluye el Navbar para las páginas internas
const MainLayout: React.FC<{ children: JSX.Element }> = ({ children }) => (
    <>
        <Navbar />
        <main>{children}</main>
    </>
);

// Versión definitiva del componente App
const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* --- RUTAS PÚBLICAS --- */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* --- RUTAS PRIVADAS (requieren autenticación) --- */}

                    {/* El Dashboard es el punto de entrada que redirige según el rol */}
                    <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

                    {/* Rutas de Administrador */}
                    {/* El rol ADMIN tiene acceso a todas las rutas que incluyen su rol */}
                    <Route path="/admin/estadisticas" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><EstadisticasPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/admin/usuarios/nuevo" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><RegisterPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><GestionUsuariosPage /></MainLayout></ProtectedRoute>} />

                    {/* Ruta de Gestión de Platillos (Admin) */}
                    <Route path="/platillos" element={<ProtectedRoute allowedRoles={['ADMIN', 'COCINERO']}><MainLayout><PlatillosCRUDPage /></MainLayout></ProtectedRoute>} />

                    {/* Ruta de Gestión de Clientes (Admin y Mesero) */}
                    <Route path="/clientes" element={<ProtectedRoute allowedRoles={['ADMIN', 'MESERO']}><MainLayout><ClientesPage /></MainLayout></ProtectedRoute>} />

                    {/* Ruta de Órdenes (Admin y Mesero) */}
                    <Route path="/mesero/ordenes" element={<ProtectedRoute allowedRoles={['ADMIN', 'MESERO']}><MainLayout><OrdenesPage /></MainLayout></ProtectedRoute>} />

                    {/* Ruta de Cocina (Admin y Cocinero) */}
                    <Route path="/cocina/pedidos" element={<ProtectedRoute allowedRoles={['ADMIN', 'COCINERO']}><MainLayout><PedidosPage /></MainLayout></ProtectedRoute>} />

                    {/* Ruta de Inventario (Admin y Encargado) */}
                    <Route path="/inventario/suministros" element={<ProtectedRoute allowedRoles={['ADMIN', 'ENCARGADO']}><MainLayout><SuministrosPage /></MainLayout></ProtectedRoute>} />

                    {/* --- RUTA COMODÍN --- */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
