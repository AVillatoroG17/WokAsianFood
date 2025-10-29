
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { CheckCircle, Clock, Utensils, Loader2, Search, DollarSign, Users, ChefHat, Package, AlertCircle, RefreshCw, Sparkles, CreditCard } from 'lucide-react';
import api from '../../services/api';

interface OrdenActiva {
    ordenId: number;
    numeroOrden: string;
    numeroMesa?: string;
    nombreCliente?: string;
    fechaOrden: string;
    estadoOrden: string;
    totalOrden: number;
    numeroPersonas: number;
    platillos: {
        ordenPlatilloId: number;
        nombrePlatillo: string;
        cantidad: number;
        estadoPreparacion: string;
        notasPlatillo?: string;
    }[];
}

const MisOrdenesPage: React.FC = () => {
    const { user } = useAuth();
    const [ordenes, setOrdenes] = useState<OrdenActiva[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'todas' | 'en_proceso' | 'listas'>('todas');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const tieneAcceso = ['ADMIN', 'MESERO'].includes(user?.rol?.toUpperCase() || '');

    useEffect(() => {
        if (tieneAcceso) {
            fetchOrdenes();
            const interval = setInterval(fetchOrdenes, 15000);
            return () => clearInterval(interval);
        }
    }, [tieneAcceso]);

    const fetchOrdenes = async () => {
        try {
            const response = await api.get('/api/ordenes', {
                params: { 
                    estados: 'ENVIADA_COCINA,EN_PROCESO,LISTA_PARA_SERVIR,SERVIDA,LISTA_PARA_PAGO',
                    meseroId: user?.usuarioId
                }
            });
            setOrdenes(response.data);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarServida = async (ordenId: number) => {
        if (!user?.usuarioId) return;
        try {
            await api.patch(`/api/ordenes/${ordenId}/servida`, null, {
                params: { meseroId: user.usuarioId }
            });
            alert('✅ Orden marcada como servida'); 
            fetchOrdenes();
        } catch (error: any) {
            const mensaje = error.response?.data?.message || 'Error al marcar orden como servida';
            alert(`❌ ${mensaje}`);
        }
    };

    const handleSolicitarPago = async (ordenId: number) => {
        if (!user?.usuarioId) return;
        try {
            await api.patch(`/api/ordenes/${ordenId}/solicitar-pago`, null, {
                params: { meseroId: user.usuarioId }
            });
            alert('💵 Solicitud de pago enviada correctamente');
            fetchOrdenes();
        } catch (error: any) {
            const mensaje = error.response?.data?.message || 'Error al solicitar el pago';
            alert(`❌ ${mensaje}`);
        }
    };

    const ordenesFiltradas = useMemo(() => {
        let resultado = ordenes.filter(o =>
            o.numeroOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.numeroMesa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.nombreCliente?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtroEstado === 'en_proceso') {
            resultado = resultado.filter(o => 
                ['ENVIADA_COCINA', 'EN_PROCESO'].includes(o.estadoOrden)
            );
        } else if (filtroEstado === 'listas') {
            resultado = resultado.filter(o => o.estadoOrden === 'LISTA_PARA_SERVIR');
        }
        return resultado;
    }, [ordenes, searchTerm, filtroEstado]);

    const stats = useMemo(() => ({
        total: ordenes.length,
        enProceso: ordenes.filter(o => ['ENVIADA_COCINA', 'EN_PROCESO'].includes(o.estadoOrden)).length,
        listas: ordenes.filter(o => o.estadoOrden === 'LISTA_PARA_SERVIR').length,
        servidas: ordenes.filter(o => ['SERVIDA', 'LISTA_PARA_PAGO'].includes(o.estadoOrden)).length, 
    }), [ordenes]);

    if (!tieneAcceso) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
                <div className="relative mb-8">
                    <div className="absolute inset-0 animate-ping">
                        <Loader2 className="w-20 h-20 text-white/30" />
                    </div>
                    <Loader2 className="animate-spin w-20 h-20 text-white" strokeWidth={3} />
                </div>
                <p className="text-white text-2xl font-black animate-pulse">Cargando órdenes...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6">
            <div className="max-w-[1800px] mx-auto">
                {/* Header mejorado */}
                <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-6 md:p-8 mb-6 text-white">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                                <Package className="w-12 h-12 text-white" strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black mb-2">Mis Órdenes Activas</h1>
                                <p className="text-white/90 text-sm md:text-base font-semibold">
                                    Panel de control de pedidos en tiempo real
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold">
                                <Clock className="w-4 h-4 inline mr-2"/>
                                {lastUpdate.toLocaleTimeString()}
                            </div>
                            <button 
                                onClick={fetchOrdenes} 
                                className="bg-white/20 backdrop-blur-sm p-3 rounded-xl hover:bg-white/30 transition-all duration-200 transform hover:scale-110 active:scale-95 hover:rotate-180"
                                title="Actualizar órdenes"
                            >
                                <RefreshCw className="w-6 h-6" strokeWidth={2.5}/>
                            </button>
                        </div>
                    </div>

                    {/* Estadísticas Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/30">
                            <div className="flex items-center justify-between mb-2">
                                <Package className="w-6 h-6 opacity-80" strokeWidth={2.5}/>
                                <span className="text-4xl font-black">{stats.total}</span>
                            </div>
                            <p className="text-sm font-bold opacity-90">Total Órdenes</p>
                        </div>
                        
                        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/30">
                            <div className="flex items-center justify-between mb-2">
                                <ChefHat className="w-6 h-6 opacity-80" strokeWidth={2.5}/>
                                <span className="text-4xl font-black">{stats.enProceso}</span>
                            </div>
                            <p className="text-sm font-bold opacity-90">En Proceso</p>
                        </div>
                        
                        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/30">
                            <div className="flex items-center justify-between mb-2">
                                <Sparkles className="w-6 h-6 opacity-80" strokeWidth={2.5}/>
                                <span className="text-4xl font-black">{stats.listas}</span>
                            </div>
                            <p className="text-sm font-bold opacity-90">Listas</p>
                        </div>
                        
                        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/30">
                            <div className="flex items-center justify-between mb-2">
                                <Utensils className="w-6 h-6 opacity-80" strokeWidth={2.5}/>
                                <span className="text-4xl font-black">{stats.servidas}</span>
                            </div>
                            <p className="text-sm font-bold opacity-90">Servidas</p>
                        </div>
                    </div>
                </header>

                {/* Filtros y Búsqueda */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Buscador */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            <input 
                                type="text" 
                                placeholder="Buscar por Nº Orden, Mesa o Cliente..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                            />
                        </div>
                        
                        {/* Filtros */}
                        <div className="flex gap-3">
                            {(['todas', 'en_proceso', 'listas'] as const).map(estado => (
                                <button 
                                    key={estado} 
                                    onClick={() => setFiltroEstado(estado)} 
                                    className={`px-6 py-3.5 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                                        filtroEstado === estado 
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {estado === 'todas' && '📊 Todas'}
                                    {estado === 'en_proceso' && '⏳ En Proceso'}
                                    {estado === 'listas' && '✅ Listas'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid de Órdenes */}
                {ordenesFiltradas.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl shadow-xl text-center border border-gray-200">
                        <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-green-600 w-12 h-12" strokeWidth={2.5}/>
                        </div>
                        <h2 className="text-3xl font-black text-gray-800 mb-3">No hay órdenes activas</h2>
                        <p className="text-gray-500 text-lg">
                            {filtroEstado === 'todas' ? 'Todas tus órdenes están completadas' : 'No hay órdenes en este estado'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {ordenesFiltradas.map(orden => (
                            <OrdenCard 
                                key={orden.ordenId} 
                                orden={orden} 
                                onMarcarServida={handleMarcarServida} 
                                onSolicitarPago={handleSolicitarPago} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- COMPONENTE: Tarjeta de Orden Mejorada ---
const OrdenCard: React.FC<{
    orden: OrdenActiva; 
    onMarcarServida: (ordenId: number) => void; 
    onSolicitarPago: (ordenId: number) => void;
}> = ({ orden, onMarcarServida, onSolicitarPago }) => {
    const estadoConfig = {
        ENVIADA_COCINA: { 
            gradient: 'from-yellow-500 to-amber-600', 
            icon: <ChefHat className="w-5 h-5" strokeWidth={2.5}/>,
            label: 'Enviada a Cocina',
            bgCard: 'from-yellow-50 to-amber-50'
        },
        EN_PROCESO: { 
            gradient: 'from-blue-500 to-cyan-600', 
            icon: <Clock className="w-5 h-5" strokeWidth={2.5}/>,
            label: 'En Preparación',
            bgCard: 'from-blue-50 to-cyan-50'
        },
        LISTA_PARA_SERVIR: { 
            gradient: 'from-green-500 to-emerald-600', 
            icon: <Sparkles className="w-5 h-5" strokeWidth={2.5}/>,
            label: 'Lista para Servir',
            bgCard: 'from-green-50 to-emerald-50'
        },
        SERVIDA: { 
            gradient: 'from-purple-500 to-indigo-600', 
            icon: <Utensils className="w-5 h-5" strokeWidth={2.5}/>,
            label: 'Servida',
            bgCard: 'from-purple-50 to-indigo-50'
        },
        LISTA_PARA_PAGO: { 
            gradient: 'from-pink-500 to-rose-600', 
            icon: <CreditCard className="w-5 h-5" strokeWidth={2.5}/>,
            label: 'Esperando Pago',
            bgCard: 'from-pink-50 to-rose-50'
        },
    };
    
    const estado = estadoConfig[orden.estadoOrden as keyof typeof estadoConfig] || estadoConfig.EN_PROCESO;
    const todosListos = orden.platillos.every(p => p.estadoPreparacion === 'LISTO' || p.estadoPreparacion === 'SERVIDO');

    return (
        <div className={`bg-gradient-to-br ${estado.bgCard} rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 transform hover:scale-[1.02]`}>
            {/* Header de la tarjeta */}
            <div className={`bg-gradient-to-r ${estado.gradient} p-5 text-white`}>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="text-2xl font-black mb-1">{orden.numeroOrden}</h3>
                        <p className="text-sm font-semibold opacity-90">
                            {new Date(orden.fechaOrden).toLocaleString('es-GT', {
                                day: '2-digit', 
                                month: '2-digit', 
                                hour: '2-digit', 
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <div className="bg-white/25 backdrop-blur-sm px-3 py-2 rounded-xl flex items-center gap-2">
                        {estado.icon}
                        <span className="text-xs font-bold">{estado.label}</span>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
                {/* Info de la orden */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 space-y-2 border border-gray-200">
                    {orden.numeroMesa && (
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <div className="bg-blue-100 p-1.5 rounded-lg">
                                <Package className="w-4 h-4 text-blue-600" strokeWidth={2.5}/>
                            </div>
                            <span className="text-gray-600">Mesa:</span>
                            <span className="text-gray-900 font-black">{orden.numeroMesa}</span>
                        </div>
                    )}
                    {orden.nombreCliente && (
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <div className="bg-purple-100 p-1.5 rounded-lg">
                                <Users className="w-4 h-4 text-purple-600" strokeWidth={2.5}/>
                            </div>
                            <span className="text-gray-600">Cliente:</span>
                            <span className="text-gray-900 font-black">{orden.nombreCliente}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <div className="bg-green-100 p-1.5 rounded-lg">
                            <Users className="w-4 h-4 text-green-600" strokeWidth={2.5}/>
                        </div>
                        <span className="text-gray-600">Personas:</span>
                        <span className="text-gray-900 font-black">{orden.numeroPersonas}</span>
                    </div>
                </div>

                {/* Lista de platillos */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <h4 className="font-black text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-orange-600" strokeWidth={2.5}/>
                        Platillos Ordenados
                    </h4>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar">
                        {orden.platillos.map(platillo => (
                            <div 
                                key={platillo.ordenPlatilloId} 
                                className="flex justify-between items-start gap-3 p-3 bg-white rounded-lg border border-gray-200"
                            >
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-gray-900">
                                        <span className="text-blue-600">x{platillo.cantidad}</span> {platillo.nombrePlatillo}
                                    </p>
                                    {platillo.notasPlatillo && (
                                        <p className="text-xs text-orange-600 italic mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3"/>
                                            {platillo.notasPlatillo}
                                        </p>
                                    )}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-black whitespace-nowrap ${
                                    platillo.estadoPreparacion === 'LISTO' || platillo.estadoPreparacion === 'SERVIDO' 
                                        ? 'bg-green-100 text-green-800' 
                                        : platillo.estadoPreparacion === 'EN_COCINA' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {platillo.estadoPreparacion === 'LISTO' && '✅'}
                                    {platillo.estadoPreparacion === 'EN_COCINA' && '👨‍🍳'}
                                    {platillo.estadoPreparacion === 'PENDIENTE' && '⏳'}
                                    {platillo.estadoPreparacion === 'SERVIDO' && '🍽️'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 flex justify-between items-center text-white">
                    <span className="font-bold text-lg">Total a Pagar:</span>
                    <span className="text-3xl font-black">Q{orden.totalOrden.toFixed(2)}</span>
                </div>

                {/* Botones de acción */}
                {orden.estadoOrden === 'LISTA_PARA_SERVIR' && (
                    <button 
                        onClick={() => onMarcarServida(orden.ordenId)} 
                        className={`w-full py-4 rounded-xl font-black text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                            todosListos 
                                ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 shadow-lg transform hover:scale-105 active:scale-95' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!todosListos} 
                        title={!todosListos ? 'Espera a que todos los platillos estén listos' : 'Marcar como servida'}
                    >
                        {todosListos ? (
                            <>
                                <CheckCircle className="w-6 h-6" strokeWidth={2.5}/>
                                Marcar como Servida
                            </>
                        ) : (
                            <>
                                <Clock className="w-6 h-6 animate-spin" strokeWidth={2.5}/>
                                Esperando Platillos...
                            </>
                        )}
                    </button>
                )}

                {(orden.estadoOrden === 'SERVIDA' || orden.estadoOrden === 'LISTA_PARA_PAGO') && (
                    <div className="space-y-3">
                        {orden.estadoOrden === 'SERVIDA' && (
                            <button 
                                onClick={() => onSolicitarPago(orden.ordenId)} 
                                className="w-full py-4 rounded-xl font-black text-lg transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-700 text-white hover:from-purple-700 hover:to-indigo-800 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 active:scale-95"
                            >
                                <DollarSign className="w-6 h-6" strokeWidth={2.5}/>
                                Solicitar Pago / Cuenta
                            </button>
                        )}
                        <div className={`text-center py-4 rounded-xl font-black text-base ${
                            orden.estadoOrden === 'SERVIDA' 
                                ? 'bg-purple-100 text-purple-800 border-2 border-purple-300' 
                                : 'bg-pink-100 text-pink-800 border-2 border-pink-300'
                        }`}>
                            {orden.estadoOrden === 'SERVIDA' ? '🍽️ Orden Servida Completamente' : '💰 Esperando Pago del Cliente'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MisOrdenesPage;