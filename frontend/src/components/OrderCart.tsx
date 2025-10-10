import React from 'react';
import { IPlatillo } from '../models/IPlatillo';
import { IOrdenPlatillo } from '../models/IOrdenPlatillo';

interface OrderCartProps {
    orderItems: IOrdenPlatillo[];
    onUpdateQuantity: (platilloId: number, newQuantity: number) => void;
    onRemoveItem: (platilloId: number) => void;
    onCheckout: () => void;
    totalOrder: number;
    isOrderSendable: boolean;
}

const OrderCart: React.FC<OrderCartProps> = ({
    orderItems,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    totalOrder,
    isOrderSendable,
}) => {
    return (
        <div className="w-1/4 bg-white p-4 shadow-md flex flex-col">
            <h2 className="text-xl font-bold mb-4">Orden Actual</h2>

            <div className="flex-grow overflow-y-auto">
                {orderItems.length === 0 ? (
                    <p>No hay platillos en la orden.</p>
                ) : (
                    <div className="space-y-3">
                        {orderItems.map(item => (
                            <div key={item.platilloId} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <p className="font-semibold">{item.nombrePlatillo}</p>
                                    <p className="text-sm text-gray-600">Q. {item.precioUnitario.toFixed(2)} x {item.cantidad}</p>
                                </div>
                                <div className="flex items-center">
                                    <button
                                        onClick={() => onUpdateQuantity(item.platilloId, item.cantidad - 1)}
                                        className="bg-red-400 text-white px-2 py-0.5 rounded-l"
                                        disabled={item.cantidad <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="px-2">{item.cantidad}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.platilloId, item.cantidad + 1)}
                                        className="bg-green-400 text-white px-2 py-0.5 rounded-r"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => onRemoveItem(item.platilloId)}
                                        className="ml-2 bg-gray-400 hover:bg-gray-600 text-white text-sm py-0.5 px-2 rounded"
                                    >
                                        X
                                    </button>
                                </div>
                                <p className="font-bold">Q. {item.subtotal.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t pt-4 mt-4">
                <p className="text-xl font-bold mb-4">Total: Q. {totalOrder.toFixed(2)}</p>
                <button
                    onClick={onCheckout}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                    disabled={!isOrderSendable || orderItems.length === 0}
                >
                    Enviar Pedido a Cocina
                </button>
            </div>
        </div>
    );
};

export default OrderCart;
