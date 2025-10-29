import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Clock, CheckCircle, Play, RefreshCw, MessageSquare } from 'lucide-react';
import { getPlatillosCocina, iniciarPreparacionPlatillo, marcarPlatilloListo } from '../../services/cocinaService';
import { IPlatilloCocina } from '../../models/IPlatilloCocina';

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
// NOTA: Se actualizó 'EN_PREPARACION' a 'EN_COCINA' para coincidir con el Enum de Java
const PlatilloCard: React.FC<{ platillo: IPlatilloCocina, onUpdateEstado: (id: number, estado: 'EN_COCINA' | 'LISTO') => 
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
            {platillo.estadoPreparacion === 'PENDIENTE' && <button onClick={() => onUpdateEstado(platillo.ordenPlatilloId,
				'EN_COCINA')} className="w-full mt-3 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center"> <Play size
				={16} className="mr-1"/> Empezar </button>}
            {platillo.estadoPreparacion === 'EN_COCINA' && <button onClick={() => onUpdateEstado(platillo.ordenPlatilloId,
				'LISTO')} className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center"> <CheckCircle size=
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
            const data = await getPlatillosCocina();
            setPlatillos(data);
        } catch (error) { console.error("Error fetching data", error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (user) {
            fetchPlatillos();
            const intervalId = setInterval(fetchPlatillos, 20000); // Real-time update
            return () => clearInterval(intervalId);
        }
    }, [fetchPlatillos, user]);

    // NOTA: Se actualizó 'EN_PREPARACION' a 'EN_COCINA'
    const handleUpdateEstado = useCallback(async (id: number, nuevoEstado: 'EN_COCINA' | 'LISTO') => {
        const oldPlatillos = [...platillos];
        
        // Optimistic update
        setPlatillos(prev => prev.map(p => 
            p.ordenPlatilloId === id 
                ? { ...p, estadoPreparacion: nuevoEstado, nombreCocinero: user!.nombreCompleto } 
                : p
        ));

        try {
            if (nuevoEstado === 'EN_COCINA') {
                await iniciarPreparacionPlatillo(id, user!.usuarioId);
            } else {
                await marcarPlatilloListo(id);
            }
        } catch (error) {
            console.error("Failed to update status, reverting...", error);
            setPlatillos(oldPlatillos); // Revert on error
        }
    }, [platillos, user]);

    const pendientes = useMemo(() => platillos.filter(p => p.estadoPreparacion === 'PENDIENTE').sort((a, b) => new Date(a.
		horaEnvioCocina).getTime() - new Date(b.horaEnvioCocina).getTime()), [platillos]);
    // NOTA: Se actualizó el filtro a 'EN_COCINA'
	const enPreparacion = useMemo(() => platillos.filter(p => p.estadoPreparacion === 'EN_COCINA'), [platillos]); 
    const listos = useMemo(() => platillos.filter(p => p.estadoPreparacion === 'LISTO'), [platillos]);

    // La comprobación de seguridad definitiva con .trim()
    if (user && user.rol.trim() !== 'COCINERO' && user.rol.trim() !== 'ADMIN') { 
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