import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Tag, X } from 'lucide-react';
import { documentService } from '../api/documentService';
import { extractErrorMessage } from '../api/axiosInstance';
import { DocumentRequest, DocumentResponse } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/EmptyState';
import { PaginationBar } from '../components/common/PaginationBar';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { ReviewModal } from '../components/documents/ReviewModal';

export const ExploreDocumentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') || 0);
  const size = Number(searchParams.get('size') || 10);
  const tagParam = searchParams.get('tag') || '';
  const initialSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocForReview, setSelectedDocForReview] = useState<DocumentResponse | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  // Sincroniza el texto con debounce hacia los query params
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch.trim()) {
      next.set('search', debouncedSearch.trim());
    } else {
      next.delete('search');
    }
    next.set('page', '0');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    documentService
      .getPublicDocuments(
        { page, size, search: debouncedSearch, tag: tagParam },
        controller.signal
      )
      .then((res) => {
        setDocuments(res.content);
        setTotalElements(res.totalElements);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError') {
          toast.error(extractErrorMessage(err));
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, size, debouncedSearch, tagParam, refreshTick]);

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const handleSizeChange = (newSize: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('size', String(newSize));
    next.set('page', '0');
    setSearchParams(next);
  };

  const handleTagFilter = (tag: string) => {
    const next = new URLSearchParams(searchParams);
    if (tag) {
      next.set('tag', tag);
    } else {
      next.delete('tag');
    }
    next.set('page', '0');
    setSearchParams(next);
  };

  const handleUploadDocument = async (payload: DocumentRequest) => {
    try {
      await documentService.uploadPublicDocument(payload);
      toast.success('¡Documento publicado en la biblioteca!');
      setRefreshTick((t) => t + 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
      throw error;
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Biblioteca Pública' }]} />

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Biblioteca Pública de Recursos</h1>
          <p className="text-sm text-slate-500">
            Encuentra apuntes, guías y exámenes compartidos por estudiantes
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
        >
          <Plus size={16} /> Subir Documento
        </button>
      </div>

      {/* Barra de búsqueda y filtro por tag */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className=" pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por título o descripción (ej. Cálculo, Algoritmos)..."
            className="w-full rounded-xl border border-slate-200 py-2 pr-4 pl-10 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        {tagParam && (
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            <Tag size={13} /> Etiqueta: #{tagParam}
            <button
              type="button"
              onClick={() => handleTagFilter('')}
              className="ml-1 rounded-full p-0.5 hover:bg-indigo-100"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonCard count={6} />
      ) : documents.length === 0 ? (
        <EmptyState
          title="No se encontraron documentos"
          description="Prueba ajustando tu búsqueda o sube el primer recurso académico para este tema."
          actionLabel="Subir Documento"
          onAction={() => setIsUploadOpen(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onOpenReviews={(d) => setSelectedDocForReview(d)}
                onTagClick={handleTagFilter}
              />
            ))}
          </div>

          <PaginationBar
            page={page}
            size={size}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onSizeChange={handleSizeChange}
          />
        </>
      )}

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmitDocument={handleUploadDocument}
      />

      <ReviewModal
        document={selectedDocForReview}
        onClose={() => setSelectedDocForReview(null)}
      />
    </div>
  );
};