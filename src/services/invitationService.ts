import api from './api';
import axios, { AxiosResponse } from 'axios';
import {
  InvitationResponse,
  SendInvitationsDto,
  RecruitmentResultsResponse,
} from '../types/exam';

// Create a separate axios instance for public endpoints (no auth required)
const publicApi = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const invitationService = {
  /**
   * Get exam details by invitation token (public endpoint)
   */
  getExamByInvitation: async (token: string): Promise<AxiosResponse<InvitationResponse>> => {
    return publicApi.get(`/exams/invitation/${token}`);
  },

  /**
   * Start exam by invitation token (public endpoint)
   */
  startExamByInvitation: async (token: string): Promise<AxiosResponse<{
    temporaryToken: string;
    sessionId: string;
    exam: any;
    questions: any[];
    expiresAt: string;
  }>> => {
    return publicApi.post(`/exams/invitation/${token}/start`);
  },

  /**
   * Send exam invitations (protected)
   */
  sendInvitations: async (
    examId: string,
    data: SendInvitationsDto
  ): Promise<AxiosResponse<{
    success: boolean;
    message: string;
    summary: {
      total: number;
      sent: number;
      duplicate: number;
      failed: number;
      emailsQueued: number;
    };
    details: any[];
  }>> => {
    return api.post(`/exams/${examId}/invitations`, data);
  },

  /**
   * Get recruitment results for an exam (protected)
   */
  getRecruitmentResults: async (
    examId: string,
    params?: {
      status?: string;
      sortBy?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<AxiosResponse<RecruitmentResultsResponse>> => {
    return api.get(`/exams/${examId}/recruitment-results`, { params });
  },

  /**
   * Bulk shortlist/reject candidates (protected)
   */
  shortlistCandidates: async (
    examId: string,
    data: {
      invitationIds: string[];
      action: 'shortlist' | 'reject';
      comments?: string;
    }
  ): Promise<AxiosResponse<{
    message: string;
    updated: number;
  }>> => {
    return api.post(`/exams/${examId}/recruitment-results/shortlist`, data);
  },

  /**
   * Export recruitment results (protected)
   */
  exportRecruitmentResults: async (
    examId: string,
    format: 'csv' | 'xlsx' | 'pdf' = 'csv'
  ): Promise<AxiosResponse<Blob>> => {
    return api.get(`/exams/${examId}/recruitment-results/export`, {
      params: { format },
      responseType: 'blob',
    });
  },
};

export default invitationService;
