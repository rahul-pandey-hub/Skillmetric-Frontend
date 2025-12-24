import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const StudentDebug = () => {
  const { user } = useAuthStore();
  const [debugData, setDebugData] = useState<any>(null);
  const [examsData, setExamsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/student/exams/debug/enrollment');
      setDebugData(response.data);
    } catch (error) {
      console.error('Debug fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamsData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/student/exams');
      setExamsData(response.data);
    } catch (error) {
      console.error('Exams fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
    fetchExamsData();
  }, []);

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <h1 className="text-4xl font-bold mb-8">Student Debug Page</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current User Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enrollment Debug Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchDebugData} variant="outline" className="mb-4">
            Refresh Debug Data
          </Button>
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <pre className="text-sm overflow-auto">{JSON.stringify(debugData, null, 2)}</pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exams API Response</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchExamsData} variant="outline" className="mb-4">
            Refresh Exams Data
          </Button>
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <pre className="text-sm overflow-auto">{JSON.stringify(examsData, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDebug;
