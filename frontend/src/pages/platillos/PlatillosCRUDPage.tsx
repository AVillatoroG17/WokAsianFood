import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Plus, Edit, Trash, Loader2, Utensils, ImageOff, AlertTriangle, X } from 'lucide-react';

// --- INTERFACES ---
interface IPlatillo {
    platilloId: number;
    nombrePlatillo: string;
    categoriaId: number;
    nombreCategoria: string;
    precioPlatillo: number;
    tiempoPreparacion: number;
    disponible: boolean;
    descripcion?: string;
    imagenUrl?: string;
}

// --- SIMULACIÓN DE API ---
let mockPlatillos: IPlatillo[] = [
    { platilloId: 1, nombrePlatillo: 'Ramen Tonkotsu', categoriaId: 1, nombreCategoria: 'Platos Fuertes', precioPlatillo: 18.00, tiempoPreparacion: 15, disponible: true, imagenUrl: 'https://placehold.co/150x150/5078FF/FFFFFF?text=Ramen' },
    { platilloId: 2, nombrePlatillo: 'Gyoza de Cerdo', categoriaId: 2, nombreCategoria: 'Entradas', precioPlatillo: 8.00, tiempoPreparacion: 10, disponible: true, imagenUrl: 'https://placehold.co/150x150/66BB6A/FFFFFF?text=Gyoza' },
    { platilloId: 3, nombrePlatillo: 'Mochi Ice Cream', categoriaId: 3, nombreCategoria: 'Postres', precioPlatillo: 6.00, tiempoPreparacion: 5, disponible: false, imagenUrl: 'https://placehold.co/150x150/FF8A65/FFFFFF?text=Mochi' },
];

const api = {
    getPlatillos: async (): Promise<IPlatillo[]> => Promise.resolve([...mockPlatillos]),
    createPlatillo: async (data: Omit<IPlatillo, 'platilloId' | 'nombreCategoria'>): Promise<IPlatillo> => {
        // Simular nombre categoria - idealmente se buscaría en la BD
        const newPlatillo: IPlatillo = { ...data, platilloId: Date.now(), nombreCategoria: 'Platos Fuertes' };
        mockPlatillos.push(newPlatillo);
        return Promise.resolve(newPlatillo);
    },
    updatePlatillo: async (id: number, data: Partial<IPlatillo>): Promise<IPlatillo> => {
        const index = mockPlatillos.findIndex(p => p.platilloId === id);
        if (index !== -1) {
            mockPlatillos[index] = { ...mockPlatillos[index], ...data };
            return Promise.resolve(mockPlatillos[index]);
        }
        return Promise.reject('Platillo no encontrado');
    },
    deletePlatillo: async (id: number): Promise<void> => {
        mockPlatillos = mockPlatillos.filter(p => p.platilloId !== id);
        return Promise.resolve();
    }
};

// --- COMPONENTE DEL MODAL DE FORMULARIO ---
const PlatilloFormModal: React.FC<{ platillo: Partial<IPlatillo> | null, onSave: (data: any) => void, onClose: () => void }> = ({ platillo, onSave, onClose }) => {
    const [formData, setFormData] = useState(platillo || { nombrePlatillo: '', categoriaId: 1, precioPlatillo: 0, tiempoPreparacion: 0, disponible: true, descripcion: '', imagenUrl: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all scale-100">
                <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-2">{platillo?.platilloId ? 'Editar' : 'Nuevo'} Platillo</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input name="nombrePlatillo" value={formData.nombrePlatillo} onChange={handleChange} placeholder="Nombre del Platillo" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150" required />
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción breve" className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 h-24" />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <input name="precioPlatillo" type="number" min="0" step="0.01" value={formData.precioPlatillo} onChange={handleChange} placeholder="Precio (Q)" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <input name="tiempoPreparacion" type="number" min="0" value={formData.tiempoPreparacion} onChange={handleChange} placeholder="Tiempo Prep. (min)" className="w-full p-3 border border-gray-300 rounded-lg" required />
                    </div>

                    <input name="imagenUrl" value={formData.imagenUrl} onChange={handleChange} placeholder="URL de la Imagen (Opcional)" className="w-full p-3 border border-gray-300 rounded-lg" />
                    
                    <label className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer">
                        <input name="disponible" type="checkbox" checked={formData.disponible} onChange={handleChange} className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-lg font-medium text-gray-700">Platillo Disponible para Ordenar</span>
                    </label>

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-semibold hover:bg-gray-300 transition duration-150">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold flex items-center hover:bg-blue-700 transition duration-150 shadow-lg shadow-blue-200/50">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- COMPONENTE DE CONFIRMACIÓN DE ELIMINACIÓN (Reemplaza window.confirm) ---
const ConfirmationMessage: React.FC<{ platillo: IPlatillo, onConfirm: (id: number) => void, onCancel: () => void }> = ({ platillo, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100]">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm text-center transform transition-all">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">Confirmar Eliminación</h3>
                <p className="text-gray-600 mb-6">¿Estás seguro de eliminar el platillo **{platillo.nombrePlatillo}**? Esta acción no se puede deshacer.</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={onCancel} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition">Cancelar</button>
                    <button onClick={() => onConfirm(platillo.platilloId)} className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition">Eliminar</button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
const PlatillosCRUDPage: React.FC = () => {
    const { user } = useAuth();
    const [platillos, setPlatillos] = useState<IPlatillo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlatillo, setEditingPlatillo] = useState<IPlatillo | null>(null);
    const [platilloToDelete, setPlatilloToDelete] = useState<IPlatillo | null>(null); // Nuevo estado para la confirmación

    useEffect(() => {
        api.getPlatillos().then(data => {
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
                const updated = await api.updatePlatillo(editingPlatillo.platilloId, data);
                setPlatillos(platillos.map(p => p.platilloId === updated.platilloId ? updated : p));
            } else {
                const created = await api.createPlatillo(data);
                setPlatillos([...platillos, created]);
            }
            setIsModalOpen(false);
            setEditingPlatillo(null);
        } catch (error) {
            console.error("Error al guardar platillo:", error);
            // Implementar notificación de error aquí
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setPlatilloToDelete(null); // Cerrar el mensaje de confirmación
            await api.deletePlatillo(id);
            setPlatillos(platillos.filter(p => p.platilloId !== id));
        } catch (error) {
            console.error("Error al eliminar platillo:", error);
            // Implementar notificación de error aquí
        }
    };

    // --- CORRECCIÓN DE ROL: Cambiado de 'user.role' a 'user.rol' para evitar el error de propiedad indefinida.
    if (user && user.rol.trim() !== 'ADMIN' && user.rol.trim() !== 'COCINERO') {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 flex items-center mb-4 sm:mb-0">
                    <Utensils className="mr-3 w-8 h-8 text-blue-600"/> Gestión de Platillos
                </h1>
                <button onClick={() => { setEditingPlatillo(null); setIsModalOpen(true); }} className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-xl flex items-center justify-center hover:bg-blue-700 transition duration-200 shadow-md">
                    <Plus className="mr-2 w-5 h-5"/> Nuevo Platillo
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-blue-600 w-12 h-12"/>
                </div>
            ) : (
                <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Imagen</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Tiempo Prep.</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {platillos.map(p => (
                                <tr key={p.platilloId} className="hover:bg-gray-50 transition duration-150">
                                    {/* Imagen */}
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                        {p.imagenUrl ? <img src={p.imagenUrl} alt={p.nombrePlatillo} className="w-16 h-16 rounded-lg object-cover shadow-sm" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = 'https://placehold.co/150x150/EEEEEE/999999?text=Error'; }} /> : <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center"><ImageOff className="text-gray-400"/></div>}
                                    </td>
                                    {/* Nombre y Descripción (en móvil) */}
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {p.nombrePlatillo}
                                        <div className="text-xs text-gray-500 block sm:hidden mt-1">{p.nombreCategoria}</div>
                                    </td>
                                    {/* Categoría (Desktop) */}
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm text-gray-600">{p.nombreCategoria}</td>
                                    {/* Precio */}
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-sm text-blue-600">Q{p.precioPlatillo.toFixed(2)}</td>
                                    {/* Tiempo Prep. (Desktop) */}
                                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell text-sm text-gray-500">{p.tiempoPreparacion} min</td>
                                    {/* Estado */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${p.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {p.disponible ? 'Disponible' : 'Agotado'}
                                        </span>
                                    </td>
                                    {/* Acciones */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenEditModal(p)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition duration-150" title="Editar Platillo"><Edit className="w-5 h-5"/></button>
                                        <button onClick={() => setPlatilloToDelete(p)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition duration-150" title="Eliminar Platillo"><Trash className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {platillos.length === 0 && (
                        <div className="text-center py-12 text-gray-500">No hay platillos registrados. Crea uno nuevo para empezar.</div>
                    )}
                </div>
            )}

            {/* Renderizar Modales */}
            {isModalOpen && <PlatilloFormModal platillo={editingPlatillo} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
            {platilloToDelete && <ConfirmationMessage platillo={platilloToDelete} onConfirm={handleDelete} onCancel={() => setPlatilloToDelete(null)} />}
        </div>
    );
};

export default PlatillosCRUDPage;
