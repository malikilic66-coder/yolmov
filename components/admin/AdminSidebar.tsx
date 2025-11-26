import React from 'react';
import { LogOut } from 'lucide-react';
import { adminTabs } from './adminTabs';
import { AdminRole } from '../../types';

interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
  onLogout: () => void;
  role: AdminRole;
  mobile?: boolean;
  onCloseMobile?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onSelectTab, onLogout, role, mobile, onCloseMobile }) => {
  return (
    <div className={`flex flex-col h-full bg-slate-900 text-white w-64 ${mobile ? 'shadow-2xl' : ''}`}>      
      <div className="p-6 border-b border-slate-800">
        <div className="cursor-pointer" onClick={() => onSelectTab('overview')}>
          <img src="https://raw.githubusercontent.com/yosoyorhan/repo2/refs/heads/main/yolmov-logo-cutter-beyaz.png" alt="YOLMOV Admin" className="h-10 w-auto object-contain mb-2" />
          <p className="text-xs text-slate-400 text-center">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2" role="tablist" aria-label="Admin sekmeleri">
        {adminTabs.filter(t => !t.allowedRoles || t.allowedRoles.includes(role)).map(item => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeTab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => { onSelectTab(item.id); mobile && onCloseMobile && onCloseMobile(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              activeTab === item.id ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
            <img src="https://i.pravatar.cc/150?img=60" alt="Admin" />
          </div>
          <div>
            <p className="text-sm font-bold">Admin User</p>
            <p className="text-xs text-slate-400">admin@yolmov.com</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
