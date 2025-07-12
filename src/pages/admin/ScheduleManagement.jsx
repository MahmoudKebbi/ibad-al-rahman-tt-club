import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import ContentCard from '../../components/layout/ContentCard';
import DataTable from '../../components/common/DataTable';
import ActionButton from '../../components/common/ActionButton';
import StatusBadge from '../../components/common/StatusBadge';
import { collection, getDocs, query, orderBy, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { deleteSession } from '../../services/firebase/sessions';

const ScheduleManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('upcoming'); // 'upcoming', 'past', 'all'
  
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        
        // Base query
        let sessionsQuery;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter based on view mode
        if (viewMode === 'upcoming') {
          sessionsQuery = query(
            collection(db, 'sessions'),
            where('date', '>=', today),
            orderBy('date', 'asc')
          );
        } else if (viewMode === 'past') {
          sessionsQuery = query(
            collection(db, 'sessions'),
            where('date', '<', today),
            orderBy('date', 'desc')
          );
        } else {
          // All sessions
          sessionsQuery = query(
            collection(db, 'sessions'),
            orderBy('date', 'desc')
          );
        }
        
        const snapshot = await getDocs(sessionsQuery);
        
        // For demo purposes, use placeholder data if no real data exists
        if (snapshot.empty) {
          // Use placeholder data
          const placeholderSessions = {};
          setSessions(placeholderSessions);
        } else {
          const sessionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamp to Date object
            date: doc.data().date?.toDate().toISOString().split('T')[0] || 'N/A'
          }));
          
          setSessions(sessionsData);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [viewMode]);



  // Handle session deletion
  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(sessionId);
        setSessions(sessions.filter(session => session.id !== sessionId));
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  // Define columns for the sessions table
  const columns = [
    {
      title: 'Session',
      field: 'title',
      render: (session) => (
        <div>
          <div className="font-medium text-gray-900">{session.title}</div>
          <div className="text-sm text-gray-500">{session.type}</div>
        </div>
      )
    },
    {
      title: 'Date & Time',
      render: (session) => (
        <div>
          <div className="text-gray-900">{session.date}</div>
          <div className="text-sm text-gray-500">{session.startTime} - {session.endTime}</div>
        </div>
      )
    },
    {
      title: 'Coach',
      field: 'coach'
    },
    {
      title: 'Participants',
      render: (session) => (
        <div className="text-gray-900">
          {session.currentParticipants} / {session.maxParticipants}
        </div>
      )
    },
    {
      title: 'Status',
      field: 'status',
      render: (session) => {
        const statusMap = {
          scheduled: { status: 'info', text: 'Scheduled' },
          completed: { status: 'success', text: 'Completed' },
          cancelled: { status: 'error', text: 'Cancelled' },
          'in-progress': { status: 'warning', text: 'In Progress' }
        };
        
        const statusConfig = statusMap[session.status] || statusMap.scheduled;
        
        return (
          <StatusBadge 
            status={statusConfig.status} 
            text={statusConfig.text} 
          />
        );
      }
    },
    {
      title: 'Actions',
      render: (session) => (
        <div className="flex space-x-2">
          <Link to={`/admin/schedule/edit/${session.id}`}>
            <ActionButton 
              color="blue" 
              size="sm"
            >
              Edit
            </ActionButton>
          </Link>
          
          <ActionButton 
            color="red" 
            size="sm"
            onClick={() => handleDeleteSession(session.id)}
          >
            Delete
          </ActionButton>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader title="Schedule Management">
          <Link to="/admin/schedule/create">
            <ActionButton
              color="green"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            >
              Create Session
            </ActionButton>
          </Link>
        </PageHeader>
        
        <ContentCard>
          {/* View toggle buttons */}
          <div className="mb-6 flex space-x-2">
            <button
              onClick={() => setViewMode('upcoming')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewMode === 'upcoming' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setViewMode('past')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewMode === 'past' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewMode === 'all' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
          
          {/* Sessions table */}
          <DataTable 
            columns={columns}
            data={sessions}
            isLoading={loading}
            emptyMessage={`No ${viewMode} sessions found`}
          />
        </ContentCard>
      </div>
    </DashboardLayout>
  );
};

export default ScheduleManagement;