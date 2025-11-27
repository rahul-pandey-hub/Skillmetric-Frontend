import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Questions from './Step2Questions';
import Step3Proctoring from './Step3Proctoring';
import Step4Settings from './Step4Settings';
import Step5Review from './Step5Review';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateExam } from '@/hooks/useExams';

export interface ExamFormData {
  // Step 1 - Basic Info
  title: string;
  code: string;
  description: string;
  type: string;
  duration: number;
  totalMarks: number;
  passingPercentage: number;
  instructions: string;

  // Schedule
  startDate: Date;
  endDate: Date;
  lateSubmissionAllowed: boolean;

  // Step 2 - Questions
  questions: string[];

  // Step 3 - Proctoring Settings
  proctoringSettings: {
    enabled: boolean;
    webcamRequired: boolean;
    screenRecording: boolean;
    tabSwitchDetection: boolean;
    copyPasteDetection: boolean;
    rightClickDisabled: boolean;
    fullscreenRequired: boolean;
    faceDetection: boolean;
    violationWarningLimit: number;
    autoSubmitOnViolation: boolean;
  };

  // Step 4 - Exam Settings
  settings: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResultsImmediately: boolean;
    allowReview: boolean;
    showCorrectAnswers: boolean;
    attemptsAllowed: number;
    allowBackNavigation: boolean;
    showTimer: boolean;
  };

  // Step 5 - Shortlisting & Results
  shortlistingCriteria: {
    enabled: boolean;
    minimumPercentage: number;
    autoAdvanceTopN: number;
  };

  resultsSettings: {
    showScore: boolean;
    showPercentile: boolean;
    showCorrectAnswers: boolean;
    showDetailedAnalysis: boolean;
    generateCertificate: boolean;
  };
}

const STEPS = [
  { id: 1, name: 'Basic Info', description: 'Exam details' },
  { id: 2, name: 'Questions', description: 'Select questions' },
  { id: 3, name: 'Proctoring', description: 'Security settings' },
  { id: 4, name: 'Settings', description: 'Exam configuration' },
  { id: 5, name: 'Review', description: 'Review & publish' },
];

export default function CreateExam() {
  const navigate = useNavigate();
  const createExamMutation = useCreateExam();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ExamFormData>({
    title: '',
    code: '',
    description: '',
    type: 'ASSESSMENT',
    duration: 60,
    totalMarks: 100,
    passingPercentage: 40,
    instructions: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    lateSubmissionAllowed: false,
    questions: [],
    proctoringSettings: {
      enabled: true,
      webcamRequired: true,
      screenRecording: false,
      tabSwitchDetection: true,
      copyPasteDetection: false,
      rightClickDisabled: true,
      fullscreenRequired: false,
      faceDetection: false,
      violationWarningLimit: 5,
      autoSubmitOnViolation: false,
    },
    settings: {
      shuffleQuestions: false,
      shuffleOptions: false,
      showResultsImmediately: false,
      allowReview: true,
      showCorrectAnswers: false,
      attemptsAllowed: 1,
      allowBackNavigation: true,
      showTimer: true,
    },
    shortlistingCriteria: {
      enabled: false,
      minimumPercentage: 60,
      autoAdvanceTopN: 10,
    },
    resultsSettings: {
      showScore: true,
      showPercentile: true,
      showCorrectAnswers: false,
      showDetailedAnalysis: false,
      generateCertificate: false,
    },
  });

  const updateFormData = (data: Partial<ExamFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title || !formData.code) {
          toast.error('Please fill in title and exam code');
          return false;
        }
        if (formData.duration < 1) {
          toast.error('Duration must be at least 1 minute');
          return false;
        }
        return true;
      case 2:
        if (formData.questions.length === 0) {
          toast.error('Please select at least one question');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      // Prepare exam data matching backend DTO structure
      const examData = {
        title: formData.title,
        code: formData.code,
        description: formData.description || undefined,
        duration: formData.duration,
        status: 'PUBLISHED',
        questions: formData.questions,
        proctoringSettings: {
          enabled: formData.proctoringSettings.enabled,
          violationWarningLimit: formData.proctoringSettings.violationWarningLimit,
          webcamRequired: formData.proctoringSettings.webcamRequired,
          screenRecording: formData.proctoringSettings.screenRecording,
          tabSwitchDetection: formData.proctoringSettings.tabSwitchDetection,
          copyPasteDetection: formData.proctoringSettings.copyPasteDetection,
          rightClickDisabled: formData.proctoringSettings.rightClickDisabled,
          devToolsDetection: false,
          fullscreenRequired: formData.proctoringSettings.fullscreenRequired,
          autoSubmitOnViolation: formData.proctoringSettings.autoSubmitOnViolation,
          faceDetection: formData.proctoringSettings.faceDetection,
          multipleFaceDetection: false,
          mobileDetection: false,
        },
        schedule: {
          startDate: formData.startDate,
          endDate: formData.endDate,
          lateSubmissionAllowed: formData.lateSubmissionAllowed,
        },
        grading: {
          totalMarks: formData.totalMarks,
          passingMarks: (formData.totalMarks * formData.passingPercentage) / 100,
          passingPercentage: formData.passingPercentage,
          negativeMarking: false,
          gradingScheme: 'PERCENTAGE',
        },
        settings: {
          shuffleQuestions: formData.settings.shuffleQuestions,
          shuffleOptions: formData.settings.shuffleOptions,
          showResultsImmediately: formData.settings.showResultsImmediately,
          allowReview: formData.settings.allowReview,
          showCorrectAnswers: formData.settings.showCorrectAnswers,
          attemptsAllowed: formData.settings.attemptsAllowed,
          allowSkip: true,
          allowBackNavigation: formData.settings.allowBackNavigation,
          showTimer: formData.settings.showTimer,
          allowPauseResume: false,
          saveProgressAutomatically: true,
        },
      };

      await createExamMutation.mutateAsync(examData);
      navigate('/recruiter/exams');
    } catch (error) {
      console.error('Failed to create exam:', error);
      // Error toast is already handled by the mutation hook
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo data={formData} updateData={updateFormData} />;
      case 2:
        return <Step2Questions data={formData} updateData={updateFormData} />;
      case 3:
        return <Step3Proctoring data={formData} updateData={updateFormData} />;
      case 4:
        return <Step4Settings data={formData} updateData={updateFormData} />;
      case 5:
        return <Step5Review data={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
        <p className="text-gray-600 mt-2">Follow the steps to create and publish your exam</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep > step.id
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : currentStep === step.id
                      ? 'border-primary-500 text-primary-500 bg-white'
                      : 'border-gray-300 text-gray-400 bg-white'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-4 transition-colors ${
                    currentStep > step.id ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        {currentStep < 5 ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createExamMutation.isPending}
            className="bg-success-600 hover:bg-success-700"
          >
            {createExamMutation.isPending ? 'Publishing...' : 'Publish Exam'}
          </Button>
        )}
      </div>
    </div>
  );
}
