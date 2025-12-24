import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BulkUpload = () => {
  return (
    <div className="container mx-auto max-w-6xl py-8">
      <h1 className="text-4xl font-bold mb-8">Bulk Upload Students</h1>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Bulk upload functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUpload;
