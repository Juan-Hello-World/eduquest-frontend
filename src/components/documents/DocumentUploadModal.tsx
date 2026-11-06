import React from 'react';
import { useForm } from 'react-hook-form';
import { Upload } from 'lucide-react';
import { Modal } from '../common/Modal';
import { DocumentRequest } from '../../types';

interface FormValues {
  title: string;
  description: string;
  fileUrl: string;
  tagsInput: string;
}

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDocument: (payload: DocumentRequest) => Promise<void>;
  modalTitle?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmitDocument,
  modalTitle = 'Subir Documento a la Biblioteca',
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: 'onChange' });

  const handleFormSubmit = async (values: FormValues) => {
    const tags = values.tagsInput
      ? values.tagsInput
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

    await onSubmitDocument({
      title: values.title.trim(),
      description: values.description.trim(),
      fileUrl: values.fileUrl.trim(),
      tags,
    });
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Título del material</label>
          <input
            type="text"
            placeholder="Ej. Resumen Cálculo II - Integrales Múltiples"
            {...register('title', {
              required: 'El título es obligatorio',
              maxLength: { value: 150, message: 'Máximo 150 caracteres' },
            })}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Descripción</label>
          <textarea
            rows={3}
            placeholder="Describe brevemente el contenido del documento o ejercicios resueltos..."
            {...register('description')}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Enlace del archivo (Google Drive, OneDrive, GitHub, PDF)
          </label>
          <input
            type="url"
            placeholder="https://drive.google.com/file/..."
            {...register('fileUrl', {
              required: 'La URL del archivo es obligatoria',
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'La URL debe comenzar con http:// o https://',
              },
            })}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
          {errors.fileUrl && <p className="mt-1 text-xs text-red-600">{errors.fileUrl.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Etiquetas separadas por coma (opcional)
          </label>
          <input
            type="text"
            placeholder="calculo, examen, parcial, algoritmos"
            {...register('tagsInput')}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
          >
            <Upload size={14} />
            {isSubmitting ? 'Publicando...' : 'Publicar Documento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};