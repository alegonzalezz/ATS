import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  Briefcase,
  Search,
  Settings,
  Bell,
  Menu,
  X,
  Linkedin,
  Table2,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  currentPath?: string;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/ATS' },
  { id: 'candidates', label: 'Candidatos', icon: Users, path: '/ATS/Candidatos' },
  { id: 'skills', label: 'Habilidades', icon: Wrench, path: '/ATS/Habilidades' },
  { id: 'recruiters', label: 'Reclutadores', icon: UserCog, path: '/ATS/Reclutadores' },
  { id: 'clients', label: 'Clientes', icon: Building2, path: '/ATS/Clientes' },
  { id: 'jobs', label: 'Ofertas', icon: Briefcase, path: '/ATS/Ofertas' },
  { id: 'search', label: 'Búsqueda Avanzada', icon: Search, path: '/ATS/Busqueda-Avanzada' },
  { id: 'sync', label: 'Sincronización LinkedIn', icon: Linkedin, path: '/ATS/Sincronizacion-LinkedIn' },
  { id: 'sheets', label: 'Google Sheets', icon: Table2, path: '/ATS/Google-Sheets' },
  { id: 'settings', label: 'Configuración', icon: Settings, path: '/ATS/Configuracion' },
];

function getPageTitle(pathname: string): string {
  const item = navItems.find(item => 
    pathname === item.path || 
    (item.path !== '/ATS' && pathname.startsWith(item.path))
  );
  
  if (item) return item.label;
  
  if (pathname.startsWith('/ATS/Candidatos')) return 'Candidatos';
  
  return 'TalentTrack';
}

function isActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/ATS') {
    return pathname === '/ATS';
  }
  return pathname.startsWith(itemPath);
}

export function Layout({ children, currentPath }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = currentPath || location.pathname;
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside 
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <Link to="/ATS" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TT</span>
              </div>
              <span className="font-semibold text-gray-900">TalentTrack</span>
            </Link>
          ) : (
            <Link to="/ATS" className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">TT</span>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.path);
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  active 
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  !sidebarOpen && "justify-center"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", active && "text-blue-600")} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
              <p className="text-xs font-medium text-blue-900 mb-1">Pro Tip</p>
              <p className="text-xs text-blue-700">
                Sincroniza con LinkedIn semanalmente para mantener los perfiles actualizados.
              </p>
            </div>
          </div>
        )}
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <Link to="/ATS" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TT</span>
          </div>
          <span className="font-semibold text-gray-900">TalentTrack</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-40">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    active 
                      ? "bg-blue-50 text-blue-700 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <main className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        <header className="hidden lg:flex h-16 items-center justify-between px-6 bg-white border-b border-gray-200">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto pt-16 lg:pt-0">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
