import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  ClipboardList,
  Eye,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Upload,
  Users,
  Building2,
  PlusCircle,
  UserPlus,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation based on role
  const getNavigation = () => {
    switch (user?.role) {
      case 'ORG_ADMIN':
        return [
          { name: 'Dashboard', href: '/org-admin', icon: LayoutDashboard },
          { name: 'Question Bank', href: '/org-admin/questions', icon: FileText },
          { name: 'Create Question', href: '/org-admin/questions/create', icon: PlusCircle },
          { name: 'Exams', href: '/org-admin/exams', icon: ClipboardList },
          { name: 'Create Exam', href: '/org-admin/exams/create', icon: PlusCircle },
          { name: 'Users', href: '/org-admin/users', icon: Users },
          { name: 'Add User', href: '/org-admin/users/add', icon: UserPlus },
          { name: 'Bulk Upload Users', href: '/org-admin/users/bulk-upload', icon: Upload },
          { name: 'Analytics', href: '/org-admin/analytics', icon: BarChart3 },
          { name: 'Settings', href: '/org-admin/settings', icon: Settings },
        ];
      case 'RECRUITER':
        return [
          { name: 'Dashboard', href: '/recruiter', icon: LayoutDashboard },
          { name: 'Assessments', href: '/recruiter/exams', icon: ClipboardList },
          { name: 'Create Exam', href: '/recruiter/create-exam', icon: PlusCircle },
          { name: 'Live Monitoring', href: '/recruiter/monitoring', icon: Eye },
          { name: 'Bulk Enroll', href: '/recruiter/bulk-enrollment', icon: Upload },
          { name: 'Analytics', href: '/recruiter/analytics', icon: BarChart3 },
          { name: 'Settings', href: '/recruiter/settings', icon: Settings },
        ];
      case 'STUDENT':
        return [
          { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
          { name: 'My Exams', href: '/student', icon: ClipboardList },
          { name: 'Exam History', href: '/student/history', icon: FileText },
          { name: 'Profile', href: '/student/profile', icon: Settings },
        ];
      case 'SUPER_ADMIN':
        return [
          { name: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
          { name: 'Organizations', href: '/super-admin/organizations', icon: Building2 },
          { name: 'Create Organization', href: '/super-admin/organizations/create', icon: PlusCircle },
          { name: 'System Config', href: '/super-admin/system-config', icon: Settings },
          { name: 'Analytics', href: '/super-admin/analytics', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card shadow-lg"
          >
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex h-16 items-center justify-between px-6 border-b">
                <h1 className="text-xl font-bold text-primary">SkillMetric</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href ||
                    (item.href !== '/recruiter' && item.href !== '/student' && location.pathname.startsWith(item.href));

                  return (
                    <Link key={item.name} to={item.href}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3',
                          isActive && 'bg-primary/10 text-primary font-medium'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile */}
              <div className="border-t p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    {getInitials(user?.fullName || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="mb-3 w-full justify-center">
                  {user?.role}
                </Badge>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={cn('transition-all duration-300', sidebarOpen ? 'lg:pl-64' : 'pl-0')}>
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center gap-4 px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            {/* Add header actions here if needed */}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
