import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FileText,
  Calendar,
  Plus,
  Video,
  Lock,
  UserPlus,
  Clock,
} from 'lucide-react';
import { groupService } from '../api/groupService';
import { extractErrorMessage } from '../api/axiosInstance';
import {
  DocumentRequest,
  DocumentResponse,
  GroupResponse,
  StudySessionRequest,
  StudySessionResponse,
} from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/EmptyState';
import { PaginationBar } from '../components/common/PaginationBar';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { ReviewModal } from '../components/documents/ReviewModal';
import { ScheduleSessionModal } from '../components/groups/ScheduleSessionModal';
import axios from 'axios';

export const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const location = useLocation();
  const numericGroupId = Number(groupId);

  const groupFromState = (location.state as { group?: GroupResponse })?.group;

  const [activeTab, setActiveTab] = useState<'docs' | 'sessions'>('docs');
  const [isForbidden, setIsForbidden] = useState(false);

  // Estado de documentos privados del grupo
  const [docs, setDocs] = useState<DocumentResponse[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Estado de sesiones de estudio
  const [sessions, setSessions] = useState<StudySessionResponse[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Modales
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedDocForReview, setSelectedDocForReview] = useState<DocumentResponse | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!numericGroupId) return;
    const controller = new AbortController();
    setLoadingDocs(true);
    setIsForbidden(false);

    groupService
      .getGroupDocuments(numericGroupId, page, size, controller.signal)
      .then((res) => {
        setDocs(res.content);
        setTotalElements(res.totalElements);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (err.name === 'CanceledError') return;
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setIsForbidden(true);
        } else {
          toast.error(extractErrorMessage(err));
        }
      })
      .finally(() => setLoadingDocs(false));

    return () => controller.abort();
  }, [numericGroupId, page, size, refreshTick]);

  useEffect(() => {
    if (!numericGroupId || activeTab !== 'sessions' || isForbidden) return;
    const controller = new AbortController();
    setLoadingSessions(true);

    groupService
      .getGroupSessions(numericGroupId, controller.signal)
      .then((data) => setSessions(data))
      .catch((err) => {
        if (err.name !== 'CanceledError') {
          toast.error(extractErrorMessage(err));
        }
      })
      .finally(() => setLoadingSessions(false));

    return () => controller.abort();
  }, [numericGroupId, activeTab, isForbidden, refreshTick]);

  const handleJoinNow = async () => {
    try {
      await groupService.joinGroup(numericGroupId);
      toast.success('¡Ahora eres miembro de este grupo!');
      setIsForbidden(false);
      setRefreshTick((t) => t + 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleUploadGroupDoc = async (payload: DocumentRequest) => {
    try {
      await groupService.uploadDocumentToGroup(numericGroupId, payload);
      toast.success('¡Documento compartido en el grupo!');
      setRefreshTick((t) => t + 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
      throw error;
    }
  };

  const handleScheduleSession = async (payload: StudySessionRequest) => {
    try {
      await groupService.scheduleSession(numericGroupId, payload);
      toast.success('¡Sesión de estudio programada!');
      setRefreshTick((t) => t + 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
      throw error;
    }
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Grupos Privados', to: '/groups' },
          { label: groupFromState?.name || `Grupo #${numericGroupId}` },
        ]}
      />

      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {groupFromState?.name || `Espacio del Grupo #${numericGroupId}`}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {groupFromState?.description ||
              'Repositorio privado de documentos y calendario de sesiones de estudio del grupo.'}
          </p>
        </div>

        {!isForbidden && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={15} /> Subir Documento al Grupo
            </button>
            <button
              type="button"
              onClick={() => setIsSessionModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              <Calendar size={15} /> Agendar Sesión
            </button>
          </div>
        )}
      </div>

      {isForbidden ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50/60 p-10 text-center">
          <div className="mb-3 rounded-full bg-amber-100 p-3 text-amber-700">
            <Lock size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Contenido Exclusivo para Miembros</h2>
          <p className="mt-1 max-w-md text-xs text-slate-600">
            Por seguridad, solo los integrantes de este grupo privado pueden acceder a sus apuntes y enlaces de videollamada.
          </p>
          <button
            type="button"
            onClick={handleJoinNow}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <UserPlus size={16} /> Unirme a este Grupo Ahora
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('docs')}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === 'docs'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText size={15} /> Documentos del Grupo ({totalElements})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === 'sessions'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar size={15} /> Sesiones de Estudio
            </button>
          </div>

          {activeTab === 'docs' ? (
            loadingDocs ? (
              <SkeletonCard count={3} />
            ) : docs.length === 0 ? (
              <EmptyState
                title="Aún no hay documentos en este grupo"
                description="Comparte el primer apunte o guía exclusiva con los miembros del grupo."
                actionLabel="Subir Documento al Grupo"
                onAction={() => setIsUploadOpen(true)}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {docs.map((d) => (
                    <DocumentCard
                      key={d.id}
                      document={d}
                      onOpenReviews={(doc) => setSelectedDocForReview(doc)}
                    />
                  ))}
                </div>
                <PaginationBar
                  page={page}
                  size={size}
                  totalElements={totalElements}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onSizeChange={(newSize) => {
                    setSize(newSize);
                    setPage(0);
                  }}
                />
              </>
            )
          ) : loadingSessions ? (
            <SkeletonCard count={3} />
          ) : sessions.length === 0 ? (
            <EmptyState
              title="No hay sesiones programadas"
              description="Agenda una reunión de repaso grupal con enlace a Google Meet, Zoom o Discord."
              actionLabel="Agendar Sesión"
              onAction={() => setIsSessionModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-indigo-600 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} /> {new Date(s.scheduledAt).toLocaleString()}
                      </span>
                      <span>{s.groupName}</span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900">{s.title}</h3>
                    <p className="mt-1 text-xs text-slate-600">
                      {s.description || 'Sesión sincrónica de estudio grupal.'}
                    </p>
                  </div>

                  {s.meetingUrl && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                      <a
                        href={s.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <Video size={14} /> Unirse a la Llamada
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmitDocument={handleUploadGroupDoc}
        modalTitle="Subir Documento Privado al Grupo"
      />

      <ScheduleSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSchedule={handleScheduleSession}
      />

      <ReviewModal
        document={selectedDocForReview}
        onClose={() => setSelectedDocForReview(null)}
      />
    </div>
  );
};