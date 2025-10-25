import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { UserPlus, Shield, User, ChefHat, Briefcase, Lock, Key, Trash2, Edit, AlertTriangle, X, Loader2, CreditCard } from 'lucide-react';

// --- INTERFACES Y TIPOS ---
interface IUsuario {
    usuarioId: number;
    nombreUsuario: string;
    nombreCompleto: string;
    email?: string;
    rol: 'ADMIN' | 'MESERO' | 'COCINERO' | 'ENCARGADO' | 'CAJERO';
    activo: boolean;
    fechaCreacion: string;
    ultimoAcceso?: string;
}

interface AuthHookResult {
    user: IUsuario | null;
    loading: boolean;
}

type FormDataType = Partial<IUsuario> & { 
    claveMaestra?: string; 
    password?: string;
    confirmPassword?: string;
    [key: string]: any; 
};

type ModalType = 'CREATE' | 'EDIT' | 'PASSWORD' | 'DELETE' | null;

// ⚠️ CAMBIO CLAVE AQUÍ: Importamos la nueva función 'desactivarUsuario'
import { getUsuarios, createUsuario, updateUsuario, desactivarUsuario } from '../../services/usuarioService';

// --- COMPONENTE: Mensaje de Alerta (sin cambios) ---
const AlertMessage: React.FC<{ message: { text: string, type: 'error' | 'success' } | null, onClose: () => void }> = ({ message, onClose }) => {
    if (!message) return null;
    const isError = message.type === 'error';
    const bgColor = isError ? 'bg-red-600' : 'bg-green-600';
    const Icon = isError ? AlertTriangle : UserPlus;

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-xl text-white shadow-2xl flex items-center z-[100] transform transition-transform duration-300 animate-in fade-in-0 slide-in-from-top-4 ${bgColor}`}>
            <Icon className="w-5 h-5 mr-3 shrink-0" />
            <span className="font-medium">{message.text}</span>
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/20 transition duration-150 shrink-0">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// --- COMPONENTE: Badge de Rol (sin cambios) ---
const RoleBadge: React.FC<{ role: IUsuario['rol'] }> = ({ role }) => {
    const roleConfig = {
        ADMIN: { color: 'bg-red-500', icon: <Shield size={14}/>, label: 'Administrador' },
        MESERO: { color: 'bg-blue-500', icon: <User size={14}/>, label: 'Mesero' },
        COCINERO: { color: 'bg-orange-500', icon: <ChefHat size={14}/>, label: 'Cocinero' },
        ENCARGADO: { color: 'bg-purple-500', icon: <Briefcase size={14}/>, label: 'Encargado' },
        CAJERO: { color: 'bg-green-500', icon: <CreditCard size={14}/>, label: 'Cajero' },
    };

    const config = roleConfig[role] || { color: 'bg-gray-500', icon: <User size={14}/>, label: role };

    return (
        <span className={`flex items-center text-xs font-semibold text-white px-3 py-1 rounded-full ${config.color}`}>
            {config.icon}
            <span className="ml-1">{config.label}</span>
        </span>
    );
};

// --- COMPONENTE: Modal de Formulario de Usuario (sin cambios en la estructura principal) ---
const UserFormModal: React.FC<{ 
    userToEdit: IUsuario | null;
    allUsers: IUsuario[];
    onSave: (data: any) => void;
    onClose: () => void;
}> = ({ userToEdit, allUsers, onSave, onClose }) => {
    const [formData, setFormData] = useState<FormDataType>(
        userToEdit || { rol: 'MESERO' as IUsuario['rol'] }
    );
    const [showMasterKey, setShowMasterKey] = useState(formData.rol === 'ADMIN');

    const adminExists = useMemo(() => {
        return allUsers.some(u => u.rol === 'ADMIN' && u.usuarioId !== userToEdit?.usuarioId);
    }, [allUsers, userToEdit]);

    const encargadoExists = useMemo(() => {
        return allUsers.some(u => u.rol === 'ENCARGADO' && u.usuarioId !== userToEdit?.usuarioId);
    }, [allUsers, userToEdit]);

    useEffect(() => {
        setShowMasterKey(formData.rol === 'ADMIN');
    }, [formData.rol]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!userToEdit && formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">
                    {userToEdit ? `Editar Usuario: ${userToEdit.nombreUsuario}` : 'Crear Nuevo Usuario'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... (Campos de formulario sin cambios) ... */}

                    {/* Nombre de Usuario */}
                    <div>
                        <label className="block font-medium mb-1">Nombre de Usuario</label>
                        <input
                            type="text"
                            name="nombreUsuario"
                            value={formData.nombreUsuario || ''}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={!!userToEdit}
                            placeholder="Ej: jperez"
                        />
                        {!userToEdit && (
                            <p className="text-xs text-gray-500 mt-1">
                                Mínimo 4 caracteres. No se puede cambiar después.
                            </p>
                        )}
                    </div>

                    {/* Nombre Completo */}
                    <div>
                        <label className="block font-medium mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto || ''}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block font-medium mb-1">Email (Opcional)</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: juan@example.com"
                        />
                    </div>

                    {/* Contraseñas (solo para nuevos usuarios) */}
                    {!userToEdit && (
                        <>
                            <div>
                                <label className="block font-medium mb-1">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password || ''}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                    minLength={6}
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword || ''}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                    placeholder="Repetir contraseña"
                                />
                            </div>
                        </>
                    )}

                    {/* Selector de Rol */}
                    <div>
                        <label className="block font-medium mb-1">Rol del Usuario</label>
                        <select
                            name="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="MESERO">👤 Mesero</option>
                            <option value="COCINERO">👨‍🍳 Cocinero</option>
                            <option value="CAJERO">💳 Cajero</option>
                            <option 
                                value="ENCARGADO" 
                                disabled={encargadoExists && formData.rol !== 'ENCARGADO'}
                            >
                                📦 Encargado de Inventario
                                {encargadoExists && formData.rol !== 'ENCARGADO' && ' (Ya existe)'}
                            </option>
                            <option 
                                value="ADMIN" 
                                disabled={adminExists && formData.rol !== 'ADMIN'}
                            >
                                🛡️ Administrador
                                {adminExists && formData.rol !== 'ADMIN' && ' (Ya existe)'}
                            </option>
                        </select>

                        {/* Descripción del rol */}
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                            {formData.rol === 'MESERO' && (
                                <p>✅ Puede: Tomar órdenes, gestionar clientes, marcar como servido</p>
                            )}
                            {formData.rol === 'COCINERO' && (
                                <p>✅ Puede: Ver pedidos de cocina, preparar platillos, gestionar menú</p>
                            )}
                            {formData.rol === 'CAJERO' && (
                                <p>✅ Puede: Procesar pagos, facturar órdenes, generar recibos</p>
                            )}
                            {formData.rol === 'ENCARGADO' && (
                                <p>✅ Puede: Gestionar inventario, suministros, control de stock</p>
                            )}
                            {formData.rol === 'ADMIN' && (
                                <p>⚠️ Acceso total al sistema. Requiere clave maestra.</p>
                            )}
                        </div>

                        {/* Advertencias de roles únicos */}
                        {adminExists && formData.rol !== 'ADMIN' && (
                            <p className="text-xs text-red-500 mt-1">
                                ⚠️ Solo puede haber un Administrador en el sistema
                            </p>
                        )}
                        {encargadoExists && formData.rol !== 'ENCARGADO' && (
                            <p className="text-xs text-red-500 mt-1">
                                ⚠️ Solo puede haber un Encargado de Inventario
                            </p>
                        )}
                    </div>

                    {/* Clave Maestra para ADMIN */}
                    {showMasterKey && (
                        <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                            <label className="font-bold text-yellow-800 block mb-2">
                                🔐 Clave Maestra de Administrador
                            </label>
                            <input
                                type="password"
                                name="claveMaestra"
                                onChange={handleChange}
                                className="w-full p-3 border border-yellow-400 rounded-lg"
                                required
                                placeholder="Ingrese la clave maestra"
                            />
                            <p className="text-xs text-yellow-700 mt-2">
                                ⚠️ Requerida para crear o asignar el rol de Administrador
                            </p>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            {userToEdit ? 'Actualizar' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL: Gestión de Usuarios ---
const GestionUsuariosPage: React.FC = () => {
    const { user: currentUser, loading: authLoading } = useAuth() as AuthHookResult;
    const [users, setUsers] = useState<IUsuario[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [modal, setModal] = useState<{ type: ModalType, data: IUsuario | null }>({ type: null, data: null });
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoadingData(true);
        try {
            const data = await getUsuarios();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
            setMessage({ text: "Error al cargar la lista de usuarios.", type: 'error' });
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && currentUser && currentUser.rol?.toUpperCase() === 'ADMIN') {
            fetchUsers();
        }
    }, [fetchUsers, authLoading, currentUser]);

    const handleSave = async (data: any) => {
        setMessage(null);
        try {
            if (modal.type === 'CREATE') {
                await createUsuario(data);
                setMessage({ text: "Usuario creado exitosamente.", type: 'success' });
            } else if (modal.type === 'EDIT' && modal.data) {
                await updateUsuario(modal.data.usuarioId, data);
                setMessage({ text: "Usuario actualizado exitosamente.", type: 'success' });
            }
            setModal({ type: null, data: null });
            fetchUsers();
        } catch (error: any) {
            console.error("Error al guardar usuario:", error);
            const errorMessage = error.response?.data?.mensaje || error.message || 'Ocurrió un error desconocido.';
            setMessage({ text: errorMessage, type: 'error' });
        }
    };

    // --------------------------------------------------------
    // ✅ FUNCIÓN CORREGIDA: Ahora realiza la DESACTIVACIÓN LÓGICA
    // --------------------------------------------------------
    const handleDesactivar = async (user: IUsuario) => {
        setMessage(null);

        // 1. Prevenir que el admin se desactive a sí mismo
        if (currentUser && user.usuarioId === currentUser.usuarioId) {
             setMessage({ text: "No puedes desactivar tu propia cuenta de administrador.", type: 'error' });
             return;
        }

        try {
            const confirmation = window.confirm(
                `¿Estás seguro de DESACTIVAR al usuario ${user.nombreUsuario} (ID ${user.usuarioId})? 
                 Esto lo marcará como INACTIVO y no podrá iniciar sesión.
                 Sus registros (órdenes, etc.) se mantendrán, evitando el error de llave foránea.`
            );
            
            if (confirmation) {
                // 2. Llama a la nueva función PATCH del servicio
                await desactivarUsuario(user.usuarioId); 
                
                setMessage({ text: `Usuario ${user.nombreUsuario} ha sido **desactivado** (Inactivo).`, type: 'success' });
                fetchUsers(); // Recargar la lista
            }
        } catch (error: any) {
            console.error("Error desactivando usuario:", error);
            const errorMessage = error.response?.data?.mensaje || error.message || 'Error al desactivar el usuario.';
            setMessage({ text: errorMessage, type: 'error' });
        }
    };
    // ⚠️ Nota: El método handleDelete ya no existe/es usado.

    // Filtrado de usuarios (sin cambios)
    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            u.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    // Estadísticas de usuarios por rol (sin cambios)
    const userStats = useMemo(() => {
        return {
            total: users.length,
            admin: users.filter(u => u.rol === 'ADMIN').length,
            mesero: users.filter(u => u.rol === 'MESERO').length,
            cocinero: users.filter(u => u.rol === 'COCINERO').length,
            cajero: users.filter(u => u.rol === 'CAJERO').length,
            encargado: users.filter(u => u.rol === 'ENCARGADO').length,
            activos: users.filter(u => u.activo).length,
        };
    }, [users]);

    // Control de acceso (sin cambios)
    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
                <p className="ml-4 text-gray-600">Verificando permisos...</p>
            </div>
        );
    }

    if (currentUser && currentUser.rol?.toUpperCase() !== 'ADMIN') {
        return <Navigate to="/unauthorized" replace />;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* Header y Buscador (sin cambios) */}
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 flex items-center mb-2">
                        <Shield className="mr-3 w-8 h-8 text-blue-600"/> 
                        Gestión de Usuarios
                    </h1>
                    {/* Estadísticas rápidas (sin cambios) */}
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span>👥 Total: <strong>{userStats.total}</strong></span>
                        <span>•</span>
                        <span>✅ Activos: <strong>{userStats.activos}</strong></span>
                        <span>•</span>
                        <span>👨‍🍳 Cocineros: <strong>{userStats.cocinero}</strong></span>
                        <span>•</span>
                        <span>💳 Cajeros: <strong>{userStats.cajero}</strong></span>
                    </div>
                </div>
                <button
                    onClick={() => setModal({ type: 'CREATE', data: null })}
                    className="mt-4 sm:mt-0 w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-xl flex items-center justify-center hover:bg-blue-700 transition duration-200 shadow-md"
                >
                    <UserPlus className="mr-2"/> 
                    Nuevo Usuario
                </button>
            </header>

            {/* Buscador (sin cambios) */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Buscar por nombre, usuario o email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Tabla de Usuarios */}
            {loadingData ? (
                <div className="flex justify-center items-center h-64">
                    <Lock className="animate-spin text-blue-600 w-12 h-12"/>
                </div>
            ) : (
                <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Thead (sin cambios) */}
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                                    Nombre Completo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map(user => (
                                <tr key={user.usuarioId} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        {user.nombreUsuario}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell text-sm text-gray-600">
                                        {user.nombreCompleto}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RoleBadge role={user.rol} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm text-gray-500">
                                        {user.email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                            user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {/* Botón de Editar (sin cambios) */}
                                        <button
                                            onClick={() => setModal({ type: 'EDIT', data: user })}
                                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition duration-150"
                                            title="Editar Datos"
                                        >
                                            <Edit className="w-5 h-5"/>
                                        </button>
                                        
                                        {/* -------------------------------------------------------- */}
                                        {/* ✅ BOTÓN DE DESACTIVAR LÓGICAMENTE (Reemplaza a Eliminar) */}
                                        {/* -------------------------------------------------------- */}
                                        <button
                                            // Deshabilitado si el usuario es el actual O si ya está inactivo
                                            disabled={currentUser ? (user.usuarioId === currentUser.usuarioId || !user.activo) : false}
                                            onClick={() => handleDesactivar(user)} // ⬅️ Llama a la nueva función
                                            className={`p-1 rounded-full hover:bg-red-50 transition duration-150 
                                                ${user.activo 
                                                    ? 'text-red-600 hover:text-red-900' 
                                                    : 'text-gray-400 cursor-not-allowed'
                                                }
                                                disabled:text-gray-300
                                            `}
                                            title={
                                                currentUser 
                                                    ? (user.usuarioId === currentUser.usuarioId 
                                                        ? "No puedes desactivar tu propia cuenta" 
                                                        : (user.activo ? "Desactivar Usuario (Lo hace INACTIVO)" : "El usuario ya está inactivo")
                                                      ) 
                                                    : "Desactivar Usuario"
                                            }
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

            {/* Modales y Alerta (sin cambios) */}
            {(modal.type === 'CREATE' || modal.type === 'EDIT') && (
                <UserFormModal
                    userToEdit={modal.data}
                    allUsers={users}
                    onSave={handleSave}
                    onClose={() => setModal({ type: null, data: null })}
                />
            )}

            <AlertMessage message={message} onClose={() => setMessage(null)} />
        </div>
    );
};

export default GestionUsuariosPage;