import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Star, Send } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Spinner } from '../common/Spinner';
import { DocumentResponse, ReviewResponse } from '../../types';
import { documentService } from '../../api/documentService';
import { extractErrorMessage } from '../../api/axiosInstance';

interface ReviewFormValues {
  rating: number;
  comment: string;
}

interface ReviewModalProps {
  document: DocumentResponse | null;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ document, onClose }) => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    defaultValues: { rating: 5, comment: '' },
  });

  useEffect(() => {
    if (!document) return;
    const controller = new AbortController();
    setLoading(true);

    documentService
      .getReviewsByDocument(document.id, controller.signal)
      .then((data) => setReviews(data))
      .catch((err) => {
        if (err.name !== 'CanceledError') {
          toast.error(extractErrorMessage(err));
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [document]);

  if (!document) return null;

  const onSubmit = async (values: ReviewFormValues) => {
    try {
      const created = await documentService.createReview({
        documentId: document.id,
        rating: Number(values.rating),
        comment: values.comment.trim(),
      });
      setReviews((prev) => [created, ...prev]);
      reset({ rating: 5, comment: '' });
      toast.success('¡Reseña publicada!');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={Boolean(document)} onClose={onClose} title={`Reseñas: ${document.title}`}>
      <div className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl bg-slate-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Calificación (1 a 5)</label>
            <select
              {...register('rating', { required: true })}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-600"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {'★'.repeat(n)} ({n}/5)
                </option>
              ))}
            </select>
          </div>

          <div>
            <textarea
              rows={2}
              placeholder="¿Qué te pareció este material de estudio?"
              {...register('comment', {
                required: 'Escribe un comentario breve',
                maxLength: { value: 500, message: 'Máximo 500 caracteres' },
              })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.comment && (
              <p className="mt-1 text-xs text-red-600">{errors.comment.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={12} /> {isSubmitting ? 'Enviando...' : 'Publicar Reseña'}
            </button>
          </div>
        </form>

        <div className="max-h-60 space-y-2.5 overflow-y-auto pr-1">
          {loading ? (
            <Spinner size={22} label="Cargando reseñas..." />
          ) : reviews.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-500">
              Aún no hay reseñas para este documento. ¡Sé el primero en opinar!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="rounded-xl border border-slate-200 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">@{rev.reviewerUsername}</span>
                  <span className="inline-flex items-center gap-0.5 font-bold text-amber-500">
                    <Star size={12} fill="currentColor" /> {rev.rating}/5
                  </span>
                </div>
                <p className="mt-1 text-slate-600">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};