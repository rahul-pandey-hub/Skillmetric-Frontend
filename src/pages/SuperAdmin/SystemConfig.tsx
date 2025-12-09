import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, HelpCircle, Award, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const SystemConfig = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Exam Templates', icon: Settings, value: 0 },
    { label: 'Question Pools', icon: HelpCircle, value: 1 },
    { label: 'Certifications', icon: Award, value: 2 },
    { label: 'Pricing Plans', icon: DollarSign, value: 3 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Exam Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Exam templates allow organizations to quickly create exams based on predefined settings and structures.
                </p>
              </div>
              <Button>Create Template</Button>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {['Technical Assessment', 'Aptitude Test', 'Language Proficiency'].map((template) => (
                <Card key={template}>
                  <CardHeader>
                    <CardTitle className="text-base">{template}</CardTitle>
                    <CardDescription>Pre-configured template</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Public Question Pools</h3>
                <p className="text-sm text-muted-foreground">
                  Question pools are collections of questions that can be shared across organizations.
                </p>
              </div>
              <Button>Create Pool</Button>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No question pools created yet</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">System Certifications</h3>
                <p className="text-sm text-muted-foreground">
                  Define certification criteria that can be awarded to users based on their performance.
                </p>
              </div>
              <Button>Create Certification</Button>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No certifications created yet</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Pricing Plans</h3>
                <p className="text-sm text-muted-foreground">
                  Configure subscription plans and pricing for organizations.
                </p>
              </div>
              <Button>Create Plan</Button>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
              {[
                { name: 'Free', price: '$0', features: ['1,000 credits', '100 users', '10 exams/month'] },
                { name: 'Basic', price: '$99', features: ['10,000 credits', '500 users', '50 exams/month'] },
                { name: 'Pro', price: '$299', features: ['50,000 credits', '2,000 users', 'Unlimited exams'] },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  features: ['Custom credits', 'Unlimited users', 'Dedicated support'],
                },
              ].map((plan) => (
                <Card key={plan.name}>
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-primary">{plan.price}</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                      {plan.features.map((feature, i) => (
                        <li key={i}>• {feature}</li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground">
          Manage system-wide templates, question pools, certifications, and pricing plans
        </p>
      </div>

      <Card>
        {/* Custom Tab Navigation */}
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 border-b-2 transition-colors',
                  activeTab === tab.value
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <CardContent className="pt-6">{renderTabContent()}</CardContent>
      </Card>
    </div>
  );
};

export default SystemConfig;
