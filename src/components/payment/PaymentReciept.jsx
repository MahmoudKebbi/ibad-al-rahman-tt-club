import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaymentById } from '../../services/firebase/payments';
import { formatCurrency, getPaymentMethodLabel } from '../../models/Payment';
import { format } from 'date-fns';


import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import ContentCard from '../../components/layout/ContentCard';
import ActionButton from '../../components/common/ActionButton';
import LoadingScreen from '../common/LoadingScreen';

const PaymentReceipt = () => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const receiptRef = useRef();

  useEffect(() => {
    const fetchPayment = async () => {
      if (!paymentId) return;
      
      try {
        setLoading(true);
        
        // Get payment from Firebase
        const paymentData = await getPaymentById(paymentId);
        setPayment(paymentData);
      } catch (err) {
        console.error('Error fetching payment:', err);
        setError('Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayment();
  }, [paymentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingScreen />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4">
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
        </div>
      </DashboardLayout>
    );
  }

  if (!payment) return null;


  const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader 
          title="Payment Receipt" 
          showBackButton
          children={
            <ActionButton
              onClick={handlePrint}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              }
              color="blue"
            >
              Print Receipt
            </ActionButton>
          }
        />
        
        <div className="max-w-2xl mx-auto" ref={receiptRef}>
          <ContentCard
            footer={
              <div className="text-center text-sm text-gray-500">
                <p>Thank you for your payment. This receipt was generated on {format(new Date(), 'MMMM d, yyyy')}.</p>
                <p className="mt-1">For questions or concerns, please contact the club administration.</p>
                <p className="mt-4 text-xs text-gray-400">
                  Receipt ID: {payment.id}
                  <br />
                  Generated: {currentDateTime}
                  <br />
                  Ibad Al Rahman Table Tennis Club
                </p>
              </div>
            }
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Payment Receipt</h1>
                <p className="text-gray-600">Ibad Al Rahman Table Tennis Club</p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-xl">RECEIPT</p>
                {payment.receiptNumber && (
                  <p className="text-gray-600">#{payment.receiptNumber}</p>
                )}
              </div>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Receipt ID</p>
                  <p className="font-medium">{payment.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="font-medium">{format(payment.paymentDate, 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{getPaymentMethodLabel(payment.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recorded By</p>
                  <p className="font-medium">{payment.recordedBy?.uid || 'Administrator'}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Member Information</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p><span className="font-medium">Name:</span> {payment.memberName}</p>
                <p><span className="font-medium">Member ID:</span> {payment.memberId}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Membership Details</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Membership Type</span>
                  <span className="font-medium">{payment.membershipName}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Valid From</span>
                  <span className="font-medium">{format(payment.paymentDate, 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Valid Until</span>
                  <span className="font-medium">
                    {payment.expirationDate ? format(payment.expirationDate, 'MMMM d, yyyy') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                  <span className="text-gray-600 font-medium">Amount Paid</span>
                  <span className="font-bold text-lg">{formatCurrency(payment.amount)}</span>
                </div>
              </div>
            </div>
            
            {payment.notes && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Notes</h2>
                <p className="text-gray-600">{payment.notes}</p>
              </div>
            )}
          </ContentCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentReceipt;