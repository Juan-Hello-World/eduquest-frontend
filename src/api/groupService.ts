import { axiosInstance } from './axiosInstance';
import {
  DocumentRequest,
  DocumentResponse,
  GroupRequest,
  GroupResponse,
  PageResponse,
  StudySessionRequest,
  StudySessionResponse,
} from '../types';

export const groupService = {
  async getAllGroups(
    page = 0,
    size = 10,
    signal?: AbortSignal
  ): Promise<PageResponse<GroupResponse>> {
    const { data } = await axiosInstance.get<PageResponse<GroupResponse>>('/groups', {
      params: { page, size },
      signal,
    });
    return data;
  },

  async createGroup(payload: GroupRequest): Promise<GroupResponse> {
    const { data } = await axiosInstance.post<GroupResponse>('/groups', payload);
    return data;
  },

  async joinGroup(groupId: number): Promise<GroupResponse> {
    const { data } = await axiosInstance.post<GroupResponse>(`/groups/${groupId}/join`);
    return data;
  },

  async getGroupDocuments(
    groupId: number,
    page = 0,
    size = 10,
    signal?: AbortSignal
  ): Promise<PageResponse<DocumentResponse>> {
    const { data } = await axiosInstance.get<PageResponse<DocumentResponse>>(
      `/groups/${groupId}/documents`,
      {
        params: { page, size },
        signal,
      }
    );
    return data;
  },

  async uploadDocumentToGroup(
    groupId: number,
    payload: DocumentRequest
  ): Promise<DocumentResponse> {
    const { data } = await axiosInstance.post<DocumentResponse>(
      `/groups/${groupId}/documents`,
      payload
    );
    return data;
  },

  async getGroupSessions(
    groupId: number,
    signal?: AbortSignal
  ): Promise<StudySessionResponse[]> {
    const { data } = await axiosInstance.get<StudySessionResponse[]>(
      `/groups/${groupId}/sessions`,
      { signal }
    );
    return data;
  },

  async scheduleSession(
    groupId: number,
    payload: StudySessionRequest
  ): Promise<StudySessionResponse> {
    const { data } = await axiosInstance.post<StudySessionResponse>(
      `/groups/${groupId}/sessions`,
      payload
    );
    return data;
  },
};