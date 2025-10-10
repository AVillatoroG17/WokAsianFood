import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp, TrendingDown, Calendar as CalendarIcon, FaSpinner } from 'lucide-react';

// --- SIMULACIÓN DEL CONTEXTO DE AUTENTICACIÓN ---
const useAuth = () => {
    // Cambia el rol para probar: 'ADMINISTRADOR', 'MESERO', etc.
    const [user] = useState({ role: 'ADMINISTRADOR' });
    return { user };
};

// --- INTERFACES Y TIPOS ---
// (Basadas en las respuestas esperadas de la API)
interface SalesData {
    totalVentas: number; ordenesCompletadas: number; ticketPromedio: number; platillosVendidos: number;
    ventasPorDia: { fecha: string; monto: number }[];
    tendencia: number;
}
interface PopularPlatillo { platilloId: number; nombrePlatillo: string; cantidadVendida: number; totalGenerado: number; }
interface EmployeePerformance {
    usuarioId: number; nombreCompleto: string; rol: string;
    ordenesAtendidas?: number; totalVendido?: number;
    platillosPreparados?: number; tiempoPromedioPrep?: number;
}
interface PaymentMethods { [key: string]: { cantidad: number; monto: number; porcentaje: number }; }

// --- SIMULACIÓN DE LA CAPA DE API ---
const api = {
    getEstadisticas: async (fechaInicio: string, fechaFin: string): Promise<[SalesData, PopularPlatillo[], EmployeePerformance[], PaymentMethods]> => {
        console.log(`API GET: /api/estadisticas/* con rango ${fechaInicio} a ${fechaFin}`);
        const mockSalesData: SalesData = { totalVentas: 15230.50, ordenesCompletadas: 312, ticketPromedio: 48.81, platillosVendidos: 780, tendencia: 15, ventasPorDia: [{ fecha: '2023-10-01', monto: 1200 }, { fecha: '2023-10-02', monto: 1500 }, { fecha: '2023-10-03', monto: 1300 }, { fecha: '2023-10-04', monto: 1800 }] };
        const mockPlatillos: PopularPlatillo[] = [{ platilloId: 1, nombrePlatillo: 'Ramen Tonkotsu', cantidadVendida: 95, totalGenerado: 1710 }, { platilloId: 2, nombrePlatillo: 'Pad Thai', cantidadVendida: 82, totalGenerado: 1271 }, { platilloId: 3, nombrePlatillo: 'Gyoza', cantidadVendida: 150, totalGenerado: 1200 }];
        const mockTrabajadores: EmployeePerformance[] = [{ usuarioId: 1, nombreCompleto: 'Carlos Ramirez', rol: 'Mesero', ordenesAtendidas: 150, totalVendido: 7321.5 }, { usuarioId: 2, nombreCompleto: 'Ana Flores', rol: 'Cocinero', platillosPreparados: 410, tiempoPromedioPrep: 12.5 }];
        const mockMetodos: PaymentMethods = { efectivo: { cantidad: 180, monto: 8000, porcentaje: 52.5 }, tarjeta: { cantidad: 132, monto: 7230.5, porcentaje: 47.5 } };
        
        return new Promise(res => setTimeout(() => res([mockSalesData, mockPlatillos, mockTrabajadores, mockMetodos]), 1200));
    }
};

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value);
const getInitialDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return { start, end };
};

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
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState(getInitialDateRange());

    const [salesData, setSalesData] = useState<SalesData | null>(null);
    const [popularDishes, setPopularDishes] = useState<PopularPlatillo[]>([]);
    const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethods | null>(null);

    useEffect(() => {
        if (user.role === 'ADMINISTRADOR') {
            fetchData();
        }
    }, [dateRange, user.role]);

    const fetchData = async () => {
        setLoading(true);
        const [sales, dishes, employees, payments] = await api.getEstadisticas(
            dateRange.start.toISOString().split('T')[0],
            dateRange.end.toISOString().split('T')[0]
        );
        setSalesData(sales);
        setPopularDishes(dishes);
        setEmployeePerformance(employees);
        setPaymentMethods(payments);
        setLoading(false);
    };

    const paymentPieData = useMemo(() => {
        if (!paymentMethods) return [];
        return Object.entries(paymentMethods).map(([name, { monto }]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: monto }));
    }, [paymentMethods]);

    if (user.role !== 'ADMINISTRADOR') {
        return <div className="p-8 text-center text-red-600"><h1>Acceso Denegado</h1><p>Esta sección es solo para Administradores.</p></div>;
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard de Estadísticas</h1>
                {/* Aquí irían los filtros de fecha */}
            </header>

            {/* Métricas Generales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
                    <>
                        <StatCard title="Total Ventas" value={formatCurrency(salesData?.totalVentas || 0)} icon={<DollarSign />} trend={salesData?.tendencia} />
                        <StatCard title="Órdenes Completadas" value={salesData?.ordenesCompletadas.toString() || '0'} icon={<ShoppingBag />} />
                        <StatCard title="Ticket Promedio" value={formatCurrency(salesData?.ticketPromedio || 0)} icon={<Users />} />
                        <StatCard title="Platillos Vendidos" value={salesData?.platillosVendidos.toString() || '0'} icon={<ShoppingBag />} />
                    </>
                )}
            </div>

            {/* Gráficas y Tablas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Principal */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">Ventas por Día</h2>
                        {loading ? <div className="h-80 animate-pulse bg-gray-200 rounded-lg"></div> : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={salesData?.ventasPorDia} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="fecha" />
                                    <YAxis tickFormatter={(val) => `Q${val / 1000}k`} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="monto" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">Rendimiento de Empleados</h2>
                        {loading ? <div className="h-60 animate-pulse bg-gray-200 rounded-lg"></div> : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">{/* ... tabla ... */}</table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Lateral */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">Métodos de Pago</h2>
                        {loading ? <div className="h-80 animate-pulse bg-gray-200 rounded-lg"></div> : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={paymentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                        {paymentPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f97316'][index % 3]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">Platillos Más Vendidos</h2>
                        {loading ? <div className="h-60 animate-pulse bg-gray-200 rounded-lg"></div> : (
                             <ul className="space-y-3">{popularDishes.map(p => <li key={p.platilloId} className="flex justify-between"><span>{p.nombrePlatillo}</span> <span className="font-bold">{p.cantidadVendida}</span></li>)}</ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstadisticasPage;