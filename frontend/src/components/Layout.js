import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, BarChart3, Users, Brain, AlertCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Layout = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Upload Data', path: '/upload', icon: Upload },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Model Insights', path: '/insights', icon: Brain },
    { name: 'Alerts', path: '/alerts', icon: AlertCircle }
  ];

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-primary text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="hidden md:block w-64 bg-white border-r border-stone-200 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
            EduRisk
          </h1>
          <p className="text-sm text-gray-600 mt-1">Dropout Prevention System</p>
        </div>
        <nav className="space-y-2">
          <NavLinks />
        </nav>
      </aside>

      <div className="md:hidden bg-white border-b border-stone-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
            EduRisk
          </h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="mobile-menu-button">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  EduRisk
                </h1>
                <p className="text-sm text-gray-600 mt-1">Dropout Prevention System</p>
              </div>
              <nav className="space-y-2">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <main className="flex-1 overflow-auto noise-texture">
        <div className="max-w-[1600px] mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
