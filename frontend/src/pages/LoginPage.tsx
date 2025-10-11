import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const auth = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (nombreUsuario.length < 3 || password.length < 6) {
            setError('Por favor, ingresa credenciales válidas.');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            // ✅ Ahora usa el método login del AuthContext que se conecta al backend
            await auth.login(nombreUsuario, password);
            
            // Navegar a la raíz protegida después del login exitoso
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-xl shadow-2xl overflow-hidden">
                {/* Columna Izquierda: Branding */}
                <div className="w-full md:w-2/5 bg-gradient-to-tr from-red-600 to-orange-500 p-12 text-white flex flex-col justify-center items-center text-center">
                    <h1 className="text-4xl font-bold mb-2">Wok Asian Food</h1>
                    <p className="text-lg">Sistema de Gestión Restaurante</p>
                </div>

                {/* Columna Derecha: Formulario */}
                <div className="w-full md:w-3/5 bg-white p-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido</h2>
                    <p className="text-gray-500 mb-8">Ingresa tus credenciales para acceder</p>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-gray-700">Usuario</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                <input 
                                    type="text" 
                                    value={nombreUsuario} 
                                    onChange={e => setNombreUsuario(e.target.value)} 
                                    className="w-full pl-10 p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500" 
                                    placeholder="Ingresa tu usuario"
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-gray-700">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    className="w-full pl-10 p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500" 
                                    placeholder="Ingresa tu contraseña"
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-orange-500 text-white p-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center disabled:bg-orange-300 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20}/>
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>
                    
                    {/* Información de ayuda para desarrollo */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-semibold mb-2">💡 Nota de desarrollo:</p>
                        <p className="text-xs text-blue-700">
                            Usa las credenciales registradas en tu base de datos para iniciar sesión.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;