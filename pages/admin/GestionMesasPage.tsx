import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Loader2, AlertTriangle, CheckCircle, Table, X } from 'lucide-react';
import { getMesas, createMesa, updateMesa, deleteMesa, IMesaInput } from '../../services/mesaService';
import { IMesa } from '../../models/IMesa';

// ✅ Componente de Mensaje de Alerta
const AlertMessage: React.FC<{ 
    message: { text: string, type: 'error' | 'success' } | null, 
    onClose: () => void 
}> = ({ message, onClose }) => {
    if (!message) return null;
    
    const isError = message.type === 'error';
    const bgColor = isError ? 'bg-red-600' : 'bg-green-600';
    const Icon = isError ? AlertTriangle : CheckCircle;

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-xl text-white shadow-2xl flex items-center z-[100] ${bgColor} animate-in fade-in-0 slide-in-from-top-4`}>
            <Icon className="w-5 h-5 mr-3 shrink-0" />
            <span className="font-medium">{message.text}</span>
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/20 transition">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// ✅ Modal de Confirmación de Eliminación
const DeleteConfirmationModal: React.FC<{ 
    mesa: IMesa, 
    onConfirm: (id: number) => void, 
    onCancel: () => void 
}> = ({ mesa, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100]">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">Confirmar Eliminación</h3>
                <p className="text-gray-600 mb-6">
                    ¿Estás seguro de eliminar la mesa <strong>"{mesa.numeroMesa}"</strong>? 
                    Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-center space-x-4">
                    <button 
                        onClick={onCancel} 
                        className="py-2 px-4 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => onConfirm(mesa.mesaId)} 
                        className="py-2 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

// ✅ Modal de Formulario
const MesaFormModal: React.FC<{ 
    mesa: IMesa | null, 
    onSave: (data: IMesaInput) => void, 
    onClose: () => void 
}> = ({ mesa, onSave, onClose }) => {
    const [formData, setFormData] = useState<IMesaInput>({
        numeroMesa: mesa?.numeroMesa || '',
        capacidad: mesa?.capacidad || 4,
        ubicacion: mesa?.ubicacion || 'interior',
        activa: mesa?.activa ?? true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : (name === 'capacidad' ? parseInt(value) : value) 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // ✅ Validaciones locales
        if (!formData.numeroMesa.trim()) {
            alert('El número de mesa es obligatorio');
            return;
        }
        
        if (formData.capacidad < 1 || formData.capacidad > 20) {
            alert('La capacidad debe estar entre 1 y 20 personas');
            return;
        }
        
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                    {mesa ? 'Editar Mesa' : 'Nueva Mesa'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Número de Mesa */}
                    <div>
                        <label className="block font-medium mb-1">Número de Mesa *</label>
                        <input 
                            type="text" 
                            name="numeroMesa" 
                            value={formData.numeroMesa} 
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: 1, A1, VIP-1"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Debe ser único en el sistema</p>
                    </div>

                    {/* Capacidad */}
                    <div>
                        <label className="block font-medium mb-1">Capacidad (personas) *</label>
                        <input 
                            type="number" 
                            name="capacidad" 
                            value={formData.capacidad} 
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="1"
                            max="20"
                            required
                        />
                    </div>

                    {/* Ubicación */}
                    <div>
                        <label className="block font-medium mb-1">Ubicación *</label>
                        <select 
                            name="ubicacion" 
                            value={formData.ubicacion} 
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="interior">🏠 Interior</option>
                            <option value="terraza">🌳 Terraza</option>
                            <option value="barra">🍷 Barra</option>
                        </select>
                    </div>

                    {/* Estado Activo */}
                    <label className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer">
                        <input 
                            type="checkbox" 
                            name="activa" 
                            checked={formData.activa} 
                            onChange={handleChange}
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-lg font-medium text-gray-700">Mesa Activa</span>
                    </label>

                    {/* Botones */}
                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ✅ PÁGINA PRINCIPAL
const GestionMesasPage: React.FC = () => {
    const { user } = useAuth();
    const [mesas, setMesas] = useState<IMesa[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMesa, setEditingMesa] = useState<IMesa | null>(null);
    const [mesaToDelete, setMesaToDelete] = useState<IMesa | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const tieneAcceso = useMemo(() => user?.rol?.toUpperCase() === 'ADMIN', [user?.rol]);

    useEffect(() => {
        if (tieneAcceso) {
            fetchMesas();
        }
    }, [tieneAcceso]);

    const fetchMesas = async () => {
        setLoading(true);
        try {
            const data = await getMesas();
            setMesas(data);
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: IMesaInput) => {
        try {
            if (editingMesa) {
                await updateMesa(editingMesa.mesaId, data);
                setMessage({ text: 'Mesa actualizada correctamente', type: 'success' });
            } else {
                await createMesa(data);
                setMessage({ text: 'Mesa creada correctamente', type: 'success' });
            }
            setIsModalOpen(false);
            setEditingMesa(null);
            fetchMesas();
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
        }
        setTimeout(() => setMessage(null), 5000);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteMesa(id);
            setMessage({ text: 'Mesa eliminada correctamente', type: 'success' });
            setMesaToDelete(null);
            fetchMesas();
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
        }
        setTimeout(() => setMessage(null), 5000);
    };

    const mesasFiltradas = useMemo(() => 
        mesas.filter(m => m.numeroMesa.toLowerCase().includes(searchTerm.toLowerCase())),
        [mesas, searchTerm]
    );

    // 🔒 Control de Acceso
    if (!tieneAcceso) {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 flex items-center mb-4 sm:mb-0">
                    <Table className="mr-3 w-8 h-8 text-blue-600"/> 
                    Gestión de Mesas
                </h1>
                <button 
                    onClick={() => { setEditingMesa(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-xl flex items-center justify-center hover:bg-blue-700 transition shadow-md"
                >
                    <Plus className="mr-2 w-5 h-5"/> Nueva Mesa
                </button>
            </header>

            {/* Buscador */}
            <div className="mb-6">
                <input 
                    type="text" 
                    placeholder="🔍 Buscar por número de mesa..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-blue-600 w-12 h-12"/>
                </div>
            ) : (
                <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Número</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Capacidad</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ubicación</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mesasFiltradas.map(mesa => (
                                <tr key={mesa.mesaId} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-bold text-gray-900">{mesa.numeroMesa}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{mesa.capacidad} personas</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            mesa.ubicacion === 'interior' ? 'bg-blue-100 text-blue-800' :
                                            mesa.ubicacion === 'terraza' ? 'bg-green-100 text-green-800' :
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                            {mesa.ubicacion}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                            mesa.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {mesa.activa ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                        <button 
                                            onClick={() => { setEditingMesa(mesa); setIsModalOpen(true); }}
                                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                                            title="Editar"
                                        >
                                            <Edit className="w-5 h-5"/>
                                        </button>
                                        <button 
                                            onClick={() => setMesaToDelete(mesa)}
                                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modales */}
            {isModalOpen && (
                <MesaFormModal 
                    mesa={editingMesa} 
                    onSave={handleSave} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
            
            {mesaToDelete && (
                <DeleteConfirmationModal 
                    mesa={mesaToDelete} 
                    onConfirm={handleDelete} 
                    onCancel={() => setMesaToDelete(null)} 
                />
            )}

            {/* Alertas */}
            <AlertMessage message={message} onClose={() => setMessage(null)} />
        </div>
    );
};

export default GestionMesasPage;