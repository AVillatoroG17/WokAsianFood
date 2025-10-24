import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FaCheckCircle, FaClock, FaUtensils, FaSpinner, FaSearch, FaDollarSign } from 'react-icons/fa';
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
                    // Se incluye ENVIADA_COCINA para ver el flujo completo
                    estados: 'ENVIADA_COCINA,EN_PROCESO,LISTA_PARA_SERVIR,SERVIDA,LISTA_PARA_PAGO',
                    meseroId: user?.usuarioId
                }
            });
            setOrdenes(response.data);
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarServida = async (ordenId: number) => {
        if (!user?.usuarioId) return;
        try {
            // Lógica para marcar TODOS los platillos de la orden como SERVIDOS
            // Nota: Se asume que este endpoint marca todos los platillos LISTO a SERVIDO
            // y luego marca la orden general a SERVIDA.
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

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 Mis Órdenes Activas</h1>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">📊 Total: {stats.total}</div>
                    <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-semibold">⏳ En Proceso: {stats.enProceso}</div>
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">✅ Listas: {stats.listas}</div>
                    <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-semibold">🍽️ Servidas/Pago: {stats.servidas}</div>
                </div>
            </header>
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input type="text" placeholder="🔍 Buscar por Nº Orden, Mesa o Cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2">
                    {(['todas', 'en_proceso', 'listas'] as const).map(estado => (
                        <button key={estado} onClick={() => setFiltroEstado(estado)} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filtroEstado === estado ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                            {estado === 'todas' && '📊 Todas'}
                            {estado === 'en_proceso' && '⏳ En Proceso'}
                            {estado === 'listas' && '✅ Listas'}
                        </button>
                    ))}
                </div>
            </div>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-blue-600" />
                </div>
            ) : ordenesFiltradas.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-700">No hay órdenes activas</h2>
                    <p className="text-gray-500 mt-2">{filtroEstado === 'todas' ? 'Todas tus órdenes están completadas' : 'No hay órdenes en este estado'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {ordenesFiltradas.map(orden => (
                        <OrdenCard key={orden.ordenId} orden={orden} onMarcarServida={handleMarcarServida} onSolicitarPago={handleSolicitarPago} />
                    ))}
                </div>
            )}
        </div>
    );
};

const OrdenCard: React.FC<{orden: OrdenActiva; onMarcarServida: (ordenId: number) => void; onSolicitarPago: (ordenId: number) => void;}> = ({ orden, onMarcarServida, onSolicitarPago }) => {
    const estadoConfig = {
        ENVIADA_COCINA: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🚀 Enviada a Cocina' },
        EN_PROCESO: { bg: 'bg-blue-100', text: 'text-blue-800', label: '👨‍🍳 En Preparación' },
        LISTA_PARA_SERVIR: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Lista para Servir' },
        SERVIDA: { bg: 'bg-purple-100', text: 'text-purple-800', label: '🍽️ Servida' },
        LISTA_PARA_PAGO: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: '💰 Pago Solicitado' },
    };
    const estado = estadoConfig[orden.estadoOrden as keyof typeof estadoConfig] || estadoConfig.EN_PROCESO;
    
    // CORRECCIÓN CLAVE: Usar mayúsculas para comparar con el Enum de Java
    const todosListos = orden.platillos.every(p => p.estadoPreparacion === 'LISTO' || p.estadoPreparacion === 'SERVIDO');

    return (
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{orden.numeroOrden}</h3>
                    <p className="text-sm text-gray-500">{new Date(orden.fechaOrden).toLocaleString('es-GT', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estado.bg} ${estado.text}`}>{estado.label}</span>
            </div>
            <div className="mb-4 space-y-1">
                {orden.numeroMesa && <p className="text-sm"><span className="font-semibold">Mesa:</span> {orden.numeroMesa}</p>}
                {orden.nombreCliente && <p className="text-sm"><span className="font-semibold">Cliente:</span> {orden.nombreCliente}</p>}
                <p className="text-sm"><span className="font-semibold">Personas:</span> {orden.numeroPersonas}</p>
            </div>
            <div className="border-t pt-4 mb-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Platillos:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {orden.platillos.map(platillo => (
                        <div key={platillo.ordenPlatilloId} className="flex justify-between items-center text-sm">
                            <div className="flex-1">
                                <span className="font-medium">{platillo.cantidad}x</span> {platillo.nombrePlatillo}
                                {platillo.notasPlatillo && <p className="text-xs text-orange-600 italic">📝 {platillo.notasPlatillo}</p>}
                            </div>
                            {/* CORRECCIÓN: Usar mayúsculas en las comparaciones de estadoPreparacion */}
                            <span className={`text-xs px-2 py-1 rounded ${platillo.estadoPreparacion === 'LISTO' || platillo.estadoPreparacion === 'SERVIDO' ? 'bg-green-100 text-green-800' : platillo.estadoPreparacion === 'EN_COCINA' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {platillo.estadoPreparacion === 'LISTO' && '✅'}
                                {platillo.estadoPreparacion === 'EN_COCINA' && '👨‍🍳'}
                                {platillo.estadoPreparacion === 'PENDIENTE' && '⏳'}
                                {platillo.estadoPreparacion === 'SERVIDO' && '🍽️'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total:</span>
                    <span className="text-xl font-bold text-green-600">Q{orden.totalOrden.toFixed(2)}</span>
                </div>
            </div>
            {orden.estadoOrden === 'LISTA_PARA_SERVIR' && (
                <button onClick={() => onMarcarServida(orden.ordenId)} className={`w-full py-3 rounded-lg font-bold transition-colors ${todosListos ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} flex items-center justify-center`} disabled={!todosListos} title={!todosListos ? 'Espera a que todos los platillos estén listos' : 'Marcar como servida'}>
                    <FaCheckCircle className="mr-2" />
                    {/* El mensaje es ahora condicional y usa 'todosListos' correctamente */}
                    {todosListos ? 'Marcar como Servida' : 'Esperando Platillos...'} 
                </button>
            )}
            {(orden.estadoOrden === 'SERVIDA' || orden.estadoOrden === 'LISTA_PARA_PAGO') && (
                <div className="space-y-3">
                    {orden.estadoOrden === 'SERVIDA' && (
                        <button onClick={() => onSolicitarPago(orden.ordenId)} className="w-full py-3 rounded-lg font-bold transition-colors bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center shadow-md hover:shadow-lg">
                            <FaDollarSign className="mr-2" />
                            Solicitar Pago / Cuenta
                        </button>
                    )}
                    <div className={`text-center py-3 rounded-lg font-semibold ${orden.estadoOrden === 'SERVIDA' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {orden.estadoOrden === 'SERVIDA' ? '🍽️ Orden Servida' : '💰 Esperando Pago del Cliente/Caja'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisOrdenesPage;