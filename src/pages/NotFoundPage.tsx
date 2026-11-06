import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 rounded-2xl bg-indigo-50 p-4 text-indigo-600">
        <Compass size={40} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="mt-2 text-base font-semibold text-slate-700">Página no encontrada</p>
      <p className="mt-1 max-w-md text-xs text-slate-500">
        La ruta que intentas visitar no existe o fue movida dentro de EduQuest.
      </p>
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
      >
        Volver al Dashboard
      </button>
    </div>
  );
};