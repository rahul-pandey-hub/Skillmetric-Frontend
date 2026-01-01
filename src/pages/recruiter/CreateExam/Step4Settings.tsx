import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ExamFormData } from './index';
import { Settings as SettingsIcon, Shuffle, Eye } from 'lucide-react';

interface Step4Props {
  data: ExamFormData;
  updateData: (data: Partial<ExamFormData>) => void;
}

export default function Step4Settings({ data, updateData }: Step4Props) {
  const updateSetting = (key: string, value: any) => {
    updateData({
      settings: {
        ...data.settings,
        [key]: value,
      },
    });
  };

  const updateShortlistingSetting = (key: string, value: any) => {
    updateData({
      shortlistingCriteria: {
        ...data.shortlistingCriteria,
        [key]: value,
      },
    });
  };

  const updateResultsSetting = (key: string, value: any) => {
    updateData({
      resultsSettings: {
        ...data.resultsSettings,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <SettingsIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Exam Configuration</h3>
            <p className="text-xs text-blue-700 mt-1">
              Configure exam behavior and candidate experience settings
            </p>
          </div>
        </div>
      </div>

      {/* Question & Answer Settings */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Question & Answer Settings</h4>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-start">
            <Shuffle className="w-5 h-5 text-gray-600 mt-1 mr-3" />
            <div>
              <Label htmlFor="shuffleQuestions" className="text-base font-medium">
                Shuffle Questions
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Display questions in random order for each candidate
              </p>
            </div>
          </div>
          <Switch
            id="shuffleQuestions"
            checked={data.settings.shuffleQuestions}
            onCheckedChange={(checked) => updateSetting('shuffleQuestions', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-start">
            <Shuffle className="w-5 h-5 text-gray-600 mt-1 mr-3" />
            <div>
              <Label htmlFor="shuffleOptions" className="text-base font-medium">
                Shuffle Options
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Randomize answer options for multiple choice questions
              </p>
            </div>
          </div>
          <Switch
            id="shuffleOptions"
            checked={data.settings.shuffleOptions}
            onCheckedChange={(checked) => updateSetting('shuffleOptions', checked)}
          />
        </div>
      </div>

      {/* Shortlisting Criteria */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-gray-900">Shortlisting Criteria (Optional)</h4>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label htmlFor="enableShortlist" className="text-base font-medium">
              Enable Automated Shortlisting
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Automatically shortlist candidates based on performance
            </p>
          </div>
          <Switch
            id="enableShortlist"
            checked={data.shortlistingCriteria.enabled}
            onCheckedChange={(checked) => updateShortlistingSetting('enabled', checked)}
          />
        </div>

        {data.shortlistingCriteria.enabled && (
          <>
            <div className="p-4 border rounded-lg">
              <Label htmlFor="minPercentage">Minimum Percentage for Shortlisting</Label>
              <Input
                id="minPercentage"
                type="number"
                value={data.shortlistingCriteria.minimumPercentage}
                onChange={(e) => updateShortlistingSetting('minimumPercentage', parseInt(e.target.value) || 0)}
                min="0"
                max="100"
                className="mt-2 w-32"
              />
              <p className="text-xs text-gray-600 mt-2">
                Candidates scoring above this percentage will be shortlisted
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <Label htmlFor="autoAdvance">Auto-advance Top N Candidates</Label>
              <Input
                id="autoAdvance"
                type="number"
                value={data.shortlistingCriteria.autoAdvanceTopN}
                onChange={(e) => updateShortlistingSetting('autoAdvanceTopN', parseInt(e.target.value) || 0)}
                min="0"
                max="100"
                className="mt-2 w-32"
              />
              <p className="text-xs text-gray-600 mt-2">
                Automatically shortlist top performing candidates (0 to disable)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
