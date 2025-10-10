import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart, FaUserFriends, FaStickyNote, FaMotorcycle, FaStore, FaSearch, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

// --- SIMULACIÓN DE AUTENTICACIÓN Y HOOKS EXTERNOS ---
const useAuth = () => ({ user: { role: 'MESERO', userId: 1 } });

// Hook simple para debounce
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// --- INTERFACES TYPESCRIPT ---
interface IMesa { mesaId: number; numeroMesa: string; capacidad: number; tieneOrdenAbierta?: boolean; }
interface IPlatillo { platilloId: number; nombrePlatillo: string; categoriaId: number; nombreCategoria: string; precioPlatillo: number; tiempoPreparacion: number; disponible: boolean; imagenUrl?: string; }
interface IItemCarrito { platillo: IPlatillo; cantidad: number; notasEspeciales?: string; }
interface OrderState {
    mesa: IMesa | null;
    numeroPersonas: number;
    tipoOrden: 'mesa' | 'llevar' | 'delivery';
    clienteId?: number;
    notasGenerales?: string;
    direccionEntrega?: string;
    telefonoContacto?: string;
    carrito: IItemCarrito[];
}

// --- LÓGICA DEL REDUCER PARA EL CARRITO ---
type CartAction = 
    | { type: 'SELECT_MESA', payload: IMesa }
    | { type: 'UPDATE_INFO', payload: Partial<OrderState> }
    | { type: 'ADD_TO_CART', payload: IPlatillo }
    | { type: 'UPDATE_QUANTITY', payload: { platilloId: number; cantidad: number } }
    | { type: 'REMOVE_FROM_CART', payload: number }
    | { type: 'CLEAR_CART' };

const initialState: OrderState = {
    mesa: null, numeroPersonas: 1, tipoOrden: 'mesa', carrito: [],
};

function orderReducer(state: OrderState, action: CartAction): OrderState {
    switch (action.type) {
        case 'SELECT_MESA': return { ...state, mesa: action.payload };
        case 'UPDATE_INFO': return { ...state, ...action.payload };
        case 'ADD_TO_CART': {
            const existingItem = state.carrito.find(item => item.platillo.platilloId === action.payload.platilloId);
            if (existingItem) {
                return { ...state, carrito: state.carrito.map(item => item.platillo.platilloId === action.payload.platilloId ? { ...item, cantidad: item.cantidad + 1 } : item) };
            }
            return { ...state, carrito: [...state.carrito, { platillo: action.payload, cantidad: 1 }] };
        }
        case 'UPDATE_QUANTITY':
            return { ...state, carrito: state.carrito.map(item => item.platillo.platilloId === action.payload.platilloId ? { ...item, cantidad: action.payload.cantidad } : item).filter(item => item.cantidad > 0) };
        case 'REMOVE_FROM_CART':
            return { ...state, carrito: state.carrito.filter(item => item.platillo.platilloId !== action.payload) };
        case 'CLEAR_CART': return initialState;
        default: return state;
    }
}

// --- SIMULACIÓN DE API ---
const api = {
    getMesas: async (): Promise<IMesa[]> => Promise.resolve([{ mesaId: 1, numeroMesa: '1', capacidad: 4, tieneOrdenAbierta: true }, { mesaId: 2, numeroMesa: '2', capacidad: 2 }, { mesaId: 3, numeroMesa: '3', capacidad: 6 }]),
    getPlatillos: async (): Promise<IPlatillo[]> => Promise.resolve([
        { platilloId: 1, nombrePlatillo: 'Ramen Tonkotsu', categoriaId: 1, nombreCategoria: 'Platos Fuertes', precioPlatillo: 18.00, tiempoPreparacion: 15, disponible: true, imagenUrl: 'https://via.placeholder.com/150' },
        { platilloId: 2, nombrePlatillo: 'Gyoza de Cerdo', categoriaId: 2, nombreCategoria: 'Entradas', precioPlatillo: 8.00, tiempoPreparacion: 10, disponible: true, imagenUrl: 'https://via.placeholder.com/150' },
        { platilloId: 3, nombrePlatillo: 'Té de Jazmín', categoriaId: 3, nombreCategoria: 'Bebidas', precioPlatillo: 3.50, tiempoPreparacion: 3, disponible: true, imagenUrl: 'https://via.placeholder.com/150' },
    ]),
    getCategorias: async (): Promise<{ id: number, nombre: string }[]> => Promise.resolve([{ id: 1, nombre: 'Platos Fuertes' }, { id: 2, nombre: 'Entradas' }, { id: 3, nombre: 'Bebidas' }]),
    createOrden: async (orden: any): Promise<{ numeroOrden: string }> => {
        console.log('Enviando orden a API:', orden);
        return Promise.resolve({ numeroOrden: `ORD-${Date.now()}` });
    }
};

// --- COMPONENTE PRINCIPAL ---
const OrdenesPage: React.FC = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [state, dispatch] = useReducer(orderReducer, initialState);
    
    const [mesas, setMesas] = useState<IMesa[]>([]);
    const [platillos, setPlatillos] = useState<IPlatillo[]>([]);
    const [categorias, setCategorias] = useState<{ id: number, nombre: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastOrder, setLastOrder] = useState('');

    const hasAccess = useMemo(() => user.role === 'ADMINISTRADOR' || user.role === 'MESERO', [user.role]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            const [mesasData, platillosData, categoriasData] = await Promise.all([api.getMesas(), api.getPlatillos(), api.getCategorias()]);
            setMesas(mesasData);
            setPlatillos(platillosData);
            setCategorias(categoriasData);
            setLoading(false);
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

        const ordenDTO = {
            mesaId: state.mesa.mesaId,
            meseroId: user.userId,
            clienteId: state.clienteId,
            numeroPersonas: state.numeroPersonas,
            tipoOrden: state.tipoOrden,
            direccionEntrega: state.direccionEntrega,
            telefonoContacto: state.telefonoContacto,
            notasGenerales: state.notasGenerales,
            platillos: state.carrito.map(item => ({
                platilloId: item.platillo.platilloId,
                cantidad: item.cantidad,
                precioUnitario: item.platillo.precioPlatillo, // El backend podría recalcular esto, pero es bueno enviarlo
                notasPlatillo: item.notasEspeciales
            }))
        };

        const { numeroOrden } = await api.createOrden(ordenDTO);
        setLastOrder(numeroOrden);
        setStep(4);
    };

    const handleNewOrder = () => {
        dispatch({ type: 'CLEAR_CART' });
        setLastOrder('');
        setStep(1);
    };

    if (!hasAccess) return <div className="p-8 text-center text-red-600"><h1>Acceso Denegado</h1></div>;
    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            {step < 4 && <h1 className="text-2xl font-bold mb-4">Paso {step}: {['Selecciona una Mesa', 'Información de la Orden', 'Elige los Platillos'][step - 1]}</h1>}
            
            {step > 1 && step < 4 && <button onClick={() => setStep(s => s - 1)} className="flex items-center text-sm text-gray-600 mb-4"><FaArrowLeft className="mr-2"/> Volver</button>}

            {step === 1 && <Step1_SelectTable mesas={mesas} onSelect={handleSelectMesa} />}
            {step === 2 && <Step2_OrderInfo onSubmit={handleInfoSubmit} initialState={state} />}
            {step === 3 && <Step3_SelectMenu platillos={platillos} categorias={categorias} state={state} dispatch={dispatch} onSubmit={handleSubmitOrder} />}
            {step === 4 && <Step4_Success numeroOrden={lastOrder} onNewOrder={handleNewOrder} />}
        </div>
    );
};

// --- SUB-COMPONENTES POR PASO ---
const Step1_SelectTable: React.FC<{ mesas: IMesa[], onSelect: (mesa: IMesa) => void }> = ({ mesas, onSelect }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mesas.map(mesa => (
            <div key={mesa.mesaId} onClick={() => onSelect(mesa)} className={`p-4 rounded-lg text-center cursor-pointer transition-transform hover:scale-105 ${mesa.tieneOrdenAbierta ? 'bg-red-400' : 'bg-green-400'}`}>
                <p className="text-2xl font-bold text-white">Mesa {mesa.numeroMesa}</p>
                <p className="text-sm text-white">{mesa.tieneOrdenAbierta ? 'Ocupada' : 'Disponible'}</p>
            </div>
        ))}
    </div>
);


const Step2_OrderInfo: React.FC<{ onSubmit: (data: Partial<OrderState>) => void, initialState: OrderState }> = ({ onSubmit, initialState }) => {
    const [info, setInfo] = useState(initialState);

    const handleTypeClick = (type: 'mesa' | 'llevar' | 'delivery') => {
        setInfo(prev => ({ ...prev, tipoOrden: type }));
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <div className="space-y-6">
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">1. ¿Para cuántas personas es la orden?</label>
                    <input 
                        type="number" 
                        value={info.numeroPersonas} 
                        onChange={e => setInfo({...info, numeroPersonas: Math.max(1, +e.target.value)})} 
                        className="w-full p-3 border border-gray-300 rounded-lg text-center text-xl" 
                        min="1"
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">2. Tipo de Orden</label>
                    <div className="grid grid-cols-3 gap-4">
                        <button onClick={() => handleTypeClick('mesa')} className={`flex flex-col items-center p-4 border-2 rounded-lg ${info.tipoOrden === 'mesa' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                            <FaStore className="text-3xl mb-2" />
                            <span className="font-semibold">En Mesa</span>
                        </button>
                        <button onClick={() => handleTypeClick('llevar')} className={`flex flex-col items-center p-4 border-2 rounded-lg ${info.tipoOrden === 'llevar' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                            <FaShoppingCart className="text-3xl mb-2" />
                            <span className="font-semibold">Para Llevar</span>
                        </button>
                        <button onClick={() => handleTypeClick('delivery')} className={`flex flex-col items-center p-4 border-2 rounded-lg ${info.tipoOrden === 'delivery' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                            <FaMotorcycle className="text-3xl mb-2" />
                            <span className="font-semibold">Delivery</span>
                        </button>
                    </div>
                </div>

                {info.tipoOrden === 'delivery' && (
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-lg font-medium text-gray-800">Información de Entrega</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Dirección de Entrega</label>
                            <input type="text" placeholder="Ej: 1ra Calle 2-3, Zona 4" value={info.direccionEntrega || ''} onChange={e => setInfo({...info, direccionEntrega: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Teléfono de Contacto</label>
                            <input type="tel" placeholder="Ej: 5555-4444" value={info.telefonoContacto || ''} onChange={e => setInfo({...info, telefonoContacto: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md mt-1" />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">3. Notas Generales (Opcional)</label>
                    <textarea 
                        value={info.notasGenerales || ''} 
                        onChange={e => setInfo({...info, notasGenerales: e.target.value})} 
                        className="w-full p-3 border border-gray-300 rounded-lg" 
                        rows={3}
                        placeholder="Alergias, celebración especial, etc."
                    />
                </div>
            </div>
            <button onClick={() => onSubmit(info)} className="w-full bg-blue-600 text-white py-3 rounded-lg mt-8 text-lg font-semibold hover:bg-blue-700 transition-colors">Continuar al Menú</button>
        </div>
    );
};

const Step3_SelectMenu: React.FC<{ platillos: IPlatillo[], categorias: any[], state: OrderState, dispatch: React.Dispatch<CartAction>, onSubmit: () => void }> = ({ platillos, categorias, state, dispatch, onSubmit }) => {
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
            <div className="lg:col-span-2">
                {/* Filtros y Búsqueda */}
                <div className="mb-4"><input type="text" placeholder="Buscar platillo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded"/></div>
                {/* Grid de Platillos */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredPlatillos.map(p => (
                        <div key={p.platilloId} className="bg-white rounded-lg shadow p-3 flex flex-col">
                            <img src={p.imagenUrl} alt={p.nombrePlatillo} className="rounded-md h-24 object-cover"/>
                            <h3 className="font-bold mt-2">{p.nombrePlatillo}</h3>
                            <p className="text-green-600 font-semibold">Q{p.precioPlatillo.toFixed(2)}</p>
                            <button onClick={() => dispatch({ type: 'ADD_TO_CART', payload: p })} className="mt-auto w-full bg-blue-500 text-white text-sm py-1 rounded hover:bg-blue-600">Agregar</button>
                        </div>
                    ))}
                </div>
            </div>
            {/* Carrito Lateral */}
            <div className="bg-white p-4 rounded-lg shadow self-start">
                <h2 className="text-xl font-bold border-b pb-2 mb-4 flex items-center"><FaShoppingCart className="mr-2"/> Carrito</h2>
                {state.carrito.length === 0 ? <p>El carrito está vacío.</p> : (
                    <div className="space-y-3">
                        {state.carrito.map(item => (
                            <div key={item.platillo.platilloId} className="flex items-center">
                                <div>
                                    <p className="font-semibold">{item.platillo.nombrePlatillo}</p>
                                    <div className="flex items-center text-sm">
                                        <button onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { platilloId: item.platillo.platilloId, cantidad: item.cantidad - 1 }})} className="p-1"><FaMinus/></button>
                                        <span className="mx-2">{item.cantidad}</span>
                                        <button onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { platilloId: item.platillo.platilloId, cantidad: item.cantidad + 1 }})} className="p-1"><FaPlus/></button>
                                    </div>
                                </div>
                                <p className="ml-auto font-medium">Q{(item.platillo.precioPlatillo * item.cantidad).toFixed(2)}</p>
                                <button onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.platillo.platilloId })} className="ml-2 text-red-500"><FaTrash/></button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="border-t mt-4 pt-4 space-y-2">
                    <div className="flex justify-between"><span>Subtotal:</span><span>Q{totals.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Impuestos (12%):</span><span>Q{totals.impuestos.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>Q{totals.total.toFixed(2)}</span></div>
                </div>
                <button onClick={onSubmit} disabled={state.carrito.length === 0} className="w-full bg-green-600 text-white py-2 rounded-lg mt-4 disabled:bg-gray-400">Enviar a Cocina</button>
            </div>
        </div>
    );
};

const Step4_Success: React.FC<{ numeroOrden: string, onNewOrder: () => void }> = ({ numeroOrden, onNewOrder }) => (
    <div className="text-center max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold">¡Orden Enviada!</h1>
        <p className="text-lg mt-2">La orden <span className="font-bold">{numeroOrden}</span> ha sido enviada a cocina exitosamente.</p>
        <button onClick={onNewOrder} className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-lg">Tomar Nueva Orden</button>
    </div>
);

export default OrdenesPage;