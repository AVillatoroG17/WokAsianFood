import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext'; // Importar el hook de autenticación real
import { Navigate } from 'react-router-dom';
import { UserPlus, Shield, User, ChefHat, Briefcase, Lock, Key, Trash2, Edit, AlertTriangle, X, Loader2 } from 'lucide-react';

// --- INTERFACES Y TIPOS ---
interface IUsuario {
    usuarioId: number; nombreUsuario: string; nombreCompleto: string; email?: string;
    rol: 'ADMIN' | 'MESERO' | 'COCINERO' | 'ENCARGADO'; // Aseguramos que el tipo de rol está en mayúsculas
    activo: boolean; fechaCreacion: string; ultimoAcceso?: string;
}

interface AuthHookResult {
    user: IUsuario | null;
    loading: boolean;
}

// TIPO CORREGIDO
type FormDataType = Partial<IUsuario> & { 
    claveMaestra?: string; 
    password?: string;
    confirmPassword?: string;
    [key: string]: any; 
};

type ModalType = 'CREATE' | 'EDIT' | 'PASSWORD' | 'DELETE' | null;

// --- SIMULACIÓN DE API (MOCK) ---
// ******************************************************
// NOTA: ESTA ES LA SIMULACIÓN QUE DEBES REEMPLAZAR CON UNA LLAMADA A TU BACKEND REAL
// ******************************************************
let mockUsers: IUsuario[] = [
    { usuarioId: 1, nombreUsuario: 'admin', nombreCompleto: 'Admin General', rol: 'ADMIN', activo: true, fechaCreacion: '2023-01-01', ultimoAcceso: new Date().toISOString() },
    { usuarioId: 2, nombreUsuario: 'mesero', nombreCompleto: 'Carlos Gómez', rol: 'MESERO', activo: true, fechaCreacion: '2023-02-15' },
    { usuarioId: 3, nombreUsuario: 'cocinero', nombreCompleto: 'Ana Flores', rol: 'COCINERO', activo: false, fechaCreacion: '2023-03-20' },
];
const MASTER_KEY = 'super-secret-key';

const api = {
    getUsuarios: async (): Promise<IUsuario[]> => {
        // Simular un delay de API para propósitos de prueba
        return new Promise(res => setTimeout(() => res([...mockUsers]), 500));
    },
    createUsuario: async (data: any): Promise<any> => {
        if (data.rol === 'ADMIN' && data.claveMaestra !== MASTER_KEY) {
            return Promise.reject({ error: "Clave maestra inválida.", codigo: "CLAVE_MAESTRA_INVALIDA" });
        }
        if (mockUsers.some(u => u.nombreUsuario === data.nombreUsuario)) {
            return Promise.reject({ error: `El usuario '${data.nombreUsuario}' ya existe.`, codigo: "USUARIO_DUPLICADO" });
        }
        const { confirmPassword, claveMaestra, ...userData } = data;
        const newUser: IUsuario = { usuarioId: Date.now(), ...userData, activo: true, fechaCreacion: new Date().toISOString(), rol: data.rol };
        mockUsers.push(newUser);
        return Promise.resolve({ mensaje: "Usuario creado exitosamente", usuario: newUser });
    },
    updateUsuario: async (id: number, data: any): Promise<IUsuario> => {
        const index = mockUsers.findIndex(u => u.usuarioId === id);
        if (index === -1) return Promise.reject("Usuario no encontrado.");
        const { confirmPassword, claveMaestra, password, ...updateData } = data;
        mockUsers[index] = { ...mockUsers[index], ...updateData };
        return Promise.resolve(mockUsers[index]);
    },
    deleteUsuario: async (id: number): Promise<void> => {
        mockUsers = mockUsers.filter(u => u.usuarioId !== id);
        return Promise.resolve();
    }
};

// --- SUB-COMPONENTES Y MODALES ---

const AlertMessage: React.FC<{ message: { text: string, type: 'error' | 'success' } | null, onClose: () => void }> = ({ message, onClose }) => {
    // ... (código sin cambios)
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

const RoleBadge: React.FC<{ role: IUsuario['rol'] }> = ({ role }) => {
    // ... (código sin cambios)
    const roleInfo = {
        ADMIN: { color: 'bg-red-500', icon: <Shield size={14}/> },
        MESERO: { color: 'bg-blue-500', icon: <User size={14}/> },
        COCINERO: { color: 'bg-orange-500', icon: <ChefHat size={14}/> },
        ENCARGADO: { color: 'bg-green-500', icon: <Briefcase size={14}/> },
    }[role];
    return <span className={`flex items-center text-xs font-semibold text-white px-2 py-1 rounded-full ${roleInfo.color}`}>{roleInfo.icon}<span className="ml-1">{role}</span></span>;
};


const UserFormModal: React.FC<{ userToEdit: IUsuario | null, allUsers: IUsuario[], onSave: (data: any) => void, onClose: () => void }> = ({ userToEdit, allUsers, onSave, onClose }) => {
    const [formData, setFormData] = useState<FormDataType>(userToEdit || { rol: 'MESERO' as IUsuario['rol'] });
    const [showMasterKey, setShowMasterKey] = useState(formData.rol === 'ADMIN');
    
    // ******************************************************
    // CÓDIGO FALTANTE AÑADIDO: Cálculo de existencias de rol
    // ******************************************************
    const adminExists = useMemo(() => {
        // Verifica si ya existe un ADMIN, excluyendo al usuario que se está editando
        return allUsers.some(u => u.rol === 'ADMIN' && u.usuarioId !== userToEdit?.usuarioId);
    }, [allUsers, userToEdit]);

    const encargadoExists = useMemo(() => {
        // Verifica si ya existe un ENCARGADO, excluyendo al usuario que se está editando
        return allUsers.some(u => u.rol === 'ENCARGADO' && u.usuarioId !== userToEdit?.usuarioId);
    }, [allUsers, userToEdit]);
    // ******************************************************
    
    useEffect(() => {
        // Sincronizar la visibilidad de la clave maestra al cambiar el rol
        setShowMasterKey(formData.rol === 'ADMIN');
    }, [formData.rol]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8">
                <h2 className="text-2xl font-bold mb-6">{userToEdit ? `Editar Usuario: ${userToEdit.nombreUsuario}` : 'Crear Nuevo Usuario'}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Campos Nombre de Usuario, Nombre Completo, Email */}
                    <div><label className="block font-medium">Nombre de Usuario</label><input type="text" name="nombreUsuario" value={formData.nombreUsuario || ''} onChange={handleChange} className="w-full p-2 border rounded" required disabled={!!userToEdit}/></div>
                    <div><label className="block font-medium">Nombre Completo</label><input type="text" name="nombreCompleto" value={formData.nombreCompleto || ''} onChange={handleChange} className="w-full p-2 border rounded" required/></div>
                    <div><label className="block font-medium">Email (Opcional)</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full p-2 border rounded"/></div>

                    {/* Campos Contraseña (solo si es nuevo o para reseteo) */}
                    {!userToEdit && (
                        <>
                            <div><label className="block font-medium">Contraseña</label><input type="password" name="password" value={formData.password || ''} onChange={handleChange} className="w-full p-2 border rounded" required/></div>
                            <div><label className="block font-medium">Confirmar Contraseña</label><input type="password" name="confirmPassword" value={formData.confirmPassword || ''} onChange={handleChange} className="w-full p-2 border rounded" required/></div>
                        </>
                    )}

                    {/* Campo Rol (aquí es donde usas las nuevas variables) */}
                    <div>
                         <label className="block font-medium">Rol</label>
                         <select 
                             name="rol" 
                             value={formData.rol} 
                             onChange={handleChange}
                             className="w-full p-2 border rounded"
                         >
                             <option value="MESERO">Mesero</option>
                             <option value="COCINERO">Cocinero</option>
                             <option value="ENCARGADO" disabled={encargadoExists && formData.rol !== 'ENCARGADO'}>Encargado de Inventario</option>
                             <option value="ADMIN" disabled={adminExists && formData.rol !== 'ADMIN'}>Administrador</option>
                         </select>
                         {adminExists && formData.rol !== 'ADMIN' && <p className="text-xs text-red-500 mt-1">Ya existe un Administrador. Solo puede haber uno.</p>}
                         {encargadoExists && formData.rol !== 'ENCARGADO' && <p className="text-xs text-red-500 mt-1">Ya existe un Encargado de Inventario. Solo puede haber uno.</p>}
                    </div>
                    
                    {/* Clave Maestra */}
                    {showMasterKey && (
                        <div className="p-3 bg-yellow-100 border border-yellow-400 rounded-md">
                            <label className="font-bold">Clave Maestra de Administrador</label>
                            <input type="password" name="claveMaestra" onChange={handleChange} className="w-full p-2 border rounded mt-1" required/> 
                            <p className="text-xs text-yellow-800 mt-1">⚠️ Requerida para crear o asignar el rol de Administrador.</p>
                        </div>
                    )}
                    
                    {/* Botones */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL (GESTIÓN DE USUARIOS) ---
const GestionUsuariosPage: React.FC = () => {
    // Usamos el hook real y destructuring con la aserción de tipo
    const { user: currentUser, loading: authLoading } = useAuth() as AuthHookResult;
    const [users, setUsers] = useState<IUsuario[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [modal, setModal] = useState<{ type: ModalType, data: IUsuario | null }>({ type: null, data: null });
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoadingData(true);
        try {
            const data = await api.getUsuarios();
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
                await api.createUsuario(data);
                setMessage({ text: "Usuario creado exitosamente.", type: 'success' });
            } else if (modal.type === 'EDIT' && modal.data) {
                await api.updateUsuario(modal.data.usuarioId, data);
                setMessage({ text: "Usuario actualizado exitosamente.", type: 'success' });
            }
            setModal({ type: null, data: null });
            fetchUsers(); 
        } catch (error: any) {
            console.error("Error al guardar usuario:", error);
            setMessage({ text: error.error || 'Ocurrió un error desconocido al guardar el usuario.', type: 'error' });
        }
    };

    const handleDelete = async (user: IUsuario) => {
        setMessage(null);
        try {
            const confirmation = window.confirm(`¿Estás seguro de eliminar el usuario ${user.nombreUsuario}?`);
            if (confirmation) {
                await api.deleteUsuario(user.usuarioId);
                setMessage({ text: `Usuario ${user.nombreUsuario} eliminado.`, type: 'success' });
                fetchUsers();
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setMessage({ text: "Error al eliminar el usuario.", type: 'error' });
        }
    };
    
    // CHECK DE AUTORIZACIÓN
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
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 flex items-center mb-4 sm:mb-0">
                    <Shield className="mr-3 w-8 h-8 text-blue-600"/> Gestión de Usuarios
                </h1>
                <button onClick={() => setModal({ type: 'CREATE', data: null })} className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-xl flex items-center justify-center hover:bg-blue-700 transition duration-200 shadow-md">
                    <UserPlus className="mr-2"/> Nuevo Usuario
                </button>
            </header>
            
            {loadingData ? ( 
                <div className="flex justify-center items-center h-64">
                    <Lock className="animate-spin text-blue-600 w-12 h-12"/>
                </div>
            ) : (
                <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                             <tr>
                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usuario</th>
                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Nombre Completo</th>
                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Email</th>
                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                 <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                             </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.usuarioId} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.nombreUsuario}</td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell text-sm text-gray-600">{user.nombreCompleto}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><RoleBadge role={user.rol} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm text-gray-500">{user.email || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => setModal({ type: 'EDIT', data: user })} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition duration-150" title="Editar Datos"><Edit className="w-5 h-5"/></button>
                                        <button onClick={() => setModal({ type: 'PASSWORD', data: user })} className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition duration-150" title="Restablecer Contraseña"><Key className="w-5 h-5"/></button>
                                        
                                        <button 
                                            disabled={currentUser ? user.usuarioId === currentUser.usuarioId : false} 
                                            onClick={() => handleDelete(user)} 
                                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition duration-150 disabled:text-gray-300"
                                            title={currentUser ? (user.usuarioId === currentUser.usuarioId ? "No puedes eliminar tu propia cuenta" : "Eliminar Usuario") : "Eliminar Usuario"}
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

            {/* Renderizar Modales */}
            {(modal.type === 'CREATE' || modal.type === 'EDIT') && 
                // Asegúrate de pasar 'allUsers' al modal
                <UserFormModal userToEdit={modal.data} allUsers={users} onSave={handleSave} onClose={() => setModal({ type: null, data: null })} />
            }

            {/* Mensaje de Alerta/Error */}
            <AlertMessage message={message} onClose={() => setMessage(null)} />
        </div>
    );
};

export default GestionUsuariosPage;