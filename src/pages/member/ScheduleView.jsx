import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import ContentCard from '../../components/layout/ContentCard';
import CalendarView from '../../components/schedule/CalendarView';
import DataTable from '../../components/common/DataTable';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

const ScheduleView = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, fetch from Firestore
        // const today = new Date();
        // today.setHours(0, 0, 0, 0);
        // 
        // const sessionsQuery = query(
        //   collection(db, 'sessions'),
        //   where('date', '>=', today),
        //   orderBy('date', 'asc')
        // );
        // 
        // const snapshot = await getDocs(sessionsQuery);
        // const sessionsData = snapshot.docs.map(...)
        
        // For demo purposes, use placeholder data
        const placeholderSessions = generatePlaceholderSessions();
        setSessions(placeholderSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Generate placeholder data for demo purposes
  const generatePlaceholderSessions = () => {
    const today = new Date();
    const sessions = [];
    
    // Add upcoming sessions for the next 14 days
    for (let i = 0; i < 14; i++) {
      // Skip some days to make the calendar look more realistic
      if (i % 3 === 2) continue;
      
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() + i);
      
      // Add 1-2 sessions per day
      const numSessions = i % 4 === 0 ? 2 : 1;
      
      for (let j = 0; j < numSessions; j++) {
        const isAdvanced = (i + j) % 3 === 0;
        
        sessions.push({
          id: `session-${i}-${j}`,
          title: isAdvanced ? 'Advanced Training' : 'Regular Training',
          type: isAdvanced ? 'advanced' : 'regular',
          date: sessionDate.toISOString().split('T')[0],
          startTime: j === 0 ? '18:00' : '20:00',
          endTime: j === 0 ? '20:00' : '22:00',
          coach: (i + j) % 2 === 0 ? 'Ahmed Hassan' : 'Sarah Ahmed',
          status: 'scheduled'
        });
      }
    }
    
    return sessions;
  };

  // Define columns for the list view
  const columns = [
    {
      title: 'Date',
      field: 'date'
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
          <div className="text-sm text-gray-500">{session.type}</div>
        </div>
      )
    },
    {
      title: 'Coach',
      field: 'coach'
    }
  ];

  // Handle session click
  const handleSessionClick = (session) => {
    console.log('Session clicked:', session);
    // You could open a modal with session details, etc.
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
          
          {/* Calendar or List View */}
          {viewMode === 'calendar' ? (
            <CalendarView 
              sessions={sessions} 
              userRole="member"
              onSessionClick={handleSessionClick}
            />
          ) : (
            <DataTable 
              columns={columns}
              data={sessions}
              isLoading={loading}
              emptyMessage="No upcoming sessions found"
            />
          )}
        </ContentCard>
      </div>
    </DashboardLayout>
  );
};

export default ScheduleView;