import React from 'react';
import { ExternalLink, FileText, MessageSquarePlus, Tag, User } from 'lucide-react';
import { DocumentResponse } from '../../types';

interface DocumentCardProps {
  document: DocumentResponse;
  onOpenReviews: (doc: DocumentResponse) => void;
  onTagClick?: (tag: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onOpenReviews,
  onTagClick,
}) => {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-200 hover:shadow-md">
      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="rounded-lg bg-indigo-50 p-2">
              <FileText size={18} />
            </div>
            <span className="text-xs font-semibold text-indigo-700">
              {document.groupName ? `Grupo: ${document.groupName}` : 'Público'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <User size={12} /> {document.authorUsername}
          </span>
        </div>

        <h3 className="line-clamp-1 text-base font-bold text-slate-900" title={document.title}>
          {document.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">
          {document.description || 'Sin descripción adicional.'}
        </p>

        {document.tags && document.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {document.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick?.(tag)}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Tag size={10} /> {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onOpenReviews(document)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <MessageSquarePlus size={14} /> Reseñas
        </button>

        <a
          href={document.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-600 hover:text-white"
        >
          Abrir Recurso <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};