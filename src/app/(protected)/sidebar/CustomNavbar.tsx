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
  Menu,
  X,
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

export default function CustomNavbar(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const { data: session } = useSession();
  const { isLoading } = useLoading();
  const { selectedPageId, clearSelectedPage } = usePageContext();

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
    setClickedItem(name);
    setSidebarOpen(false);
    
    // Add a small delay to show loading state
    setTimeout(() => {
      // Add pageId to URL if available for job listing and events
      let finalHref = href;
      if ((href === '/job-listing' || href === '/events') && selectedPageId) {
        finalHref = `${href}?pageId=${selectedPageId}`;
      }
      
      router.push(finalHref);
      setClickedItem(null);
    }, 100);
  };

  const handleLogout = () => {
    // Clear the selected page before logging out
    clearSelectedPage();
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      {/* Mobile Toggle Button - Fixed position */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          flex flex-col
        `}
      >
        {/* Logo Section - Fixed */}
        <div className="flex items-center justify-center px-4 py-6 border-gray-100">
          <Image
            src="https://www.tayog.in/assets/logo/full_blue.svg"
            alt="tayog logo"
            width={124}
            height={32}
            className="h-8 w-auto"
            onError={(e) => {
              // Fallback to text if logo fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden text-2xl font-bold text-blue-600">tayog</span>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const isClicked = clickedItem === item.name;
              const showLoading = isClicked || (isLoading && isActive);
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href, item.name)}
                  disabled={showLoading}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg
                    transition-all duration-200 group
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${showLoading ? 'cursor-not-allowed opacity-75' : ''}
                  `}
                >
                  <span className={`${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}`}>
                    {showLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      item.icon
                    )}
                  </span>
                  <span className="flex-1 text-left">{item.name}</span>
                  {showLoading && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section - Fixed */}
        <div className="border-t border-gray-100 p-4 space-y-2">
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

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

          {/* User Profile */}
          {session?.user && (
            <div className="flex items-center gap-3 p-3 mt-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-700">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
  