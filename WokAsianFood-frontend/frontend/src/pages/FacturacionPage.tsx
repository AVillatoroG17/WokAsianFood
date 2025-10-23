
import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaMoneyBillWave, FaCreditCard, FaReceipt, FaUsers, FaUser, FaCheckCircle, FaSpinner } from 'react-icons/fa';

// --- SIMULACIÓN DEL CONTEXTO DE AUTENTICACIÓN ---
const useAuth = () => {
    // Cambia el rol para probar: 'ADMINISTRADOR', 'MESERO', 'COCINERO', 'ENCARGADO'
    const [user] = useState({ role: 'ADMINISTRADOR', userId: 1, name: 'Admin User' });
    return { user };
};

// --- INTERFACES TYPESCRIPT ---
interface IOrdenPlatillo {
    ordenPlatilloId: number;
    nombrePlatillo: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    pagado?: boolean; // Control para pago separado
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

// --- SIMULACIÓN DE LA CAPA DE API ---
const mockOrdenesFacturables: Partial<IOrden>[] = [
    { ordenId: 101, numeroOrden: 'ORD-001', numeroMesa: '5', totalOrden: 55.40 },
    { ordenId: 102, numeroOrden: 'ORD-002', numeroMesa: '3', totalOrden: 120.10 },
    { ordenId: 103, numeroOrden: 'ORD-003', numeroMesa: '8', totalOrden: 33.00 },
];

const mockOrdenDetalle: IOrden = {
    ordenId: 101,
    numeroOrden: 'ORD-001',
    numeroMesa: '5',
    nombreMesero: 'Carlos',
    fechaOrden: new Date().toISOString(),
    numeroPersonas: 2,
    subtotal: 49.50,
    impuestos: 5.94,
    descuento: 0,
    totalOrden: 55.44,
    platillos: [
        { ordenPlatilloId: 201, nombrePlatillo: 'Pad Thai', cantidad: 1, precioUnitario: 15.50, subtotal: 15.50 },
        { ordenPlatilloId: 202, nombrePlatillo: 'Ramen Tonkotsu', cantidad: 1, precioUnitario: 18.00, subtotal: 18.00 },
        { ordenPlatilloId: 203, nombrePlatillo: 'Gyoza (6u)', cantidad: 2, precioUnitario: 8.00, subtotal: 16.00 },
    ]
};

const api = {
    getOrdenesFacturables: async (): Promise<Partial<IOrden>[]> => {
        console.log('API GET: /api/ordenes?estados=listo,servido');
        return new Promise(res => setTimeout(() => res(mockOrdenesFacturables), 500));
    },
    getOrdenDetalle: async (ordenId: number): Promise<IOrden> => {
        console.log(`API GET: /api/ordenes/${ordenId}`);
        // En una app real, buscarías la orden correcta
        return new Promise(res => setTimeout(() => res(mockOrdenDetalle), 500));
    },
    createPago: async (pagoData: any): Promise<{ success: boolean }> => {
        console.log('API POST: /api/pagos', pagoData);
        return new Promise(res => setTimeout(() => res({ success: true }), 1000));
    }
};

// --- COMPONENTE PRINCIPAL ---
const FacturacionPage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Partial<IOrden>[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<IOrden | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const hasAccess = useMemo(() => user.role === 'ADMINISTRADOR' || user.role === 'MESERO', [user.role]);

    useEffect(() => {
        if (hasAccess) {
            fetchOrders();
        }
    }, [hasAccess]);

    const fetchOrders = async () => {
        setLoading(true);
        const data = await api.getOrdenesFacturables();
        setOrders(data);
        setLoading(false);
    };

    const handleOpenModal = async (orderId: number) => {
        setIsModalOpen(true);
        const details = await api.getOrdenDetalle(orderId);
        setSelectedOrder(details);
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
        return <div className="p-8 text-center text-red-600"><h1>Acceso Denegado</h1><p>No tienes permisos para acceder a la facturación.</p></div>;
    }

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
                <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-blue-600" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredOrders.map(order => (
                        <div key={order.ordenId} className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">{order.numeroOrden}</h2>
                                <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">Mesa {order.numeroMesa}</span>
                            </div>
                            <p className="text-2xl font-light my-4">Q{order.totalOrden?.toFixed(2)}</p>
                            <button
                                onClick={() => handleOpenModal(order.ordenId!)}
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                            >
                                <FaReceipt className="mr-2" /> Facturar
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

import jsPDF from 'jspdf';
import { FaPrint } from 'react-icons/fa';

// --- MODAL DE FACTURACIÓN ---
type PaymentType = 'grupal' | 'dividido' | 'individual';
type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto';

interface BillingModalProps {
    order: IOrden;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

// Interfaz para los datos del pago, para tipado fuerte
interface IPagoData {
    ordenId: number;
    tipoPago: PaymentType;
    metodoPago: PaymentMethod;
    montoSubtotal: number;
    montoImpuestos: number;
    montoDescuento: number;
    montoTotal: number;
    cajeroId: number;
    cashReceived?: number;
}

const generarReciboPDF = (orden: IOrden, pago: IPagoData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 220] // Formato ticket un poco más largo
    });

    let y = 10; // Posición vertical inicial
    const lineHeight = 5;
    const margin = 5;
    const center = 40;
    const right = 75;

    // --- Encabezado ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('WOK ASIAN FOOD', center, y, { align: 'center' });
    y += lineHeight * 1.5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('6ta Avenida 3-45, Zona 1', center, y, { align: 'center' });
    y += lineHeight;
    doc.text('Tel: +502 1234-5678', center, y, { align: 'center' });
    y += lineHeight;
    doc.text('NIT: 12345678-9', center, y, { align: 'center' });
    y += lineHeight;
    doc.line(margin, y, 80 - margin, y);
    y += lineHeight;

    // --- Información de la Orden ---
    doc.setFontSize(9);
    doc.text(`Orden: ${orden.numeroOrden}`, margin, y);
    y += lineHeight;
    doc.text(`Fecha: ${new Date(orden.fechaOrden).toLocaleString()}`, margin, y);
    y += lineHeight;
    doc.text(`Mesa: ${orden.numeroMesa || 'N/A'}`, margin, y);
    doc.text(`Mesero: ${orden.nombreMesero || 'N/A'}`, right, y, { align: 'right' });
    y += lineHeight;
    doc.line(margin, y, 80 - margin, y);
    y += lineHeight;

    // --- Detalle de Platillos ---
    doc.setFont('helvetica', 'bold');
    doc.text('Cant.', margin, y);
    doc.text('Platillo', margin + 10, y);
    doc.text('Total', right, y, { align: 'right' });
    y += lineHeight;
    doc.setFont('helvetica', 'normal');

    orden.platillos.forEach(p => {
        doc.text(p.cantidad.toString(), margin, y);
        doc.text(p.nombrePlatillo, margin + 10, y);
        doc.text(p.subtotal.toFixed(2), right, y, { align: 'right' });
        y += lineHeight;
    });
    y += lineHeight * 0.5;
    doc.line(margin, y, 80 - margin, y);
    y += lineHeight;

    // --- Totales ---
    doc.setFontSize(10);
    doc.text('Subtotal:', margin, y);
    doc.text(`Q${pago.montoSubtotal.toFixed(2)}`, right, y, { align: 'right' });
    y += lineHeight;

    if (pago.montoDescuento > 0) {
        doc.text('Descuento:', margin, y);
        doc.text(`-Q${pago.montoDescuento.toFixed(2)}`, right, y, { align: 'right' });
        y += lineHeight;
    }

    doc.text('IVA (12%):', margin, y);
    doc.text(`Q${pago.montoImpuestos.toFixed(2)}`, right, y, { align: 'right' });
    y += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('TOTAL:', margin, y);
    doc.text(`Q${pago.montoTotal.toFixed(2)}`, right, y, { align: 'right' });
    y += lineHeight * 1.5;
    doc.line(margin, y, 80 - margin, y);
    y += lineHeight;

    // --- Información del Pago ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Método: ${pago.metodoPago.charAt(0).toUpperCase() + pago.metodoPago.slice(1)}`, margin, y);
    y += lineHeight;

    if (pago.metodoPago === 'efectivo') {
        doc.text('Recibido:', margin, y);
        doc.text(`Q${(pago.cashReceived || 0).toFixed(2)}`, right, y, { align: 'right' });
        y += lineHeight;
        doc.text('Cambio:', margin, y);
        doc.text(`Q${Math.max(0, (pago.cashReceived || 0) - pago.montoTotal).toFixed(2)}`, right, y, { align: 'right' });
        y += lineHeight;
    }
    y += lineHeight * 2;

    // --- Pie de Página ---
    doc.setFontSize(10);
    doc.text('¡Gracias por tu visita!', center, y, { align: 'center' });
    y += lineHeight;
    doc.setFontSize(8);
    doc.text(new Date().toLocaleString(), center, y, { align: 'center' });

    // --- Guardar o Imprimir ---
    doc.save(`Recibo-${orden.numeroOrden}.pdf`);
};

const BillingModal: React.FC<BillingModalProps> = ({ order, onClose, onPaymentSuccess }) => {
    const { user } = useAuth();
    const [paymentType, setPaymentType] = useState<PaymentType>('grupal');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
    const [numPeople, setNumPeople] = useState(order.numeroPersonas || 1);
    const [discount, setDiscount] = useState(order.descuento || 0);
    const [cashReceived, setCashReceived] = useState(0);
    
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
    const [finalPagoData, setFinalPagoData] = useState<IPagoData | null>(null);

    // Lógica para pago separado
    const [itemsToPay, setItemsToPay] = useState<number[]>([]);
    const [paidItems, setPaidItems] = useState<number[]>([]);

    const subtotal = useMemo(() => {
        if (paymentType === 'individual') {
            return order.platillos
                .filter(p => itemsToPay.includes(p.ordenPlatilloId))
                .reduce((sum, p) => sum + p.subtotal, 0);
        }
        return order.subtotal;
    }, [order, paymentType, itemsToPay]);

    const total = useMemo(() => {
        const tax = (subtotal - discount) * 0.12;
        return subtotal - discount + tax;
    }, [subtotal, discount]);

    const handleConfirmPayment = async () => {
        setIsProcessing(true);
        const pagoData: IPagoData = {
            ordenId: order.ordenId,
            tipoPago: paymentType,
            metodoPago: paymentMethod,
            montoSubtotal: subtotal,
            montoImpuestos: (subtotal - discount) * 0.12,
            montoDescuento: discount,
            montoTotal: total,
            cajeroId: user.userId,
            cashReceived: cashReceived
        };

        await api.createPago(pagoData);
        setFinalPagoData(pagoData); // Guardar los datos del pago para el recibo
        setPaymentStatus('success'); // Cambiar a la vista de éxito
        onPaymentSuccess(); // Refrescar la lista de órdenes en segundo plano
    };

    const toggleItemToPay = (platilloId: number) => {
        setItemsToPay(prev => 
            prev.includes(platilloId) ? prev.filter(id => id !== platilloId) : [...prev, platilloId]
        );
    };

    if (paymentStatus === 'success') {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-md text-center p-8">
                    <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h2>
                    <p className="text-gray-600 mb-6">La orden {order.numeroOrden} ha sido cerrada.</p>
                    <div className="flex flex-col space-y-4">
                        <button 
                            onClick={() => generarReciboPDF(order, finalPagoData!)}
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
                    {/* ... El resto del formulario de pago no cambia ... */}
                </main>

                <footer className="p-4 border-t flex justify-end space-x-4">
                    <button onClick={onClose} className="py-2 px-6 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleConfirmPayment} disabled={paymentStatus === 'processing'} className="py-2 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center">
                        {paymentStatus === 'processing' ? <FaSpinner className="animate-spin mr-2" /> : <FaCheckCircle className="mr-2" />} Confirmar Pago
                    </button>
                </footer>
            </div>
        </div>
    );
};


export default FacturacionPage;
