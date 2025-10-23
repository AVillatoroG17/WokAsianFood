import React, { useState, useEffect, useMemo } from 'react';
import { FaEdit, FaTrash, FaExclamationTriangle, FaPlus, FaSpinner } from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';

// --- FIN DE LA SIMULACIÓN ---

import { getSuministros, createSuministro, updateSuministro, deleteSuministro } from '../../services/suministroService';
import { ISuministro } from '../../models/ISuministro';

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

  // Derivación de permisos a partir del rol
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

  if (user.role === 'MESERO') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p className="mt-2">No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Inventario</h1>
        {hasWriteAccess && (
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 md:mt-0 flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Nuevo Suministro
          </button>
        )}
      </header>

      {alert && (
        <div className={`p-4 mb-4 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {alert.message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3">Nombre</th>
                  <th scope="col" className="px-6 py-3">Categoría</th>
                  <th scope="col" className="px-6 py-3">Cantidad</th>
                  <th scope="col" className="px-6 py-3">Stock Mínimo</th>
                  {hasWriteAccess && <th scope="col" className="px-6 py-3">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filteredSuministros.map(s => (
                  <tr key={s.suministroId} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{s.nombre}</td>
                    <td className="px-6 py-4">{s.categoria}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {s.cantidad} {s.unidadMedida}
                        {s.cantidad < s.stockMinimo && (
                          <FaExclamationTriangle className="ml-2 text-red-500" title="Stock bajo" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{s.stockMinimo} {s.unidadMedida}</td>
                    {hasWriteAccess && (
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <button onClick={() => handleOpenModal(s)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                        <button onClick={() => handleDelete(s)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <SuministroFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          suministro={editingSuministro}
        />
      )}

      {isDeleteConfirmOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={deletingSuministro?.nombre || ''}
        />
      )}
    </div>
  );
};

// --- COMPONENTES MODALES ---

interface SuministroFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ISuministro, 'suministroId' | 'fechaActualizacion'>) => void;
  suministro: ISuministro | null;
}

const SuministroFormModal: React.FC<SuministroFormModalProps> = ({ isOpen, onClose, onSave, suministro }) => {
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
    setFormData(prev => ({ ...prev, [name]: name === 'cantidad' || name === 'precioUnitario' || name === 'stockMinimo' ? parseFloat(value) : value }));
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{suministro ? 'Editar' : 'Nuevo'} Suministro</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" className="p-2 border rounded" required />
            <select name="categoria" value={formData.categoria} onChange={handleChange} className="p-2 border rounded">
              <option>Vegetales</option>
              <option>Carnes</option>
              <option>Salsas</option>
              <option>Granos</option>
              <option>Bebidas</option>
              <option>Otros</option>
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} placeholder="Cantidad" className="p-2 border rounded" required min="0" step="0.01" />
              <select name="unidadMedida" value={formData.unidadMedida} onChange={handleChange} className="p-2 border rounded">
                <option>kg</option>
                <option>g</option>
                <option>L</option>
                <option>ml</option>
                <option>unidades</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" name="precioUnitario" value={formData.precioUnitario} onChange={handleChange} placeholder="Precio Unitario" className="p-2 border rounded" required min="0" step="0.01" />
              <input type="number" name="stockMinimo" value={formData.stockMinimo} onChange={handleChange} placeholder="Stock Mínimo" className="p-2 border rounded" required min="0" />
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
        <p>¿Estás seguro de eliminar el suministro <span className="font-bold">'{itemName}'</span>? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end mt-6 space-x-4">
          <button onClick={onClose} className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
          <button onClick={onConfirm} className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700">Eliminar</button>
        </div>
      </div>
    </div>
  );
};

export default SuministrosPage;