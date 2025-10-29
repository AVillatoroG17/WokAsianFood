import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
    return (
        <div className="text-center my-20">
            <h1 className="text-4xl font-bold text-red-600">Acceso Denegado</h1>
            <p className="mt-4">No tienes permiso para ver esta página.</p>
            <Link to="/dashboard" className="mt-6 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
                Volver al Dashboard
            </Link>
        </div>
    );
};

export default UnauthorizedPage;
