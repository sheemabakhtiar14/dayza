import React from 'react';
import { Calendar, LayoutGrid, Target, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'today' | 'week' | 'focus' | 'profile';
  onTabChange: (tab: 'today' | 'week' | 'focus' | 'profile') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-white overflow-hidden font-sans">
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-[#09090b]/90 backdrop-blur-md border-t border-white/10 px-6 py-4 flex justify-between items-center z-50">
        <NavItem 
          icon={<Calendar size={24} />} 
          label="TODAY" 
          isActive={activeTab === 'today'} 
          onClick={() => onTabChange('today')} 
        />
        <NavItem 
          icon={<LayoutGrid size={24} />} 
          label="WEEK" 
          isActive={activeTab === 'week'} 
          onClick={() => onTabChange('week')} 
        />
        <NavItem 
          icon={<Target size={24} />} 
          label="FOCUS" 
          isActive={activeTab === 'focus'} 
          onClick={() => onTabChange('focus')} 
        />
        <NavItem 
          icon={<User size={24} />} 
          label="PROFILE" 
          isActive={activeTab === 'profile'} 
          onClick={() => onTabChange('profile')} 
        />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors",
        isActive ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
      )}
    >
      <div className={cn(
        "p-2 rounded-2xl transition-all",
        isActive ? "bg-indigo-500/20" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-medium tracking-wider">{label}</span>
    </button>
  );
}
