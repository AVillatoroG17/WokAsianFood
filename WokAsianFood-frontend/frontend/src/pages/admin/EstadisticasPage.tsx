import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

// --- INTERFACES Y TIPOS ---
interface PopularPlatillo { 
    platilloId: number; 
    nombrePlatillo: string; 
    cantidadVendida: number; 
    totalGenerado: number; 
}

interface EmployeePerformance {
    usuarioId: number; 
    nombreCompleto: string; 
    rol: string;
    ordenesAtendidas?: number; 
    totalVendido?: number;
    platillosPreparados?: number; 
    tiempoPromedioPrep?: number;
}

interface PaymentMethods { 
    [key: string]: { 
        cantidad: number; 
        monto: number; 
        porcentaje: number 
    }; 
}

// Interfaz para los datos que vienen del backend
interface SalesData {
    totalVentas: number; 
    totalOrdenes: number;
    platillosVendidos: number;
    clientesActivos: number;
    ventasHoy: number;
    ordenesHoy: number;
}

// --- SIMULACIÓN DE LA CAPA DE API ---
const api = {
    getEstadisticas: async (): Promise<SalesData> => {
        console.log('API REAL: Obteniendo estadísticas del backend');
        
        try {
            const response = await fetch('http://localhost:8080/api/v1/estadisticas', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
            }

            const data: SalesData = await response.json();
            console.log('Datos recibidos del backend:', data);
            return data;
            
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }
};

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value);

// --- COMPONENTES DEL DASHBOARD ---
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend?: number }> = ({ title, value, icon, trend }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
        </div>
        {trend !== undefined && (
            <div className={`mt-2 flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                {Math.abs(trend)}% vs. periodo anterior
            </div>
        )}
    </div>
);

const SkeletonCard: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
    </div>
);

// --- PÁGINA PRINCIPAL DE ESTADÍSTICAS ---
const EstadisticasPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth(); 
    const [loadingData, setLoadingData] = useState(false);
    const [salesData, setSalesData] = useState<SalesData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const userRol = useMemo(() => user?.rol?.toUpperCase(), [user]);

    useEffect(() => {
        if (!authLoading && userRol === 'ADMIN') {
            fetchData();
        }
    }, [userRol, authLoading]);

    const fetchData = async () => {
        setLoadingData(true);
        setError(null);
        try {
            const data = await api.getEstadisticas();
            setSalesData(data);
        } catch (error) {
            console.error('Fallo en la carga de datos:', error);
            setError('Error al cargar las estadísticas. Por favor, intenta de nuevo.');
        } finally {
            setLoadingData(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="mt-4 text-lg text-gray-600">Verificando permisos...</p>
            </div>
        );
    }

    if (userRol !== 'ADMIN') {
        return (
            <div className="p-8 text-center text-red-600">
                <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
                <p>Esta sección es solo para Administradores.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard de Estadísticas</h1>
                <button 
                    onClick={fetchData}
                    disabled={loadingData}
                    className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
                >
                    {loadingData && <Loader2 className="animate-spin" size={16} />}
                    Actualizar
                </button>
            </header>

            {error && (
                <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Error: </strong>
                    <span>{error}</span>
                </div>
            )}

            {/* Métricas Generales - Primera Fila */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loadingData ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
                    <>
                        <StatCard 
                            title="Total Ventas" 
                            value={formatCurrency(salesData?.totalVentas || 0)} 
                            icon={<DollarSign />} 
                        />
                        <StatCard 
                            title="Total Órdenes" 
                            value={(salesData?.totalOrdenes || 0).toString()} 
                            icon={<ShoppingBag />} 
                        />
                        <StatCard 
                            title="Platillos Vendidos" 
                            value={(salesData?.platillosVendidos || 0).toString()} 
                            icon={<ShoppingBag />} 
                        />
                        <StatCard 
                            title="Clientes Activos" 
                            value={(salesData?.clientesActivos || 0).toString()} 
                            icon={<Users />} 
                        />
                    </>
                )}
            </div>

            {/* Métricas de Hoy - Segunda Fila */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {loadingData ? Array(2).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
                    <>
                        <StatCard 
                            title="Ventas Hoy" 
                            value={formatCurrency(salesData?.ventasHoy || 0)} 
                            icon={<DollarSign />} 
                        />
                        <StatCard 
                            title="Órdenes Hoy" 
                            value={(salesData?.ordenesHoy || 0).toString()} 
                            icon={<ShoppingBag />} 
                        />
                    </>
                )}
            </div>

            {/* Mensaje informativo sobre funcionalidades futuras */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 Panel en Desarrollo</h3>
                <p className="text-blue-800 text-sm">
                    Las siguientes funcionalidades estarán disponibles próximamente:
                </p>
                <ul className="list-disc list-inside text-blue-700 text-sm mt-2 space-y-1">
                    <li>Gráficas de ventas por día</li>
                    <li>Rendimiento de empleados</li>
                    <li>Métodos de pago más utilizados</li>
                    <li>Platillos más vendidos</li>
                </ul>
            </div>
        </div>
    );
};

export default EstadisticasPage;