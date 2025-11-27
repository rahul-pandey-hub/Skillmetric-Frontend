import { create } from 'zustand';

export interface Violation {
  id: string;
  sessionId: string;
  type: 'tab_switch' | 'multiple_faces' | 'no_face' | 'phone_detected' | 'voice_detected' | 'unauthorized_device';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  screenshotUrl?: string;
  resolved: boolean;
}

export interface ProctoringSettings {
  webcamEnabled: boolean;
  screenShareEnabled: boolean;
  tabSwitchDetection: boolean;
  multipleFaceDetection: boolean;
  phoneDetection: boolean;
  voiceDetection: boolean;
  maxTabSwitches: number;
  autoSubmitOnViolation: boolean;
}

interface ProctoringState {
  violations: Violation[];
  settings: ProctoringSettings;
  isMonitoring: boolean;
  connectedSessions: string[];

  // Actions
  addViolation: (violation: Violation) => void;
  resolveViolation: (id: string) => void;
  setViolations: (violations: Violation[]) => void;
  updateSettings: (settings: Partial<ProctoringSettings>) => void;
  setMonitoring: (isMonitoring: boolean) => void;
  addConnectedSession: (sessionId: string) => void;
  removeConnectedSession: (sessionId: string) => void;
  clearViolations: () => void;
}

export const useProctoringStore = create<ProctoringState>((set) => ({
  violations: [],
  settings: {
    webcamEnabled: true,
    screenShareEnabled: false,
    tabSwitchDetection: true,
    multipleFaceDetection: true,
    phoneDetection: false,
    voiceDetection: false,
    maxTabSwitches: 3,
    autoSubmitOnViolation: false,
  },
  isMonitoring: false,
  connectedSessions: [],

  addViolation: (violation) =>
    set((state) => ({ violations: [...state.violations, violation] })),

  resolveViolation: (id) =>
    set((state) => ({
      violations: state.violations.map((v) =>
        v.id === id ? { ...v, resolved: true } : v
      ),
    })),

  setViolations: (violations) => set({ violations }),

  updateSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),

  setMonitoring: (isMonitoring) => set({ isMonitoring }),

  addConnectedSession: (sessionId) =>
    set((state) => ({
      connectedSessions: [...state.connectedSessions, sessionId],
    })),

  removeConnectedSession: (sessionId) =>
    set((state) => ({
      connectedSessions: state.connectedSessions.filter((id) => id !== sessionId),
    })),

  clearViolations: () => set({ violations: [] }),
}));
