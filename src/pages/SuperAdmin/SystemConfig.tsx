import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, HelpCircle, DollarSign, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import superAdminService from '@/services/superAdminService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SystemConfig = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [examTemplates, setExamTemplates] = useState([]);
  const [questionPools, setQuestionPools] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const tabs = [
    { label: 'Exam Templates', icon: Settings, value: 0 },
    { label: 'Question Pools', icon: HelpCircle, value: 1 },
    { label: 'Pricing Plans', icon: DollarSign, value: 2 },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 0) {
        const data = await superAdminService.getAllExamTemplates();
        setExamTemplates(data);
      } else if (activeTab === 1) {
        const data = await superAdminService.getAllQuestionPools();
        setQuestionPools(data);
      } else if (activeTab === 2) {
        const data = await superAdminService.getAllPricingPlans();
        setPricingPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'template' | 'pool' | 'plan') => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (type === 'template') {
        await superAdminService.deleteExamTemplate(id);
      } else if (type === 'pool') {
        await superAdminService.deleteQuestionPool(id);
      } else if (type === 'plan') {
        await superAdminService.deletePricingPlan(id);
      }
      fetchData();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete item');
    }
  };

  const handleCreate = () => {
    setFormData({});
    setCreateDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setEditDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    try {
      if (activeTab === 0) {
        await superAdminService.createExamTemplate(formData);
      } else if (activeTab === 1) {
        await superAdminService.createQuestionPool(formData);
      } else if (activeTab === 2) {
        await superAdminService.createPricingPlan(formData);
      }
      setCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create:', error);
      alert('Failed to create item');
    }
  };

  const handleSubmitEdit = async () => {
    try {
      if (activeTab === 0) {
        await superAdminService.updateExamTemplate(editingItem._id, formData);
      } else if (activeTab === 1) {
        await superAdminService.updateQuestionPool(editingItem._id, formData);
      } else if (activeTab === 2) {
        await superAdminService.updatePricingPlan(editingItem._id, formData);
      }
      setEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to update:', error);
      alert('Failed to update item');
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    switch (activeTab) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Exam Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage exam templates that organizations can use.
                </p>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
            {examTemplates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No exam templates created yet</p>
                <Button variant="outline" className="mt-4" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {examTemplates.map((template: any) => (
                  <Card key={template._id}>
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.description || 'Exam template'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div>Category: {template.category}</div>
                        <div>Usage: {template.usageCount || 0} times</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(template._id, 'template')}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Question Pools</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage question pools that can be shared across organizations.
                </p>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Pool
              </Button>
            </div>
            {questionPools.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No question pools created yet</p>
                <Button variant="outline" className="mt-4" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Pool
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {questionPools.map((pool: any) => (
                  <Card key={pool._id}>
                    <CardHeader>
                      <CardTitle className="text-base">{pool.name}</CardTitle>
                      <CardDescription>{pool.description || 'Question pool'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div>Questions: {pool.questions?.length || 0}</div>
                        <div>Visibility: {pool.visibility}</div>
                        <div>Difficulty: {pool.difficulty}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(pool)}>
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(pool._id, 'pool')}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Pricing Plans</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage subscription plans for organizations.
                </p>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </div>
            {pricingPlans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pricing plans created yet</p>
                <Button variant="outline" className="mt-4" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Plan
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
                {pricingPlans.map((plan: any) => (
                  <Card key={plan._id}>
                    <CardHeader>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold text-primary">
                        ${plan.pricing?.monthly || 0}/mo
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div>• {plan.features?.credits || 0} credits</div>
                        <div>• {plan.features?.maxConcurrentUsers || 0} users</div>
                        <div>• {plan.features?.maxExamsPerMonth || 0} exams/month</div>
                        <div>Tier: {plan.tier}</div>
                        <div>Subscribers: {plan.subscriberCount || 0}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(plan._id, 'plan')}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
          Manage system-wide templates, question pools, and pricing plans
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

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Create {activeTab === 0 ? 'Exam Template' : activeTab === 1 ? 'Question Pool' : 'Pricing Plan'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            {activeTab === 0 && (
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || undefined}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="APTITUDE">Aptitude</SelectItem>
                    <SelectItem value="LANGUAGE">Language</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {activeTab === 1 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={formData.visibility || undefined}
                    onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="ORGANIZATION">Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty || undefined}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {activeTab === 2 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="tier">Tier</Label>
                  <Select
                    value={formData.tier || undefined}
                    onValueChange={(value) => setFormData({ ...formData, tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">Free</SelectItem>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    value={formData.pricing?.monthly || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricing: { ...formData.pricing, monthly: Number(e.target.value) },
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Edit {activeTab === 0 ? 'Exam Template' : activeTab === 1 ? 'Question Pool' : 'Pricing Plan'}
            </DialogTitle>
            <DialogDescription>Update the details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            {activeTab === 0 && (
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category || undefined}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="APTITUDE">Aptitude</SelectItem>
                    <SelectItem value="LANGUAGE">Language</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {activeTab === 1 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="edit-visibility">Visibility</Label>
                  <Select
                    value={formData.visibility || undefined}
                    onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="ORGANIZATION">Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty || undefined}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {activeTab === 2 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="edit-tier">Tier</Label>
                  <Select
                    value={formData.tier || undefined}
                    onValueChange={(value) => setFormData({ ...formData, tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">Free</SelectItem>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-monthlyPrice">Monthly Price ($)</Label>
                  <Input
                    id="edit-monthlyPrice"
                    type="number"
                    value={formData.pricing?.monthly || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricing: { ...formData.pricing, monthly: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemConfig;
