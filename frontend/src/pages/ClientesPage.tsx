import React, { useState } from 'react';
import { createCliente, getClientes } from '../services/clienteService';
import { ICliente } from '../models/ICliente';

const ClientesPage: React.FC = () => {
    // Estado para el formulario de registro
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [registroMessage, setRegistroMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Estado para la búsqueda
    const [telefonoBusqueda, setTelefonoBusqueda] = useState('');
    const [clienteEncontrado, setClienteEncontrado] = useState<ICliente | null>(null);
    const [busquedaMessage, setBusquedaMessage] = useState<string | null>(null);

    const handleRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegistroMessage(null);
        try {
            const nuevoCliente = await createCliente({ nombre, telefono, email });
            if (nuevoCliente) {
                setRegistroMessage({ type: 'success', text: `Cliente '${nuevoCliente.nombre}' registrado con éxito!` });
                setNombre('');
                setTelefono('');
                setEmail('');
            }
        } catch (err) {
            console.error("Error al registrar cliente:", err);
            setRegistroMessage({ type: 'error', text: 'Error al registrar el cliente.' });
        }
    };

    const handleBusqueda = async (e: React.FormEvent) => {
        e.preventDefault();
        setClienteEncontrado(null);
        setBusquedaMessage(null);
        try {
            const clientes = await getClientes(telefonoBusqueda);
            if (clientes && clientes.length > 0) {
                setClienteEncontrado(clientes[0]); // Muestra el primer resultado
            } else {
                setBusquedaMessage('No se encontró ningún cliente con ese teléfono.');
            }
        } catch (err) {
            console.error("Error al buscar cliente:", err);
            setBusquedaMessage('Error al buscar el cliente.');
        }
    };

    return (
        <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Columna de Registro */}
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Registrar Nuevo Cliente</h2>
                <form onSubmit={handleRegistro}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
                        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                        <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" />
                    </div>
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">Registrar</button>
                    {registroMessage && (
                        <p className={`mt-4 text-sm ${registroMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {registroMessage.text}
                        </p>
                    )}
                </form>
            </div>

            {/* Columna de Búsqueda */}
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Buscar Cliente</h2>
                <form onSubmit={handleBusqueda}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Buscar por Teléfono</label>
                        <input type="text" value={telefonoBusqueda} onChange={e => setTelefonoBusqueda(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required />
                    </div>
                    <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">Buscar</button>
                </form>
                {busquedaMessage && <p className="mt-4 text-red-500 text-sm">{busquedaMessage}</p>}
                {clienteEncontrado && (
                    <div className="mt-6 p-4 border rounded-md bg-gray-50">
                        <h3 className="font-bold">Cliente Encontrado:</h3>
                        <p><strong>Nombre:</strong> {clienteEncontrado.nombre}</p>
                        <p><strong>Teléfono:</strong> {clienteEncontrado.telefono}</p>
                        <p><strong>Email:</strong> {clienteEncontrado.email}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientesPage;
