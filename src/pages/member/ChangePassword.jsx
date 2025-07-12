import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import FormSection from '../../components/form/FormSection';
import InputField from '../../components/common/InputField';
import FormButtonGroup from '../../components/form/FormButtonGroup';
import AlertMessage from '../../components/common/AlertMessage';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../../services/firebase/config';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Submission and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  
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
  
  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };
  
  // Validate the form
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      // For a real implementation, use Firebase Auth
      // const credential = EmailAuthProvider.credential(
      //   auth.currentUser.email,
      //   formData.currentPassword
      // );
      // 
      // // Re-authenticate user
      // await reauthenticateWithCredential(auth.currentUser, credential);
      // 
      // // Update password
      // await updatePassword(auth.currentUser, formData.newPassword);
      
      // Simulate success for demo
      // In a real app, this would be replaced with actual Firebase auth code
      setTimeout(() => {
        setFormAlert({
          type: 'success',
          message: 'Password updated successfully!'
        });
        
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate('/member/profile');
        }, 2000);
      }, 1000);
      
    } catch (error) {
      console.error('Error changing password:', error);
      
      let errorMessage = 'Error changing password. Please try again.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
        setFormErrors({
          ...formErrors,
          currentPassword: 'Current password is incorrect'
        });
      }
      
      setFormAlert({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/member/profile');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader 
          title="Change Password" 
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
          <FormSection 
            title="Password Update" 
            description="Update your account password. Please make sure to use a strong password that you don't use elsewhere."
          >
            <div className="space-y-4">
              <InputField
                label="Current Password"
                name="currentPassword"
                type={showPasswords.currentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleChange}
                required
                error={formErrors.currentPassword}
                placeholder="Enter your current password"
                icon={
                  <svg 
                    className="h-5 w-5 text-gray-400 cursor-pointer" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                  >
                    {showPasswords.currentPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                }
                onIconClick={() => togglePasswordVisibility('currentPassword')}
              />
              
              <InputField
                label="New Password"
                name="newPassword"
                type={showPasswords.newPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange}
                required
                error={formErrors.newPassword}
                placeholder="Enter your new password"
                helpText="Use at least 8 characters with a mix of letters, numbers & symbols"
                icon={
                  <svg 
                    className="h-5 w-5 text-gray-400 cursor-pointer" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    onClick={() => togglePasswordVisibility('newPassword')}
                  >
                    {showPasswords.newPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                }
                onIconClick={() => togglePasswordVisibility('newPassword')}
              />
              
              <InputField
                label="Confirm New Password"
                name="confirmPassword"
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                error={formErrors.confirmPassword}
                placeholder="Confirm your new password"
                icon={
                  <svg 
                    className="h-5 w-5 text-gray-400 cursor-pointer" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {showPasswords.confirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                }
                onIconClick={() => togglePasswordVisibility('confirmPassword')}
              />
            </div>
            
            <div className="mt-6">
              <FormButtonGroup
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitText="Update Password"
                isSubmitting={isSubmitting}
                align="right"
              />
            </div>
          </FormSection>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ChangePassword;