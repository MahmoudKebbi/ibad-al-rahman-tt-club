import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { checkOutMember } from '../../services/firebase/attendance';
import { formatTime, calculateDuration } from '../../models/Attendance';


import ContentCard from '../layout/ContentCard';
import InputField from '../../components/ui/InputField';
import ActionButton from '../common/ActionButton';

const CheckOutForm = ({ attendanceId, onSuccess, onCancel }) => {
  const [attendance, setAttendance] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    notes: '',
  });

  // Fetch attendance record and member data
  useEffect(() => {
    const fetchData = async () => {
      if (!attendanceId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch attendance document
        const attendanceDoc = await getDoc(doc(db, 'attendance', attendanceId));
        if (!attendanceDoc.exists()) {
          setError('Attendance record not found');
          setLoading(false);
          return;
        }

        const attendanceData = attendanceDoc.data();
        setAttendance({
          id: attendanceDoc.id,
          ...attendanceData,
          checkInTime: attendanceData.checkInTime?.toDate?.() || attendanceData.checkInTime,
          checkOutTime: attendanceData.checkOutTime?.toDate?.() || attendanceData.checkOutTime
        });

        // Fetch member document
        const memberDoc = await getDoc(doc(db, 'users', attendanceData.memberId));
        if (memberDoc.exists()) {
          setMember({
            id: memberDoc.id,
            ...memberDoc.data()
          });
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to load attendance data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [attendanceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!attendanceId) {
      setError('Attendance record ID is required');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Prepare check-out data
      const checkOutData = {
        notes: formData.notes,
        adminId: 'MahmoudKebbi', // Current admin ID
        adminName: 'MahmoudKebbi', // Current admin name
      };
      
      // Perform check-out
      const result = await checkOutMember(attendanceId, checkOutData);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Error checking out member:', err);
      setError(`Check-out failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If already checked out
  if (attendance?.checkOutTime) {
    return (
      <ContentCard title="Member Already Checked Out">
        <div className="bg-yellow-50 p-4 rounded-md mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {member?.displayName || 'Member'} is already checked out
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Checked out at: {formatTime(attendance.checkOutTime)}</p>
                <p>Duration: {calculateDuration(attendance.checkInTime, attendance.checkOutTime)}</p>
                {attendance.notes && <p>Notes: {attendance.notes}</p>}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <ActionButton
            onClick={onCancel}
            color="gray"
          >
            Cancel
          </ActionButton>
          <ActionButton
            onClick={() => onSuccess(attendance)}
            color="blue"
          >
            View Attendance
          </ActionButton>
        </div>
      </ContentCard>
    );
  }

  return (
    <ContentCard title="Check Out Member">
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
      
      {attendance && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Attendance Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Member</p>
              <p className="font-medium">{member?.displayName || attendance.memberName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Check-In Time</p>
              <p className="font-medium">{formatTime(attendance.checkInTime)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{new Date(attendance.checkInTime).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{attendance.attendanceType}</p>
            </div>
            {attendance.notes && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Check-In Notes</p>
                <p className="font-medium">{attendance.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <InputField
            label="Check-Out Notes (Optional)"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any comments about this check-out"
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <ActionButton
            type="button"
            onClick={onCancel}
            color="gray"
          >
            Cancel
          </ActionButton>
          <ActionButton
            type="submit"
            disabled={submitting}
            color="red"
          >
            {submitting ? 'Checking Out...' : 'Check Out Member'}
          </ActionButton>
        </div>
      </form>
    </ContentCard>
  );
};

export default CheckOutForm;