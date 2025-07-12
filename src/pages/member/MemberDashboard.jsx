import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import ContentCard from '../../components/layout/ContentCard';
import StatusBadge from '../../components/common/StatusBadge';
import ActionButton from '../../components/common/ActionButton';
import DataTable from '../../components/common/DataTable';
import { collection, doc, getDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { useSelector } from 'react-redux';
import { getAllSessions } from '../../services/firebase/sessions';
import { getCurrentAttendance } from '../../services/firebase/attendance';
import { getMemberPayments } from '../../services/firebase/payments';

const MemberDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [memberProfile, setMemberProfile] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({
    status: 'loading',
    nextPayment: '',
    amount: ''
  });
  const [loading, setLoading] = useState(true);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch member profile
        const profileDoc = await getDoc(doc(db, 'memberProfiles', user.uid));
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setMemberProfile({
            ...profileData,
            membershipExpiration: profileData.membershipExpiration?.toDate() || null,
            lastVisit: profileData.lastVisit?.toDate() || null,
            weeklyResetDate: profileData.weeklyResetDate?.toDate() || null,
            monthlyResetDate: profileData.monthlyResetDate?.toDate() || null
          });
          
          // Determine payment status
          const now = new Date();
          const expirationDate = profileData.membershipExpiration?.toDate() || null;
          
          if (profileData.membershipStatus === 'active' && expirationDate && expirationDate > now) {
            // Active membership
            setPaymentStatus({
              status: 'paid',
              nextPayment: expirationDate.toLocaleDateString(),
              amount: profileData.membershipFee || '$50.00' // Use actual fee if available
            });
          } else if (expirationDate && now > expirationDate) {
            // Expired membership
            setPaymentStatus({
              status: 'overdue',
              nextPayment: 'Immediately',
              amount: profileData.membershipFee || '$50.00'
            });
          } else {
            // No active membership or about to expire
            setPaymentStatus({
              status: 'due',
              nextPayment: 'Now',
              amount: profileData.membershipFee || '$50.00'
            });
          }
        } else {
          setError('Member profile not found. Please contact the administrator.');
        }
        
        // Fetch recent payments
        const payments = await getMemberPayments(user.uid, { limit: 1 });
        if (payments.length > 0) {
          const latestPayment = payments[0];
          // You could use this to show more payment details if needed
        }
        
        // Fetch current attendance status
        const attendance = await getCurrentAttendance(user.uid);
        setCurrentAttendance(attendance);
        
        // Fetch upcoming sessions
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const sessions = await getAllSessions({
          startDate: today,
          endDate: nextWeek
        });
        
        // Format sessions for display
        const formattedSessions = sessions.map(session => ({
          id: session.id,
          date: new Date(session.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }),
          time: `${session.startTime} - ${session.endTime}`,
          type: session.title || session.type,
          coach: session.coach
        }));
        
        setUpcomingSessions(formattedSessions);
        
      } catch (err) {
        console.error('Error fetching member data:', err);
        setError('Failed to load your profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [user?.uid]);

  // Handle navigation to attendance page
  const handleAttendanceView = () => {
    navigate('/member/attendance');
  };

  // Handle navigation to payments page
  const handlePaymentsView = () => {
    navigate('/member/payments');
  };
  
  // Handle navigation to profile page
  const handleProfileView = () => {
    navigate('/member/profile');
  };

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
      field: 'type',
      render: (row) => (
        <span className="capitalize">{row.type}</span>
      )
    },
    {
      title: 'Coach',
      field: 'coach'
    }
  ];

  // Calculate membership usage
  const getMembershipUsage = () => {
    if (!memberProfile) return { text: 'N/A', percentage: 0 };
    
    const { membershipType, daysUsedThisWeek } = memberProfile;
    
    // Map membership types to allowed days per week
    const daysPerWeekMap = {
      'one-day-weekly': 1,
      'two-days-weekly': 2,
      'three-days-weekly': 3,
      'unlimited': 7
    };
    
    const daysAllowed = daysPerWeekMap[membershipType] || 0;
    
    if (daysAllowed === 0) return { text: 'No membership', percentage: 0 };
    
    const percentage = Math.min(Math.round((daysUsedThisWeek / daysAllowed) * 100), 100);
    
    return {
      text: `${daysUsedThisWeek} of ${daysAllowed} days used this week`,
      percentage
    };
  };
  
  const membershipUsage = getMembershipUsage();

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader title={`Welcome, ${user?.displayName || 'Member'}`} />

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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

        {/* Member Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
              <div className="ml-4 flex-grow">
                <h3 className="font-medium text-gray-800">Membership Payment Status</h3>
                <div className="mt-1 flex items-center">
                  <StatusBadge status={paymentStatus.status} />
                  <span className="ml-2">
                    {paymentStatus.status === 'paid' ? (
                      <span className="text-green-700">Your membership is active. Next payment due on {paymentStatus.nextPayment}.</span>
                    ) : paymentStatus.status === 'due' ? (
                      <span className="text-yellow-700">Payment of {paymentStatus.amount} due on {paymentStatus.nextPayment}.</span>
                    ) : paymentStatus.status === 'loading' ? (
                      <span className="text-gray-700">Loading payment information...</span>
                    ) : (
                      <span className="text-red-700">Your payment of {paymentStatus.amount} is overdue. Please settle to maintain membership.</span>
                    )}
                  </span>
                </div>
              </div>
              <div>
                <ActionButton
                  color="green"
                  size="sm"
                  onClick={handlePaymentsView}
                >
                  View Payments
                </ActionButton>
              </div>
            </div>
          </ContentCard>

          {/* Attendance Status Card */}
          <ContentCard>
            <div className="flex items-center">
              <div className={`rounded-full p-3 ${currentAttendance ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="font-medium text-gray-800">Attendance Status</h3>
                <div className="mt-1">
                  {loading ? (
                    <span className="text-gray-700">Loading attendance information...</span>
                  ) : currentAttendance ? (
                    <span className="text-green-700">You are currently checked in. Check-in time: {new Date(currentAttendance.checkInTime).toLocaleTimeString()}</span>
                  ) : (
                    <span className="text-blue-700">You are not currently checked in.</span>
                  )}
                </div>
                
                {/* Membership Usage Progress */}
                {memberProfile && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{membershipUsage.text}</span>
                      <span>{membershipUsage.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          membershipUsage.percentage < 70 ? 'bg-green-500' : 
                          membershipUsage.percentage < 90 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`} 
                        style={{ width: `${membershipUsage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <ActionButton
                  color="blue"
                  size="sm"
                  onClick={handleAttendanceView}
                >
                  View History
                </ActionButton>
              </div>
            </div>
          </ContentCard>
        </div>

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
                onClick={() => navigate('/member/schedule')}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              >
                View Training Schedule
              </ActionButton>
              
              <ActionButton 
                color="blue" 
                fullWidth 
                size="sm"
                onClick={handleAttendanceView}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              >
                View Attendance History
              </ActionButton>
              
              <ActionButton 
                color="blue" 
                fullWidth 
                size="sm"
                onClick={handleProfileView}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              >
                Update Profile
              </ActionButton>
            </div>
          </ContentCard>
          
          <ContentCard title="Club Announcements">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-800 font-medium">July 2025 Tournament</p>
                <p className="text-xs text-gray-500 mt-1">Registration open for the summer tournament starting August 15th. Limited spots available!</p>
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">New Equipment Arrival</p>
                <p className="text-xs text-gray-500 mt-1">We've received new competition-grade tables and nets. Try them out at your next session!</p>
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">Membership Renewal Discount</p>
                <p className="text-xs text-gray-500 mt-1">10% discount on membership renewals completed before the 25th of each month.</p>
              </div>
            </div>
          </ContentCard>
        </div>
        
        {/* Last Visit Information */}
        {memberProfile?.lastVisit && (
          <ContentCard>
            <div className="flex items-center space-x-4">
              <div className="rounded-full p-3 bg-purple-100 text-purple-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Your last visit was on</p>
                <p className="font-medium">
                  {new Date(memberProfile.lastVisit).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="ml-auto">
                <p className="text-sm text-gray-500">Membership Type</p>
                <p className="font-medium capitalize">
                  {memberProfile.membershipType?.replace(/-/g, ' ') || 'No active membership'}
                </p>
              </div>
            </div>
          </ContentCard>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;