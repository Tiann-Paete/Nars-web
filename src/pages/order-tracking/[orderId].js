import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Check } from 'lucide-react';

const OrderTracking = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(`/api/order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      setOrderDetails(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  if (!orderDetails) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  const progressSteps = [
    { status: 'Order Placed', message: 'We\'ve received your order!' },
    { status: 'Processing', message: 'We\'re preparing your order.' },
    { status: 'Shipped', message: 'Your order is on its way!' },
    { status: 'Delivered', message: 'Your order has been delivered!' },
    { status: 'Received', message: 'You\'ve received your order!' }
  ];

  const statusSteps = [
    { status: 'Order Placed', message: 'We\'ve received your order!' },
    { status: 'Processing', message: 'We\'re preparing your order.' },
    { status: 'Shipped', message: 'Your order is on its way!' },
    { status: 'Delivered', message: 'Your order has been delivered!' },
    { status: 'Received', message: 'You\'ve received your order!' },
    { status: 'Returned', message: 'Your order has been returned.' },
    { status: 'Refunded', message: 'Your order has been fully refunded.' },
    { status: 'Cancelled', message: 'Your order has been cancelled.' },
    { status: 'Return Cancelled', message: 'We apologize, but your return request has been cancelled.' }
  ];

  const isNonTrackingStatus = ['Returned', 'Refunded', 'Cancelled', 'Return Cancelled'].includes(orderDetails.status);
  const currentStatusIndex = isNonTrackingStatus ? -1 : progressSteps.findIndex(step => step.status === orderDetails.status);

  const CircleProgress = ({ step, index }) => {
    const isCompleted = index < currentStatusIndex;
    const isCurrent = index === currentStatusIndex;
    const isActive = isCompleted || isCurrent;
    const isGrayed = isNonTrackingStatus;
    const isLast = index === progressSteps.length - 1;

    const isChecked = orderDetails.status === 'Received' || isCompleted;
    const isRefundedOrReturned = orderDetails.status === 'Refunded' || orderDetails.status === 'Returned';

    return (
      <li className={`flex flex-col items-center relative w-full ${!isLast ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block after:absolute after:top-5 after:left-[50%] after:z-0" : ""} ${
        isCompleted ? "after:border-orange-500" : "after:border-gray-200"
      }`}>
        <span className={`flex items-center justify-center w-10 h-10 lg:h-12 lg:w-12 rounded-full shrink-0 transition-all duration-300 z-10 ${
          isGrayed ? 'bg-gray-200' :
          isChecked ? 'bg-orange-500' :
          isRefundedOrReturned ? 'bg-orange-300' :
          isCurrent ? 'bg-orange-500' :
          'bg-gray-200'
        }`}>
          {isGrayed ? (
            <div className="w-4 h-4 text-gray-500" />
          ) : isChecked ? (
            <Check className="w-5 h-5 text-white" />
          ) : isRefundedOrReturned ? (
            <Check className="w-5 h-5 text-gray-200" />
          ) : isCurrent ? (
            <div className="w-3 h-3 rounded-full bg-white" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-gray-300" />
          )}
        </span>
        
        <span className={`mt-4 text-sm text-center w-32 ${
          isGrayed ? 'text-gray-500' :
          isActive ? 'text-orange-500 font-semibold' : 'text-gray-500'
        }`}>
          {step.status}
        </span>
      </li>
    );
  };

  const isCancelled = orderDetails.status === 'Cancelled';
  const isReturned = orderDetails.status === 'Returned';
  const isRefunded = orderDetails.status === 'Refunded';
  const isReturnCancelled = orderDetails.status === 'Return Cancelled';

  const getStatusMessage = (status, orderId) => {
    switch (status) {
      case 'Order Placed':
        return `Your order #${orderId} has already been placed and will be with you soon.`;
      case 'Processing':
        return `Your order #${orderId} has already been processed and will be with you soon.`;
      case 'Shipped':
        return `Your order #${orderId} has already shipped and will be with you soon.`;
      case 'Delivered':
        return `Your order #${orderId} has been delivered.`;
      case 'Received':
        return `You've successfully received order #${orderId}. Thank you for shopping with us!`;
      case 'Returned':
        return `Order #${orderId} has been returned and is being processed.`;
      case 'Refunded':
        return `Your refund for order #${orderId} has been completed. The amount has been credited to your original payment method.`;
      case 'Cancelled':
        return `Your order #${orderId} has been cancelled.`;
      case 'Return Cancelled':
        return `We apologize, your return request for order #${orderId} has been cancelled. Please contact our support team for assistance.`;
      default:
        return `Your order #${orderId} is being processed.`;
    }
  };

  const getStatusStepMessage = () => {
    const currentStatus = statusSteps.find(step => step.status === orderDetails.status);
    if (currentStatus) {
      return currentStatus.message;
    }
    return 'Order status unknown';
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4 sm:p-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-8xl mx-auto p-6">
          <div className="text-left mb-8">
            <h1 className={`text-xl font-small mb-2 ${isCancelled || isReturned || isRefunded || isReturnCancelled ? 'text-gray-500' : 'text-orange-500'}`}>
              {isCancelled ? 'Order Cancelled' : 
               isReturned ? 'Order Returned' :
               isRefunded ? 'Refund Accepted' :
               isReturnCancelled ? 'Return Request Cancelled' :
               'Thank You!'}
            </h1>
            
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              {getStatusStepMessage()}
            </h2>
            
            <p className="text-lg text-gray-600 mb-4">
              {getStatusMessage(orderDetails.status, orderDetails.orderId)}
            </p>
          </div>
          
          <div className="mb-12 overflow-x-auto">
            <div className="flex justify-between items-center min-w-max px-16 py-4">
              {progressSteps.map((step, index) => (
                <CircleProgress key={step.status} step={step} index={index} />
              ))}
            </div>
          </div>
          
          {/* Rest of the component remains the same... */}
          {/* Tracking Number */}
          <div className="text-left mb-8">
            <p className="text-gray-600">
              <span className="font-semibold">Tracking Number:</span> {orderDetails.trackingNumber}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            {/* Ordered Items */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Ordered Items</h3>
              <div className="bg-white p-4 rounded-lg max-h-80 overflow-y-auto">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div className="flex items-center">
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                      <span className="font-semibold text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs mr-2">x{item.quantity}</span>
                      <span className="font-semibold">₱{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Billing Information */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Billing Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-600"><span className="font-semibold">Full Name:</span> {orderDetails.billingInfo.fullName}</p>
                <p className="text-gray-600"><span className="font-semibold">Phone Number:</span> {orderDetails.billingInfo.phoneNumber}</p>
                <p className="text-gray-600"><span className="font-semibold">Address:</span> {orderDetails.billingInfo.address}</p>
                <p className="text-gray-600"><span className="font-semibold">City:</span> {orderDetails.billingInfo.city}</p>
                <p className="text-gray-600"><span className="font-semibold">State/Province:</span> {orderDetails.billingInfo.stateProvince}</p>
                <p className="text-gray-600"><span className="font-semibold">Postal Code:</span> {orderDetails.billingInfo.postalCode}</p>
                <p className="text-gray-600"><span className="font-semibold">Delivery Address:</span> {orderDetails.billingInfo.deliveryAddress}</p>
              </div>
              
              <h3 className="text-xl font-bold mb-4 text-gray-800">Payment Method</h3>
              <p className="text-gray-600 mb-6">{orderDetails.paymentMethod}</p>
              
              <h3 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">₱{orderDetails.subtotal}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-semibold">₱{orderDetails.delivery}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-4 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span className={
                    isCancelled || isReturned || isRefunded || isReturnCancelled
                      ? 'text-gray-500'
                      : 'text-orange-500'
                  }>₱{orderDetails.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/home')}
            className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;