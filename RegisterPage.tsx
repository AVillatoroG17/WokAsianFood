import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Lock, Mail, Shield, Loader2, UserPlus, CheckCircle, XCircle, AlertTriangle, ChefHat, Briefcase, CreditCard } from 'lucide-react';

// Simulación de API de registro
const api = {
    register: async (data: any): Promise<{ mensaje: string, usuarioId: number }> => {
        console.log('API POST: /api/usuarios', data);
        // Simular validación de usuario existente
        if (data.nombreUsuario === 'admin') {
            return Promise.reject({ message: 'El nombre de usuario ya existe.' });
        }
        return Promise.resolve({ mensaje: `Usuario ${data.nombreUsuario} creado exitosamente`, usuarioId: Date.now() });
    }
};

// --- COMPONENTE: Indicador de Fortaleza de Contraseña ---
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
    const strength = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);

    const config = [
        { label: 'Muy débil', color: 'bg-red-500', textColor: 'text-red-700' },
        { label: 'Débil', color: 'bg-orange-500', textColor: 'text-orange-700' },
        { label: 'Aceptable', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
        { label: 'Fuerte', color: 'bg-green-500', textColor: 'text-green-700' }
    ];

    const currentConfig = config[strength - 1] || { label: 'Sin contraseña', color: 'bg-gray-300', textColor: 'text-gray-500' };
    const width = `${(strength / 4) * 100}%`;

    if (!password) return null;

    return (
        <div className="mt-3 space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                    className={`${currentConfig.color} h-3 rounded-full transition-all duration-500 shadow-lg`} 
                    style={{ width }}
                />
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
                <span className={currentConfig.textColor}>Fortaleza: {currentConfig.label}</span>
                <div className="flex gap-2 text-gray-500">
                    {password.length >= 8 && <span className="text-green-600">✓ 8+ caracteres</span>}
                    {/[A-Z]/.test(password) && <span className="text-green-600">✓ Mayúscula</span>}
                    {/[0-9]/.test(password) && <span className="text-green-600">✓ Número</span>}
                    {/[^A-Za-z0-9]/.test(password) && <span className="text-green-600">✓ Especial</span>}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE: Mensaje de Alerta ---
const AlertMessage: React.FC<{ type: 'error' | 'success', message: string, onClose: () => void }> = ({ type, message, onClose }) => {
    const isError = type === 'error';
    const bgGradient = isError 
        ? 'bg-gradient-to-r from-red-500 to-pink-600' 
        : 'bg-gradient-to-r from-green-500 to-emerald-600';
    const Icon = isError ? XCircle : CheckCircle;

    return (
        <div className={`${bgGradient} text-white p-5 rounded-2xl mb-6 flex items-center gap-4 shadow-xl animate-in slide-in-from-top-5 duration-500`}>
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                <Icon className="w-6 h-6" strokeWidth={2.5}/>
            </div>
            <div className="flex-1">
                <p className="font-black text-lg">{isError ? '¡Error!' : '¡Éxito!'}</p>
                <p className="text-sm opacity-95">{message}</p>
            </div>
            <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-all"
            >
                <XCircle className="w-5 h-5" strokeWidth={2.5}/>
            </button>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---
const RegisterPage: React.FC = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ 
        nombreUsuario: '', 
        nombreCompleto: '', 
        email: '', 
        password: '', 
        confirmPassword: '', 
        rol: 'MESERO' 
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    if (user?.rol !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const { mensaje } = await api.register(formData);
            setSuccess(mensaje);
            // Reset form
            setFormData({ 
                nombreUsuario: '', 
                nombreCompleto: '', 
                email: '', 
                password: '', 
                confirmPassword: '', 
                rol: 'MESERO' 
            });
        } catch (err: any) {
            setError(err.message || 'Error al registrar el usuario.');
        } finally {
            setLoading(false);
        }
    };

    const roleConfig = {
        MESERO: { 
            icon: <User className="w-5 h-5" strokeWidth={2.5}/>, 
            label: 'Mesero',
            description: 'Toma órdenes y gestiona mesas',
            gradient: 'from-blue-500 to-cyan-600'
        },
        COCINERO: { 
            icon: <ChefHat className="w-5 h-5" strokeWidth={2.5}/>, 
            label: 'Cocinero',
            description: 'Prepara platillos y gestiona cocina',
            gradient: 'from-orange-500 to-amber-600'
        },
        ENCARGADO: { 
            icon: <Briefcase className="w-5 h-5" strokeWidth={2.5}/>, 
            label: 'Encargado de Inventario',
            description: 'Gestiona suministros y stock',
            gradient: 'from-purple-500 to-indigo-600'
        },
        CAJERO: { 
            icon: <CreditCard className="w-5 h-5" strokeWidth={2.5}/>, 
            label: 'Cajero',
            description: 'Procesa pagos y factura',
            gradient: 'from-green-500 to-emerald-600'
        },
        ADMIN: { 
            icon: <Shield className="w-5 h-5" strokeWidth={2.5}/>, 
            label: 'Administrador',
            description: 'Acceso total al sistema',
            gradient: 'from-red-500 to-pink-600'
        }
    };

    const selectedRole = roleConfig[formData.rol as keyof typeof roleConfig] || roleConfig.MESERO;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-3xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-t-3xl shadow-2xl p-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                            <UserPlus className="w-10 h-10 text-white" strokeWidth={2.5}/>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black mb-2">Registrar Nuevo Usuario</h1>
                            <p className="text-white/90 text-base font-semibold">
                                Crea una nueva cuenta de usuario para el sistema
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="bg-white rounded-b-3xl shadow-2xl p-8 border-x border-b border-gray-200">
                    {/* Mensajes de alerta */}
                    {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
                    {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nombre de Usuario */}
                        <div className="group">
                            <label className="block font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" strokeWidth={2.5}/> Nombre de Usuario
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" strokeWidth={2}/>
                                <input 
                                    type="text" 
                                    name="nombreUsuario" 
                                    value={formData.nombreUsuario} 
                                    onChange={handleChange}
                                    placeholder="usuario123"
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 font-medium"
                                    required 
                                    minLength={4}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Mínimo 4 caracteres, sin espacios</p>
                        </div>

                        {/* Nombre Completo */}
                        <div className="group">
                            <label className="block font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-600" strokeWidth={2.5}/> Nombre Completo
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" strokeWidth={2}/>
                                <input 
                                    type="text" 
                                    name="nombreCompleto" 
                                    value={formData.nombreCompleto} 
                                    onChange={handleChange}
                                    placeholder="Juan Pérez González"
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 font-medium"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="group">
                            <label className="block font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4 text-green-600" strokeWidth={2.5}/> Email (Opcional)
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" strokeWidth={2}/>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange}
                                    placeholder="usuario@restaurant.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200 font-medium"
                                />
                            </div>
                        </div>

                        {/* Selector de Rol */}
                        <div className="group">
                            <label className="block font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                                <Shield className="w-4 h-4 text-indigo-600" strokeWidth={2.5}/> Rol del Usuario
                            </label>
                            <div className="relative">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" strokeWidth={2}/>
                                <select 
                                    name="rol" 
                                    value={formData.rol} 
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 appearance-none cursor-pointer font-bold"
                                >
                                    <option value="MESERO">👤 Mesero</option>
                                    <option value="COCINERO">👨‍🍳 Cocinero</option>
                                    <option value="CAJERO">💳 Cajero</option>
                                    <option value="ENCARGADO">📦 Encargado de Inventario</option>
                                    <option value="ADMIN">🛡️ Administrador</option>
                                </select>
                            </div>

                            {/* Card de descripción del rol */}
                            <div className={`mt-4 p-5 bg-gradient-to-r ${selectedRole.gradient} rounded-2xl text-white shadow-lg`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                                        {selectedRole.icon}
                                    </div>
                                    <h3 className="font-black text-lg">{selectedRole.label}</h3>
                                </div>
                                <p className="text-sm font-semibold opacity-95">{selectedRole.description}</p>
                            </div>
                        </div>

                        {/* Contraseñas en grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                            {/* Contraseña */}
                            <div className="group">
                                <label className="block font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-blue-600" strokeWidth={2.5}/> Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" strokeWidth={2}/>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 font-medium"
                                        required 
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {/* Confirmar Contraseña */}
                            <div className="group">
                                <label className="block font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-purple-600" strokeWidth={2.5}/> Confirmar
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" strokeWidth={2}/>
                                    <input 
                                        type="password" 
                                        name="confirmPassword" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 font-medium"
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Indicador de fortaleza - ancho completo */}
                            <div className="md:col-span-2">
                                <PasswordStrengthIndicator password={formData.password} />
                            </div>
                        </div>

                        {/* Validación visual de contraseñas */}
                        {formData.password && formData.confirmPassword && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${
                                formData.password === formData.confirmPassword 
                                    ? 'bg-green-100 border-2 border-green-300' 
                                    : 'bg-red-100 border-2 border-red-300'
                            }`}>
                                {formData.password === formData.confirmPassword ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2.5}/>
                                        <span className="font-bold text-green-700">Las contraseñas coinciden</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-5 h-5 text-red-600" strokeWidth={2.5}/>
                                        <span className="font-bold text-red-700">Las contraseñas no coinciden</span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Botón de envío */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-black text-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin w-6 h-6" strokeWidth={2.5}/>
                                    <span>Registrando Usuario...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-6 h-6" strokeWidth={2.5}/>
                                    <span>Registrar Usuario</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;