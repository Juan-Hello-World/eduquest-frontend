import { axiosInstance } from './axiosInstance';
import { StudyPlanRequest, StudyPlanResponse } from '../types';

export const studyPlanService = {
  async generatePlan(payload: StudyPlanRequest): Promise<StudyPlanResponse> {
    const { data } = await axiosInstance.post<StudyPlanResponse>(
      '/study-plans/generate',
      payload
    );
    return data;
  },

  async getMyPlans(signal?: AbortSignal): Promise<StudyPlanResponse[]> {
    const { data } = await axiosInstance.get<StudyPlanResponse[]>('/study-plans', { signal });
    return data;
  },
};