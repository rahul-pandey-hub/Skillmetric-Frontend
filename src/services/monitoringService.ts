import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const monitoringApi = axios.create({
  baseURL: `${API_URL}/monitoring`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
monitoringApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LiveExamStats {
  examId: string;
  examTitle: string;
  status: string;
  schedule: {
    startDate: Date;
    endDate: Date;
    timeRemaining?: number;
  };
  participation: {
    totalEnrolled: number;
    totalStarted: number;
    totalInProgress: number;
    totalSubmitted: number;
    notStarted: number;
  };
  recentActivity: Array<{
    timestamp: Date;
    studentId: string;
    studentName?: string;
    action: 'STARTED' | 'SUBMITTED' | 'VIOLATION';
    details?: string;
  }>;
  violations: {
    totalViolations: number;
    recentViolations: Array<{
      timestamp: Date;
      studentId: string;
      studentName?: string;
      type: string;
      severity: string;
    }>;
  };
  liveStudents: Array<{
    studentId: string;
    studentName?: string;
    studentEmail?: string;
    status: string;
    startedAt: Date;
    timeElapsed: number;
    warningCount: number;
    lastActivity?: Date;
  }>;
}

export interface ActiveExam {
  examId: string;
  examTitle: string;
  examCode: string;
  startDate: Date;
  endDate: Date;
  totalEnrolled: number;
  inProgress: number;
  timeRemaining: number;
}

export interface ViolationAlert {
  sessionId: string;
  examId: string;
  examTitle: string;
  examCode: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalViolations: number;
  warningCount: number;
  latestViolation: {
    type: string;
    timestamp: Date;
    severity: string;
  } | null;
  startedAt: Date;
}

export interface SystemStats {
  activeExams: number;
  activeSessions: number;
  recentViolations: number;
  completedToday: number;
  timestamp: Date;
}

/**
 * Get live exam statistics
 */
export const getLiveExamStats = async (examId: string): Promise<LiveExamStats> => {
  const response = await monitoringApi.get(`/exams/${examId}/live`);
  return response.data;
};

/**
 * Get all active exams
 */
export const getActiveExams = async (): Promise<ActiveExam[]> => {
  const response = await monitoringApi.get('/exams/active');
  return response.data;
};

/**
 * Get violation alerts
 */
export const getViolationAlerts = async (examId?: string): Promise<ViolationAlert[]> => {
  const url = examId ? `/violations?examId=${examId}` : '/violations';
  const response = await monitoringApi.get(url);
  return response.data;
};

/**
 * Get system-wide statistics
 */
export const getSystemStats = async (): Promise<SystemStats> => {
  const response = await monitoringApi.get('/system/stats');
  return response.data;
};

/**
 * Get session details
 */
export const getSessionDetails = async (sessionId: string) => {
  const response = await monitoringApi.get(`/sessions/${sessionId}`);
  return response.data;
};

/**
 * WebSocket Manager for Real-Time Monitoring
 */
export class MonitoringWebSocket {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(`${API_URL}/monitoring`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Monitoring WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Monitoring WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  /**
   * Subscribe to exam monitoring
   */
  subscribeToExam(examId: string, refreshInterval: number = 5000): void {
    if (!this.socket?.connected) {
      this.connect();
    }

    this.socket?.emit('monitor:exam:subscribe', { examId, refreshInterval });

    // Listen for subscription confirmation
    this.socket?.once('monitor:exam:subscribed', (data) => {
      console.log('📊 Subscribed to exam monitoring:', data);
    });
  }

  /**
   * Unsubscribe from exam monitoring
   */
  unsubscribeFromExam(examId: string): void {
    this.socket?.emit('monitor:exam:unsubscribe', { examId });

    // Listen for unsubscription confirmation
    this.socket?.once('monitor:exam:unsubscribed', (data) => {
      console.log('📊 Unsubscribed from exam monitoring:', data);
    });
  }

  /**
   * Subscribe to system monitoring
   */
  subscribeToSystem(refreshInterval: number = 10000): void {
    if (!this.socket?.connected) {
      this.connect();
    }

    this.socket?.emit('monitor:system:subscribe', { refreshInterval });

    this.socket?.once('monitor:system:subscribed', (data) => {
      console.log('📊 Subscribed to system monitoring:', data);
    });
  }

  /**
   * Unsubscribe from system monitoring
   */
  unsubscribeFromSystem(): void {
    this.socket?.emit('monitor:system:unsubscribe');

    this.socket?.once('monitor:system:unsubscribed', () => {
      console.log('📊 Unsubscribed from system monitoring');
    });
  }

  /**
   * Listen for exam updates
   */
  onExamUpdate(callback: (stats: LiveExamStats) => void): void {
    this.socket?.on('monitor:exam:update', callback);
    this.addListener('monitor:exam:update', callback);
  }

  /**
   * Listen for violation alerts
   */
  onViolationAlert(callback: (violation: any) => void): void {
    this.socket?.on('monitor:violation:alert', callback);
    this.addListener('monitor:violation:alert', callback);
  }

  /**
   * Listen for exam events
   */
  onExamEvent(callback: (event: any) => void): void {
    this.socket?.on('monitor:exam:event', callback);
    this.addListener('monitor:exam:event', callback);
  }

  /**
   * Listen for system updates
   */
  onSystemUpdate(callback: (stats: SystemStats) => void): void {
    this.socket?.on('monitor:system:update', callback);
    this.addListener('monitor:system:update', callback);
  }

  /**
   * Listen for errors
   */
  onError(callback: (error: any) => void): void {
    this.socket?.on('monitor:exam:error', callback);
    this.socket?.on('monitor:system:error', callback);
    this.addListener('monitor:error', callback);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.off(event, callback as any);
      });
    });
    this.listeners.clear();
  }

  private addListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }
}

// Singleton instance
export const monitoringWs = new MonitoringWebSocket();

export default {
  getLiveExamStats,
  getActiveExams,
  getViolationAlerts,
  getSystemStats,
  getSessionDetails,
  monitoringWs,
};
