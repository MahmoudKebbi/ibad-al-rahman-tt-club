import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import ActionButton from '../../components/common/ActionButton';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    scheduledSessions: 0,
    pendingPayments: 0,
  });
  
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch users count
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const totalMembers = usersSnapshot.size;
        
        // Count active members (non-guest users)
        const activeMembers = usersSnapshot.docs.filter(
          doc => doc.data().role === 'member' || doc.data().role === 'admin'
        ).length;
        
        // Fetch recent members
        const recentMembersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentMembersSnapshot = await getDocs(recentMembersQuery);
        const recentMembersData = recentMembersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A'
        }));

        // Set data
        setStats({
          totalMembers,
          activeMembers,
          // For demo purposes, using placeholder data for these
          scheduledSessions: 12,
          pendingPayments: 5,
        });
        
        setRecentMembers(recentMembersData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Define columns for the recent members table
  const memberColumns = [
    {
      title: 'Name',
      field: 'displayName',
      render: (member) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            {member.photoURL ? (
              <img 
                src={member.photoURL} 
                alt={member.displayName} 
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <span className="text-lg font-medium text-gray-600">
                {member.displayName?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{member.displayName}</div>
            <div className="text-sm text-gray-500">{member.phoneNumber || 'No phone'}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Email',
      field: 'email',
      render: (member) => (
        <div className="text-sm text-gray-500">{member.email || 'No email'}</div>
      )
    },
    {
      title: 'Role',
      field: 'role',
      render: (member) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
            member.role === 'member' ? 'bg-green-100 text-green-800' : 
            'bg-gray-100 text-gray-800'}`}>
          {member.role}
        </span>
      )
    },
    {
      title: 'Joined',
      field: 'createdAt'
    }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader title="Dashboard Overview" />
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Members" 
            value={loading ? '...' : stats.totalMembers}
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="green"
          />
          
          <StatsCard 
            title="Active Members" 
            value={loading ? '...' : stats.activeMembers}
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            color="blue"
          />
          
          <StatsCard 
            title="Scheduled Sessions" 
            value={loading ? '...' : stats.scheduledSessions}
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="purple"
          />
          
          <StatsCard 
            title="Pending Payments" 
            value={loading ? '...' : stats.pendingPayments}
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="yellow"
          />
        </div>
        
        {/* Recent members */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Members</h3>
          <DataTable 
            columns={memberColumns}
            data={recentMembers}
            isLoading={loading}
            emptyMessage="No members found"
            footerContent={
              <a href="/admin/members" className="text-sm font-medium text-green-600 hover:text-green-500">
                View all members
              </a>
            }
          />
        </div>
        
        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              color="green"
              onClick={() => {/* Navigate to add member page */}}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            >
              Add New Member
            </ActionButton>
            
            <ActionButton
              color="blue"
              onClick={() => {/* Navigate to schedule page */}}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            >
              Schedule Session
            </ActionButton>
            
            <ActionButton
              color="purple"
              onClick={() => {/* Generate report function */}}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              Generate Report
            </ActionButton>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;