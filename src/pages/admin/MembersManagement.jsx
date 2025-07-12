import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import SearchAndFilter from '../../components/common/SearchAndFilter';
import DataTable from '../../components/common/DataTable';
import ActionButton from '../../components/common/ActionButton';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { useNavigate } from 'react-router-dom';

const MembersManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const navigate = useNavigate();

  const roleFilterOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
    { value: 'guest', label: 'Guest' }
  ];

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('displayName'));
        const querySnapshot = await getDocs(q);
        
        const membersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A'
        }));
        
        setMembers(membersData);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);


  const filteredMembers = members.filter(member => {
    const matchesSearch = member.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Function to change user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date()
      });
      
      // Update local state
      setMembers(members.map(member => 
        member.id === userId ? { ...member, role: newRole } : member
      ));
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Please try again.');
    }
  };

  const handleAddNewMember = () => {
    try {
    // Navigate to add new member page
    navigate('/admin/members/new');
    } catch (error) {
      console.error('Error navigating to add new member:', error);
    }
  }




  // Define columns for the members table
  const columns = [
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
    },
    {
      title: 'Actions',
      render: (member) => (
        <div className="flex space-x-2">
          <select
            value={member.role}
            onChange={(e) => handleRoleChange(member.id, e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="guest">Guest</option>
            <option value="coach">Coach</option>
          </select>
          <ActionButton 
            color="blue" 
            size="sm"
            onClick={() => {/* View profile function */}}
          >
            View
          </ActionButton>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader title="Members Management">
          <SearchAndFilter 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterOptions={roleFilterOptions}
            filterValue={filterRole}
            onFilterChange={setFilterRole}
            placeholder="Search members..."
          />
        </PageHeader>

        <div className="mb-4 flex justify-end">
          <ActionButton
            color="green"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            onClick={() => handleAddNewMember()}
          >
            Add New Member
          </ActionButton>
        </div>

        <DataTable 
          columns={columns}
          data={filteredMembers}
          isLoading={loading}
          emptyMessage="No members found"
          footerContent={
            <div className="text-sm text-gray-500">
              Showing {filteredMembers.length} of {members.length} members
            </div>
          }
        />
      </div>
    </DashboardLayout>
  );
};

export default MembersManagement;