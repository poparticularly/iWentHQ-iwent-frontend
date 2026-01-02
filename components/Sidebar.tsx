import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, BarChart3, Settings, LogOut, Hexagon, Shield } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Panel' },
    { to: '/events', icon: Calendar, label: 'Etkinlikler' },
    { to: '/analytics', icon: BarChart3, label: 'Analitik' },
    { to: '/moderation', icon: Shield, label: 'Moderasyon' },
    { to: '/settings', icon: Settings, label: 'Ayarlar' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col hidden md:flex z-50">
      <div className="h-16 flex items-center px-8 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm shadow-brand-500/30">
            <Hexagon size={18} strokeWidth={3} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">iWent</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={20} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
          <LogOut size={20} strokeWidth={2} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;