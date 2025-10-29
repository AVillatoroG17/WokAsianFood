import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Plus, Edit, Trash, Loader2, Utensils, ImageOff, AlertTriangle, X, Clock, DollarSign, CheckCircle, XCircle, ChefHat, Image } from 'lucide-react';
import { getPlatillos, createPlatillo, updatePlatillo, deletePlatillo } from '../../services/platilloCRUDService';
import { IPlatillo } from '../../models/IPlatillo';

// --- COMPONENTE: Modal de Formulario ---
const PlatilloFormModal: React.FC<{ 
    platillo: Partial<IPlatillo> | null, 
    onSave: (data: any) => void, 
    onClose: () => void 
}> = ({ platillo, onSave, onClose }) => {
    const [formData, setFormData] = useState(platillo || { 
        nombrePlatillo: '', 
        categoriaId: 1, 
        precioPlatillo: 0, 
        tiempoPreparacion: 0, 
        disponible: true, 
        descripcion: '', 
        imagenUrl: '' 
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value) 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in-0 duration-300">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-gray-200 transform transition-all duration-300 animate-in zoom-in-95">
                {/* Header del Modal */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                                <Utensils className="w-7 h-7 text-white" strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white">
                                    {platillo?.platilloId ? 'Editar Platillo' : 'Nuevo Platillo'}
                                </h2>
                                <p className="text-white/90 text-sm mt-1">
                                    {platillo?.platilloId ? 'Actualiza la información del platillo' : 'Agrega un nuevo platillo al menú'}
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
                    {/* Nombre del Platillo */}
                    <div className="group">
                        <label className="block font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                            <ChefHat className="w-4 h-4 text-orange-600"/> Nombre del Platillo
                        </label>
                        <input 
                            name="nombrePlatillo" 
                            value={formData.nombrePlatillo} 
                            onChange={handleChange} 
                            placeholder="Ej: Pollo Asado con Papas"
                            className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-200 font-medium"
                            required 
                        />
                    </div>

                    {/* Descripción */}
                    <div className="group">
                        <label className="block font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-red-600"/> Descripción
                        </label>
                        <textarea 
                            name="descripcion" 
                            value={formData.descripcion} 
                            onChange={handleChange} 
                            placeholder="Describe brevemente el platillo..."
                            className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl resize-none focus:ring-4 focus:ring-red-500/30 focus:border-red-500 transition-all duration-200 h-28 font-medium"
                        />
                    </div>

                    {/* Grid de 2 columnas: Precio y Tiempo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600"/> Precio (Q)
                            </label>
                            <input 
                                name="precioPlatillo" 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                value={formData.precioPlatillo === 0 ? '' : formData.precioPlatillo} 
                                onChange={handleChange} 
                                placeholder="0.00"
                                className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200 font-bold text-lg"
                                required 
                            />
                        </div>

                        <div className="group">
                            <label className="block font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600"/> Tiempo Prep. (min)
                            </label>
                            <input 
                                name="tiempoPreparacion" 
                                type="number" 
                                min="0" 
                                value={formData.tiempoPreparacion === 0 ? '' : formData.tiempoPreparacion} 
                                onChange={handleChange} 
                                placeholder="15"
                                className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 font-bold text-lg"
                                required 
                            />
                        </div>
                    </div>

                    {/* URL de Imagen */}
                    <div className="group">
                        <label className="block font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                            <Image className="w-4 h-4 text-purple-600"/> URL de la Imagen (Opcional)
                        </label>
                        <input 
                            name="imagenUrl" 
                            value={formData.imagenUrl} 
                            onChange={handleChange} 
                            placeholder="https://ejemplo.com/imagen.jpg"
                            className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 font-medium"
                        />
                        {formData.imagenUrl && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                <p className="text-xs text-purple-700 font-semibold mb-2">Vista Previa:</p>
                                <img 
                                    src={formData.imagenUrl} 
                                    alt="Preview" 
                                    className="w-32 h-32 rounded-lg object-cover shadow-md"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/150x150/EEEEEE/999999?text=Error';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Checkbox de Disponibilidad */}
                    <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input 
                                name="disponible" 
                                type="checkbox" 
                                checked={formData.disponible} 
                                onChange={handleChange} 
                                className="h-6 w-6 text-green-600 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-green-500/30 cursor-pointer"
                            />
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2.5}/>
                                <span className="text-lg font-black text-gray-800">Platillo Disponible para Ordenar</span>
                            </div>
                        </label>
                        <p className="text-xs text-green-700 mt-2 ml-9">
                            Los platillos marcados como disponibles aparecerán en el menú para los meseros
                        </p>
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
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white rounded-xl hover:from-orange-700 hover:via-red-700 hover:to-pink-700 transition-all duration-200 font-black text-lg shadow-xl transform hover:scale-105 active:scale-95"
                        >
                            {platillo?.platilloId ? '✓ Actualizar Platillo' : '+ Crear Platillo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- COMPONENTE: Confirmación de Eliminación ---
const ConfirmationMessage: React.FC<{ 
    platillo: IPlatillo, 
    onConfirm: (id: number) => void, 
    onCancel: () => void 
}> = ({ platillo, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[100] animate-in fade-in-0 duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center transform transition-all animate-in zoom-in-95 border-2 border-red-200">
                <div className="bg-gradient-to-br from-red-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-600" strokeWidth={2.5}/>
                </div>
                <h3 className="text-2xl font-black mb-3 text-gray-900">¿Eliminar Platillo?</h3>
                <p className="text-gray-600 mb-2 text-lg">
                    Estás a punto de eliminar:
                </p>
                <p className="text-xl font-black text-red-600 mb-6">
                    "{platillo.nombrePlatillo}"
                </p>
                <p className="text-sm text-gray-500 mb-8">
                    Esta acción no se puede deshacer y el platillo será removido permanentemente del sistema.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                        onClick={onCancel} 
                        className="w-full sm:w-auto px-8 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => onConfirm(platillo.platilloId)} 
                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-black hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg transform hover:scale-105 active:scale-95"
                    >
                        Sí, Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---
const PlatillosCRUDPage: React.FC = () => {
    const { user } = useAuth();
    const [platillos, setPlatillos] = useState<IPlatillo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlatillo, setEditingPlatillo] = useState<IPlatillo | null>(null);
    const [platilloToDelete, setPlatilloToDelete] = useState<IPlatillo | null>(null);

    useEffect(() => {
        getPlatillos().then(data => {
            setPlatillos(data);
            setLoading(false);
        }).catch(error => {
            console.error("Error al cargar platillos:", error);
            setLoading(false);
        });
    }, []);

    const handleOpenEditModal = (platillo: IPlatillo) => {
        setEditingPlatillo(platillo);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Omit<IPlatillo, 'platilloId' | 'nombreCategoria'>) => {
        try {
            if (editingPlatillo) {
                const updated = await updatePlatillo(editingPlatillo.platilloId, data);
                setPlatillos(platillos.map(p => p.platilloId === updated.platilloId ? updated : p));
            } else {
                const created = await createPlatillo(data);
                setPlatillos([...platillos, created]);
            }
            setIsModalOpen(false);
            setEditingPlatillo(null);
        } catch (error) {
            console.error("Error al guardar platillo:", error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setPlatilloToDelete(null);
            await deletePlatillo(id);
            setPlatillos(platillos.filter(p => p.platilloId !== id));
        } catch (error) {
            console.error("Error al eliminar platillo:", error);
        }
    };

    if (user && user.rol.trim() !== 'ADMIN' && user.rol.trim() !== 'COCINERO') {
        return <Navigate to="/unauthorized" replace />;
    }

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-600">
                <div className="relative mb-8">
                    <div className="absolute inset-0 animate-ping">
                        <Loader2 className="w-20 h-20 text-white/30" />
                    </div>
                    <Loader2 className="animate-spin w-20 h-20 text-white" strokeWidth={3} />
                </div>
                <p className="text-white text-2xl font-black animate-pulse">Cargando platillos...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-[1800px] mx-auto">
                {/* Header */}
                <header className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-3xl shadow-2xl p-6 md:p-8 mb-6 text-white">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                                <Utensils className="w-12 h-12 text-white" strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black mb-2">Gestión de Platillos</h1>
                                <p className="text-white/90 text-sm md:text-base font-semibold">
                                    Administra el menú completo del restaurante • {platillos.length} platillos registrados
                                </p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => { setEditingPlatillo(null); setIsModalOpen(true); }} 
                            className="w-full lg:w-auto bg-white/20 backdrop-blur-sm text-white py-4 px-8 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/30 transition-all duration-300 shadow-lg font-bold text-lg transform hover:scale-105 active:scale-95 border border-white/30"
                        >
                            <Plus className="w-6 h-6" strokeWidth={2.5}/> 
                            Nuevo Platillo
                        </button>
                    </div>
                </header>

                {/* Tabla de Platillos */}
                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
                    {platillos.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Utensils className="text-gray-400 w-12 h-12" strokeWidth={2}/>
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 mb-3">No hay platillos registrados</h2>
                            <p className="text-gray-500 text-lg mb-6">Crea tu primer platillo para comenzar</p>
                            <button 
                                onClick={() => { setEditingPlatillo(null); setIsModalOpen(true); }}
                                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                + Crear Primer Platillo
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Imagen</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">Categoría</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Precio</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Tiempo</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                                        <th className="relative px-6 py-5"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {platillos.map(p => (
                                        <tr key={p.platilloId} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition-all duration-200">
                                            {/* Imagen */}
                                            <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                                {p.imagenUrl ? (
                                                    <img 
                                                        src={p.imagenUrl} 
                                                        alt={p.nombrePlatillo} 
                                                        className="w-20 h-20 rounded-xl object-cover shadow-lg ring-2 ring-gray-200"
                                                        onError={(e) => { 
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/150x150/EEEEEE/999999?text=Error'; 
                                                        }} 
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
                                                        <ImageOff className="text-gray-400 w-8 h-8" strokeWidth={2}/>
                                                    </div>
                                                )}
                                            </td>
                                            
                                            {/* Nombre */}
                                            <td className="px-6 py-4">
                                                <p className="font-black text-gray-900 text-base">{p.nombrePlatillo}</p>
                                                <p className="text-xs text-gray-500 block sm:hidden mt-1">{p.nombreCategoria}</p>
                                            </td>
                                            
                                            {/* Categoría */}
                                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-xs font-bold rounded-full">
                                                    {p.nombreCategoria}
                                                </span>
                                            </td>
                                            
                                            {/* Precio */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-black text-lg text-green-600">Q{p.precioPlatillo.toFixed(2)}</span>
                                            </td>
                                            
                                            {/* Tiempo */}
                                            <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                                    <Clock className="w-4 h-4 text-blue-600" strokeWidth={2.5}/>
                                                    {p.tiempoPreparacion} min
                                                </div>
                                            </td>
                                            
                                            {/* Estado */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-4 py-2 inline-flex items-center gap-1.5 text-xs font-black rounded-full ${
                                                    p.disponible 
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                                                        : 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                                                }`}>
                                                    {p.disponible ? <CheckCircle className="w-4 h-4" strokeWidth={2.5}/> : <XCircle className="w-4 h-4" strokeWidth={2.5}/>}
                                                    {p.disponible ? 'Disponible' : 'Agotado'}
                                                </span>
                                            </td>
                                            
                                            {/* Acciones */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                <button 
                                                    onClick={() => handleOpenEditModal(p)} 
                                                    className="p-2.5 text-indigo-600 hover:text-indigo-900 rounded-xl hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110 active:scale-95"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-5 h-5" strokeWidth={2.5}/>
                                                </button>
                                                <button 
                                                    onClick={() => setPlatilloToDelete(p)} 
                                                    className="p-2.5 text-red-600 hover:text-red-900 rounded-xl hover:bg-red-50 transition-all duration-200 transform hover:scale-110 active:scale-95"
                                                    title="Eliminar"
                                                >
                                                    <Trash className="w-5 h-5" strokeWidth={2.5}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            {isModalOpen && (
                <PlatilloFormModal 
                    platillo={editingPlatillo} 
                    onSave={handleSave} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
            {platilloToDelete && (
                <ConfirmationMessage 
                    platillo={platilloToDelete} 
                    onConfirm={handleDelete} 
                    onCancel={() => setPlatilloToDelete(null)} 
                />
            )}
        </div>
    );
};

export default PlatillosCRUDPage;