import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrgSettings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    orgName: 'My Organization',
    contactEmail: 'contact@org.com',
    contactPhone: '+1234567890',
    website: 'https://org.com',
    allowBulkEnrollment: true,
    requireEmailVerification: false,
    allowStudentDashboard: true,
  });

  const handleSave = () => {
    // TODO: API call to save settings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization configuration and preferences</p>
      </div>

      {/* Success Message */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-lg bg-success-50 border border-success-200 text-success-700"
        >
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">Settings saved successfully!</p>
        </motion.div>
      )}

      {/* Organization Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>Basic details about your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization Name */}
              <div className="col-span-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={settings.orgName}
                  onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              {/* Contact Email */}
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              {/* Website */}
              <div className="col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  placeholder="https://example.com"
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feature Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Feature Settings</CardTitle>
            <CardDescription>Configure platform features and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Allow Bulk Enrollment */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowBulkEnrollment" className="text-base font-medium">
                    Allow Bulk User Enrollment
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable CSV upload for adding multiple users at once
                  </p>
                </div>
                <Switch
                  id="allowBulkEnrollment"
                  checked={settings.allowBulkEnrollment}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowBulkEnrollment: checked })
                  }
                />
              </div>

              {/* Require Email Verification */}
              <div className="flex items-center justify-between border-t pt-6">
                <div className="space-y-0.5">
                  <Label htmlFor="requireEmailVerification" className="text-base font-medium">
                    Require Email Verification
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before accessing the platform
                  </p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, requireEmailVerification: checked })
                  }
                />
              </div>

              {/* Allow Student Dashboard */}
              <div className="flex items-center justify-between border-t pt-6">
                <div className="space-y-0.5">
                  <Label htmlFor="allowStudentDashboard" className="text-base font-medium">
                    Allow Student Dashboard Access
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Students can view their results and performance analytics
                  </p>
                </div>
                <Switch
                  id="allowStudentDashboard"
                  checked={settings.allowStudentDashboard}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowStudentDashboard: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
