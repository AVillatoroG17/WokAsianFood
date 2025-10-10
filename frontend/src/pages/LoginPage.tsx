import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';


// --- SIMULACIÓN DE API MEJORADA ---

// Helper para crear un token JWT simulado y codificado en base64
const createMockToken = (payload: object): string => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    return `${encodedHeader}.${encodedPayload}.fake-signature`;
};

// Simulación de la API de login con tokens completos
const api = {
    login: async (nombreUsuario: string, password: string): Promise<{ token: string }> => {
        console.log(`API POST: /api/auth/login con usuario: ${nombreUsuario}`);
        if (password !== 'password') {
            return Promise.reject({ message: 'Usuario o contraseña incorrectos' });
        }

        const exp = Math.floor(Date.now() / 1000) + (60 * 60); // Expira en 1 hora
        let payload: object | null = null;

        switch (nombreUsuario) {
            case 'admin':
                payload = { userId: 1, username: 'admin', nombreCompleto: 'Admin General', role: 'ADMIN', exp };
                break;
            case 'mesero':
                payload = { userId: 2, username: 'mesero', nombreCompleto: 'Carlos Gómez', role: 'MESERO', exp };
                break;
            case 'cocinero':
                payload = { userId: 3, username: 'cocinero', nombreCompleto: 'Ana Flores', role: 'COCINERO', exp };
                break;
            case 'encargado':
                payload = { userId: 4, username: 'encargado', nombreCompleto: 'Luis Paz', role: 'ENCARGADO', exp };
                break;
            default:
                return Promise.reject({ message: 'Usuario o contraseña incorrectos' });
        }

        const token = createMockToken(payload);
        return Promise.resolve({ token });
    }
};

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
            const { token } = await api.login(nombreUsuario, password);
            auth.login(token);
            // Solución: Navegar a la raíz protegida. El Dashboard se encargará de redirigir.
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
                    
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-gray-700">Usuario</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                <input type="text" value={nombreUsuario} onChange={e => setNombreUsuario(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white p-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center disabled:bg-orange-300">
                            {loading ? <Loader2 className="animate-spin"/> : 'Iniciar Sesión'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;