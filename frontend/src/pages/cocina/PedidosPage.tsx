import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { ChefHat, Clock, CheckCircle, Play, RefreshCw, MessageSquare } from 'lucide-react';

// --- INTERFACES Y TIPOS ---
interface IPlatilloCocina {
    ordenPlatilloId: number; ordenId: number; numeroOrden: string; numeroMesa?: string;
    nombrePlatillo: string; cantidad: number; nombreCategoria: string; colorCategoria?: string;
    estadoPreparacion: 'pendiente' | 'en_preparacion' | 'listo';
    prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
    tiempoPreparacionEstimado: number; horaEnvioCocina: string; horaInicioPreparacion?: string;
    nombreCocinero?: string;
    notasPlatillo?: string;
}

// --- SIMULACIÓN DE API ---
let mockPlatillos: IPlatilloCocina[] = [
    { ordenPlatilloId: 1, ordenId: 101, numeroOrden: 'ORD-001', numeroMesa: '5', nombrePlatillo: 'Ramen Tonkotsu', cantidad: 1,
      nombreCategoria: 'Platos Fuertes', estadoPreparacion: 'pendiente', prioridad: 'normal', tiempoPreparacionEstimado: 15,
      horaEnvioCocina: new Date(Date.now() - 3 * 60000).toISOString(), notasPlatillo: 'Extra picante' },
    { ordenPlatilloId: 2, ordenId: 102, numeroOrden: 'ORD-002', numeroMesa: '3', nombrePlatillo: 'Gyoza de Cerdo', cantidad: 2,
      nombreCategoria: 'Entradas', estadoPreparacion: 'en_preparacion', prioridad: 'alta', tiempoPreparacionEstimado: 10,
      horaEnvioCocina: new Date(Date.now() - 5 * 60000).toISOString(), horaInicioPreparacion: new Date(Date.now() - 2 * 60000).
      toISOString(), nombreCocinero: 'Ana' },
    { ordenPlatilloId: 3, ordenId: 103, numeroOrden: 'ORD-003', numeroMesa: '8', nombrePlatillo: 'Té de Jazmín', cantidad: 1,
      nombreCategoria: 'Bebidas', estadoPreparacion: 'listo', prioridad: 'baja', tiempoPreparacionEstimado: 3, horaEnvioCocina: new
      Date(Date.now() - 8 * 60000).toISOString(), horaInicioPreparacion: new Date(Date.now() - 6 * 60000).toISOString(),
      nombreCocinero: 'Ana' },
];
const api = {
    getPlatillosCocina: async (): Promise<IPlatilloCocina[]> => {
        return new Promise(res => setTimeout(() => res([...mockPlatillos]), 500));
    },
    updateEstadoPlatillo: async (id: number, nuevoEstado: string, cocineroId: number, cocineroNombre: string): Promise<
        IPlatilloCocina> => {
        const index = mockPlatillos.findIndex(p => p.ordenPlatilloId === id);
        if (index !== -1) {
            mockPlatillos[index].estadoPreparacion = nuevoEstado as any;
            if (nuevoEstado === 'en_preparacion') {
                mockPlatillos[index].horaInicioPreparacion = new Date().toISOString();
                mockPlatillos[index].nombreCocinero = cocineroNombre;
            }
            return new Promise(res => setTimeout(() => res(mockPlatillos[index]), 300));
        }
        return Promise.reject('Platillo no encontrado');
    }
};

// --- HOOKS PERSONALIZADOS ---
const useTimeAgo = (dateString: string) => {
    const [timeAgo, setTimeAgo] = useState('');
    useEffect(() => {
        const update = () => {
            const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
            const minutes = Math.floor(seconds / 60);
            if (minutes < 1) setTimeAgo('Recién');
            else setTimeAgo(`Hace ${minutes} min`);
        };
        update();
        const intervalId = setInterval(update, 60000);
        return () => clearInterval(intervalId);
    }, [dateString]);
    return timeAgo;
};

// --- COMPONENTES ---
const PlatilloCard: React.FC<{ platillo: IPlatilloCocina, onUpdateEstado: (id: number, estado: 'en_preparacion' | 'listo') =>
    void }> = ({ platillo, onUpdateEstado }) => {
    const timeAgo = useTimeAgo(platillo.horaEnvioCocina);
    const isOverdue = !platillo.horaInicioPreparacion && (new Date().getTime() - new Date(platillo.horaEnvioCocina).getTime()) >
        10 * 60000;

    return (
        <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${isOverdue ? 'border-red-500' : 'border-blue-500'}`}>
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">{platillo.numeroOrden}</span>
                <span className="text-sm text-gray-600">{platillo.numeroMesa ? `Mesa ${platillo.numeroMesa}` : 'Para Llevar'
    }</span>
            </div>
            <div className="my-3">
                <p className="font-bold text-xl">{platillo.nombrePlatillo} <span className="text-blue-600
    font-black">x{platillo.cantidad}</span></p>
                {platillo.notasPlatillo && <p className="text-sm text-orange-600 flex items-center mt-1"><MessageSquare size=
    {14} className="mr-1"/> {platillo.notasPlatillo}</p>}
            </div>
            <div className="text-xs text-gray-500 flex justify-between items-center border-t pt-2">
                <span><Clock size={14} className="inline"/> {timeAgo}</span>
                <span>~{platillo.tiempoPreparacionEstimado} min</span>
            </div>
            {platillo.estadoPreparacion === 'pendiente' && <button onClick={() => onUpdateEstado(platillo.ordenPlatilloId,
    'en_preparacion')} className="w-full mt-3 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center"> <Play size
    ={16} className="mr-1"/> Empezar </button>}
            {platillo.estadoPreparacion === 'en_preparacion' && <button onClick={() => onUpdateEstado(platillo.ordenPlatilloId,
    'listo')} className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center"> <CheckCircle size=
    {16} className="mr-1"/> Listo </button>}
        </div>
    );
};

const KanbanColumn: React.FC<{ title: string, platillos: IPlatilloCocina[], onUpdateEstado: any }> = ({ title, platillos,
    onUpdateEstado }) => (
    <div className="bg-gray-100 rounded-lg p-3">
        <h2 className="font-bold text-lg mb-3 flex justify-between items-center">{title} <span className="bg-gray-300
    text-gray-700 text-sm font-semibold rounded-full px-2">{platillos.length}</span></h2>
        <div className="space-y-4 h-[75vh] overflow-y-auto pr-2">{platillos.map(p => <PlatilloCard key={p.ordenPlatilloId}
    platillo={p} onUpdateEstado={onUpdateEstado} />)}</div>
    </div>
);

// --- PÁGINA PRINCIPAL ---
const PedidosPage: React.FC = () => {
    const { user } = useAuth();
    const [platillos, setPlatillos] = useState<IPlatilloCocina[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPlatillos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getPlatillosCocina();
            setPlatillos(data);
        } catch (error) { console.error("Error fetching data", error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (user) {
            fetchPlatillos();
            const intervalId = setInterval(fetchPlatillos, 20000);
            return () => clearInterval(intervalId);
        }
    }, [fetchPlatillos, user]);

    const handleUpdateEstado = useCallback(async (id: number, nuevoEstado: 'en_preparacion' | 'listo') => {
        const oldPlatillos = platillos;
        setPlatillos(prev => prev.map(p => p.ordenPlatilloId === id ? { ...p, estadoPreparacion: nuevoEstado, nombreCocinero:
    user!.nombreCompleto } : p));
        try {
            await api.updateEstadoPlatillo(id, nuevoEstado, user!.userId, user!.nombreCompleto);
        } catch (error) {
            console.error("Failed to update status, reverting...");
            setPlatillos(oldPlatillos);
        }
    }, [platillos, user]);

    const pendientes = useMemo(() => platillos.filter(p => p.estadoPreparacion === 'pendiente').sort((a, b) => new Date(a.
    horaEnvioCocina).getTime() - new Date(b.horaEnvioCocina).getTime()), [platillos]);
    const enPreparacion = useMemo(() => platillos.filter(p => p.estadoPreparacion === 'en_preparacion'), [platillos]);
    const listos = useMemo(() => platillos.filter(p => p.estadoPreparacion === 'listo'), [platillos]);

    // La comprobación de seguridad definitiva con .trim()
    if (user && user.rol.trim() !== 'COCINERO' && user.rol.trim() !== 'ADMIN') { // Corregido: 'user.role' a 'user.rol'
        return <Navigate to="/unauthorized" replace />;
    }

    if (loading && platillos.length === 0) {
        return <div>Cargando...</div>
    }

    return (
        <div className="p-4 md:p-6 bg-white min-h-screen">
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Visor de Cocina</h1>
                <button onClick={fetchPlatillos} className="p-2 rounded-full hover:bg-gray-200"><RefreshCw size={20}/></button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KanbanColumn title="⏳ Pendientes" platillos={pendientes} onUpdateEstado={handleUpdateEstado} />
                <KanbanColumn title="👨‍🍳 En Preparación" platillos={enPreparacion} onUpdateEstado={handleUpdateEstado} />
                <KanbanColumn title="✓ Listos para Servir" platillos={listos} onUpdateEstado={handleUpdateEstado} />
            </div>
        </div>
    );
};

export default PedidosPage;
