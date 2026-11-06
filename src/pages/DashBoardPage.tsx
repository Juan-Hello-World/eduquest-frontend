import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { documentService } from '../api/documentService';
import { groupService } from '../api/groupService';
import { studyPlanService } from '../api/studyPlanService';

export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ docs: 0, groups: 0, plans: 0 });

  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([
      documentService.getPublicDocuments({ page: 0, size: 1 }, controller.signal),
      groupService.getAllGroups(0, 1, controller.signal),
      studyPlanService.getMyPlans(controller.signal),
    ]).then(([docsRes, groupsRes, plansRes]) => {
      setStats({
        docs: docsRes.status === 'fulfilled' ? docsRes.value.totalElements : 0,
        groups: groupsRes.status === 'fulfilled' ? groupsRes.value.totalElements : 0,
        plans: plansRes.status === 'fulfilled' ? plansRes.value.length : 0,
      });
    });

    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-linear-to-r from-indigo-600 to-violet-600 p-8 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck size={14} /> Plataforma Académica Colaborativa
            </span>
            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
              ¡Hola, {user?.username}! 👋
            </h1>
            <p className="mt-1 max-w-xl text-sm text-indigo-100">
              Explora apuntes verificados por la comunidad, colabora en grupos privados de estudio y genera rutas de aprendizaje personalizadas con IA.
            </p>
          </div>
          <Link
            to="/study-planner"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-xs transition hover:bg-indigo-50"
          >
            <Sparkles size={16} /> Generar Plan con IA
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Documentos Públicos</span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <FileText size={20} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{stats.docs}</p>
          <Link
            to="/documents"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
          >
            Ir a la biblioteca <ArrowRight size={13} />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Grupos de Estudio</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <Users size={20} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{stats.groups}</p>
          <Link
            to="/groups"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
          >
            Explorar grupos <ArrowRight size={13} />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Mis Planes de Estudio IA</span>
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
              <Sparkles size={20} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{stats.plans}</p>
          <Link
            to="/study-planner"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline"
          >
            Ver mi historial <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {isAdmin && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs text-amber-900">
          Tienes privilegios de <strong>ROLE_ADMIN</strong>. Puedes gestionar roles de usuarios desde la pestaña Admin en la barra superior.
        </div>
      )}
    </div>
  );
};