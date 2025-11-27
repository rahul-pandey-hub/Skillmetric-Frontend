import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ExamFormData } from './index';
import { Award, Users, Target } from 'lucide-react';

interface Step4Props {
  data: ExamFormData;
  updateData: (data: Partial<ExamFormData>) => void;
}

export default function Step4Criteria({ data, updateData }: Step4Props) {
  const updateCriteria = (key: string, value: any) => {
    updateData({
      shortlistingCriteria: {
        ...data.shortlistingCriteria,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start">
          <Award className="w-5 h-5 text-purple-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-purple-900">Shortlisting Criteria</h3>
            <p className="text-xs text-purple-700 mt-1">
              Define criteria for automatically shortlisting candidates based on performance
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Cutoff Percentage */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-start mb-4">
            <Target className="w-5 h-5 text-gray-600 mt-1 mr-3" />
            <div className="flex-1">
              <Label className="text-base font-medium">Cutoff Percentage</Label>
              <p className="text-sm text-gray-600 mt-1">
                Minimum percentage score required for shortlisting
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Cutoff: {data.shortlistingCriteria.cutoffPercentage}%</Label>
              <Input
                type="number"
                value={data.shortlistingCriteria.cutoffPercentage}
                onChange={(e) => updateCriteria('cutoffPercentage', parseInt(e.target.value))}
                min="0"
                max="100"
                className="w-20 text-center"
              />
            </div>
            <Slider
              value={[data.shortlistingCriteria.cutoffPercentage]}
              onValueChange={(value) => updateCriteria('cutoffPercentage', value[0])}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </div>

        {/* Auto Select Top N */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-start">
              <Users className="w-5 h-5 text-gray-600 mt-1 mr-3" />
              <div>
                <Label htmlFor="autoselect" className="text-base font-medium">
                  Auto-select Top Performers
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Automatically shortlist top N students regardless of cutoff
                </p>
              </div>
            </div>
            <Switch
              id="autoselect"
              checked={data.shortlistingCriteria.autoSelect}
              onCheckedChange={(checked) => updateCriteria('autoSelect', checked)}
            />
          </div>

          {data.shortlistingCriteria.autoSelect && (
            <div className="mt-4 pl-8">
              <Label htmlFor="topN" className="text-sm">
                Number of Top Students
              </Label>
              <Input
                id="topN"
                type="number"
                value={data.shortlistingCriteria.topNStudents}
                onChange={(e) => updateCriteria('topNStudents', parseInt(e.target.value))}
                min="1"
                max="100"
                className="mt-2 w-32"
              />
              <p className="text-xs text-gray-600 mt-2">
                Select top {data.shortlistingCriteria.topNStudents} students by score
              </p>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Shortlisting Summary</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
              Candidates scoring above{' '}
              <strong className="mx-1">{data.shortlistingCriteria.cutoffPercentage}%</strong>
              will be shortlisted
            </li>
            {data.shortlistingCriteria.autoSelect && (
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Top <strong className="mx-1">{data.shortlistingCriteria.topNStudents}</strong>
                students will be automatically selected
              </li>
            )}
            <li className="flex items-center">
              <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
              You can manually adjust shortlist after exam completion
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
