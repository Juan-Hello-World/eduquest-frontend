import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-xs text-slate-500">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 font-medium text-slate-600 transition hover:text-indigo-600"
      >
        <Home size={14} /> Inicio
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="mx-1.5 text-slate-400" />
          {item.to ? (
            <Link to={item.to} className="font-medium text-slate-600 hover:text-indigo-600">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};