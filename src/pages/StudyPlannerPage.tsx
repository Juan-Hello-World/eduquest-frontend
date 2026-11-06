import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Sparkles, BookOpen, Clock } from 'lucide-react';
import { studyPlanService } from '../api/studyPlanService';
import { extractErrorMessage } from '../api/axiosInstance';
import { StudyPlanRequest, StudyPlanResponse } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Spinner } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';

export const StudyPlannerPage: React.FC = () => {
  const [plans, setPlans] = useState<StudyPlanResponse[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlanResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudyPlanRequest>({
    defaultValues: { courseName: '', difficulty: 'Media' },
    mode: 'onChange',
  });

  useEffect(() => {
    const controller = new AbortController();
    studyPlanService
      .getMyPlans(controller.signal)
      .then((data) => {
        setPlans(data);
        if (data.length > 0) setSelectedPlan(data[0]);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError') {
          toast.error(extractErrorMessage(err));
        }
      })
      .finally(() => setLoadingHistory(false));

    return () => controller.abort();
  }, []);

  const onSubmit = async (values: StudyPlanRequest) => {
    try {
      const created = await studyPlanService.generatePlan({
        courseName: values.courseName.trim(),
        difficulty: values.difficulty,
      });
      setPlans((prev) => [created, ...prev]);
      setSelectedPlan(created);
      reset({ courseName: '', difficulty: 'Media' });
      toast.success('¡Plan de estudio generado con IA!');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Planificador de Estudio con IA' }]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Study Planner (OpenAI)</h1>
        <p className="text-sm text-slate-500">
          Genera una hoja de ruta estructurada por semanas adaptada al nivel de dificultad de tu curso
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Formulario Generador */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-1">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
            <Sparkles size={18} className="text-indigo-600" /> Nuevo Plan de Estudio
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Curso o Tema Académico (máx. 100 caracteres)
              </label>
              <input
                type="text"
                placeholder="Ej. Algoritmos y Estructuras de Datos en C++"
                {...register('courseName', {
                  required: 'El nombre del curso o tema es obligatorio',
                  maxLength: {
                    value: 100,
                    message: 'El tema no puede superar los 100 caracteres',
                  },
                })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
              />
              {errors.courseName && (
                <p className="mt-1 text-xs text-red-600">{errors.courseName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Dificultad Percibida
              </label>
              <select
                {...register('difficulty', { required: true })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Sparkles size={15} />
              {isSubmitting ? 'Generando con OpenAI...' : 'Generar Plan de Estudio'}
            </button>
          </form>

          {/* Historial lateral */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Clock size={13} /> Mis Planes Guardados ({plans.length})
            </h3>
            {loadingHistory ? (
              <Spinner size={20} label="Cargando historial..." />
            ) : plans.length === 0 ? (
              <p className="text-xs text-slate-400">Aún no has generado planes.</p>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlan(p)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedPlan?.id === p.id
                        ? 'border-indigo-600 bg-indigo-50/70'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="line-clamp-1 text-xs font-bold text-slate-800">{p.courseName}</p>
                    <span className="mt-1 inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                      Dificultad: {p.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visor del Plan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          {isSubmitting ? (
            <Spinner size={34} label="Consultando a OpenAI gpt-4o-mini..." />
          ) : selectedPlan ? (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    <BookOpen size={12} /> Dificultad {selectedPlan.difficulty}
                  </span>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {selectedPlan.courseName}
                  </h2>
                </div>
              </div>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-800">
                {selectedPlan.generatedPlan}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Selecciona o genera un plan de estudio"
              description="Ingresa el nombre de tu curso a la izquierda para que nuestro asistente IA estructure tu plan semanal."
            />
          )}
        </div>
      </div>
    </div>
  );
};