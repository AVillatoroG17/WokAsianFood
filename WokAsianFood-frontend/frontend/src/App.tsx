import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import FacturacionPage from './pages/FacturacionPage';
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
import MisOrdenesPage from './pages/mesero/MisOrdenesPage';

// Layout principal que incluye el Navbar para las páginas internas
const MainLayout: React.FC<{ children: JSX.Element }> = ({ children }) => (
    <>
        <Navbar />
        <main>{children}</main>
    </>
);

// Componente App principal
const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* ============================================ */}
                    {/* RUTAS PÚBLICAS (Sin autenticación requerida) */}
                    {/* ============================================ */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* ============================================ */}
                    {/* RUTAS PRIVADAS (Requieren autenticación)     */}
                    {/* ============================================ */}

                    {/* Dashboard - Redirige según el rol del usuario */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* ============================================ */}
                    {/* RUTAS DE ADMINISTRADOR                        */}
                    {/* ============================================ */}
                    <Route
                        path="/admin/estadisticas"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <MainLayout>
                                    <EstadisticasPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/usuarios/nuevo"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <MainLayout>
                                    <RegisterPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/usuarios"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <MainLayout>
                                    <GestionUsuariosPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* ============================================ */}
                    {/* RUTA DE CAJA / FACTURACIÓN                   */}
                    {/* Acceso: ADMIN, CAJERO, ENCARGADO             */}
                    {/* ============================================ */}
                    <Route
                        path="/caja/facturacion"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'CAJERO', 'ENCARGADO']}>
                                <MainLayout>
                                    <FacturacionPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* ============================================ */}
                    {/* RUTAS DE GESTIÓN COMPARTIDAS                 */}
                    {/* ============================================ */}

                    {/* Gestión de Platillos - Admin y Cocinero */}
                    <Route
                        path="/platillos"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'COCINERO']}>
                                <MainLayout>
                                    <PlatillosCRUDPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Gestión de Clientes - Admin y Mesero */}
                    <Route
                        path="/clientes"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'MESERO']}>
                                <MainLayout>
                                    <ClientesPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* ============================================ */}
                    {/* RUTAS DE MESERO                              */}
                    {/* ============================================ */}
                    <Route
                        path="/mesero/ordenes"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'MESERO']}>
                                <MainLayout>
                                    <OrdenesPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* ============================================ */}
                    {/* RUTAS DE COCINA                              */}
                    {/* ============================================ */}
                    <Route
                        path="/cocina/pedidos"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'COCINERO']}>
                                <MainLayout>
                                    <PedidosPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* ============================================ */}
                    {/* RUTAS DE INVENTARIO                          */}
                    {/* ============================================ */}
                    <Route
                        path="/inventario/suministros"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'ENCARGADO']}>
                                <MainLayout>
                                    <SuministrosPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/mesero/mis-ordenes"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'MESERO']}>
                                <MainLayout>
                                    <MisOrdenesPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* ============================================ */}
                    {/* RUTA COMODÍN (404)                           */}
                    {/* ============================================ */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;