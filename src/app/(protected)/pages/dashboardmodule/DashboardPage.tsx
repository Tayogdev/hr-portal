'use client';

import React from 'react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp, 
  Building2,
  Plus,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePageContext } from '@/components/PageContext';

export default function DashboardPage(): React.JSX.Element {
  const router = useRouter();
  const { selectedPageId } = usePageContext();

  // Mock data for dashboard - in production this would come from API
  const stats = [
    {
      title: 'Active Jobs',
      value: '12',
      change: '+2',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'bg-blue-500',
      href: '/job-listing'
    },
    {
      title: 'Total Events',
      value: '8',
      change: '+1',
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-green-500',
      href: '/events'
    },
    {
      title: 'Total Applicants',
      value: '156',
      change: '+23',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
      href: '/all-applicants'
    },
    {
      title: 'Organizations',
      value: '5',
      change: '+1',
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-orange-500',
      href: '/organization'
    }
  ];

  const recentActivities = [
    {
      type: 'job',
      title: 'New job posted: Senior Developer',
      time: '2 hours ago',
      icon: <Briefcase className="w-4 h-4" />
    },
    {
      type: 'event',
      title: 'Event created: Tech Workshop 2024',
      time: '4 hours ago',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      type: 'applicant',
      title: 'New applicant: John Doe',
      time: '6 hours ago',
      icon: <Users className="w-4 h-4" />
    },
    {
      type: 'organization',
      title: 'Organization updated: Tech Corp',
      time: '1 day ago',
      icon: <Building2 className="w-4 h-4" />
    }
  ];

  const quickActions = [
    {
      title: 'Post New Job',
      description: 'Create a new job listing',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      href: '/job-listing'
    },
    {
      title: 'Create Event',
      description: 'Schedule a new event',
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-green-600 hover:bg-green-700',
      href: '/events'
    },
    {
      title: 'View Applicants',
      description: 'Review all applicants',
      icon: <Eye className="w-5 h-5" />,
      color: 'bg-purple-600 hover:bg-purple-700',
      href: '/all-applicants'
    },
    {
      title: 'Manage Schedule',
      description: 'View and manage schedules',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-orange-600 hover:bg-orange-700',
      href: '/schedule'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your HR portal.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index}
            onClick={() => {
              let href = stat.href;
              if (stat.href === '/job-listing' && selectedPageId) {
                href = `/job-listing?pageId=${selectedPageId}`;
              } else if (stat.href === '/events' && selectedPageId) {
                href = `/events?pageId=${selectedPageId}`;
              }
              router.push(href);
            }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change} from last month
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                let href = action.href;
                if (action.href === '/job-listing' && selectedPageId) {
                  href = `/job-listing?pageId=${selectedPageId}`;
                } else if (action.href === '/events' && selectedPageId) {
                  href = `/events?pageId=${selectedPageId}`;
                }
                router.push(href);
              }}
              className={`${action.color} text-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-left`}
            >
              <div className="flex items-center mb-2">
                {action.icon}
                <span className="ml-2 font-semibold">{action.title}</span>
              </div>
              <p className="text-sm opacity-90">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                  {activity.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
              <div className="flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
