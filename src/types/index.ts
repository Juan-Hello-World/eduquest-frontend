export interface AuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
    username: string;
    password?: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password?: string;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface DocumentResponse {
    id: number;
    title: string;
    description: string;
    fileUrl: string;
    authorUsername: string;
    groupName: string;
    createdAt?: string;
    tags?: string[];
}

export interface DocumentRequest {
    title: string;
    description: string;
    fileUrl: string;
    tags?: string[];
}

export interface GroupResponse {
    id: number;
    name: string;
    description: string;
    creatorUsername: string;
}

export interface GroupRequest {
    name: string;
    description: string;
}

export interface StudySessionResponse {
    id: number;
    title: string;
    description: string;
    scheduledAt: string;
    meetingUrl: string;
    groupName: string;
}

export interface StudySessionRequest {
    title: string;
    description: string;
    scheduledAt: string;
    meetingUrl?: string;
}

export interface StudyPlanResponse {
    id: number;
    courseName: string;
    difficulty: string;
    generatedPlan: string;
    createdAt?: string;
}

export interface StudyPlanRequest {
    courseName: string;
    difficulty: string;
}

export interface ReviewResponse {
    id: number;
    rating: number;
    comment: string;
    reviewerUsername: string;
    documentTitle: string;
    createdAt?: string;
}

export interface ReviewRequest {
    documentId: number;
    rating: number;
    comment: string;
}


