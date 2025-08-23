'use client';
import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Users, 
  UserCheck, 
  Settings, 
  BarChart3, 
  Clock, 
  Stethoscope, 
  FileText,
  Search,
  Plus
} from 'lucide-react';
import { RootState } from '../../store';
import Button from '../ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  if (!user) {
    return <div className="container py-8">Please log in to continue.</div>;
  }

  const doctorNavItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard/doctor', 
      icon: Home, 
      description: 'Overview and stats' 
    },
    { 
      name: 'Appointments', 
      href: '/dashboard/doctor/appointments', 
      icon: Calendar, 
      description: 'Manage appointments' 
    },
    { 
      name: 'Schedule', 
      href: '/dashboard/doctor/schedule', 
      icon: Clock, 
      description: 'Time management' 
    },
    { 
      name: 'Patients', 
      href: '/dashboard/doctor/patients', 
      icon: Users, 
      description: 'Patient records' 
    },
    { 
      name: 'Profile', 
      href: '/dashboard/doctor/profile', 
      icon: UserCheck, 
      description: 'Professional info' 
    },
  ];

  const patientNavItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard/patient', 
      icon: Home, 
      description: 'Your overview' 
    },
    { 
      name: 'Find Doctors', 
      href: '/doctors', 
      icon: Search, 
      description: 'Search doctors' 
    },
    { 
      name: 'Appointments', 
      href: '/appointments', 
      icon: Calendar, 
      description: 'Your appointments' 
    },
    { 
      name: 'Medical Records', 
      href: '/medical-records', 
      icon: FileText, 
      description: 'Health history' 
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserCheck, 
      description: 'Personal info' 
    },
  ];

  const navItems = user.is_doctor ? doctorNavItems : patientNavItems;

  const isActive = (href: string) => {
    if (href === '/dashboard/doctor' && pathname === '/dashboard/doctor') return true;
    if (href === '/dashboard/patient' && pathname === '/dashboard/patient') return true;
    if (href !== '/dashboard/doctor' && href !== '/dashboard/patient') {
      return pathname?.startsWith(href);
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 lg:bg-white lg:border-r lg:border-gray-200">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              {/* User Info */}
              <div className="px-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      {user.is_doctor ? (
                        <Stethoscope className="w-5 h-5 text-primary-600" />
                      ) : (
                        <UserCheck className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user.is_doctor ? 'Dr. ' : ''}{user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.is_doctor ? 'Doctor' : 'Patient'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Action */}
              {!user.is_doctor && (
                <div className="px-4 mb-6">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => router.push('/doctors')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              )}

              {/* Navigation */}
              <nav className="px-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive(item.href)
                            ? 'text-primary-500'
                            : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom section */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div>
                  <p className="text-xs text-gray-500">
                    {user.is_doctor ? 'Serving patients since' : 'Member since'} {new Date(user.created_at).getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;