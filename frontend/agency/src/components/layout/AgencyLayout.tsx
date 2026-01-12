'use client';

import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { AuthGuard } from '@/middleware/auth-guard';

interface AgencyLayoutProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  headerActions?: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  className?: string;
  showSidebar?: boolean;
}

export function AgencyLayout({
  children,
  headerContent,
  headerActions,
  headerTitle,
  headerSubtitle,
  className,
  showSidebar = true,
}: AgencyLayoutProps) {
  return (
    <AuthGuard>
      <div className={`h-screen bg-gray-50 flex overflow-hidden ${className || ''}`}>
        {showSidebar && <Sidebar />}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Global Header with User Dropdown - Always Present */}
          <Header
            title={headerTitle}
            subtitle={headerSubtitle}
            actions={headerActions}
          >
            {headerContent}
          </Header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

