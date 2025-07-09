import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import ContentCard from '../../components/layout/ContentCard';
import StatusBadge from '../../components/common/StatusBadge';
import ActionButton from '../../components/common/ActionButton';
import DataTable from '../../components/common/DataTable';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { useSelector } from 'react-redux';

const MemberDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState({
    status: 'paid', // or 'due', 'overdue'
    nextPayment: '2025-08-01',
    amount: '$50.00'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would fetch real data from Firestore in a complete implementation
    const fetchMemberData = async () => {
      try {
        // For demo purposes using placeholder data
        setUpcomingSessions([
          {
            id: '1',
            date: '2025-07-10',
            time: '18:00 - 20:00',
            type: 'Regular Training',
            coach: 'Ahmed Hassan'
          },
          {
            id: '2',
            date: '2025-07-14',
            time: '19:00 - 21:00',
            type: 'Advanced Training',
            coach: 'Sarah Ahmed'
          },
          {
            id: '3',
            date: '2025-07-17',
            time: '18:00 - 20:00',
            type: 'Regular Training',
            coach: 'Ahmed Hassan'
          }
        ]);
      } catch (error) {
        console.error('Error fetching member data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [/*user.uid*/]);

  // Define columns for the sessions table
  const sessionColumns = [
    {
      title: 'Date',
      field: 'date'
    },
    {
      title: 'Time',
      field: 'time'
    },
    {
      title: 'Type',
      field: 'type'
    },
    {
      title: 'Coach',
      field: 'coach'
    }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader title={`Welcome, ${user?.displayName || 'Member'}`} />

        {/* Payment Status Card */}
        <ContentCard>
          <div className="flex items-center">
            <div className={`rounded-full p-3 
              ${paymentStatus.status === 'paid' ? 'bg-green-100 text-green-600' : 
               paymentStatus.status === 'due' ? 'bg-yellow-100 text-yellow-600' : 
               'bg-red-100 text-red-600'}`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-800">Membership Payment Status</h3>
              <div className="mt-1 flex items-center">
                <StatusBadge status={paymentStatus.status} />
                <span className="ml-2">
                  {paymentStatus.status === 'paid' ? (
                    <span className="text-green-700">Your membership is active. Next payment due on {paymentStatus.nextPayment}.</span>
                  ) : paymentStatus.status === 'due' ? (
                    <span className="text-yellow-700">Payment of {paymentStatus.amount} due on {paymentStatus.nextPayment}.</span>
                  ) : (
                    <span className="text-red-700">Your payment of {paymentStatus.amount} is overdue. Please settle to maintain membership.</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </ContentCard>

        {/* Upcoming Sessions */}
        <ContentCard 
          title="Upcoming Training Sessions"
          footer={
            <a href="/member/schedule" className="text-sm font-medium text-green-600 hover:text-green-500">
              View full schedule
            </a>
          }
          noPadding
        >
          <DataTable 
            columns={sessionColumns}
            data={upcomingSessions}
            isLoading={loading}
            emptyMessage="No upcoming sessions scheduled"
          />
        </ContentCard>

        {/* Quick Actions & Announcements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ContentCard title="Quick Actions">
            <div className="space-y-3">
              <ActionButton 
                color="blue" 
                fullWidth 
                size="sm"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              >
                Register for special event
              </ActionButton>
              
              <ActionButton 
                color="blue" 
                fullWidth 
                size="sm"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              >
                Contact coach
              </ActionButton>
              
              <ActionButton 
                color="blue" 
                fullWidth 
                size="sm"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                Download membership card
              </ActionButton>
            </div>
          </ContentCard>
          
          <ContentCard title="Club Announcements">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-800 font-medium">Summer Tournament</p>
                <p className="text-xs text-gray-500 mt-1">Registration open for the summer tournament starting August 15th.</p>
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">Facility Maintenance</p>
                <p className="text-xs text-gray-500 mt-1">The club will be closed for maintenance on July 20th.</p>
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">New Coach</p>
                <p className="text-xs text-gray-500 mt-1">Welcome our new coach, Sarah Ahmed, joining the team next week.</p>
              </div>
            </div>
          </ContentCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;