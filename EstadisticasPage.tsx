import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp, TrendingDown, Loader2, RefreshCw, BarChart3, Calendar, AlertCircle } from 'lucide-react';
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

// --- COMPONENTE: Tarjeta de Estadística ---
const StatCard: React.FC<{ 
    title: string; 
    value: string; 
    icon: React.ReactNode; 
    trend?: number;
    gradient: string;
}> = ({ title, value, icon, trend, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-xl p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20`}>
        <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
                <p className="text-sm font-semibold opacity-90 mb-2">{title}</p>
                <p className="text-4xl font-black">{value}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                {icon}
            </div>
        </div>
        {trend !== undefined && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                {trend >= 0 ? (
                    <TrendingUp className="w-4 h-4" strokeWidth={2.5}/>
                ) : (
                    <TrendingDown className="w-4 h-4" strokeWidth={2.5}/>
                )}
                <span className="text-sm font-bold">
                    {Math.abs(trend)}% vs. periodo anterior
                </span>
            </div>
        )}
    </div>
);

// --- COMPONENTE: Skeleton Loader ---
const SkeletonCard: React.FC = () => (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-3/4"></div>
            </div>
            <div className="w-14 h-14 bg-gray-300 rounded-xl"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded w-2/3"></div>
    </div>
);

// --- PÁGINA PRINCIPAL DE ESTADÍSTICAS ---
const EstadisticasPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth(); 
    const [loadingData, setLoadingData] = useState(false);
    const [salesData, setSalesData] = useState<SalesData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

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
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Fallo en la carga de datos:', error);
            setError('Error al cargar las estadísticas. Por favor, intenta de nuevo.');
        } finally {
            setLoadingData(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
                <div className="relative mb-8">
                    <div className="absolute inset-0 animate-ping">
                        <Loader2 className="w-20 h-20 text-white/30" />
                    </div>
                    <Loader2 className="animate-spin w-20 h-20 text-white" strokeWidth={3} />
                </div>
                <p className="text-white text-2xl font-black animate-pulse">Verificando permisos...</p>
            </div>
        );
    }

    if (userRol !== 'ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 p-8">
                <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
                    <div className="bg-gradient-to-br from-red-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-12 h-12 text-red-600" strokeWidth={2.5}/>
                    </div>
                    <h1 className="text-3xl font-black text-gray-800 mb-3">Acceso Denegado</h1>
                    <p className="text-gray-600 text-lg">Esta sección es solo para Administradores.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-[1800px] mx-auto">
                {/* Header */}
                <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-6 md:p-8 mb-8 text-white">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                                <BarChart3 className="w-12 h-12 text-white" strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black mb-2">Dashboard de Estadísticas</h1>
                                <p className="text-white/90 text-sm md:text-base font-semibold">
                                    Panel de control y análisis del restaurante
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <Calendar className="w-4 h-4"/>
                                {lastUpdate.toLocaleTimeString()}
                            </div>
                            <button 
                                onClick={fetchData}
                                disabled={loadingData}
                                className="bg-white/20 backdrop-blur-sm p-3 rounded-xl hover:bg-white/30 transition-all duration-200 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:rotate-180"
                                title="Actualizar datos"
                            >
                                <RefreshCw className={`w-6 h-6 ${loadingData ? 'animate-spin' : ''}`} strokeWidth={2.5}/>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Mensaje de Error */}
                {error && (
                    <div className="mb-8 bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-white/20 animate-in slide-in-from-top-5 duration-500">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                            <AlertCircle className="w-6 h-6" strokeWidth={2.5}/>
                        </div>
                        <div>
                            <p className="font-black text-lg">Error</p>
                            <p className="text-sm opacity-95">{error}</p>
                        </div>
                        <button 
                            onClick={() => setError(null)}
                            className="ml-auto p-2 rounded-lg hover:bg-white/20 transition-all"
                        >
                            <AlertCircle className="w-5 h-5" strokeWidth={2.5}/>
                        </button>
                    </div>
                )}

                {/* Métricas Generales - Primera Fila */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.5}/>
                        </div>
                        Métricas Generales
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loadingData ? (
                            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                        ) : (
                            <>
                                <StatCard 
                                    title="Total Ventas" 
                                    value={formatCurrency(salesData?.totalVentas || 0)} 
                                    icon={<DollarSign className="w-8 h-8" strokeWidth={2.5}/>}
                                    gradient="from-green-500 to-emerald-600"
                                />
                                <StatCard 
                                    title="Total Órdenes" 
                                    value={(salesData?.totalOrdenes || 0).toString()} 
                                    icon={<ShoppingBag className="w-8 h-8" strokeWidth={2.5}/>}
                                    gradient="from-blue-500 to-cyan-600"
                                />
                                <StatCard 
                                    title="Platillos Vendidos" 
                                    value={(salesData?.platillosVendidos || 0).toString()} 
                                    icon={<ShoppingBag className="w-8 h-8" strokeWidth={2.5}/>}
                                    gradient="from-orange-500 to-amber-600"
                                />
                                <StatCard 
                                    title="Clientes Activos" 
                                    value={(salesData?.clientesActivos || 0).toString()} 
                                    icon={<Users className="w-8 h-8" strokeWidth={2.5}/>}
                                    gradient="from-purple-500 to-indigo-600"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Métricas de Hoy - Segunda Fila */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                        <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-2 rounded-lg">
                            <Calendar className="w-6 h-6 text-white" strokeWidth={2.5}/>
                        </div>
                        Actividad de Hoy
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {loadingData ? (
                            Array(2).fill(0).map((_, i) => <SkeletonCard key={i} />)
                        ) : (
                            <>
                                <StatCard 
                                    title="Ventas Hoy" 
                                    value={formatCurrency(salesData?.ventasHoy || 0)} 
                                    icon={<DollarSign className="w-8 h-8" strokeWidth={2.5}/>}
                                    gradient="from-pink-500 to-rose-600"
                                />
                                <StatCard 
                                    title="Órdenes Hoy" 
                                    value={(salesData?.ordenesHoy || 0).toString()} 
                                    icon={<ShoppingBag className="w-8 h-8" strokeWidth={2.5}/>}
                                    gradient="from-teal-500 to-cyan-600"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Mensaje informativo sobre funcionalidades futuras */}
                <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 text-white border border-white/20">
                    <div className="flex items-start gap-6">
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shrink-0">
                            <BarChart3 className="w-10 h-10 text-white" strokeWidth={2.5}/>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-3xl font-black mb-4 flex items-center gap-3">
                                📊 Panel en Desarrollo
                            </h3>
                            <p className="text-lg font-semibold mb-6 opacity-95">
                                Estamos trabajando en nuevas funcionalidades para mejorar tu experiencia:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <TrendingUp className="w-5 h-5" strokeWidth={2.5}/>
                                        </div>
                                        <h4 className="font-bold text-lg">Gráficas de Ventas</h4>
                                    </div>
                                    <p className="text-sm opacity-90">Visualiza el rendimiento por día, semana y mes</p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <Users className="w-5 h-5" strokeWidth={2.5}/>
                                        </div>
                                        <h4 className="font-bold text-lg">Rendimiento de Empleados</h4>
                                    </div>
                                    <p className="text-sm opacity-90">Métricas de productividad del equipo</p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <DollarSign className="w-5 h-5" strokeWidth={2.5}/>
                                        </div>
                                        <h4 className="font-bold text-lg">Métodos de Pago</h4>
                                    </div>
                                    <p className="text-sm opacity-90">Análisis de pagos más utilizados</p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <ShoppingBag className="w-5 h-5" strokeWidth={2.5}/>
                                        </div>
                                        <h4 className="font-bold text-lg">Platillos Más Vendidos</h4>
                                    </div>
                                    <p className="text-sm opacity-90">Top de productos más populares</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstadisticasPage;