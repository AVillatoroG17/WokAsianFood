import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { IPlatillo } from '../models/IPlatillo';

const PlatillosPage: React.FC = () => {
    const [platillos, setPlatillos] = useState<IPlatillo[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlatillos = async () => {
            try {
                const response = await api.get<IPlatillo[]>('/api/platillos');
                setPlatillos(response.data);
            } catch (err) {
                setError('No se pudieron cargar los platillos.');
            }
        };
        fetchPlatillos();
    }, []);

    const handleEdit = (id: number) => {
        navigate(`/platillos/crud/${id}`);
    };

    const handleDelete = (id: number) => {
        console.log(`Eliminar platillo con ID: ${id}`);
        // Lógica de eliminación aquí
    };

    const handleAddNew = () => {
        navigate('/platillos/crud');
    };

    const filteredPlatillos = useMemo(() => {
        return platillos.filter(p => 
            p.nombrePlatillo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [platillos, searchTerm]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Gestión de Platillos</h1>
                <button 
                    onClick={handleAddNew}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    Agregar Nuevo Platillo
                </button>
            </div>
            
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoría</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Disponible</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPlatillos.map(platillo => (
                            <tr key={platillo.platilloId}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{platillo.nombrePlatillo}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{platillo.nombreCategoria}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">Q. {platillo.precioPlatillo.toFixed(2)}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{platillo.disponible ? 'Sí' : 'No'}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <button onClick={() => handleEdit(platillo.platilloId)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                                    <button onClick={() => handleDelete(platillo.platilloId)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlatillosPage;
