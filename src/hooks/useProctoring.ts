import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useExamStore } from '@/store/examStore';
import { useProctoringStore, Violation } from '@/store/proctoringStore';

let socket: Socket | null = null;

export function useProctoring(examId?: string) {
  const { updateSession, addSession } = useExamStore();
  const { addViolation, setMonitoring, addConnectedSession, removeConnectedSession } =
    useProctoringStore();

  useEffect(() => {
    if (!examId) return;

    // Initialize socket connection
    socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      setMonitoring(true);
      socket?.emit('join-exam-monitoring', examId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setMonitoring(false);
    });

    // Session events
    socket.on('session-started', (session) => {
      addSession(session);
      addConnectedSession(session.id);
    });

    socket.on('session-updated', ({ sessionId, updates }) => {
      updateSession(sessionId, updates);
    });

    socket.on('session-ended', (sessionId) => {
      updateSession(sessionId, { status: 'submitted' });
      removeConnectedSession(sessionId);
    });

    // Violation events
    socket.on('violation-detected', (violation: Violation) => {
      addViolation(violation);
      // Also update the session's violation count
      updateSession(violation.sessionId, {
        violations: (violation as any).totalViolations || 0,
      });
    });

    // Tab switch events
    socket.on('tab-switch-detected', ({ sessionId, count }) => {
      updateSession(sessionId, { tabSwitches: count });
    });

    // Answer updates
    socket.on('answer-submitted', ({ sessionId, questionIndex }) => {
      updateSession(sessionId, {
        answeredQuestions: (questionIndex as any) + 1,
      });
    });

    return () => {
      if (socket) {
        socket.emit('leave-exam-monitoring', examId);
        socket.disconnect();
        socket = null;
      }
      setMonitoring(false);
    };
  }, [examId]);

  return {
    socket,
    isConnected: socket?.connected || false,
  };
}

// Hook for student-side proctoring
export function useStudentProctoring(sessionId: string) {
  useEffect(() => {
    if (!sessionId) return;

    socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket?.emit('join-session', sessionId);
    });

    return () => {
      if (socket) {
        socket.emit('leave-session', sessionId);
        socket.disconnect();
        socket = null;
      }
    };
  }, [sessionId]);

  const logViolation = (violation: Omit<Violation, 'id' | 'timestamp' | 'sessionId'>) => {
    socket?.emit('log-violation', {
      sessionId,
      ...violation,
    });
  };

  const logTabSwitch = () => {
    socket?.emit('tab-switch', sessionId);
  };

  const submitAnswer = (questionIndex: number, answer: any) => {
    socket?.emit('submit-answer', {
      questionIndex,
      answer,
    });
  };

  return {
    logViolation,
    logTabSwitch,
    submitAnswer,
    isConnected: socket?.connected || false,
  };
}
