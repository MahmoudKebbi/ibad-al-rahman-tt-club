import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import FormSection from '../../components/form/FormSection';
import InputField from '../../components/common/InputField';
import SelectField from '../../components/common/SelectField';
import FormButtonGroup from '../../components/form/FormButtonGroup';
import AlertMessage from '../../components/common/AlertMessage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    birthDate: '',
    gender: '',
    address: '',
    city: '',
    playingLevel: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  
  // Submission and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Options for select fields
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ];
  
  const playingLevelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'competitive', label: 'Competitive' }
  ];
  
  // Load user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, fetch from Firestore
        // const userDoc = await getDoc(doc(db, 'users', user.uid));
        // if (userDoc.exists()) {
        //   const userData = userDoc.data();
        //   setFormData({
        //     firstName: userData.firstName || '',
        //     lastName: userData.lastName || '',
        //     phoneNumber: userData.phoneNumber || '',
        //     birthDate: userData.birthDate || '',
        //     gender: userData.gender || '',
        //     address: userData.address || '',
        //     city: userData.city || '',
        //     playingLevel: userData.playingLevel || '',
        //     emergencyContactName: userData.emergencyContact?.name || '',
        //     emergencyContactPhone: userData.emergencyContact?.phone || ''
        //   });
        // }
        
        // For demo purposes, use placeholder data
        setFormData({
          firstName: 'Mahmoud',
          lastName: 'Kebbi',
          phoneNumber: '+201234567890',
          birthDate: '1985-06-15',
          gender: 'male',
          address: '123 Main St',
          city: 'Cairo',
          playingLevel: 'intermediate',
          emergencyContactName: 'Ahmed Kebbi',
          emergencyContactPhone: '+201234567891'
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setFormAlert({
          type: 'error',
          message: 'Error loading profile data. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchUserData();
    }
  }, [user?.uid]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    // Phone validation
    if (formData.phoneNumber && !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }
    
    // Emergency contact phone validation (if provided)
    if (formData.emergencyContactPhone && 
        !/^\+?[0-9]{10,15}$/.test(formData.emergencyContactPhone.replace(/\s/g, ''))) {
      errors.emergencyContactPhone = 'Please enter a valid phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setFormAlert({
        type: 'error',
        message: 'Please fix the errors in the form before submitting.'
      });
      return;
    }
    
    setIsSubmitting(true);
    setFormAlert(null);
    
    try {
      // Prepare profile data
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        phoneNumber: formData.phoneNumber,
        birthDate: formData.birthDate,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        playingLevel: formData.playingLevel,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone
        },
        updatedAt: new Date()
      };
      
      // In a real implementation, update Firestore
      // await updateDoc(doc(db, 'users', user.uid), profileData);
      
      // Show success message
      setFormAlert({
        type: 'success',
        message: 'Profile updated successfully!'
      });
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/member/profile');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      setFormAlert({
        type: 'error',
        message: 'Error updating profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/member/profile');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4">
          <PageHeader title="Edit Profile" showBackButton onBackClick={handleCancel} />
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader 
          title="Edit Profile" 
          showBackButton
          onBackClick={handleCancel}
        />
        
        {formAlert && (
          <AlertMessage
            type={formAlert.type}
            message={formAlert.message}
            onClose={() => setFormAlert(null)}
          />
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <FormSection 
            title="Personal Information" 
            description="Update your basic personal information."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                error={formErrors.firstName}
                placeholder="Enter first name"
              />
              
              <InputField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                error={formErrors.lastName}
                placeholder="Enter last name"
              />
              
              <InputField
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={formErrors.phoneNumber}
                placeholder="Enter phone number"
              />
              
              <InputField
                label="Birth Date"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                error={formErrors.birthDate}
              />
              
              <SelectField
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={genderOptions}
                error={formErrors.gender}
                placeholder="Select gender"
              />
              
              <SelectField
                label="Playing Level"
                name="playingLevel"
                value={formData.playingLevel}
                onChange={handleChange}
                options={playingLevelOptions}
                error={formErrors.playingLevel}
                placeholder="Select playing level"
              />
            </div>
          </FormSection>
          
          {/* Address Information */}
          <FormSection 
            title="Address Information" 
            description="Update your address details."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={formErrors.address}
                  placeholder="Enter street address"
                />
              </div>
              
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={formErrors.city}
                placeholder="Enter city"
              />
            </div>
          </FormSection>
          
          {/* Emergency Contact */}
          <FormSection 
            title="Emergency Contact" 
            description="Provide details of someone to contact in case of emergency."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Contact Name"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                error={formErrors.emergencyContactName}
                placeholder="Enter emergency contact name"
              />
              
              <InputField
                label="Contact Phone"
                name="emergencyContactPhone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                error={formErrors.emergencyContactPhone}
                placeholder="Enter emergency contact phone"
              />
            </div>
            
            <FormButtonGroup
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitText="Update Profile"
              isSubmitting={isSubmitting}
              align="right"
            />
          </FormSection>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ProfileEdit;