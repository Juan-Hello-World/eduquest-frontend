import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookOpen, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoginRequest } from '../types';
import { extractErrorMessage } from '../api/axiosInstance';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      await login(data);
      toast.success('¡Bienvenido de nuevo a EduQuest!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-50 via-white to-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <BookOpen size={26} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h1>
          <p className="mt-1 text-sm text-slate-500">
            Accede a tus apuntes, grupos de estudio y planificador IA
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-slate-700">
              Nombre de usuario
            </label>
            <input
              id="username"
              type="text"
              placeholder="Ej. juanpablo"
              {...register('username', {
                required: 'El usuario es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn size={16} />
            {isSubmitting ? 'Iniciando sesión...' : 'Ingresar a EduQuest'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};