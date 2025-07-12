import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { checkInMember, checkOutMember, getCurrentAttendance } from '../../services/firebase/attendance';
import { AttendanceType, CheckInMethod } from '../../models/Attendance';


import ContentCard from '../../components/layout/ContentCard';
import InputField from '../../components/common/InputField';
import ActionButton from '../../components/common/ActionButton';
import SelectField from '../../components/common/SelectField';

const QuickCheckInOut = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [attendanceType, setAttendanceType] = useState(AttendanceType.REGULAR);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  
  // Search for members
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearching(true);
      setSearchError(null);
      setSearchResults([]);
      
      // Query users collection
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'member'),
        orderBy('displayName')
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      // Filter results based on search term
      const term = searchTerm.toLowerCase();
      const results = querySnapshot.docs
        .filter(doc => {
          const data = doc.data();
          return (
            data.displayName?.toLowerCase().includes(term) ||
            data.email?.toLowerCase().includes(term) ||
            data.phoneNumber?.includes(searchTerm) ||
            doc.id.includes(searchTerm)
          );
        })
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setSearchError('No members found matching your search criteria.');
      }
    } catch (error) {
      console.error('Error searching members:', error);
      setSearchError('Failed to search for members. Please try again.');
    } finally {
      setSearching(false);
    }
  };
  
  // Handle member selection
  const handleSelectMember = async (member) => {
    setSelectedMember(member);
    setSearchResults([]);
    
    try {
      // Check if member is already checked in
      const attendance = await getCurrentAttendance(member.id);
      setCurrentAttendance(attendance);
    } catch (error) {
      console.error('Error checking current attendance:', error);
    }
  };
  
  // Handle check in
  const handleCheckIn = async () => {
    if (!selectedMember) return;
    
    try {
      setProcessing(true);
      setStatusMessage(null);
      
      // Prepare check-in data
      const checkInData = {
        memberName: selectedMember.displayName,
        attendanceType: attendanceType,
        notes: notes,
        checkInMethod: CheckInMethod.FRONT_DESK,
        adminId: 'MahmoudKebbi', // Current admin ID
        adminName: 'MahmoudKebbi', // Current admin name
      };
      
      // Perform check-in
      const result = await checkInMember(selectedMember.id, checkInData);
      
      setCurrentAttendance(result);
      setStatusMessage({
        type: 'success',
        text: `${selectedMember.displayName} has been successfully checked in.`
      });
      
      // Reset form
      setNotes('');
      setAttendanceType(AttendanceType.REGULAR);
    } catch (error) {
      console.error('Error checking in member:', error);
      setStatusMessage({
        type: 'error',
        text: `Check-in failed: ${error.message}`
      });
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle check out
  const handleCheckOut = async () => {
    if (!currentAttendance) return;
    
    try {
      setProcessing(true);
      setStatusMessage(null);
      
      // Perform check-out
      await checkOutMember(currentAttendance.id, {
        notes: notes,
        adminId: 'MahmoudKebbi', // Current admin ID
        adminName: 'MahmoudKebbi', // Current admin name
      });
      
      setCurrentAttendance(null);
      setStatusMessage({
        type: 'success',
        text: `${selectedMember.displayName} has been successfully checked out.`
      });
      
      // Reset after a delay
      setTimeout(() => {
        setSelectedMember(null);
        setNotes('');
        setStatusMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error checking out member:', error);
      setStatusMessage({
        type: 'error',
        text: `Check-out failed: ${error.message}`
      });
    } finally {
      setProcessing(false);
    }
  };
  
  // Reset everything
  const handleReset = () => {
    setSelectedMember(null);
    setCurrentAttendance(null);
    setSearchTerm('');
    setSearchResults([]);
    setNotes('');
    setAttendanceType(AttendanceType.REGULAR);
    setStatusMessage(null);
  };
  
  // Handle search input with Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <ContentCard title="Quick Check-In / Check-Out">
      {statusMessage && (
        <div className={`mb-4 p-4 rounded-md ${
          statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${
                statusMessage.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`} fill="currentColor" viewBox="0 0 20 20">
                {statusMessage.type === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                )}
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{statusMessage.text}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Member Search */}
      {!selectedMember ? (
        <div>
          <div className="flex space-x-2 mb-4">
            <InputField
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mb-0 flex-grow"
            />
            <ActionButton
              onClick={handleSearch}
              disabled={searching || !searchTerm.trim()}
              color="blue"
            >
              {searching ? 'Searching...' : 'Search'}
            </ActionButton>
          </div>
          
          {searchError && (
            <p className="text-sm text-red-600 mb-4">{searchError}</p>
          )}
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 border rounded-md divide-y">
              {searchResults.map((member) => (
                <div 
                  key={member.id} 
                  className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => handleSelectMember(member)}
                >
                  <div>
                    <p className="font-medium">{member.displayName}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <div>
                    <ActionButton
                      size="sm"
                      color="green"
                    >
                      Select
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Member Selected - Check In/Out Form */
        <div>
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{selectedMember.displayName}</h3>
                <p className="text-sm text-gray-500">{selectedMember.email}</p>
              </div>
              <ActionButton
                size="sm"
                color="gray"
                onClick={handleReset}
              >
                Change Member
              </ActionButton>
            </div>
          </div>
          
          {currentAttendance ? (
            /* Check Out Form */
            <div>
              <div className="mb-4 bg-blue-50 p-4 rounded-md">
                <p className="text-blue-700">
                  This member is currently checked in since {new Date(currentAttendance.checkInTime).toLocaleTimeString()} on {new Date(currentAttendance.checkInTime).toLocaleDateString()}.
                </p>
              </div>
              
              <InputField
                label="Check-Out Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this session"
              />
              
              <div className="mt-6 flex justify-end space-x-4">
                <ActionButton
                  onClick={handleReset}
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
            </div>
          ) : (
            /* Check In Form */
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <SelectField
                  label="Attendance Type"
                  value={attendanceType}
                  onChange={(e) => setAttendanceType(e.target.value)}
                  options={[
                    { value: AttendanceType.REGULAR, label: 'Regular Training' },
                    { value: AttendanceType.COACHING, label: 'Coaching Session' },
                    { value: AttendanceType.EVENT, label: 'Special Event' },
                    { value: AttendanceType.COMPETITION, label: 'Competition' }
                  ]}
                />
                
                <InputField
                  label="Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about this check-in"
                />
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <ActionButton
                  onClick={handleReset}
                  color="gray"
                  disabled={processing}
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  onClick={handleCheckIn}
                  color="green"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Check In Member'}
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      )}
    </ContentCard>
  );
};

export default QuickCheckInOut;