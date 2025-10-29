import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaCheckCircle, FaSpinner, FaPrint } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getOrdenesFacturables, crearPago } from '../services/pagoService';
import { IOrdenDTO } from '../models/IOrden';

const FacturacionPage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<IOrdenDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<IOrdenDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const hasAccess = useMemo(() => user?.rol === 'ADMIN' || user?.rol === 'CAJERO', [user?.rol]);

    useEffect(() => {
        if (hasAccess) fetchOrders();
    }, [hasAccess]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrdenesFacturables();
            setOrders(data);
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (order: IOrdenDTO) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const filteredOrders = useMemo(() =>
        orders.filter(o =>
            o.numeroOrden?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.numeroMesa?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [orders, searchTerm]);

    if (!hasAccess) return <div className="p-8 text-center text-red-600"><h1>Acceso Denegado</h1></div>;

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Facturación de Órdenes</h1>
            </header>
            <div className="mb-4">
                <div className="relative">
                    <FaSearch className="absolute top-3 left-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por Nº de Orden o Mesa..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 p-2 pl-10 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-blue-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredOrders.map(order => (
                        <div key={order.ordenId} className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">{order.numeroOrden}</h2>
                                <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">Mesa {order.numeroMesa}</span>
                            </div>
                            <p className="text-2xl font-light my-4">Q{order.totalOrden.toFixed(2)}</p>
                            <button
                                onClick={() => handleOpenModal(order)}
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                            >
                                <FaCheckCircle className="mr-2" /> Facturar
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && selectedOrder && (
                <BillingModal order={selectedOrder} onClose={handleCloseModal} onPaymentSuccess={fetchOrders} />
            )}
        </div>
    );
};

const BillingModal: React.FC<{ order: IOrdenDTO, onClose: () => void, onPaymentSuccess: () => void }> = ({ order, onClose, onPaymentSuccess }) => {
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'mixto'>('efectivo');
    const [cashReceived, setCashReceived] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const cambio = cashReceived - order.totalOrden;

    const handleConfirmPayment = async () => {
        setProcessing(true);
        const pagoData = {
            orden: { ordenId: order.ordenId },
            tipoPago: 'grupal',
            metodoPago: paymentMethod,
            montoSubtotal: order.subtotal,
            montoImpuestos: order.impuestos,
            montoDescuento: order.descuento || 0,
            montoTotal: order.totalOrden,
            cajero: { usuarioId: user?.usuarioId },
            montoEfectivo: paymentMethod === 'efectivo' ? cashReceived : 0
        };

        try {
            await crearPago(pagoData);
            setSuccess(true);
            setTimeout(() => {
                onPaymentSuccess();
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error al procesar pago:', error);
            alert('Error al procesar el pago');
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-md text-center p-8">
                    <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h2>
                    <p className="text-gray-600 mb-6">La orden {order.numeroOrden} ha sido cerrada.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                <header className="p-4 border-b">
                    <h2 className="text-2xl font-bold">Factura Orden: {order.numeroOrden}</h2>
                </header>

                <main className="p-6 max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold mb-2">Platillos:</h3>
                            {order.platillos?.map(p => (
                                <div key={p.ordenPlatilloId} className="flex justify-between text-sm">
                                    <span>{p.nombrePlatillo} x{p.cantidad}</span>
                                    <span>Q{p.subtotal.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between"><span>Subtotal:</span><span>Q{order.subtotal?.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Impuestos:</span><span>Q{order.impuestos?.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>Q{order.totalOrden.toFixed(2)}</span></div>
                        </div>
                        <div>
                            <label className="block font-medium mb-2">Método de Pago:</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full p-2 border rounded">
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="mixto">Mixto</option>
                            </select>
                        </div>
                        {paymentMethod === 'efectivo' && (
                            <div>
                                <label className="block font-medium mb-2">Efectivo Recibido:</label>
                                <input type="number" value={cashReceived} onChange={e => setCashReceived(+e.target.value)} className="w-full p-2 border rounded" />
                                {cambio >= 0 && <p className="text-green-600 mt-2">Cambio: Q{cambio.toFixed(2)}</p>}
                            </div>
                        )}
                    </div>
                </main>

                <footer className="p-4 border-t flex justify-end space-x-4">
                    <button onClick={onClose} className="py-2 px-6 bg-gray-200 rounded-lg">Cancelar</button>
                    <button onClick={handleConfirmPayment} disabled={processing || (paymentMethod === 'efectivo' && cambio < 0)} className="py-2 px-6 bg-green-600 text-white rounded-lg disabled:bg-gray-400">
                        {processing ? <FaSpinner className="animate-spin"/> : 'Confirmar'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default FacturacionPage;