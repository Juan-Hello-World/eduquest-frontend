import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
}

const PAGE_SIZES = [10, 25, 50, 100];

export const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
}) => {
  if (totalElements === 0) return null;

  const startItem = page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

  const pages = Array.from({ length: totalPages }, (_, i) => i).slice(
    Math.max(0, page - 2),
    Math.min(totalPages, page + 3)
  );

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span>
          Mostrando <strong className="font-semibold text-slate-900">{startItem}</strong> -{' '}
          <strong className="font-semibold text-slate-900">{endItem}</strong> de{' '}
          <strong className="font-semibold text-slate-900">{totalElements}</strong> resultados
        </span>
        <div className="flex items-center gap-1.5">
          <label htmlFor="pageSize" className="text-xs text-slate-500">
            Filas:
          </label>
          <select
            id="pageSize"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} /> Anterior
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
              p === page
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p + 1}
          </button>
        ))}

        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};