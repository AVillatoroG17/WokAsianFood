import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaMoneyBillWave, FaCreditCard, FaReceipt, FaUsers, FaUser, FaCheckCircle, FaSpinner, FaPrint } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.tsx';
import { Navigate } from 'react-router-dom';
import jsPDF from 'jspdf';

// --- INTERFACES TYPESCRIPT ---
interface IOrdenPlatillo {
    ordenPlatilloId: number;
    nombrePlatillo: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    pagado?: boolean;
}

interface IOrden {
    ordenId: number;
    numeroOrden: string;
    numeroMesa?: string;
    nombreMesero?: string;
    fechaOrden: string;
    subtotal: number;
    impuestos: number;
    descuento: number;
    totalOrden: number;
    numeroPersonas: number;
    platillos: IOrdenPlatillo[];
}

type PaymentType = 'grupal' | 'dividido' | 'individual';
type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto';

// Interfaz para el objeto de respuesta del pago (del backend)
interface IPagoResponse {
    success: boolean;
    message: string;
    pagoId: number;
    cambio: number;
}

// --- SIMULACIÓN Y CAPA DE API ---

const mockOrdenesFacturables: Partial<IOrden>[] = [
    { ordenId: 36, numeroOrden: 'ORD-001', numeroMesa: '5', totalOrden: 89.60 }, 
    { ordenId: 102, numeroOrden: 'ORD-002', numeroMesa: '3', totalOrden: 120.10 },
    { ordenId: 103, numeroOrden: 'ORD-003', numeroMesa: '8', totalOrden: 33.00 },
];

const mockOrdenDetalle: IOrden = {
    ordenId: 36,
    numeroOrden: 'ORD-001',
    numeroMesa: '5',
    nombreMesero: 'Carlos',
    fechaOrden: new Date().toISOString(),
    numeroPersonas: 2,
    subtotal: 80.00,
    impuestos: 9.60,
    descuento: 0,
    totalOrden: 89.60,
    platillos: [
        { ordenPlatilloId: 2, nombrePlatillo: 'Pad Thai', cantidad: 1, precioUnitario: 40.00, subtotal: 40.00 },
        { ordenPlatilloId: 3, nombrePlatillo: 'Ramen Tonkotsu', cantidad: 1, precioUnitario: 40.00, subtotal: 40.00 },
    ]
};

// 🔑 CLAVE: La función 'api' recibe el token de autenticación.
const api = (token: string) => ({
    getOrdenesFacturables: async (): Promise<Partial<IOrden>[]> => {
        // En una app real, usarías el token aquí para llamar al backend.
        return new Promise(res => setTimeout(() => res(mockOrdenesFacturables), 500));
    },
    getOrdenDetalle: async (ordenId: number): Promise<IOrden> => {
        return new Promise(res => setTimeout(() => res(mockOrdenDetalle), 500));
    },
    // 🔥 FUNCIÓN CRÍTICA: LLAMADA REAL A /api/pagos
    createPago: async (pagoData: any): Promise<IPagoResponse> => {
        console.log('API POST: /api/pagos (Real Call)', pagoData);
        
        const response = await fetch('http://localhost:8080/api/pagos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 🔑 ¡El Token de Autorización es esencial!
            },
            body: JSON.stringify(pagoData)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.message || `Error ${response.status}: Fallo en el servidor.`);
        }

        // El backend devuelve el objeto { success, message, pagoId, cambio }
        return await response.json(); 
    }
});


// --- GENERACIÓN DE RECIBO PDF (Sin Cambios) ---

const generarReciboPDF = (orden: IOrden, pagoData: any, cambioFinal: number) => {
    // ... (Tu código de generación de PDF va aquí)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 220] });
    let y = 10;
    const lineHeight = 5;
    const margin = 5;
    const center = 40;
    const right = 75;

    // ... [CÓDIGO DE RECIBO OMITIDO POR ESPACIO] ...

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
    // ... [CÓDIGO DE RECIBO OMITIDO POR ESPACIO] ...

    doc.save(`Recibo-${orden.numeroOrden}.pdf`);
};


// --- COMPONENTE PRINCIPAL FacturacionPage ---

const FacturacionPage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Partial<IOrden>[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<IOrden | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Asumimos que el token existe si el usuario existe
    const token = user?.token || '';
    const cajeroId = user?.usuarioId || 0;
    
    // Inicializamos la API con el token
    const realApi = useMemo(() => api(token), [token]);

    const hasAccess = useMemo(() => user && (user.rol?.trim() === 'ADMINISTRADOR' || user.rol?.trim() === 'MESERO'), [user]);

    const fetchOrders = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await realApi.getOrdenesFacturables();
            setOrders(data);
        } catch (e) {
            console.error("Error al cargar órdenes:", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (hasAccess) {
            fetchOrders();
        }
    }, [hasAccess]);

    const handleOpenModal = async (orderId: number) => {
        setIsModalOpen(true);
        try {
            const details = await realApi.getOrdenDetalle(orderId);
            setSelectedOrder(details);
        } catch (e) {
            console.error("Error al obtener detalle:", e);
        }
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

    if (!hasAccess) {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            {/* ... (Tu JSX de la página principal de Facturación) ... */}

            {isModalOpen && selectedOrder && (
                <BillingModal 
                    order={selectedOrder} 
                    onClose={handleCloseModal} 
                    onPaymentSuccess={fetchOrders} 
                    token={token} // Pasamos el token
                    cajeroId={cajeroId} // Pasamos el ID del cajero
                />
            )}
        </div>
    );
};


// --- COMPONENTE BillingModal ---

interface BillingModalProps {
    order: IOrden;
    onClose: () => void;
    onPaymentSuccess: () => void;
    token: string;
    cajeroId: number;
}

const BillingModal: React.FC<BillingModalProps> = ({ order, onClose, onPaymentSuccess, token, cajeroId }) => {
    const [paymentType, setPaymentType] = useState<PaymentType>('grupal');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
    const [cashReceived, setCashReceived] = useState(0); 
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
    const [finalPagoData, setFinalPagoData] = useState<IPagoResponse & { totalOrden: number, montoEfectivo: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const realApi = useMemo(() => api(token), [token]);

    const subtotal = useMemo(() => order.subtotal, [order]); // Simplificado, asume pago total
    const discount = order.descuento || 0;
    const total = order.totalOrden;

    const handleConfirmPayment = async () => {
        setError(null);
        setPaymentStatus('processing');
        
        const isEfectivo = paymentMethod === 'efectivo';

        // 🎯 PAYLOAD CRÍTICO: 8 CAMPOS EXACTOS (como tu PagoRequestDTO)
        const payload = {
            ordenId: order.ordenId,
            cajeroId: cajeroId, 
            
            // Usamos mayúsculas para coincidir con tus Enums de Java
            metodoPago: paymentMethod.toUpperCase(), 
            tipoPago: paymentType.toUpperCase(), 
            
            // Lógica de montos
            montoEfectivo: isEfectivo ? cashReceived : 0, 
            montoTarjeta: !isEfectivo ? total : 0, 
            
            // Valores por defecto
            referenciaTransaccion: !isEfectivo ? `TXN-${new Date().getTime()}` : null, 
            notasPago: `Pago cerrado por Cajero ID: ${cajeroId}` 
        };

        try {
            const response = await realApi.createPago(payload);
            
            // Guardamos la respuesta del backend junto con el total de la orden
            setFinalPagoData({ 
                ...response, 
                totalOrden: total,
                montoEfectivo: payload.montoEfectivo
            }); 
            setPaymentStatus('success');
            onPaymentSuccess(); 
            
        } catch (e) {
            console.error("Error al procesar el pago:", e);
            const errMsg = e instanceof Error ? e.message : String(e);
            setError(errMsg || 'Error desconocido al confirmar el pago.');
            setPaymentStatus('pending'); 
        }
    };
    
    // ... (Manejo de estados y JSX para el modal)
    
    if (paymentStatus === 'success' && finalPagoData) {
        const cambioFinal = finalPagoData.cambio;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                 <div className="bg-white rounded-lg shadow-2xl w-full max-w-md text-center p-8">
                    <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h2>
                    <p className="text-gray-600 mb-6">Cambio a entregar: Q{cambioFinal.toFixed(2)}</p>
                    <div className="flex flex-col space-y-4">
                        <button 
                            onClick={() => generarReciboPDF(order, finalPagoData, cambioFinal)}
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b">
                    <h2 className="text-2xl font-bold">Factura Orden: {order.numeroOrden} (Mesa {order.numeroMesa})</h2>
                </header>

                <main className="p-6 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* --- PANEL DE ORDEN/DETALLE --- */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold border-b pb-2">Detalle de la Orden</h3>
                        {order.platillos.map(p => (
                            <div key={p.ordenPlatilloId} className="flex justify-between items-center text-sm">
                                <span>{p.cantidad}x {p.nombrePlatillo}</span>
                                <span className="font-medium">Q{(p.subtotal).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t pt-2 space-y-1">
                            <div className="flex justify-between"><span>Subtotal:</span><span>Q{order.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Impuestos:</span><span>Q{order.impuestos.toFixed(2)}</span></div>
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
                            {['efectivo', 'tarjeta'].map((method) => (
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
                                <p className="mt-2 text-red-600 text-sm">Cambio: Q{(Math.max(0, cashReceived - total)).toFixed(2)}</p>
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
                        disabled={paymentStatus === 'processing' || (paymentMethod === 'efectivo' && cashReceived < total)} 
                        className="py-2 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                    >
                        {paymentStatus === 'processing' ? <FaSpinner className="animate-spin mr-2" /> : <FaCheckCircle className="mr-2" />} Confirmar Pago
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default FacturacionPage;