'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useLoading } from '@/components/LoadingProvider';
import { usePageContext } from '@/components/PageContext';

import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  Ticket,
  Loader2,
} from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: React.JSX.Element;
};

type NewSidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export default function NewSidebar({
  sidebarOpen,
  setSidebarOpen,
}: NewSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { isLoading } = useLoading();
  const { selectedPageId, clearSelectedPage } = usePageContext();
  const [profileExpanded, setProfileExpanded] = useState(false);

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: 'Job listing',
      href: '/job-listing',
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      name: 'Events',
      href: '/events',
      icon: <Ticket className="w-5 h-5" />, 
    },
    {
      name: 'All applicants',
      href: '/all-applicants',
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: 'Organization',
      href: '/organization',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      name: 'Schedule',
      href: '/schedule',
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  const handleNavigation = (href: string, name: string) => {
    // Add pageId to URL if available for job listing and events
    let finalHref = href;
    if ((href === '/job-listing' || href === '/events') && selectedPageId) {
      finalHref = `${href}?pageId=${selectedPageId}`;
    }
    
    // Navigate immediately
    router.push(finalHref);
  };

  const handleLogout = () => {
    // Clear the selected page before logging out
    clearSelectedPage();
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      {/* Left Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 h-[calc(100vh-4rem)] 
          transition-all duration-300 ease-in-out flex-shrink-0
          flex flex-col shadow-lg fixed top-16 left-0 z-20
          lg:z-10
        `}
      >
        <div className="flex flex-col h-full">
          
          
          {/* Main Navigation */}
          <div className="flex-1 pt-6 px-2 pb-4 overflow-y-auto">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href, item.name)}
                    className={`
                      w-full flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-2.5 text-sm font-medium rounded-lg
                      transition-all duration-200 group relative
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    <span className={`${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      {item.icon}
                    </span>
                    {sidebarOpen && (
                      <span className="flex-1 text-left">{item.name}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Section - User Actions */}
          <div className={`border-t border-gray-100 ${sidebarOpen ? 'p-4' : 'p-2'} space-y-2`}>
            {sidebarOpen ? (
              <>
                {/* Settings */}
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>

                {/* Help Desk */}
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
                  <HelpCircle className="w-4 h-4" />
                  Help desk
                </button>

                {/* User Profile */}
                {session?.user && (
                  <div className="mt-4">
                    <button
                      onClick={() => setProfileExpanded(!profileExpanded)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {session?.user?.name || 'User'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {session.user.email}
                        </div>
                      </div>
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform ${profileExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Logout - only visible when profile is expanded */}
                    {profileExpanded && (
                      <div className="mt-2 pl-4">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Collapsed Settings */}
                <button 
                  className="w-full flex items-center justify-center py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Collapsed Help Desk */}
                <button 
                  className="w-full flex items-center justify-center py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                  title="Help desk"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                {/* Collapsed User Profile */}
                {session?.user && (
                  <button
                    onClick={() => setProfileExpanded(!profileExpanded)}
                    className="w-full flex items-center justify-center p-2 mt-4 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Profile"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-700">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                )}

                {/* Collapsed Logout - only visible when profile is expanded */}
                {profileExpanded && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
