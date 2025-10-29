import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Clock, CheckCircle, Play, RefreshCw, MessageSquare, ChefHat, Flame, Timer, AlertCircle, Sparkles } from 'lucide-react';
import { getPlatillosCocina, iniciarPreparacionPlatillo, marcarPlatilloListo } from '../../services/cocinaService';
import { IPlatilloCocina } from '../../models/IPlatilloCocina';

// --- HOOKS PERSONALIZADOS ---
const useTimeAgo = (dateString: string) => {
    const [timeAgo, setTimeAgo] = useState('');
    const [isOverdue, setIsOverdue] = useState(false);
    
    useEffect(() => {
        const update = () => {
            const now = new Date().getTime();
            const orderTime = new Date(dateString).getTime();
            const seconds = Math.floor((now - orderTime) / 1000);
            const minutes = Math.floor(seconds / 60);
            
            if (minutes < 1) {
                setTimeAgo('Ahora mismo');
            } else if (minutes < 60) {
                setTimeAgo(`${minutes} min`);
            } else {
                const hours = Math.floor(minutes / 60);
                setTimeAgo(`${hours}h ${minutes % 60}m`);
            }
            
            // Marca como atrasado después de 10 minutos
            setIsOverdue(minutes > 10);
        };
        
        update();
        const intervalId = setInterval(update, 30000); // Actualiza cada 30 segundos
        return () => clearInterval(intervalId);
    }, [dateString]);
    
    return { timeAgo, isOverdue };
};

// --- COMPONENTE: Tarjeta de Platillo Mejorada ---
const PlatilloCard: React.FC<{ 
    platillo: IPlatilloCocina, 
    onUpdateEstado: (id: number, estado: 'EN_COCINA' | 'LISTO') => void 
}> = ({ platillo, onUpdateEstado }) => {
    const { timeAgo, isOverdue } = useTimeAgo(platillo.horaEnvioCocina);
    const isPendiente = platillo.estadoPreparacion === 'PENDIENTE';
    const isEnCocina = platillo.estadoPreparacion === 'EN_COCINA';
    const isListo = platillo.estadoPreparacion === 'LISTO';

    // Determinar el color del borde y fondo
    const getBorderColor = () => {
        if (isListo) return 'border-green-500';
        if (isEnCocina) return 'border-blue-500';
        if (isOverdue && isPendiente) return 'border-red-500';
        return 'border-orange-500';
    };

    const getBgGradient = () => {
        if (isListo) return 'bg-gradient-to-br from-green-50 to-emerald-50';
        if (isEnCocina) return 'bg-gradient-to-br from-blue-50 to-cyan-50';
        if (isOverdue && isPendiente) return 'bg-gradient-to-br from-red-50 to-pink-50';
        return 'bg-gradient-to-br from-white to-gray-50';
    };

    return (
        <div className={`${getBgGradient()} rounded-2xl shadow-lg border-l-4 ${getBorderColor()} p-5 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isOverdue && isPendiente ? 'bg-red-500 animate-pulse' : isEnCocina ? 'bg-blue-500' : isListo ? 'bg-green-500' : 'bg-orange-500'}`}>
                        <ChefHat className="w-5 h-5 text-white" strokeWidth={2.5}/>
                    </div>
                    <div>
                        <span className="font-black text-xl text-gray-800">{platillo.numeroOrden}</span>
                        <p className="text-xs font-semibold text-gray-500">
                            {platillo.numeroMesa ? `🪑 Mesa ${platillo.numeroMesa}` : '📦 Para Llevar'}
                        </p>
                    </div>
                </div>
                
                {/* Badge de Tiempo */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    isOverdue && isPendiente 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-gray-200 text-gray-700'
                }`}>
                    <Clock className="w-3.5 h-3.5" strokeWidth={2.5}/>
                    <span>{timeAgo}</span>
                </div>
            </div>

            {/* Información del Platillo */}
            <div className="mb-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-black text-lg text-gray-800 leading-tight flex-1">
                        {platillo.nombrePlatillo}
                    </h3>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-black shadow-lg">
                        x{platillo.cantidad}
                    </span>
                </div>
                
                {/* Notas especiales */}
                {platillo.notasPlatillo && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-orange-400 rounded-lg">
                        <p className="text-sm font-bold text-orange-800 flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2.5}/>
                            <span className="flex-1">{platillo.notasPlatillo}</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Footer con información adicional */}
            <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-purple-600" strokeWidth={2.5}/>
                    <span>~{platillo.tiempoPreparacionEstimado} min</span>
                </div>
                {platillo.nombreCocinero && (
                    <div className="flex items-center gap-1.5 text-blue-600">
                        <ChefHat className="w-4 h-4" strokeWidth={2.5}/>
                        <span>{platillo.nombreCocinero}</span>
                    </div>
                )}
            </div>

            {/* Botones de Acción */}
            {isPendiente && (
                <button 
                    onClick={() => onUpdateEstado(platillo.ordenPlatilloId, 'EN_COCINA')} 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    <Play className="w-5 h-5" strokeWidth={2.5}/> 
                    Empezar a Preparar
                </button>
            )}
            
            {isEnCocina && (
                <button 
                    onClick={() => onUpdateEstado(platillo.ordenPlatilloId, 'LISTO')} 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    <CheckCircle className="w-5 h-5" strokeWidth={2.5}/> 
                    Marcar como Listo
                </button>
            )}
            
            {isListo && (
                <div className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg">
                    <Sparkles className="w-5 h-5" strokeWidth={2.5}/> 
                    Listo para Servir
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE: Columna Kanban Mejorada ---
const KanbanColumn: React.FC<{ 
    title: string, 
    icon: React.ReactNode,
    color: string,
    platillos: IPlatilloCocina[], 
    onUpdateEstado: any 
}> = ({ title, icon, color, platillos, onUpdateEstado }) => {
    const gradientMap: { [key: string]: string } = {
        orange: 'from-orange-500 to-amber-600',
        blue: 'from-blue-500 to-cyan-600',
        green: 'from-green-500 to-emerald-600'
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header de la columna */}
            <div className={`bg-gradient-to-r ${gradientMap[color]} p-5 text-white`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                            {icon}
                        </div>
                        <h2 className="font-black text-xl">{title}</h2>
                    </div>
                    <div className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="font-black text-lg">{platillos.length}</span>
                    </div>
                </div>
            </div>

            {/* Lista de platillos */}
            <div className="p-4 space-y-4 h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar bg-gradient-to-b from-gray-50 to-white">
                {platillos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <AlertCircle className="w-12 h-12" strokeWidth={1.5}/>
                        </div>
                        <p className="font-bold text-lg">No hay platillos aquí</p>
                        <p className="text-sm text-center mt-2">Los pedidos aparecerán automáticamente</p>
                    </div>
                ) : (
                    platillos.map(p => (
                        <PlatilloCard 
                            key={p.ordenPlatilloId} 
                            platillo={p} 
                            onUpdateEstado={onUpdateEstado} 
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---
const PedidosPage: React.FC = () => {
    const { user } = useAuth();
    const [platillos, setPlatillos] = useState<IPlatilloCocina[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchPlatillos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPlatillosCocina();
            setPlatillos(data);
            setLastUpdate(new Date());
        } catch (error) { 
            console.error("Error fetching data", error); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchPlatillos();
            const intervalId = setInterval(fetchPlatillos, 20000);
            return () => clearInterval(intervalId);
        }
    }, [fetchPlatillos, user]);

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
            setPlatillos(oldPlatillos);
        }
    }, [platillos, user]);

    const pendientes = useMemo(() => 
        platillos
            .filter(p => p.estadoPreparacion === 'PENDIENTE')
            .sort((a, b) => new Date(a.horaEnvioCocina).getTime() - new Date(b.horaEnvioCocina).getTime()),
        [platillos]
    );
    
    const enPreparacion = useMemo(() => 
        platillos.filter(p => p.estadoPreparacion === 'EN_COCINA'), 
        [platillos]
    );
    
    const listos = useMemo(() => 
        platillos.filter(p => p.estadoPreparacion === 'LISTO'), 
        [platillos]
    );

    // Control de acceso
    if (user && user.rol.trim() !== 'COCINERO' && user.rol.trim() !== 'ADMIN') { 
        return <Navigate to="/unauthorized" replace />;
    }

    if (loading && platillos.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500">
                <div className="relative mb-8">
                    <div className="absolute inset-0 animate-ping">
                        <Flame className="w-20 h-20 text-white/30" />
                    </div>
                    <Flame className="animate-bounce w-20 h-20 text-white" strokeWidth={2}/>
                </div>
                <p className="text-white text-2xl font-black animate-pulse">Cargando cocina...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 md:p-6">
            <div className="max-w-[1800px] mx-auto">
                {/* Header mejorado */}
                <header className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl shadow-2xl p-6 mb-6 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                                <Flame className="w-10 h-10 text-white" strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h1 className="text-4xl font-black">Visor de Cocina</h1>
                                <p className="text-white/90 text-sm font-semibold mt-1">
                                    Panel de control en tiempo real • {platillos.length} platillos en sistema
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* Última actualización */}
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold">
                                <Clock className="w-4 h-4 inline mr-2"/>
                                Actualizado: {lastUpdate.toLocaleTimeString()}
                            </div>
                            
                            {/* Botón de actualización */}
                            <button 
                                onClick={fetchPlatillos} 
                                className="bg-white/20 backdrop-blur-sm p-3 rounded-xl hover:bg-white/30 transition-all duration-200 transform hover:scale-110 active:scale-95 hover:rotate-180"
                                title="Actualizar pedidos"
                            >
                                <RefreshCw className="w-6 h-6" strokeWidth={2.5}/>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Grid de columnas Kanban */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <KanbanColumn 
                        title="Pendientes" 
                        icon={<Clock className="w-6 h-6" strokeWidth={2.5}/>}
                        color="orange"
                        platillos={pendientes} 
                        onUpdateEstado={handleUpdateEstado} 
                    />
                    <KanbanColumn 
                        title="En Preparación" 
                        icon={<Flame className="w-6 h-6" strokeWidth={2.5}/>}
                        color="blue"
                        platillos={enPreparacion} 
                        onUpdateEstado={handleUpdateEstado} 
                    />
                    <KanbanColumn 
                        title="Listos" 
                        icon={<CheckCircle className="w-6 h-6" strokeWidth={2.5}/>}
                        color="green"
                        platillos={listos} 
                        onUpdateEstado={handleUpdateEstado} 
                    />
                </div>
            </div>

            {/* Estilos para scrollbar personalizado */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 999px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default PedidosPage;