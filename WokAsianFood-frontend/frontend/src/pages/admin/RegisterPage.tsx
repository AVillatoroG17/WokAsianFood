
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Lock, Mail, Shield, Loader2 } from 'lucide-react';

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

const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
    const strength = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);

    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const width = `${(strength / 4) * 100}%`;

    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`${colors[strength-1] || 'bg-gray-200'} h-2.5 rounded-full transition-all`} style={{ width }}></div>
        </div>
    );
};

const RegisterPage: React.FC = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ nombreUsuario: '', nombreCompleto: '', email: '', password: '', confirmPassword: '', rol: 'MESERO' });
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
        // Aquí irían más validaciones de fortaleza, etc.
        setLoading(true);
        try {
            const { mensaje } = await api.register(formData);
            setSuccess(mensaje);
            // Reset form
            setFormData({ nombreUsuario: '', nombreCompleto: '', email: '', password: '', confirmPassword: '', rol: 'MESERO' });
        } catch (err: any) {
            setError(err.message || 'Error al registrar el usuario.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold mb-6">Registrar Nuevo Usuario</h1>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{success}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* ... campos del formulario ... */}
                     <div>
                        <label className="block text-gray-700">Rol</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                            <select name="rol" value={formData.rol} onChange={handleChange} className="w-full pl-10 p-3 border rounded-lg appearance-none">
                                <option value="MESERO">Mesero</option>
                                <option value="COCINERO">Cocinero</option>
                                <option value="ENCARGADO">Encargado de Inventario</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700">Contraseña</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 border rounded-lg" required />
                        <PasswordStrengthIndicator password={formData.password} />
                    </div>
                    <div>
                        <label className="block text-gray-700">Confirmar Contraseña</label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full p-3 border rounded-lg" required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center disabled:bg-blue-400">
                        {loading ? <Loader2 className="animate-spin"/> : 'Registrar Usuario'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
