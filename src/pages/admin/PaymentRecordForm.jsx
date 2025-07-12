import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { recordMembershipPayment } from '../../services/firebase/payments';
import { 
  MembershipTypes, 
  PaymentMethod, 
  getMembershipById
} from '../../models/Payment';
import { format } from 'date-fns';


import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import ContentCard from '../../components/layout/ContentCard';
import InputField from '../../components/common/InputField';
import SelectField from '../../components/common/SelectField';
import ActionButton from '../../components/common/ActionButton';

const PaymentRecordForm = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  
  const [member, setMember] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    membershipType: 'two-days-weekly',
    paymentMethod: 'cash',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    receiptNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Fetch member data and profile if memberId is provided
  useEffect(() => {
    const fetchMemberData = async () => {
      if (!memberId) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch user document
        const memberDoc = await getDoc(doc(db, 'users', memberId));
        
        if (!memberDoc.exists()) {
          setError('Member not found');
          setLoading(false);
          return;
        }
        
        const memberData = {
          id: memberDoc.id,
          ...memberDoc.data()
        };
        
        setMember(memberData);
        
        // Fetch member profile document
        const profileDoc = await getDoc(doc(db, 'memberProfiles', memberId));
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setMemberProfile({
            ...profileData,
            lastVisit: profileData.lastVisit?.toDate?.() || profileData.lastVisit,
            weeklyResetDate: profileData.weeklyResetDate?.toDate?.() || profileData.weeklyResetDate,
            monthlyResetDate: profileData.monthlyResetDate?.toDate?.() || profileData.monthlyResetDate
          });
        } else {
          console.warn('Member profile not found');
        }
        
        // Pre-fill amount based on the default membership type
        setFormData(prev => ({
          ...prev,
          amount: MembershipTypes.TWO_DAYS_WEEKLY.price.toString()
        }));
      } catch (err) {
        console.error('Error fetching member data:', err);
        setError('Failed to load member data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemberData();
  }, [memberId]);
  
  // Update amount when membership type changes
  useEffect(() => {
    const selectedMembership = getMembershipById(formData.membershipType);
    if (selectedMembership) {
      setFormData(prev => ({
        ...prev,
        amount: selectedMembership.price.toString()
      }));
    }
  }, [formData.membershipType]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!memberId) {
      setError('Member ID is required');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const paymentDate = new Date(formData.paymentDate);
      
      // Use the payment service to record the payment
      await recordMembershipPayment(memberId, formData.membershipType, {
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: paymentDate,
        notes: formData.notes,
        receiptNumber: formData.receiptNumber,
        recordedBy: 'MahmoudKebbi' // Current user
      });
      
      // Redirect to member details
      navigate(`/admin/members/${memberId}`);
    } catch (err) {
      console.error('Error recording payment:', err);
      setError(`Failed to record payment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader
          title="Record Membership Payment"
          showBackButton
          backButtonLabel="Back to Members"
          onBackClick={() => navigate('/admin/members')}
        />
        
        <div className="max-w-3xl mx-auto">
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
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <ContentCard>
              {member && (
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Member Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{member.displayName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{member.email}</p>
                    </div>
                    
                    {memberProfile && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Current Membership</p>
                          <p className="font-medium">
                            {memberProfile.membershipType 
                              ? `${getMembershipById(memberProfile.membershipType)?.name || memberProfile.membershipType} (${memberProfile.membershipStatus || 'unknown'})`
                              : 'None'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Visit</p>
                          <p className="font-medium">
                            {memberProfile.lastVisit ? new Date(memberProfile.lastVisit).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Weekly Usage</p>
                          <p className="font-medium">
                            {memberProfile.daysUsedThisWeek} days 
                            (Resets: {memberProfile.weeklyResetDate ? new Date(memberProfile.weeklyResetDate).toLocaleDateString() : 'N/A'})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Monthly Usage</p>
                          <p className="font-medium">
                            {memberProfile.daysUsedThisMonth} days
                            (Resets: {memberProfile.monthlyResetDate ? new Date(memberProfile.monthlyResetDate).toLocaleDateString() : 'N/A'})
                          </p>
                        </div>
                      </>
                    )}
                    
                    {member.membershipExpiration && (
                      <div>
                        <p className="text-sm text-gray-500">Expires</p>
                        <p className="font-medium">
                          {new Date(member.membershipExpiration.toDate?.() || member.membershipExpiration).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <SelectField
                    label="Membership Type"
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleChange}
                    required
                    options={Object.values(MembershipTypes)
                      .filter(type => type.isActive)
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map(type => ({
                        value: type.id,
                        label: `${type.name} (${type.price} USD) - ${type.daysPerWeek} days/week`
                      }))}
                  />
                  
                  <InputField
                    label="Amount (USD)"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                  
                  <SelectField
                    label="Payment Method"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                    options={[
                      { value: PaymentMethod.CASH, label: 'Cash' },
                      { value: PaymentMethod.WHISH, label: 'Whish' },
                      { value: PaymentMethod.OTHER, label: 'Other' }
                    ]}
                  />
                  
                  <InputField
                    label="Payment Date"
                    name="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    required
                  />
                  
                  <InputField
                    label="Receipt Number (Optional)"
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleChange}
                  />
                </div>
                
                <InputField
                  label="Notes (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="mb-4"
                />
                
                <div className="flex justify-end space-x-4 mt-6">
                  <ActionButton
                    onClick={() => navigate('/admin/members')}
                    color="gray"
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton
                    type="submit"
                    disabled={submitting}
                    color="green"
                  >
                    {submitting ? 'Recording...' : 'Record Payment'}
                  </ActionButton>
                </div>
              </form>
            </ContentCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentRecordForm;