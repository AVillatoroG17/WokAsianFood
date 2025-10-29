import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, Truck, Store, CheckCircle, ArrowLeft, Search, Loader2, Users, Package } from 'lucide-react';
import { getMesas } from '../../services/mesaService';
import { getPlatillos } from '../../services/platilloService';
import { useAuth } from '../../context/AuthContext';
import { IPlatillo } from '../../models/IPlatillo';
import { IMesa } from '../../models/IMesa';
import { createOrden, IOrdenInputDTO } from '../../services/ordenService';

// Hook simple para debounce
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// INTERFACES
interface CartItem {
    platillo: IPlatillo;
    cantidad: number;
    notasEspeciales?: string;
}

interface OrderState {
    mesa: IMesa | null;
    numeroPersonas: number;
    tipoOrden: 'mesa' | 'takeout' | 'delivery';
    carrito: CartItem[];
    clienteId?: number | null;
    direccionEntrega?: string;
    telefonoContacto?: string;
    notasGenerales?: string;
}

type CartAction =
    | { type: 'SELECT_MESA', payload: IMesa }
    | { type: 'UPDATE_INFO', payload: Partial<OrderState> }
    | { type: 'ADD_TO_CART', payload: IPlatillo }
    | { type: 'UPDATE_QUANTITY', payload: { platilloId: number; cantidad: number } }
    | { type: 'REMOVE_FROM_CART', payload: number }
    | { type: 'CLEAR_CART' };

const initialState: OrderState = {
    mesa: null,
    numeroPersonas: 1,
    tipoOrden: 'mesa',
    carrito: [],
};

function orderReducer(state: OrderState, action: CartAction): OrderState {
    switch (action.type) {
        case 'SELECT_MESA':
            return { ...state, mesa: action.payload };
        case 'UPDATE_INFO':
            return { ...state, ...action.payload };
        case 'ADD_TO_CART': {
            const existingItem = state.carrito.find(item => item.platillo.platilloId === action.payload.platilloId);
            if (existingItem) {
                return {
                    ...state,
                    carrito: state.carrito.map(item =>
                        item.platillo.platilloId === action.payload.platilloId
                            ? { ...item, cantidad: item.cantidad + 1 }
                            : item
                    )
                };
            }
            return {
                ...state,
                carrito: [...state.carrito, { platillo: action.payload, cantidad: 1 }]
            };
        }
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                carrito: state.carrito.map(item =>
                    item.platillo.platilloId === action.payload.platilloId
                        ? { ...item, cantidad: action.payload.cantidad }
                        : item
                ).filter(item => item.cantidad > 0)
            };
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                carrito: state.carrito.filter(item => item.platillo.platilloId !== action.payload)
            };
        case 'CLEAR_CART':
            return initialState;
        default:
            return state;
    }
}

// COMPONENTE PRINCIPAL
const OrdenesPage: React.FC = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [state, dispatch] = useReducer(orderReducer, initialState);

    const [mesas, setMesas] = useState<IMesa[]>([]);
    const [platillos, setPlatillos] = useState<IPlatillo[]>([]);
    const [categorias, setCategorias] = useState<{ id: number, nombre: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastOrder, setLastOrder] = useState('');

    const hasAccess = useMemo(() => user?.rol === 'ADMIN' || user?.rol === 'MESERO', [user?.rol]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [mesasData, platillosData] = await Promise.all([getMesas(), getPlatillos()]);
                setMesas(mesasData);
                setPlatillos(platillosData);

                const categoriasUnicas = platillosData.reduce((acc: { id: number, nombre: string }[], platillo) => {
                    if (!acc.some(c => c.id === platillo.categoriaId)) {
                        acc.push({ id: platillo.categoriaId, nombre: platillo.nombreCategoria });
                    }
                    return acc;
                }, []);
                setCategorias(categoriasUnicas);
            } catch (error) {
                console.error("Error al cargar datos iniciales", error);
            } finally {
                setLoading(false);
            }
        };
        if (hasAccess) loadInitialData();
    }, [hasAccess]);

    const handleSelectMesa = (mesa: IMesa) => {
        dispatch({ type: 'SELECT_MESA', payload: mesa });
        setStep(2);
    };

    const handleInfoSubmit = (data: Partial<OrderState>) => {
        dispatch({ type: 'UPDATE_INFO', payload: data });
        setStep(3);
    };

    const handleSubmitOrder = async () => {
        if (!state.mesa || state.carrito.length === 0) {
            alert("Se necesita una mesa y al menos un platillo en la orden.");
            return;
        }

        if (!user?.usuarioId) {
            alert("Error: No se pudo identificar al mesero. Por favor, inicia sesión nuevamente.");
            return;
        }

        const tipoOrdenMap: Record<'mesa' | 'takeout' | 'delivery', 'MESA' | 'PARA_LLEVAR' | 'DOMICILIO'> = {
            mesa: 'MESA',
            takeout: 'PARA_LLEVAR',
            delivery: 'DOMICILIO'
        };

        const ordenDTO: IOrdenInputDTO = {
            mesaId: state.mesa.mesaId,
            meseroId: user.usuarioId,
            clienteId: state.clienteId ?? undefined,
            numeroPersonas: state.numeroPersonas,
            tipoOrden: tipoOrdenMap[state.tipoOrden],
            direccionEntrega: state.direccionEntrega,
            telefonoContacto: state.telefonoContacto,
            notasGenerales: state.notasGenerales,
            platillos: state.carrito.map(item => ({
                platilloId: item.platillo.platilloId,
                cantidad: item.cantidad,
                notasPlatillo: item.notasEspeciales
            }))
        };

        try {
            const nuevaOrden = await createOrden(ordenDTO);
            setLastOrder(nuevaOrden.numeroOrden || 'N/A');
            setStep(4);
        } catch (error: any) {
            console.error("❌ Error completo:", error);
            if (error.response?.status === 403) {
                alert("No tienes permisos para crear órdenes. Verifica tu rol de usuario.");
            } else if (error.response?.status === 401) {
                alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
            } else {
                alert("Error al crear la orden: " + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleNewOrder = () => {
        dispatch({ type: 'CLEAR_CART' });
        setLastOrder('');
        setStep(1);
    };

    if (!hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 p-8">
                <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
                    <h1 className="text-3xl font-black text-gray-800 mb-3">Acceso Denegado</h1>
                    <p className="text-gray-600 text-lg">Solo meseros y administradores pueden acceder.</p>
                </div>
            </div>
        );
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
                <p className="text-white text-2xl font-black animate-pulse">Cargando menú...</p>
            </div>
        );
    }

    const stepTitles = ['Selecciona una Mesa', 'Información de la Orden', 'Elige los Platillos', '¡Orden Completada!'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {step < 4 && (
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-6 mb-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-black mb-2">
                                    Paso {step} de 3
                                </h1>
                                <p className="text-xl font-semibold opacity-90">{stepTitles[step - 1]}</p>
                            </div>
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(s => s - 1)}
                                    className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/30 transition-all font-bold"
                                >
                                    <ArrowLeft className="w-5 h-5" strokeWidth={2.5}/> Volver
                                </button>
                            )}
                        </div>
                        
                        {/* Barra de progreso */}
                        <div className="mt-6 bg-white/20 rounded-full h-3">
                            <div 
                                className="bg-white h-3 rounded-full transition-all duration-500"
                                style={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {step === 1 && <Step1_SelectTable mesas={mesas} onSelect={handleSelectMesa} />}
                {step === 2 && <Step2_OrderInfo onSubmit={handleInfoSubmit} initialState={state} />}
                {step === 3 && <Step3_SelectMenu platillos={platillos} categorias={categorias} state={state} dispatch={dispatch} onSubmit={handleSubmitOrder} />}
                {step === 4 && <Step4_Success numeroOrden={lastOrder} onNewOrder={handleNewOrder} />}
            </div>
        </div>
    );
};

// STEP 1: Selección de Mesa
const Step1_SelectTable: React.FC<{ mesas: IMesa[], onSelect: (mesa: IMesa) => void }> = ({ mesas, onSelect }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mesas.map(mesa => (
            <button
                key={mesa.mesaId}
                onClick={() => onSelect(mesa)}
                disabled={mesa.tieneOrdenAbierta}
                className={`p-6 rounded-2xl text-center cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-xl border-2 ${
                    mesa.tieneOrdenAbierta 
                        ? 'bg-gradient-to-br from-red-500 to-pink-600 border-red-400 opacity-60 cursor-not-allowed' 
                        : 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 hover:shadow-2xl active:scale-95'
                }`}
            >
                <Package className="w-10 h-10 text-white mx-auto mb-3" strokeWidth={2.5}/>
                <p className="text-3xl font-black text-white mb-1">Mesa {mesa.numeroMesa}</p>
                <p className="text-sm text-white/90 font-bold">
                    {mesa.tieneOrdenAbierta ? '🔴 Ocupada' : '✅ Disponible'}
                </p>
                <p className="text-xs text-white/80 mt-2">
                    👥 {mesa.capacidad} personas
                </p>
            </button>
        ))}
    </div>
);

// STEP 2: Información de la Orden
const Step2_OrderInfo: React.FC<{
    onSubmit: (data: Partial<OrderState>) => void,
    initialState: OrderState
}> = ({ onSubmit, initialState }) => {
    const [info, setInfo] = useState(initialState);

    const handleTypeClick = (type: 'mesa' | 'takeout' | 'delivery') => {
        setInfo(prev => ({ ...prev, tipoOrden: type }));
    };

    const tipoOrdenOptions = [
        { value: 'mesa', icon: Store, label: 'En Mesa', gradient: 'from-blue-500 to-cyan-600' },
        { value: 'takeout', icon: ShoppingCart, label: 'Para Llevar', gradient: 'from-purple-500 to-indigo-600' },
        { value: 'delivery', icon: Truck, label: 'Delivery', gradient: 'from-pink-500 to-rose-600' },
    ];

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">
            <div className="space-y-8">
                {/* Número de Personas */}
                <div>
                    <label className="block text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" strokeWidth={2.5}/>
                        1. ¿Para cuántas personas?
                    </label>
                    <input
                        type="number"
                        value={info.numeroPersonas}
                        onChange={e => setInfo({ ...info, numeroPersonas: Math.max(1, +e.target.value) })}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-center text-3xl font-black focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                        min="1"
                    />
                </div>

                {/* Tipo de Orden */}
                <div>
                    <label className="block text-xl font-black text-gray-800 mb-4">2. Tipo de Orden</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tipoOrdenOptions.map(option => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleTypeClick(option.value as any)}
                                    className={`flex flex-col items-center p-6 border-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                                        info.tipoOrden === option.value 
                                            ? `bg-gradient-to-br ${option.gradient} border-white text-white shadow-xl` 
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className={`w-12 h-12 mb-3 ${info.tipoOrden === option.value ? 'text-white' : 'text-gray-600'}`} strokeWidth={2.5}/>
                                    <span className={`font-black text-lg ${info.tipoOrden === option.value ? 'text-white' : 'text-gray-800'}`}>
                                        {option.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Información de Delivery */}
                {info.tipoOrden === 'delivery' && (
                    <div className="space-y-4 p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-200">
                        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-pink-600" strokeWidth={2.5}/>
                            Información de Entrega
                        </h3>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Dirección de Entrega</label>
                            <input
                                type="text"
                                placeholder="Ej: 1ra Calle 2-3, Zona 4"
                                value={info.direccionEntrega || ''}
                                onChange={e => setInfo({ ...info, direccionEntrega: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono de Contacto</label>
                            <input
                                type="tel"
                                placeholder="Ej: 5555-4444"
                                value={info.telefonoContacto || ''}
                                onChange={e => setInfo({ ...info, telefonoContacto: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 transition-all"
                            />
                        </div>
                    </div>
                )}

                {/* Notas Generales */}
                <div>
                    <label className="block text-xl font-black text-gray-800 mb-4">3. Notas Generales (Opcional)</label>
                    <textarea
                        value={info.notasGenerales || ''}
                        onChange={e => setInfo({ ...info, notasGenerales: e.target.value })}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                        rows={4}
                        placeholder="Alergias, celebración especial, preferencias..."
                    />
                </div>
            </div>
            
            <button
                onClick={() => onSubmit(info)}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-5 rounded-xl mt-8 text-xl font-black hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-xl transform hover:scale-105 active:scale-95"
            >
                Continuar al Menú →
            </button>
        </div>
    );
};

// STEP 3: Selección de Menú
const Step3_SelectMenu: React.FC<{
    platillos: IPlatillo[],
    categorias: any[],
    state: OrderState,
    dispatch: React.Dispatch<CartAction>,
    onSubmit: () => void
}> = ({ platillos, categorias, state, dispatch, onSubmit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);

    const filteredPlatillos = useMemo(() => platillos.filter(p =>
        (activeCategory === null || p.categoriaId === activeCategory) &&
        p.nombrePlatillo.toLowerCase().includes(debouncedSearch.toLowerCase())
    ), [platillos, activeCategory, debouncedSearch]);

    const totals = useMemo(() => {
        const subtotal = state.carrito.reduce((sum, item) => sum + (item.platillo.precioPlatillo * item.cantidad), 0);
        const impuestos = subtotal * 0.12;
        const total = subtotal + impuestos;
        return { subtotal, impuestos, total };
    }, [state.carrito]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menú de Platillos */}
            <div className="lg:col-span-2 space-y-6">
                {/* Buscador */}
                <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6"/>
                        <input
                            type="text"
                            placeholder="Buscar platillo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium"
                        />
                    </div>
                </div>

                {/* Filtros de Categorías */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`px-6 py-3 rounded-xl whitespace-nowrap font-bold transition-all transform hover:scale-105 ${
                            activeCategory === null 
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                                : 'bg-white text-gray-700 border-2 border-gray-200'
                        }`}
                    >
                        Todos
                    </button>
                    {categorias.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-6 py-3 rounded-xl whitespace-nowrap font-bold transition-all transform hover:scale-105 ${
                                activeCategory === cat.id 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                                    : 'bg-white text-gray-700 border-2 border-gray-200'
                            }`}
                        >
                            {cat.nombre}
                        </button>
                    ))}
                </div>

                {/* Grid de Platillos */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredPlatillos.map(p => (
                        <div key={p.platilloId} className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl border border-gray-200">
                            <img 
                                src={p.imagenUrl || 'https://via.placeholder.com/200'} 
                                alt={p.nombrePlatillo} 
                                className="w-full h-32 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="font-black text-sm mb-2 text-gray-900 line-clamp-2">{p.nombrePlatillo}</h3>
                                <p className="text-green-600 font-black text-lg mb-3">Q{p.precioPlatillo.toFixed(2)}</p>
                                <button
                                    onClick={() => dispatch({ type: 'ADD_TO_CART', payload: p })}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" strokeWidth={3}/> Agregar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Carrito */}
            <div className="bg-white p-6 rounded-3xl shadow-2xl self-start sticky top-4 border border-gray-200">
                <h2 className="text-2xl font-black border-b-2 pb-4 mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-blue-600" strokeWidth={2.5}/> 
                    Carrito
                    <span className="ml-auto bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                        {state.carrito.length}
                    </span>
                </h2>
                
                {state.carrito.length === 0 ? (
                    <div className="text-center py-8">
                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                        <p className="text-gray-500 font-semibold">El carrito está vacío</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                        {state.carrito.map(item => (
                            <div key={item.platillo.platilloId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-gray-900">{item.platillo.nombrePlatillo}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => dispatch({
                                                type: 'UPDATE_QUANTITY',
                                                payload: { platilloId: item.platillo.platilloId, cantidad: item.cantidad - 1 }
                                            })}
                                            className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-all"
                                        >
                                            <Minus className="w-4 h-4" strokeWidth={3}/>
                                        </button>
                                        <span className="font-black text-lg px-3">{item.cantidad}</span>
                                        <button
                                            onClick={() => dispatch({
                                                type: 'UPDATE_QUANTITY',
                                                payload: { platilloId: item.platillo.platilloId, cantidad: item.cantidad + 1 }
                                            })}
                                            className="bg-green-500 text-white p-1.5 rounded-lg hover:bg-green-600 transition-all"
                                        >
                                            <Plus className="w-4 h-4" strokeWidth={3}/>
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-green-600">Q{(item.platillo.precioPlatillo * item.cantidad).toFixed(2)}</p>
                                    <button
                                        onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.platillo.platilloId })}
                                        className="text-red-500 hover:text-red-700 mt-2"
                                    >
                                        <Trash2 className="w-5 h-5" strokeWidth={2.5}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Totales */}
                <div className="border-t-2 pt-4 space-y-3">
                    <div className="flex justify-between text-gray-700">
                        <span className="font-semibold">Subtotal:</span>
                        <span className="font-bold">Q{totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                        <span className="font-semibold">Impuestos (12%):</span>
                        <span className="font-bold">Q{totals.impuestos.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-black text-gray-900 pt-3 border-t-2">
                        <span>Total:</span>
                        <span className="text-green-600">Q{totals.total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={onSubmit}
                    disabled={state.carrito.length === 0}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl mt-4 font-black text-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 transition-all shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-6 h-6" strokeWidth={2.5}/>
                    Enviar a Cocina
                </button>
            </div>
        </div>
    );
};

// STEP 4: Confirmación de Orden
const Step4_Success: React.FC<{ numeroOrden: string, onNewOrder: () => void }> = ({ numeroOrden, onNewOrder }) => (
    <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-200 animate-in zoom-in-95 duration-500">
            {/* Ícono de Éxito */}
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <CheckCircle className="w-20 h-20 text-white" strokeWidth={2.5}/>
            </div>

            {/* Mensaje Principal */}
            <h1 className="text-5xl font-black text-gray-900 mb-4">
                ¡Orden Enviada!
            </h1>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl mb-6 border-2 border-blue-200">
                <p className="text-gray-600 text-lg mb-2">Número de Orden:</p>
                <p className="text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {numeroOrden}
                </p>
            </div>

            <p className="text-xl text-gray-600 mb-8 font-semibold">
                La orden ha sido enviada a cocina exitosamente y está siendo preparada.
            </p>

            {/* Información Adicional */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" strokeWidth={2.5}/>
                    <p className="text-sm font-bold text-gray-700">En Cocina</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" strokeWidth={2.5}/>
                    <p className="text-sm font-bold text-gray-700">Mesero Asignado</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" strokeWidth={2.5}/>
                    <p className="text-sm font-bold text-gray-700">Confirmada</p>
                </div>
            </div>

            {/* Botón de Nueva Orden */}
            <button
                onClick={onNewOrder}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-5 px-8 rounded-xl text-xl font-black hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
                <Plus className="w-6 h-6" strokeWidth={3}/>
                Tomar Nueva Orden
            </button>
        </div>
    </div>
);

export default OrdenesPage;