import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { checkOutMember } from '../../services/firebase/attendance';
import { formatTime, formatDate, calculateDuration, AttendanceStatus } from '../../models/Attendance';


import ContentCard from '../../components/layout/ContentCard';
import ActionButton from '../../components/common/ActionButton';
import InputField from '../../components/common/InputField';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';

const AttendanceDetails = () => {
  const { attendanceId } = useParams();
  const navigate = useNavigate();
  
  const [attendance, setAttendance] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkOutNotes, setCheckOutNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Fetch attendance and member details
  useEffect(() => {
    const fetchData = async () => {
      if (!attendanceId) {
        setError('No attendance record ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get attendance record
        const attendanceDoc = await getDoc(doc(db, 'attendance', attendanceId));
        
        if (!attendanceDoc.exists()) {
          setError('Attendance record not found');
          setLoading(false);
          return;
        }
        
        const attendanceData = attendanceDoc.data();
        const formattedAttendance = {
          id: attendanceId,
          ...attendanceData,
          checkInTime: attendanceData.checkInTime?.toDate() || new Date(attendanceData.checkInTime),
          checkOutTime: attendanceData.checkOutTime?.toDate() || attendanceData.checkOutTime ? new Date(attendanceData.checkOutTime) : null,
          createdAt: attendanceData.createdAt?.toDate() || new Date(attendanceData.createdAt)
        };
        
        setAttendance(formattedAttendance);
        
        // Get member details
        if (attendanceData.memberId) {
          const memberDoc = await getDoc(doc(db, 'users', attendanceData.memberId));
          
          if (memberDoc.exists()) {
            setMember({
              id: memberDoc.id,
              ...memberDoc.data()
            });
          }
        }
      } catch (err) {
        console.error('Error fetching attendance details:', err);
        setError(`Failed to load attendance details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [attendanceId]);
  
  // Handle check out
  const handleCheckOut = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      // Perform check-out
      const result = await checkOutMember(attendanceId, {
        notes: checkOutNotes,
        adminId: 'MahmoudKebbi', // Current admin ID
        adminName: 'MahmoudKebbi', // Current admin name
      });
      
      // Update local state
      setAttendance({
        ...attendance,
        ...result,
        checkOutTime: result.checkOutTime instanceof Date ? result.checkOutTime : new Date(result.checkOutTime)
      });
      
      setSuccessMessage('Member has been successfully checked out.');
      setCheckOutNotes('');
    } catch (err) {
      console.error('Error checking out member:', err);
      setError(`Failed to check out member: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4">
          <PageHeader 
            title="Attendance Details" 
            showBackButton
            backButtonLabel="Back to Attendance"
            onBackClick={() => navigate('/admin/attendance')}
          />
          
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
        </div>
      </DashboardLayout>
    );
  }
  
  if (!attendance) return null;
  
  const isCheckedIn = attendance.status === AttendanceStatus.CHECKED_IN;
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader 
          title="Attendance Details" 
          showBackButton
          backButtonLabel="Back to Attendance"
          onBackClick={() => navigate('/admin/attendance')}
        />
        
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          {/* Attendance Status */}
          <ContentCard className="mb-6">
            <div className="flex items-start">
              <div className={`rounded-full p-3 ${
                isCheckedIn ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {isCheckedIn ? 'Currently Checked In' : 'Attendance Record'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isCheckedIn ? (
                    `Member is currently checked in. Check-in time: ${formatTime(attendance.checkInTime)}`
                  ) : (
                    `Attendance completed. Duration: ${calculateDuration(attendance.checkInTime, attendance.checkOutTime)}`
                  )}
                </p>
              </div>
              
              <div className="ml-auto">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  isCheckedIn ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isCheckedIn ? 'Checked In' : 'Checked Out'}
                </span>
              </div>
            </div>
          </ContentCard>
          
          {/* Member Information */}
          <ContentCard title="Member Information" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {member ? (
                    <span 
                      className="text-green-600 cursor-pointer hover:underline"
                      onClick={() => navigate(`/admin/members/${member.id}`)}
                    >
                      {member.displayName}
                    </span>
                  ) : attendance.memberName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member ID</p>
                <p className="font-medium">{attendance.memberId}</p>
              </div>
              {member && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{member.phoneNumber || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </ContentCard>
          
          {/* Attendance Details */}
          <ContentCard title="Attendance Details" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(attendance.checkInTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Attendance Type</p>
                <p className="font-medium capitalize">{attendance.attendanceType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-In Time</p>
                <p className="font-medium">{formatTime(attendance.checkInTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-Out Time</p>
                <p className="font-medium">
                  {attendance.checkOutTime ? formatTime(attendance.checkOutTime) : 'Not checked out yet'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">
                  {attendance.checkOutTime 
                    ? calculateDuration(attendance.checkInTime, attendance.checkOutTime)
                    : 'In progress'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-In Method</p>
                <p className="font-medium capitalize">{attendance.checkInMethod?.replace('-', ' ') || 'N/A'}</p>
              </div>
            </div>
            
            {attendance.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="font-medium">{attendance.notes}</p>
              </div>
            )}
          </ContentCard>
          
          {/* Check Out Form (if still checked in) */}
          {isCheckedIn && (
            <ContentCard title="Check Out Member">
              <InputField
                label="Check-Out Notes (Optional)"
                value={checkOutNotes}
                onChange={(e) => setCheckOutNotes(e.target.value)}
                placeholder="Any notes about this session"
              />
              
              <div className="mt-6 flex justify-end space-x-4">
                <ActionButton
                  onClick={() => navigate('/admin/attendance')}
                  color="gray"
                  disabled={processing}
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  onClick={handleCheckOut}
                  color="red"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Check Out Member'}
                </ActionButton>
              </div>
            </ContentCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceDetails;