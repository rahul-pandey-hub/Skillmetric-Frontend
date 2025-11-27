import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ExamFormData } from './index';
import { Shield, Camera, Monitor, AlertTriangle, User, Eye, Maximize, MousePointer } from 'lucide-react';

interface Step3Props {
  data: ExamFormData;
  updateData: (data: Partial<ExamFormData>) => void;
}

export default function Step3Proctoring({ data, updateData }: Step3Props) {
  const updateProctoringSetting = (key: string, value: any) => {
    updateData({
      proctoringSettings: {
        ...data.proctoringSettings,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Proctoring Features</h3>
            <p className="text-xs text-blue-700 mt-1">
              Configure security and monitoring settings to maintain exam integrity
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Enable Proctoring */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-start">
            <Eye className="w-5 h-5 text-gray-600 mt-1 mr-3" />
            <div>
              <Label htmlFor="enabled" className="text-base font-medium">
                Enable Proctoring
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Turn on automated monitoring and violation detection
              </p>
            </div>
          </div>
          <Switch
            id="enabled"
            checked={data.proctoringSettings.enabled}
            onCheckedChange={(checked) => updateProctoringSetting('enabled', checked)}
          />
        </div>

        {data.proctoringSettings.enabled && (
          <>
            {/* Webcam Required */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start">
                <Camera className="w-5 h-5 text-gray-600 mt-1 mr-3" />
                <div>
                  <Label htmlFor="webcam" className="text-base font-medium">
                    Require Webcam
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Students must have webcam enabled during the exam
                  </p>
                </div>
              </div>
              <Switch
                id="webcam"
                checked={data.proctoringSettings.webcamRequired}
                onCheckedChange={(checked) => updateProctoringSetting('webcamRequired', checked)}
              />
            </div>

            {/* Screen Recording */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start">
                <Monitor className="w-5 h-5 text-gray-600 mt-1 mr-3" />
                <div>
                  <Label htmlFor="screen" className="text-base font-medium">
                    Screen Recording
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Record student's screen during the exam session
                  </p>
                </div>
              </div>
              <Switch
                id="screen"
                checked={data.proctoringSettings.screenRecording}
                onCheckedChange={(checked) => updateProctoringSetting('screenRecording', checked)}
              />
            </div>

            {/* Tab Switch Detection */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-gray-600 mt-1 mr-3" />
                <div>
                  <Label htmlFor="tabswitch" className="text-base font-medium">
                    Tab Switch Detection
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Detect and count when student switches tabs or windows
                  </p>
                </div>
              </div>
              <Switch
                id="tabswitch"
                checked={data.proctoringSettings.tabSwitchDetection}
                onCheckedChange={(checked) => updateProctoringSetting('tabSwitchDetection', checked)}
              />
            </div>

            {/* Copy Paste Detection */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start">
                <MousePointer className="w-5 h-5 text-gray-600 mt-1 mr-3" />
                <div>
                  <Label htmlFor="copypaste" className="text-base font-medium">
                    Copy/Paste Detection
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Detect and prevent copy/paste actions
                  </p>
                </div>
              </div>
              <Switch
                id="copypaste"
                checked={data.proctoringSettings.copyPasteDetection}
                onCheckedChange={(checked) => updateProctoringSetting('copyPasteDetection', checked)}
              />
            </div>

            {/* Right Click Disabled */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start">
                <MousePointer className="w-5 h-5 text-gray-600 mt-1 mr-3" />
                <div>
                  <Label htmlFor="rightclick" className="text-base font-medium">
                    Disable Right Click
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Disable right-click menu during exam
                  </p>
                </div>
              </div>
              <Switch
                id="rightclick"
                checked={data.proctoringSettings.rightClickDisabled}
                onCheckedChange={(checked) => updateProctoringSetting('rightClickDisabled', checked)}
              />
            </div>

            {/* Fullscreen Required */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start">
                <Maximize className="w-5 h-5 text-gray-600 mt-1 mr-3" />
                <div>
                  <Label htmlFor="fullscreen" className="text-base font-medium">
                    Require Fullscreen
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Student must take exam in fullscreen mode
                  </p>
                </div>
              </div>
              <Switch
                id="fullscreen"
                checked={data.proctoringSettings.fullscreenRequired}
                onCheckedChange={(checked) => updateProctoringSetting('fullscreenRequired', checked)}
              />
            </div>

            {/* Face Detection */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start">
                <User className="w-5 h-5 text-gray-600 mt-1 mr-3" />
                <div>
                  <Label htmlFor="facedetect" className="text-base font-medium">
                    Face Detection
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Monitor for face presence during exam
                  </p>
                </div>
              </div>
              <Switch
                id="facedetect"
                checked={data.proctoringSettings.faceDetection}
                onCheckedChange={(checked) => updateProctoringSetting('faceDetection', checked)}
              />
            </div>

            {/* Violation Thresholds */}
            <div className="space-y-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900">Violation Thresholds</h4>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Maximum Tab Switches</Label>
                  <span className="text-sm font-medium text-primary-600">
                    {data.proctoringSettings.maxTabSwitches}
                  </span>
                </div>
                <Slider
                  value={[data.proctoringSettings.maxTabSwitches]}
                  onValueChange={(value) => updateProctoringSetting('maxTabSwitches', value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Exam will be auto-submitted after exceeding this limit
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Maximum Violations</Label>
                  <span className="text-sm font-medium text-primary-600">
                    {data.proctoringSettings.maxViolations}
                  </span>
                </div>
                <Slider
                  value={[data.proctoringSettings.maxViolations]}
                  onValueChange={(value) => updateProctoringSetting('maxViolations', value[0])}
                  min={1}
                  max={15}
                  step={1}
                  className="mt-2"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Total violations allowed before flagging the exam
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
