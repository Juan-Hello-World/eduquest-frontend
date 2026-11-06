import React from 'react';
import { useForm } from 'react-hook-form';
import { CalendarPlus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { StudySessionRequest } from '../../types';

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (payload: StudySessionRequest) => Promise<void>;
}

export const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudySessionRequest>({ mode: 'onChange' });

  const onSubmit = async (values: StudySessionRequest) => {
    const formattedDate =
      values.scheduledAt.length === 16 ? `${values.scheduledAt}:00` : values.scheduledAt;

    await onSchedule({
      title: values.title.trim(),
      description: values.description?.trim() || '',
      scheduledAt: formattedDate,
      meetingUrl: values.meetingUrl?.trim() || undefined,
    });
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agendar Sesión de Estudio">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Título de la sesión</label>
          <input
            type="text"
            placeholder="Ej. Repaso Final de Base de Datos"
            {...register('title', {
              required: 'El título es obligatorio',
              maxLength: { value: 150, message: 'Máximo 150 caracteres' },
            })}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Descripción / Temas</label>
          <textarea
            rows={2}
            placeholder="Resolveremos exámenes pasados..."
            {...register('description')}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Fecha y Hora (Futura)</label>
          <input
            type="datetime-local"
            {...register('scheduledAt', {
              required: 'Selecciona la fecha y hora de la sesión',
            })}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
          {errors.scheduledAt && (
            <p className="mt-1 text-xs text-red-600">{errors.scheduledAt.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Enlace de Videollamada (Meet, Zoom, Discord)
          </label>
          <input
            type="url"
            placeholder="https://meet.google.com/abc-defg-hij"
            {...register('meetingUrl', {
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'El enlace debe comenzar con http:// o https://',
              },
            })}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
          {errors.meetingUrl && (
            <p className="mt-1 text-xs text-red-600">{errors.meetingUrl.message}</p>
          )}
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
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <CalendarPlus size={14} />
            {isSubmitting ? 'Agendando...' : 'Programar Sesión'}
          </button>
        </div>
      </form>
    </Modal>
  );
};