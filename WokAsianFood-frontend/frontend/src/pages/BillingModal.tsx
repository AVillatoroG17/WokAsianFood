import React, { useState } from 'react';
import { FaTimes, FaCheckCircle, FaPrint } from 'react-icons/fa';
import api from '../services/api';
import jsPDF from 'jspdf';

interface BillingModalProps {
    orden: any;
    cajeroId: number;
    onClose: () => void;
    onPagoExitoso: () => void;
}

const BillingModal: React.FC<BillingModalProps> = ({ orden, cajeroId, onClose, onPagoExitoso }) => {
    const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'mixto'>('efectivo');
    const [montoEfectivo, setMontoEfectivo] = useState(orden.totalOrden);
    const [montoTarjeta, setMontoTarjeta] = useState(0);
    const [processing, setProcessing] = useState(false);

    const cambio = metodoPago === 'efectivo' 
        ? Math.max(0, montoEfectivo - orden.totalOrden)
        : 0;

    const handleConfirmarPago = async () => {
        setProcessing(true);
        try {
            const pagoData = {
                ordenId: orden.ordenId,
                cajeroId: cajeroId,
                metodoPago: metodoPago,
                tipoPago: 'grupal',
                montoEfectivo: metodoPago === 'efectivo' || metodoPago === 'mixto' ? montoEfectivo : 0,
                montoTarjeta: metodoPago === 'tarjeta' || metodoPago === 'mixto' ? montoTarjeta : 0,
                referenciaTransaccion: `PAG-${Date.now()}`,
                notasPago: `Pago procesado por caja`
            };

            await api.post('/api/pagos', pagoData);
            
            // Generar recibo
            generarRecibo(orden, pagoData, cambio);
            
            alert('✅ Pago procesado exitosamente');
            onPagoExitoso();
            
        } catch (error) {
            console.error('Error al procesar pago:', error);
            alert('❌ Error al procesar el pago');
        } finally {
            setProcessing(false);
        }
    };

    const generarRecibo = (orden: any, pago: any, cambio: number) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 200]
        });

        let y = 10;
        const lineHeight = 5;

        // Encabezado
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('WOK ASIAN FOOD', 40, y, { align: 'center' });
        y += lineHeight * 2;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Orden: ${orden.numeroOrden}`, 5, y);
        y += lineHeight;
        doc.text(`Fecha: ${new Date().toLocaleString()}`, 5, y);
        y += lineHeight;
        doc.text(`Mesa: ${orden.numeroMesa || 'N/A'}`, 5, y);
        y += lineHeight * 2;

        // Total
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: Q${orden.totalOrden.toFixed(2)}`, 40, y, { align: 'center' });
        y += lineHeight * 2;

        // Método de pago
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Método: ${pago.metodoPago.toUpperCase()}`, 5, y);
        y += lineHeight;

        if (pago.metodoPago === 'efectivo') {
            doc.text(`Recibido: Q${pago.montoEfectivo.toFixed(2)}`, 5, y);
            y += lineHeight;
            doc.text(`Cambio: Q${cambio.toFixed(2)}`, 5, y);
        }

        y += lineHeight * 2;
        doc.text('¡Gracias por su visita!', 40, y, { align: 'center' });

        doc.save(`Recibo-${orden.numeroOrden}.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Procesar Pago</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-sm text-gray-600">Orden: <strong>{orden.numeroOrden}</strong></p>
                        <p className="text-sm text-gray-600">Mesa: <strong>{orden.numeroMesa || 'N/A'}</strong></p>
                        <p className="text-3xl font-bold text-green-600 mt-4">
                            Total: Q{orden.totalOrden.toFixed(2)}
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Método de Pago</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['efectivo', 'tarjeta', 'mixto'] as const).map(metodo => (
                                <button
                                    key={metodo}
                                    onClick={() => setMetodoPago(metodo)}
                                    className={`py-3 rounded-lg font-semibold transition-colors ${
                                        metodoPago === metodo
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {metodoPago === 'efectivo' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Monto Recibido</label>
                            <input
                                type="number"
                                step="0.01"
                                value={montoEfectivo}
                                onChange={e => setMontoEfectivo(parseFloat(e.target.value) || 0)}
                                className="w-full p-3 border rounded-lg text-lg"
                            />
                            <p className="text-sm text-gray-600 mt-2">
                                Cambio: <strong className="text-green-600">Q{cambio.toFixed(2)}</strong>
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleConfirmarPago}
                        disabled={processing}
                        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                    >
                        {processing ? (
                            <>Procesando...</>
                        ) : (
                            <>
                                <FaCheckCircle className="mr-2" />
                                Confirmar Pago
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillingModal;