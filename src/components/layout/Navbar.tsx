import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Users, Sparkles, ShieldAlert, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <NavLink to="/dashboard" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
            <BookOpen size={24} />
            <span>EduQuest</span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            <NavLink to="/documents" className={navLinkClass}>
              <FileText size={16} /> Biblioteca Pública
            </NavLink>
            <NavLink to="/groups" className={navLinkClass}>
              <Users size={16} /> Grupos Privados
            </NavLink>
            <NavLink to="/study-planner" className={navLinkClass}>
              <Sparkles size={16} /> Planificador IA
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin/users" className={navLinkClass}>
                <ShieldAlert size={16} /> Admin
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="text-xs font-semibold text-slate-800">{user.username}</p>
                <p className="text-[11px] text-slate-500">
                  {isAdmin ? 'Administrador' : 'Estudiante'}
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>

      {/* Navegación móvil inferior/compacta */}
      <nav className="flex items-center justify-around border-t border-slate-100 px-2 py-1.5 md:hidden">
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboard size={15} /> Inicio
        </NavLink>
        <NavLink to="/documents" className={navLinkClass}>
          <FileText size={15} /> Docs
        </NavLink>
        <NavLink to="/groups" className={navLinkClass}>
          <Users size={15} /> Grupos
        </NavLink>
        <NavLink to="/study-planner" className={navLinkClass}>
          <Sparkles size={15} /> IA
        </NavLink>
      </nav>
    </header>
  );
};