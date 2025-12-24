import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ExamMonitoring = () => {
  return (
    <div className="container mx-auto max-w-6xl py-8">
      <h1 className="text-4xl font-bold mb-8">Real-time Exam Monitoring</h1>

      <Card>
        <CardHeader>
          <CardTitle>Live Monitoring Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Live monitoring dashboard will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamMonitoring;
