import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { groupService } from '../api/groupService';
import { extractErrorMessage } from '../api/axiosInstance';
import { GroupRequest, GroupResponse } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/EmptyState';
import { PaginationBar } from '../components/common/PaginationBar';
import { Modal } from '../components/common/Modal';
import { GroupCard } from '../components/groups/GroupCard';

export const GroupsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(searchParams.get('page') || 0);
  const size = Number(searchParams.get('size') || 10);

  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GroupRequest>({ mode: 'onChange' });

  const fetchGroups = (signal?: AbortSignal) => {
    setLoading(true);
    groupService
      .getAllGroups(page, size, signal)
      .then((res) => {
        setGroups(res.content);
        setTotalElements(res.totalElements);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError') {
          toast.error(extractErrorMessage(err));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchGroups(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const handleJoinGroup = async (groupId: number) => {
    try {
      setJoiningId(groupId);
      const joined = await groupService.joinGroup(groupId);
      toast.success(`¡Te uniste al grupo "${joined.name}"!`);
      navigate(`/groups/${groupId}`, { state: { group: joined } });
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreateGroup = async (values: GroupRequest) => {
    try {
      const created = await groupService.createGroup(values);
      toast.success(`Grupo "${created.name}" creado exitosamente`);
      reset();
      setIsCreateOpen(false);
      navigate(`/groups/${created.id}`, { state: { group: created } });
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Grupos Privados' }]} />

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Grupos Privados de Estudio</h1>
          <p className="text-sm text-slate-500">
            Únete a comunidades de tu curso para compartir material privado y agendar sesiones
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
        >
          <Plus size={16} /> Crear Grupo
        </button>
      </div>

      {loading ? (
        <SkeletonCard count={6} />
      ) : groups.length === 0 ? (
        <EmptyState
          title="No hay grupos creados todavía"
          description="Crea el primer grupo privado para tu curso e invita a tus compañeros."
          actionLabel="Crear Grupo"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <GroupCard
                key={g.id}
                group={g}
                onJoin={handleJoinGroup}
                joiningId={joiningId}
              />
            ))}
          </div>

          <PaginationBar
            page={page}
            size={size}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={(p) => setSearchParams({ page: String(p), size: String(size) })}
            onSizeChange={(s) => setSearchParams({ page: '0', size: String(s) })}
          />
        </>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Crear Nuevo Grupo de Estudio"
      >
        <form onSubmit={handleSubmit(handleCreateGroup)} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Nombre del grupo</label>
            <input
              type="text"
              placeholder="Ej. DBP 2026-2 - Equipo Proyecto"
              {...register('name', {
                required: 'El nombre del grupo es obligatorio',
                maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Descripción</label>
            <textarea
              rows={3}
              placeholder="Objetivos del grupo, horario de reuniones..."
              {...register('description')}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear Grupo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};