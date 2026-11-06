import { axiosInstance } from './axiosInstance';
import {
  DocumentRequest,
  DocumentResponse,
  PageResponse,
  ReviewRequest,
  ReviewResponse,
} from '../types';

export interface DocumentQueryParams {
  page?: number;
  size?: number;
  search?: string;
  tag?: string;
}

export const documentService = {
  async getPublicDocuments(
    params: DocumentQueryParams,
    signal?: AbortSignal
  ): Promise<PageResponse<DocumentResponse>> {
    const cleanParams: Record<string, string | number> = {
      page: params.page ?? 0,
      size: params.size ?? 10,
    };
    if (params.search?.trim()) cleanParams.search = params.search.trim();
    if (params.tag?.trim()) cleanParams.tag = params.tag.trim();

    const { data } = await axiosInstance.get<PageResponse<DocumentResponse>>('/documents', {
      params: cleanParams,
      signal,
    });
    return data;
  },

  async uploadPublicDocument(payload: DocumentRequest): Promise<DocumentResponse> {
    const { data } = await axiosInstance.post<DocumentResponse>('/documents', payload);
    return data;
  },

  async createReview(payload: ReviewRequest): Promise<ReviewResponse> {
    const { data } = await axiosInstance.post<ReviewResponse>('/reviews', payload);
    return data;
  },

  async getReviewsByDocument(
    documentId: number,
    signal?: AbortSignal
  ): Promise<ReviewResponse[]> {
    const { data } = await axiosInstance.get<ReviewResponse[]>(
      `/documents/${documentId}/reviews`,
      { signal }
    );
    return data;
  },
};