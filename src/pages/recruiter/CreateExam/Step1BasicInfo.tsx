import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ExamFormData } from './index';

interface Step1Props {
  data: ExamFormData;
  updateData: (data: Partial<ExamFormData>) => void;
}

export default function Step1BasicInfo({ data, updateData }: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Exam Title *</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => {
              const title = e.target.value;
              updateData({
                title,
                code: title.toUpperCase().replace(/\s+/g, '-').substring(0, 20),
              });
            }}
            placeholder="e.g., Full Stack Developer Assessment"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="code">Exam Code *</Label>
          <Input
            id="code"
            value={data.code}
            onChange={(e) => updateData({ code: e.target.value.toUpperCase().replace(/\s+/g, '-') })}
            placeholder="e.g., FS-DEV-2024"
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">Unique code for this exam</p>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Brief description of the exam..."
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="type">Exam Type</Label>
          <Select
            value={data.type}
            onValueChange={(value) => updateData({ type: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASSESSMENT">Assessment</SelectItem>
              <SelectItem value="PRACTICE">Practice Test</SelectItem>
              <SelectItem value="CERTIFICATION">Certification</SelectItem>
              <SelectItem value="MOCK_TEST">Mock Test</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration">Duration (minutes) *</Label>
          <Input
            id="duration"
            type="number"
            value={data.duration}
            onChange={(e) => updateData({ duration: parseInt(e.target.value) || 0 })}
            min="1"
            max="300"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="totalMarks">Total Marks *</Label>
          <Input
            id="totalMarks"
            type="number"
            value={data.totalMarks}
            onChange={(e) => updateData({ totalMarks: parseInt(e.target.value) || 0 })}
            min="1"
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="passingPercentage">Passing Percentage *</Label>
        <Input
          id="passingPercentage"
          type="number"
          value={data.passingPercentage}
          onChange={(e) => updateData({ passingPercentage: parseInt(e.target.value) || 0 })}
          min="0"
          max="100"
          className="mt-2"
        />
        <p className="text-sm text-gray-500 mt-1">
          Students need {data.passingPercentage}% ({((data.totalMarks * data.passingPercentage) / 100).toFixed(1)} marks) to pass
        </p>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="startDate">Start Date & Time</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={data.startDate ? new Date(data.startDate.getTime() - data.startDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => updateData({ startDate: new Date(e.target.value) })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date & Time</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={data.endDate ? new Date(data.endDate.getTime() - data.endDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => updateData({ endDate: new Date(e.target.value) })}
              className="mt-2"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label htmlFor="lateSubmission" className="text-base font-medium">
              Allow Late Submission
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Students can submit exam after the end date
            </p>
          </div>
          <Switch
            id="lateSubmission"
            checked={data.lateSubmissionAllowed}
            onCheckedChange={(checked) => updateData({ lateSubmissionAllowed: checked })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="instructions">Instructions for Students</Label>
        <textarea
          id="instructions"
          value={data.instructions}
          onChange={(e) => updateData({ instructions: e.target.value })}
          placeholder="Important instructions for students taking this exam..."
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px]"
        />
      </div>
    </div>
  );
}
