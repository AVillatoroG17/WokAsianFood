import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, AlertTriangle, X, Loader2, Search, Package, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSuministros, createSuministro, updateSuministro, deleteSuministro } from '../../services/suministroService';
import { ISuministro } from '../../models/ISuministro';

// --- COMPONENTE: Mensaje de Alerta ---
const AlertMessage: React.FC<{ 
    alert: { type: 'success' | 'error', message: string } | null, 
    onClose: () => void 
}> = ({ alert, onClose }) => {
    if (!alert) return null;
    
    const isError = alert.type === 'error';
    const bgGradient = isError 
        ? 'bg-gradient-to-r from-red-500 to-pink-600' 
        : 'bg-gradient-to-r from-green-500 to-emerald-600';
    const Icon = isError ? XCircle : CheckCircle;

    return (
        <div className={`fixed top-6 right-6 p-5 rounded-2xl text-white shadow-2xl flex items-center z-[100] ${bgGradient} backdrop-blur-sm border border-white/20 animate-in fade-in-0 slide-in-from-top-5 duration-500`}>
            <div className="bg-white/20 p-2 rounded-full mr-4">
                <Icon className="w-6 h-6" strokeWidth={2.5}/>
            </div>
            <span className="font-semibold text-lg">{alert.message}</span>
            <button 
                onClick={onClose} 
                className="ml-6 p-2 rounded-full hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
            >
                <X className="w-5 h-5" strokeWidth={2.5}/>
            </button>
        </div>
    );
};

// --- COMPONENTE: Modal de Confirmación ---
const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
}> = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[100] animate-in fade-in-0 duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center transform transition-all animate-in zoom-in-95 border-2 border-red-200">
                <div className="bg-gradient-to-br from-red-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-600" strokeWidth={2.5}/>
                </div>
                <h3 className="text-2xl font-black mb-3 text-gray-900">¿Eliminar Suministro?</h3>
                <p className="text-gray-600 mb-2 text-lg">
                    Estás a punto de eliminar:
                </p>
                <p className="text-xl font-black text-red-600 mb-6">
                    "{itemName}"
                </p>
                <p className="text-sm text-gray-500 mb-8">
                    Esta acción no se puede deshacer y el suministro será removido permanentemente.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                        onClick={onClose} 
                        className="w-full sm:w-auto px-8 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-black hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg transform hover:scale-105 active:scale-95"
                    >
                        Sí, Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE: Modal de Formulario ---
const SuministroFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<ISuministro, 'suministroId' | 'fechaActualizacion'>) => void;
    suministro: ISuministro | null;
}> = ({ isOpen, onClose, onSave, suministro }) => {
    const [formData, setFormData] = useState({
        nombre: suministro?.nombre || '',
        categoria: suministro?.categoria || 'Vegetales',
        cantidad: suministro?.cantidad || 0,
        unidadMedida: suministro?.unidadMedida || 'kg',
        precioUnitario: suministro?.precioUnitario || 0,
        stockMinimo: suministro?.stockMinimo || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'cantidad' || name === 'precioUnitario' || name === 'stockMinimo' 
                ? parseFloat(value) 
                : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre) {
            alert('El nombre es requerido.');
            return;
        }
        onSave(formData as Omit<ISuministro, 'suministroId' | 'fechaActualizacion'>);
    };

    if (!isOpen) return null;

    const categoriaConfig = {
        'Vegetales': { icon: '🥬', gradient: 'from-green-500 to-emerald-600' },
        'Carnes': { icon: '🥩', gradient: 'from-red-500 to-rose-600' },
        'Salsas': { icon: '🍯', gradient: 'from-orange-500 to-amber-600' },
        'Granos': { icon: '🌾', gradient: 'from-yellow-500 to-amber-600' },
        'Bebidas': { icon: '🥤', gradient: 'from-blue-500 to-cyan-600' },
        'Otros': { icon: '📦', gradient: 'from-purple-500 to-indigo-600' },
    };

    const selectedCategoria = categoriaConfig[formData.categoria as keyof typeof categoriaConfig] || categoriaConfig['Otros'];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in-0 duration-300">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-gray-200 transform transition-all duration-300 animate-in zoom-in-95">
                {/* Header del Modal */}
                <div className="sticky top-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                                <Package className="w-7 h-7 text-white" strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white">
                                    {suministro ? 'Editar Suministro' : 'Nuevo Suministro'}
                                </h2>
                                <p className="text-white/90 text-sm mt-1">
                                    {suministro ? 'Actualiza la información del inventario' : 'Agrega un nuevo suministro al inventario'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200 transform hover:scale-110 active:scale-95"
                        >
                            <X className="w-6 h-6 text-white" strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Contenido del Formulario */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Nombre */}
                    <div className="group">
                        <label className="block font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                            <Package className="w-4 h-4 text-green-600" strokeWidth={2.5}/> Nombre del Suministro
                        </label>
                        <input 
                            type="text" 
                            name="nombre" 
                            value={formData.nombre} 
                            onChange={handleChange}
                            placeholder="Ej: Tomates frescos"
                            className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200 font-medium"
                            required
                        />
                    </div>

                    {/* Categoría */}
                    <div className="group">
                        <label className="block font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-600" strokeWidth={2.5}/> Categoría
                        </label>
                        <select 
                            name="categoria" 
                            value={formData.categoria} 
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 appearance-none cursor-pointer font-bold text-base"
                        >
                            <option value="Vegetales">🥬 Vegetales</option>
                            <option value="Carnes">🥩 Carnes</option>
                            <option value="Salsas">🍯 Salsas</option>
                            <option value="Granos">🌾 Granos</option>
                            <option value="Bebidas">🥤 Bebidas</option>
                            <option value="Otros">📦 Otros</option>
                        </select>

                        {/* Card de categoría */}
                        <div className={`mt-4 p-5 bg-gradient-to-r ${selectedCategoria.gradient} rounded-2xl text-white shadow-lg`}>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg text-2xl">
                                    {selectedCategoria.icon}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Categoría: {formData.categoria}</h3>
                                    <p className="text-sm font-semibold opacity-95">Clasificación del inventario</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid: Cantidad y Unidad */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block font-bold text-gray-700 mb-2 text-sm">Cantidad</label>
                            <input 
                                type="number" 
                                name="cantidad" 
                                value={formData.cantidad} 
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 font-bold text-lg"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="group">
                            <label className="block font-bold text-gray-700 mb-2 text-sm">Unidad de Medida</label>
                            <select 
                                name="unidadMedida" 
                                value={formData.unidadMedida} 
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer font-bold text-lg"
                            >
                                <option value="kg">Kilogramos (kg)</option>
                                <option value="g">Gramos (g)</option>
                                <option value="L">Litros (L)</option>
                                <option value="ml">Mililitros (ml)</option>
                                <option value="unidades">Unidades</option>
                            </select>
                        </div>
                    </div>

                    {/* Grid: Precio y Stock Mínimo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block font-bold text-gray-700 mb-2 text-sm">Precio Unitario (Q)</label>
                            <input 
                                type="number" 
                                name="precioUnitario" 
                                value={formData.precioUnitario} 
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200 font-bold text-lg"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="group">
                            <label className="block font-bold text-gray-700 mb-2 text-sm">Stock Mínimo</label>
                            <input 
                                type="number" 
                                name="stockMinimo" 
                                value={formData.stockMinimo} 
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-200 font-bold text-lg"
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6 border-t-2 border-gray-200">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-bold text-lg shadow-md transform hover:scale-105 active:scale-95"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all duration-200 font-black text-lg shadow-xl transform hover:scale-105 active:scale-95"
                        >
                            {suministro ? '✓ Actualizar' : '+ Crear Suministro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---
const SuministrosPage: React.FC = () => {
    const { user } = useAuth();
    
    const [suministros, setSuministros] = useState<ISuministro[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSuministro, setEditingSuministro] = useState<ISuministro | null>(null);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deletingSuministro, setDeletingSuministro] = useState<ISuministro | null>(null);

    const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const hasWriteAccess = useMemo(() => user.rol === 'ADMIN' || user.rol === 'ENCARGADO', [user.rol]);

    useEffect(() => {
        if (user.rol === 'MESERO') {
            return;
        }
        fetchSuministros();
    }, [user.rol]);

    const fetchSuministros = async () => {
        try {
            setLoading(true);
            const data = await getSuministros();
            setSuministros(data);
        } catch (err) {
            setError('Error al cargar los suministros. Por favor, intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (suministro: ISuministro | null = null) => {
        setEditingSuministro(suministro);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSuministro(null);
    };

    const handleSave = async (data: Omit<ISuministro, 'suministroId' | 'fechaActualizacion'>) => {
        try {
            if (editingSuministro) {
                const updated = await updateSuministro(editingSuministro.suministroId, data);
                setSuministros(suministros.map(s => s.suministroId === updated.suministroId ? updated : s));
                setAlert({ type: 'success', message: 'Suministro actualizado correctamente.' });
            } else {
                const created = await createSuministro(data);
                setSuministros([...suministros, created]);
                setAlert({ type: 'success', message: 'Suministro creado correctamente.' });
            }
            handleCloseModal();
        } catch (error: any) {
            setAlert({ type: 'error', message: `Error al guardar: ${error.message || error}` });
        }
        setTimeout(() => setAlert(null), 3000);
    };

    const handleDelete = (suministro: ISuministro) => {
        setDeletingSuministro(suministro);
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingSuministro) return;
        try {
            await deleteSuministro(deletingSuministro.suministroId);
            setSuministros(suministros.filter(s => s.suministroId !== deletingSuministro.suministroId));
            setAlert({ type: 'success', message: 'Suministro eliminado correctamente.' });
        } catch (error: any) {
            setAlert({ type: 'error', message: `Error al eliminar: ${error.message || error}` });
        }
        setIsDeleteConfirmOpen(false);
        setDeletingSuministro(null);
        setTimeout(() => setAlert(null), 3000);
    };

    const filteredSuministros = useMemo(() =>
        suministros.filter(s =>
            s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        ), [suministros, searchTerm]
    );

    const stats = useMemo(() => ({
        total: suministros.length,
        stockBajo: suministros.filter(s => s.cantidad < s.stockMinimo).length,
    }), [suministros]);

    if (user.rol === 'MESERO') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 p-8">
                <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
                    <div className="bg-gradient-to-br from-red-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-12 h-12 text-red-600" strokeWidth={2.5}/>
                    </div>
                    <h1 className="text-3xl font-black text-gray-800 mb-3">Acceso Denegado</h1>
                    <p className="text-gray-600 text-lg">No tienes permisos para acceder a esta página.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600">
                <div className="relative mb-8">
                    <div className="absolute inset-0 animate-ping">
                        <Loader2 className="w-20 h-20 text-white/30" />
                    </div>
                    <Loader2 className="animate-spin w-20 h-20 text-white" strokeWidth={3} />
                </div>
                <p className="text-white text-2xl font-black animate-pulse">Cargando inventario...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
            <div className="max-w-[1800px] mx-auto">
                {/* Header */}
                <header className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl shadow-2xl p-6 md:p-8 mb-8 text-white">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                                <Package className="w-12 h-12 text-white" strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black mb-2">Gestión de Inventario</h1>
                                <p className="text-white/90 text-sm md:text-base font-semibold">
                                    Control de suministros y stock del restaurante
                                </p>
                            </div>
                        </div>
                        
                        {hasWriteAccess && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="w-full lg:w-auto bg-white/20 backdrop-blur-sm text-white py-4 px-8 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/30 transition-all duration-300 shadow-lg font-bold text-lg transform hover:scale-105 active:scale-95 border border-white/30"
                            >
                                <Plus className="w-6 h-6" strokeWidth={2.5}/> 
                                Nuevo Suministro
                            </button>
                        )}
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/30">
                            <div className="flex items-center justify-between mb-2">
                                <Package className="w-6 h-6 opacity-80" strokeWidth={2.5}/>
                                <span className="text-4xl font-black">{stats.total}</span>
                            </div>
                            <p className="text-sm font-bold opacity-90">Total Suministros</p>
                        </div>
                        
                        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/30">
                            <div className="flex items-center justify-between mb-2">
                                <AlertTriangle className="w-6 h-6 opacity-80" strokeWidth={2.5}/>
                                <span className="text-4xl font-black">{stats.stockBajo}</span>
                            </div>
                            <p className="text-sm font-bold opacity-90">Stock Bajo</p>
                        </div>
                    </div>
                </header>

                {/* Buscador */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6"/>
                        <input
                            type="text"
                            placeholder="Buscar por nombre de suministro..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg font-medium"
                        />
                    </div>
                </div>

                {/* Tabla */}
                {error ? (
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-red-200">
                        <div className="bg-gradient-to-br from-red-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-600" strokeWidth={2.5}/>
                        </div>
                        <p className="text-red-600 text-xl font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Categoría</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Cantidad</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Stock Mínimo</th>
                                        {hasWriteAccess && <th className="relative px-6 py-5"><span className="sr-only">Acciones</span></th>}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSuministros.map(s => (
                                        <tr key={s.suministroId} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                                            <td className="px-6 py-4">
                                                <span className="font-black text-lg text-gray-900">{s.nombre}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-black rounded-full shadow-lg">
                                                    {s.categoria}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-gray-900 text-base">
                                                        {s.cantidad} {s.unidadMedida}
                                                    </span>
                                                    {s.cantidad < s.stockMinimo && (
                                                        <div className="bg-red-100 p-1.5 rounded-full animate-pulse" title="Stock bajo">
                                                            <AlertTriangle className="w-4 h-4 text-red-600" strokeWidth={2.5}/>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-600">
                                                    {s.stockMinimo} {s.unidadMedida}
                                                </span>
                                            </td>
                                            {hasWriteAccess && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                    <button 
                                                        onClick={() => handleOpenModal(s)}
                                                        className="p-2.5 text-indigo-600 hover:text-indigo-900 rounded-xl hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110 active:scale-95"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-5 h-5" strokeWidth={2.5}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(s)}
                                                        className="p-2.5 text-red-600 hover:text-red-900 rounded-xl hover:bg-red-50 transition-all duration-200 transform hover:scale-110 active:scale-95"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-5 h-5" strokeWidth={2.5}/>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredSuministros.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Package className="text-gray-400 w-12 h-12" strokeWidth={2}/>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-800 mb-3">No hay suministros</h2>
                                    <p className="text-gray-500 text-lg mb-6">
                                        {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Agrega tu primer suministro al inventario'}
                                    </p>
                                    {hasWriteAccess && !searchTerm && (
                                        <button 
                                            onClick={() => handleOpenModal()}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                                        >
                                            + Crear Primer Suministro
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modales */}
            <SuministroFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                suministro={editingSuministro}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={deletingSuministro?.nombre || ''}
            />

            {/* Alertas */}
            <AlertMessage alert={alert} onClose={() => setAlert(null)} />
        </div>
    );
};

export default SuministrosPage;