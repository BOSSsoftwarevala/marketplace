import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { WireframeHeader } from './WireframeHeader';
import { WireframeSidebar } from './WireframeSidebar';
import { WireframeFooter } from './WireframeFooter';
import { InternalChatDock } from './InternalChatDock';
import { AIAssistantWidget } from './AIAssistantWidget';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface WireframeLayoutProps {
  children?: React.ReactNode;
}

export function WireframeLayout({ children }: WireframeLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Fixed Top Header */}
      <WireframeHeader 
        theme={theme} 
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onChatToggle={() => setChatOpen(!chatOpen)}
      />

      {/* Mobile nav toggle (visible <lg) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileNavOpen(o => !o)}
        className="lg:hidden fixed top-3 left-3 z-[60] h-10 w-10 rounded-lg bg-slate-900/80 backdrop-blur border border-slate-700 text-white hover:bg-slate-800"
        aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex flex-1 pt-16">
        {/* Left Sidebar — hidden on mobile unless toggled */}
        <div
          className={`${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 fixed lg:static z-40`}
          onClick={() => mobileNavOpen && setMobileNavOpen(false)}
        >
          <WireframeSidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            theme={theme}
          />
        </div>

        {/* Main Body */}
        <main className={`flex-1 min-w-0 transition-all duration-300 ml-0 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} ${chatOpen ? 'lg:mr-80' : 'mr-0'} p-4 sm:p-6`}>
          {children || <Outlet />}
        </main>

        {/* Right Chat Dock */}
        <InternalChatDock open={chatOpen} onClose={() => setChatOpen(false)} theme={theme} />
      </div>

      {/* AI Assistant Floating Widget */}
      <AIAssistantWidget theme={theme} />

      {/* Footer */}
      <WireframeFooter theme={theme} />
    </div>
  );
}
