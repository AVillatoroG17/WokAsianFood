import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FaSearch, FaReceipt, FaCheckCircle, FaSpinner, FaMoneyBillWave, FaCreditCard, FaPrint, FaUsers } from 'react-icons/fa';
import api from '../services/api'; // ✅ Asumimos que este servicio ya está configurado con el token
import jsPDF from 'jspdf'; // Para la generación del recibo

// --- INTERFACES TYPESCRIPT (Compartidas con el Backend/Detalle) ---
interface IOrdenPlatillo {
    ordenPlatilloId: number;
    nombrePlatillo: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    // La propiedad 'pagado' no se usa en este flujo, la quitamos para limpiar.
}

// Interfaz detallada (usada en el Modal)
interface IOrdenDetalle {
    ordenId: number;
    numeroOrden: string;
    numeroMesa?: string;
    nombreMesero?: string;
    nombreCliente?: string;
    fechaOrden: string;
    subtotal: number;
    impuestos: number;
    descuento: number;
    totalOrden: number;
    numeroPersonas: number;
    platillos: IOrdenPlatillo[];
}

// Interfaz para la lista de órdenes (usada en la vista principal)
interface OrdenFacturable {
    ordenId: number;
    numeroOrden: string;
    numeroMesa?: string;
    nombreCliente?: string;
    totalOrden: number;
    fechaOrden: string;
    numeroPersonas: number;
}

// Tipos de Pago y Respuesta
type PaymentType = 'grupal' | 'dividido' | 'individual';
type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto';

interface IPagoResponse {
    success: boolean;
    message: string;
    pagoId: number;
    cambio: number;
}

// --- GENERACIÓN DE RECIBO PDF ---

const generarReciboPDF = (orden: IOrdenDetalle, pagoData: any, cambioFinal: number) => {
    // Implementación real de jsPDF, simplificada por espacio
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 220] });
    let y = 10;
    const lineHeight = 5;
    const margin = 5;
    const right = 75;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Wok Asian Fusion', 40, y, { align: 'center' });
    y += lineHeight + 1;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Recibo: ${orden.numeroOrden}`, margin, y);
    y += lineHeight;
    doc.text(`Mesa: ${orden.numeroMesa || 'N/A'}`, margin, y);
    y += lineHeight;
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, y);
    y += lineHeight;

    doc.line(margin, y, right, y);
    y += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('Producto', margin, y);
    doc.text('Subtotal', right, y, { align: 'right' });
    y += lineHeight;

    doc.setFont('helvetica', 'normal');
    orden.platillos.forEach(p => {
        doc.text(`${p.cantidad}x ${p.nombrePlatillo}`, margin, y);
        doc.text(`Q${p.subtotal.toFixed(2)}`, right, y, { align: 'right' });
        y += lineHeight;
    });

    doc.line(margin, y, right, y);
    y += lineHeight;

    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', margin, y);
    doc.text(`Q${orden.subtotal.toFixed(2)}`, right, y, { align: 'right' });
    y += lineHeight;
    doc.text('Impuestos:', margin, y);
    doc.text(`Q${orden.impuestos.toFixed(2)}`, right, y, { align: 'right' });
    y += lineHeight;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', margin, y);
    doc.text(`Q${orden.totalOrden.toFixed(2)}`, right, y, { align: 'right' });
    y += lineHeight + 2;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Método: ${pagoData.metodoPago.charAt(0).toUpperCase() + pagoData.metodoPago.slice(1)}`, margin, y);
    y += lineHeight;

    if (pagoData.metodoPago === 'EFECTIVO') {
        doc.text('Recibido:', margin, y);
        doc.text(`Q${(pagoData.montoEfectivo || 0).toFixed(2)}`, right, y, { align: 'right' });
        y += lineHeight;
        doc.text('Cambio:', margin, y);
        doc.text(`Q${cambioFinal.toFixed(2)}`, right, y, { align: 'right' });
        y += lineHeight;
    }
    
    doc.text(`¡Gracias por su visita!`, 40, y + 5, { align: 'center' });

    doc.save(`Recibo-${orden.numeroOrden}.pdf`);
};

// --- COMPONENTE BillingModal (Adaptado para usar el servicio 'api') ---

interface BillingModalProps {
    orden: OrdenFacturable; // Solo la data base
    cajeroId: number;
    onClose: () => void;
    onPagoExitoso: () => void;
}

const BillingModal: React.FC<BillingModalProps> = ({ orden, cajeroId, onClose, onPagoExitoso }) => {
    const [paymentType, setPaymentType] = useState<PaymentType>('grupal');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
    const [cashReceived, setCashReceived] = useState(0); 
    const [orderDetail, setOrderDetail] = useState<IOrdenDetalle | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
    const [finalPagoData, setFinalPagoData] = useState<IPagoResponse & { totalOrden: number, montoEfectivo: number, metodoPago: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const total = orderDetail?.totalOrden || orden.totalOrden;
    const minCash = total;
    const cambio = Math.max(0, cashReceived - total);
    
    // 1. Cargar detalles de la orden al abrir el modal
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get<IOrdenDetalle>(`/api/ordenes/${orden.ordenId}`);
                setOrderDetail(response.data);
                setCashReceived(response.data.totalOrden); // Inicializa el monto recibido al total
            } catch (e) {
                console.error("Error al obtener detalle:", e);
                setError("Error al cargar detalles de la orden.");
            } finally {
                setLoadingDetail(false);
            }
        };
        fetchDetail();
    }, [orden.ordenId]);


    const handleConfirmPayment = async () => {
        if (!orderDetail) return;

        setError(null);
        setPaymentStatus('processing');
        
        const isEfectivo = paymentMethod === 'efectivo';

        if (isEfectivo && cashReceived < minCash) {
            setError("El monto recibido en efectivo es menor al total de la orden.");
            setPaymentStatus('pending');
            return;
        }

        // 🎯 PAYLOAD CRÍTICO para /api/pagos
        const payload = {
            ordenId: orderDetail.ordenId,
            cajeroId: cajeroId, 
            metodoPago: paymentMethod.toUpperCase(), 
            tipoPago: paymentType.toUpperCase(), 
            montoEfectivo: isEfectivo ? cashReceived : 0, 
            montoTarjeta: !isEfectivo ? total : 0, 
            referenciaTransaccion: !isEfectivo ? `TXN-${new Date().getTime()}` : null, 
            notasPago: `Pago cerrado por Cajero ID: ${cajeroId} para mesa ${orden.numeroMesa}` 
        };

        try {
            const response = await api.post<IPagoResponse>('/api/pagos', payload);
            
            setFinalPagoData({ 
                ...response.data, 
                totalOrden: total,
                montoEfectivo: payload.montoEfectivo,
                metodoPago: payload.metodoPago
            }); 
            setPaymentStatus('success');
            onPagoExitoso(); 
            
        } catch (e: any) {
            console.error("Error al procesar el pago:", e);
            const errMsg = e.response?.data?.message || e.message || 'Error desconocido al confirmar el pago.';
            setError(errMsg);
            setPaymentStatus('pending'); 
        }
    };
    
    // Renderizado del Modal de Éxito
    if (paymentStatus === 'success' && finalPagoData && orderDetail) {
        const cambioFinal = finalPagoData.cambio;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                 <div className="bg-white rounded-lg shadow-2xl w-full max-w-md text-center p-8">
                    <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h2>
                    <p className="text-gray-600 mb-6">Cambio a entregar: Q{cambioFinal.toFixed(2)}</p>
                    <div className="flex flex-col space-y-4">
                        <button 
                            onClick={() => generarReciboPDF(orderDetail, finalPagoData, cambioFinal)}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center">
                            <FaPrint className="mr-2" /> Imprimir Recibo
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">
                            Cerrar
                        </button>
                    </div>
                 </div>
            </div>
        )
    }

    if (loadingDetail) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
                    <p className="font-semibold">Cargando detalles de la orden...</p>
                </div>
            </div>
        );
    }
    
    // Renderizado del Modal de Pago
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b">
                    <h2 className="text-2xl font-bold">Factura Orden: {orden.numeroOrden} (Mesa {orden.numeroMesa})</h2>
                </header>

                <main className="p-6 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* --- PANEL DE ORDEN/DETALLE --- */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold border-b pb-2">Detalle de la Orden</h3>
                        {orderDetail?.platillos.map(p => (
                            <div key={p.ordenPlatilloId} className="flex justify-between items-center text-sm">
                                <span>{p.cantidad}x {p.nombrePlatillo}</span>
                                <span className="font-medium">Q{(p.subtotal).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t pt-2 space-y-1">
                            <div className="flex justify-between"><span>Subtotal:</span><span>Q{orderDetail?.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Impuestos:</span><span>Q{orderDetail?.impuestos.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-xl"><span>TOTAL:</span><span className="text-green-600">Q{total.toFixed(2)}</span></div>
                        </div>
                    </div>
                    
                    {/* --- PANEL DE PAGO --- */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold border-b pb-2">Opciones de Pago</h3>
                        
                        {/* Tipo de Pago */}
                        <label className="block font-medium">Tipo de Pago</label>
                        <div className="flex space-x-2">
                            {['grupal', 'dividido'].map((type) => (
                                <button key={type} onClick={() => setPaymentType(type as PaymentType)} 
                                    className={`flex-1 py-2 rounded-lg transition-colors ${paymentType === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                                    <FaUsers className="inline mr-2" /> {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Método de Pago */}
                        <label className="block font-medium pt-4">Método de Pago</label>
                        <div className="flex space-x-2">
                            {['efectivo', 'tarjeta', 'transferencia'].map((method) => (
                                <button key={method} onClick={() => setPaymentMethod(method as PaymentMethod)} 
                                    className={`flex-1 py-2 rounded-lg transition-colors ${paymentMethod === method ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                                    {method === 'efectivo' ? <FaMoneyBillWave className="inline mr-2" /> : <FaCreditCard className="inline mr-2" />} {method.charAt(0).toUpperCase() + method.slice(1)}
                                </button>
                            ))}
                        </div>
                        
                        {/* Monto Efectivo Recibido */}
                        {paymentMethod === 'efectivo' && (
                            <div className="pt-4">
                                <label className="block font-medium">Monto Recibido (Efectivo)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={cashReceived || ''}
                                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-2xl font-bold mt-1"
                                    placeholder={total.toFixed(2)}
                                />
                                <p className={`mt-2 text-sm ${cambio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Cambio: Q{cambio.toFixed(2)}
                                </p>
                            </div>
                        )}
                        
                        {/* Mensaje de Error */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Error:</strong>
                                <span className="block sm:inline"> {error}</span>
                            </div>
                        )}
                    </div>
                </main>

                <footer className="p-4 border-t flex justify-end space-x-4">
                    <button onClick={onClose} className="py-2 px-6 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button 
                        onClick={handleConfirmPayment} 
                        disabled={paymentStatus === 'processing' || (paymentMethod === 'efectivo' && cashReceived < minCash)} 
                        className="py-2 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                    >
                        {paymentStatus === 'processing' ? <FaSpinner className="animate-spin mr-2" /> : <FaCheckCircle className="mr-2" />} Confirmar Pago
                    </button>
                </footer>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL FacturacionPage (Nueva Versión) ---

const FacturacionPage: React.FC = () => {
    const { user } = useAuth();
    const [ordenes, setOrdenes] = useState<OrdenFacturable[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrden, setSelectedOrden] = useState<OrdenFacturable | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ✅ Control de acceso: Solo CAJERO, ADMIN o ENCARGADO
    const tieneAcceso = ['ADMINISTRADOR', 'CAJERO', 'ENCARGADO'].includes(user?.rol?.toUpperCase() || '');

    useEffect(() => {
        if (tieneAcceso) {
            fetchOrdenes();
        }
    }, [tieneAcceso]);

    const fetchOrdenes = async () => {
        setLoading(true);
        try {
            // ✅ AJUSTE CLAVE: Filtrar ahora solo órdenes en estado 'listo',
            // eliminando el paso intermedio de 'servida' para el Cajero.
            const response = await api.get('/api/ordenes', {
                params: { estados: 'listo' } // <-- ¡Cambiado de 'servida' a 'listo'!
            });
            setOrdenes(response.data);
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (orden: OrdenFacturable) => {
        setSelectedOrden(orden);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrden(null);
    };

    const handlePagoExitoso = () => {
        fetchOrdenes(); // Refrescar lista
        handleCloseModal();
    };

    const ordenesFiltradas = ordenes.filter(o =>
        o.numeroOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.numeroMesa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.nombreCliente?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!tieneAcceso) {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    💳 Caja / Facturación
                </h1>
                <div className="text-sm text-gray-600">
                    <strong>{ordenesFiltradas.length}</strong> órdenes pendientes de pago
                </div>
            </header>

            {/* Buscador */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por N° Orden, Mesa o Cliente..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-blue-600" />
                </div>
            ) : ordenesFiltradas.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-700">No hay órdenes pendientes de pago</h2>
                    <p className="text-gray-500 mt-2">Todas las órdenes están pagadas o en proceso</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ordenesFiltradas.map(orden => (
                        <div key={orden.ordenId} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{orden.numeroOrden}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(orden.fechaOrden).toLocaleString('es-GT', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                                    Mesa {orden.numeroMesa || 'N/A'}
                                </span>
                            </div>

                            {orden.nombreCliente && (
                                <p className="text-sm text-gray-600 mb-2">
                                    👤 {orden.nombreCliente}
                                </p>
                            )}

                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        Q{orden.totalOrden.toFixed(2)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleOpenModal(orden)}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                                >
                                    <FaReceipt className="mr-2" />
                                    Facturar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && selectedOrden && (
                <BillingModal
                    orden={selectedOrden}
                    cajeroId={user!.usuarioId}
                    onClose={handleCloseModal}
                    onPagoExitoso={handlePagoExitoso}
                />
            )}
        </div>
    );
};

export default FacturacionPage;
