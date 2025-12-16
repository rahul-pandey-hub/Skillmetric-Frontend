import api from './api';
import {
  Exam,
  CreateExamDto,
  AddQuestionsDto,
  RemoveQuestionsDto,
  ExamsResponse,
} from '../types/exam';
import { AxiosResponse } from 'axios';

export const examService = {
  /**
   * Create a new exam
   */
  createExam: async (examData: CreateExamDto): Promise<AxiosResponse<Exam>> => {
    return api.post('/exams', examData);
  },

  /**
   * Get all exams created by the admin
   */
  getAllExams: async (): Promise<AxiosResponse<ExamsResponse>> => {
    return api.get('/exams');
  },

  /**
   * Get a single exam by ID
   */
  getExamById: async (id: string): Promise<AxiosResponse<Exam>> => {
    return api.get(`/exams/${id}`);
  },

  /**
   * Add questions to an exam
   */
  addQuestionsToExam: async (
    examId: string,
    data: AddQuestionsDto
  ): Promise<AxiosResponse<{ message: string; exam: Exam }>> => {
    return api.post(`/exams/${examId}/questions`, data);
  },

  /**
   * Remove questions from an exam
   */
  removeQuestionsFromExam: async (
    examId: string,
    data: RemoveQuestionsDto
  ): Promise<AxiosResponse<{ message: string; exam: Exam }>> => {
    return api.delete(`/exams/${examId}/questions`, { data });
  },

  /**
   * Bulk enroll students to an exam
   */
  enrollStudents: async (
    examId: string,
    students: { name: string; email: string }[]
  ): Promise<AxiosResponse<{
    message: string;
    summary: {
      total: number;
      enrolled: number;
      alreadyEnrolled: number;
      created: number;
      errors: number;
    };
    details: any;
  }>> => {
    return api.post(`/exams/${examId}/enroll-students`, { students });
  },

  /**
   * Delete an exam
   */
  deleteExam: async (examId: string): Promise<AxiosResponse<{
    message: string;
    examId: string;
  }>> => {
    return api.delete(`/exams/${examId}`);
  },
};

export default examService;
