import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { UserPlus, Shield, User, ChefHat, Briefcase, Lock, Key, Trash2, Edit, AlertTriangle, X, Loader2, CreditCard, Search, Users, CheckCircle } from 'lucide-react';

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

import { getUsuarios, createUsuario, updateUsuario, desactivarUsuario } from '../../services/usuarioService';

// --- COMPONENTE: Mensaje de Alerta Mejorado ---
const AlertMessage: React.FC<{ message: { text: string, type: 'error' | 'success' } | null, onClose: () => void }> = ({ message, onClose }) => {
    if (!message) return null;
    const isError = message.type === 'error';
    const bgGradient = isError 
        ? 'bg-gradient-to-r from-red-500 to-red-600' 
        : 'bg-gradient-to-r from-green-500 to-emerald-600';
    const Icon = isError ? AlertTriangle : CheckCircle;

    return (
        <div className={`fixed top-6 right-6 p-5 rounded-2xl text-white shadow-2xl flex items-center z-[100] transform transition-all duration-500 animate-in fade-in-0 slide-in-from-top-5 ${bgGradient} backdrop-blur-sm border border-white/20`}>
            <div className="bg-white/20 p-2 rounded-full mr-4">
                <Icon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-lg">{message.text}</span>
            <button 
                onClick={onClose} 
                className="ml-6 p-2 rounded-full hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

// --- COMPONENTE: Badge de Rol Mejorado ---
const RoleBadge: React.FC<{ role: IUsuario['rol'] }> = ({ role }) => {
    const roleConfig = {
        ADMIN: { 
            gradient: 'bg-gradient-to-r from-red-500 to-pink-600', 
            icon: <Shield size={16}/>, 
            label: 'Administrador',
            ring: 'ring-2 ring-red-400/50'
        },
        MESERO: { 
            gradient: 'bg-gradient-to-r from-blue-500 to-cyan-600', 
            icon: <User size={16}/>, 
            label: 'Mesero',
            ring: 'ring-2 ring-blue-400/50'
        },
        COCINERO: { 
            gradient: 'bg-gradient-to-r from-orange-500 to-amber-600', 
            icon: <ChefHat size={16}/>, 
            label: 'Cocinero',
            ring: 'ring-2 ring-orange-400/50'
        },
        ENCARGADO: { 
            gradient: 'bg-gradient-to-r from-purple-500 to-indigo-600', 
            icon: <Briefcase size={16}/>, 
            label: 'Encargado',
            ring: 'ring-2 ring-purple-400/50'
        },
        CAJERO: { 
            gradient: 'bg-gradient-to-r from-green-500 to-teal-600', 
            icon: <CreditCard size={16}/>, 
            label: 'Cajero',
            ring: 'ring-2 ring-green-400/50'
        },
    };

    const config = roleConfig[role] || { 
        gradient: 'bg-gradient-to-r from-gray-500 to-gray-600', 
        icon: <User size={16}/>, 
        label: role,
        ring: 'ring-2 ring-gray-400/50'
    };

    return (
        <span className={`inline-flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-full ${config.gradient} ${config.ring} shadow-lg transform transition-transform hover:scale-105`}>
            {config.icon}
            <span>{config.label}</span>
        </span>
    );
};

// --- COMPONENTE: Modal de Formulario Mejorado ---
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
        <div className="fixed inset-0 bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in-0 duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-in zoom-in-95">
                <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-100">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                        {userToEdit ? <Edit className="w-8 h-8 text-blue-600"/> : <UserPlus className="w-8 h-8 text-blue-600"/>}
                        {userToEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nombre de Usuario */}
                    <div className="group">
                        <label className="block font-semibold text-gray-700 mb-2 text-sm">Nombre de Usuario</label>
                        <input
                            type="text"
                            name="nombreUsuario"
                            value={formData.nombreUsuario || ''}
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                            required
                            disabled={!!userToEdit}
                            placeholder="Ej: jperez"
                        />
                        {!userToEdit && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <Lock className="w-3 h-3"/> Mínimo 4 caracteres. No se puede cambiar después.
                            </p>
                        )}
                    </div>

                    {/* Nombre Completo */}
                    <div className="group">
                        <label className="block font-semibold text-gray-700 mb-2 text-sm">Nombre Completo</label>
                        <input
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto || ''}
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                            required
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    {/* Email */}
                    <div className="group">
                        <label className="block font-semibold text-gray-700 mb-2 text-sm">Email (Opcional)</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                            placeholder="Ej: juan@example.com"
                        />
                    </div>

                    {/* Contraseñas */}
                    {!userToEdit && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block font-semibold text-gray-700 mb-2 text-sm">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password || ''}
                                    onChange={handleChange}
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                    required
                                    minLength={6}
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                            <div className="group">
                                <label className="block font-semibold text-gray-700 mb-2 text-sm">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword || ''}
                                    onChange={handleChange}
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                    required
                                    placeholder="Repetir contraseña"
                                />
                            </div>
                        </div>
                    )}

                    {/* Selector de Rol */}
                    <div className="group">
                        <label className="block font-semibold text-gray-700 mb-2 text-sm">Rol del Usuario</label>
                        <select
                            name="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 cursor-pointer"
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
                        <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-sm border-l-4 border-blue-500">
                            {formData.rol === 'MESERO' && (
                                <p className="text-gray-700">✅ Puede: Tomar órdenes, gestionar clientes, marcar como servido</p>
                            )}
                            {formData.rol === 'COCINERO' && (
                                <p className="text-gray-700">✅ Puede: Ver pedidos de cocina, preparar platillos, gestionar menú</p>
                            )}
                            {formData.rol === 'CAJERO' && (
                                <p className="text-gray-700">✅ Puede: Procesar pagos, facturar órdenes, generar recibos</p>
                            )}
                            {formData.rol === 'ENCARGADO' && (
                                <p className="text-gray-700">✅ Puede: Gestionar inventario, suministros, control de stock</p>
                            )}
                            {formData.rol === 'ADMIN' && (
                                <p className="text-gray-700 font-semibold">⚠️ Acceso total al sistema. Requiere clave maestra.</p>
                            )}
                        </div>

                        {/* Advertencias */}
                        {adminExists && formData.rol !== 'ADMIN' && (
                            <p className="text-xs text-red-600 mt-2 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-4 h-4"/> Solo puede haber un Administrador en el sistema
                            </p>
                        )}
                        {encargadoExists && formData.rol !== 'ENCARGADO' && (
                            <p className="text-xs text-red-600 mt-2 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-4 h-4"/> Solo puede haber un Encargado de Inventario
                            </p>
                        )}
                    </div>

                    {/* Clave Maestra */}
                    {showMasterKey && (
                        <div className="p-5 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-xl">
                            <label className="font-bold text-yellow-800 flex items-center gap-2 mb-3">
                                <Key className="w-5 h-5"/> Clave Maestra de Administrador
                            </label>
                            <input
                                type="password"
                                name="claveMaestra"
                                onChange={handleChange}
                                className="w-full p-4 border-2 border-yellow-400 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-200"
                                required
                                placeholder="Ingrese la clave maestra"
                            />
                            <p className="text-xs text-yellow-700 mt-2 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3"/> Requerida para crear o asignar el rol de Administrador
                            </p>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold transform hover:scale-105"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-bold shadow-lg transform hover:scale-105"
                        >
                            {userToEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---
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

    const handleDesactivar = async (user: IUsuario) => {
        setMessage(null);

        if (currentUser && user.usuarioId === currentUser.usuarioId) {
             setMessage({ text: "No puedes desactivar tu propia cuenta de administrador.", type: 'error' });
             return;
        }

        try {
            const confirmation = window.confirm(
                `¿Estás seguro de DESACTIVAR al usuario ${user.nombreUsuario}?\n\nEsto lo marcará como INACTIVO y no podrá iniciar sesión.\nSus registros se mantendrán en el sistema.`
            );
            
            if (confirmation) {
                await desactivarUsuario(user.usuarioId); 
                setMessage({ text: `Usuario ${user.nombreUsuario} ha sido desactivado correctamente.`, type: 'success' });
                fetchUsers();
            }
        } catch (error: any) {
            console.error("Error desactivando usuario:", error);
            const errorMessage = error.response?.data?.mensaje || error.message || 'Error al desactivar el usuario.';
            setMessage({ text: errorMessage, type: 'error' });
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            u.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

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

    if (authLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="relative">
                    <Loader2 className="animate-spin w-16 h-16 text-blue-600" />
                    <div className="absolute inset-0 animate-ping">
                        <Loader2 className="w-16 h-16 text-blue-400 opacity-30" />
                    </div>
                </div>
                <p className="mt-6 text-gray-700 text-lg font-semibold">Verificando permisos...</p>
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-8">
            {/* Header Mejorado */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-4 mb-4">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                                    <Shield className="w-10 h-10 text-white"/>
                                </div>
                                Gestión de Usuarios
                            </h1>
                            
                            {/* Estadísticas Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <Users className="w-8 h-8 opacity-80"/>
                                        <span className="text-3xl font-bold">{userStats.total}</span>
                                    </div>
                                    <p className="text-sm mt-2 opacity-90">Total Usuarios</p>
                                </div>
                                
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <CheckCircle className="w-8 h-8 opacity-80"/>
                                        <span className="text-3xl font-bold">{userStats.activos}</span>
                                    </div>
                                    <p className="text-sm mt-2 opacity-90">Activos</p>
                                </div>
                                
                                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-4 rounded-xl text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <ChefHat className="w-8 h-8 opacity-80"/>
                                        <span className="text-3xl font-bold">{userStats.cocinero}</span>
                                    </div>
                                    <p className="text-sm mt-2 opacity-90">Cocineros</p>
                                </div>
                                
                                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-xl text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <User className="w-8 h-8 opacity-80"/>
                                        <span className="text-3xl font-bold">{userStats.mesero}</span>
                                    </div>
                                    <p className="text-sm mt-2 opacity-90">Meseros</p>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setModal({ type: 'CREATE', data: null })}
                            className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl flex items-center justify-center gap-3 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg font-bold text-lg transform hover:scale-105"
                        >
                            <UserPlus className="w-6 h-6"/> 
                            Nuevo Usuario
                        </button>
                    </div>
                </div>

                {/* Buscador Mejorado */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6"/>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, usuario o email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg"
                        />
                    </div>
                </div>

                {/* Tabla Mejorada */}
                {loadingData ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 flex flex-col justify-center items-center">
                        <div className="relative">
                            <Lock className="animate-spin text-blue-600 w-16 h-16"/>
                            <div className="absolute inset-0 animate-ping">
                                <Lock className="w-16 h-16 text-blue-400 opacity-30"/>
                            </div>
                        </div>
                        <p className="mt-6 text-gray-600 text-lg font-semibold">Cargando usuarios...</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Usuario</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Nombre Completo</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rol</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">Email</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                                        <th className="relative px-6 py-5">
                                            <span className="sr-only">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map(