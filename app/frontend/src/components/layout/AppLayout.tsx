import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children?: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  breadcrumbs,
}) => {
  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Desktop sidebar collapsed state (compact icon bar vs full width)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        // Clear any previous buggy state that hid the sidebar
        localStorage.removeItem('sidebar_expanded');
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  // Automatically close mobile drawer when window resizes to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('sidebar_collapsed', String(next));
        } catch {
          // ignore localStorage issues
        }
        return next;
      });
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar Navigation (Responsive) */}
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Body */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 transition-all duration-300">
        <Header
          onToggleSidebar={handleToggleSidebar}
          title={title}
          breadcrumbs={breadcrumbs}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
