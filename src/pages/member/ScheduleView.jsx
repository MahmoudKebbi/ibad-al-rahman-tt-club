import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import ContentCard from '../../components/layout/ContentCard';
import CalendarView from '../../components/schedule/CalendarView';
import DataTable from '../../components/common/DataTable';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { getAllSessions } from '../../services/firebase/sessions';

const ScheduleView = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get today's date at midnight for filtering
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get sessions from Firebase using the sessions service
        const sessionsData = await getAllSessions({
          startDate: today
        });
        
        // Sort sessions by date and time
        const sortedSessions = sessionsData.sort((a, b) => {
          // First compare dates
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          
          // If same date, compare start times
          return a.startTime.localeCompare(b.startTime);
        });
        console.log('Sorted Sessions:', sortedSessions);
        setSessions(sortedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setError('Failed to load training schedule. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Define columns for the list view
  const columns = [
    {
      title: 'Date',
      field: 'date',
      render: (session) => {
        const date = new Date(session.date);
        return date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    },
    {
      title: 'Time',
      render: (session) => `${session.startTime} - ${session.endTime}`
    },
    {
      title: 'Session',
      render: (session) => (
        <div>
          <div className="font-medium">{session.title}</div>
          <div className="text-sm text-gray-500 capitalize">{session.type}</div>
        </div>
      )
    },
    {
      title: 'Coach',
      field: 'coach'
    },
    {
      title: 'Status',
      field: 'status',
      render: (session) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          session.status === 'scheduled' ? 'bg-green-100 text-green-800' : 
          session.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </span>
      )
    }
  ];

  // Handle session click
  const handleSessionClick = (session) => {
    console.log('Session clicked:', session);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader title="Training Schedule" />
        
        <ContentCard>
          {/* View toggle buttons */}
          <div className="mb-6 flex space-x-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewMode === 'calendar' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewMode === 'list' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              List View
            </button>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Calendar or List View */}
          {viewMode === 'calendar' ? (
            <CalendarView 
              sessions={sessions} 
              userRole="member"
              onSessionClick={handleSessionClick}
              isLoading={loading}
            />
          ) : (
            <DataTable 
              columns={columns}
              data={sessions}
              isLoading={loading}
              emptyMessage="No upcoming sessions found"
            />
          )}
          
          {/* Legend */}
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-200 rounded-sm mr-2"></div>
                <span className="text-sm">Regular Training</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-200 rounded-sm mr-2"></div>
                <span className="text-sm">Advanced Training</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-200 rounded-sm mr-2"></div>
                <span className="text-sm">Special Event</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-200 rounded-sm mr-2"></div>
                <span className="text-sm">Competition</span>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
    </DashboardLayout>
  );
};

export default ScheduleView;