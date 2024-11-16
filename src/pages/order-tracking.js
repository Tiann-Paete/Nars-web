import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AlertTriangle, X, ShoppingBag, Loader, Check } from 'lucide-react';

const CancelConfirmationModal = ({ isOpen, onClose, onConfirm, orderId, isReturn, orderDetails }) => {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherReason, setOtherReason] = useState('');
  
  const returnReasons = [
    { value: 'defective', label: 'Defective or Damaged Product' },
    { value: 'wrong_item', label: 'Received Wrong Item' },
    { value: 'quality', label: 'Quality Not as Expected' },
    { value: 'incomplete', label: 'Incomplete Set/Missing Parts' },
    { value: 'size_issue', label: 'Size/Dimension Issue' },
    { value: 'packaging', label: 'Damaged Packaging' },
    { value: 'duplicate', label: 'Duplicate/Multiple Orders' },
    { value: 'performance', label: 'Poor Performance/Not Working as Described' },
    { value: 'other', label: 'Other Reason' }
  ];
  
  if (!isOpen) return null;

  const handleReasonChange = (value) => {
    setSelectedReasons(prev => {
      if (prev.includes(value)) {
        return prev.filter(reason => reason !== value);
      } else {
        return [...prev, value];
      }
    });
    
    if (value === 'other' && selectedReasons.includes('other')) {
      setOtherReason('');
    }
  };

  const getFinalReasons = () => {
    const selectedLabels = selectedReasons
      .filter(value => value !== 'other')
      .map(value => returnReasons.find(reason => reason.value === value)?.label)
      .filter(Boolean);

    if (selectedReasons.includes('other') && otherReason.trim()) {
      selectedLabels.push(`Other: ${otherReason.trim()}`);
    }

    return selectedLabels.join('; ');
  };

  const handleConfirmReturn = async () => {
    try {
      await onConfirm(orderId, getFinalReasons());
      onClose();
      setSelectedReasons([]);
      setOtherReason('');
    } catch (error) {
      console.error('Error confirming return:', error);
      // Handle the error, e.g., display an error message
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto animate-scale-in md:max-w-5xl">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {isReturn ? 'Return Product' : 'Cancel Order'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="md:flex">
          {/* Left side - Return Reasons */}
          <div className="p-6 md:w-1/2 md:border-r">
            <div className="flex items-center mb-4 text-amber-600">
              <AlertTriangle size={24} className="mr-2" />
              <p className="font-semibold">
                {isReturn 
                  ? 'Are you sure you want to return this product?' 
                  : 'Are you sure you want to cancel this order?'}
              </p>
            </div>

            {isReturn && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Please select reason(s) for return:
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                  {returnReasons.map((reason) => (
                    <label key={reason.value} className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedReasons.includes(reason.value)}
                        onChange={() => handleReasonChange(reason.value)}
                        className="mt-1 h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 accent-orange-500 [&:checked]:bg-orange-500 [&:checked]:hover:bg-orange-500"
                      />
                      <span className="text-sm text-gray-700">{reason.label}</span>
                    </label>
                  ))}
                </div>
                
                {selectedReasons.includes('other') && (
                  <div className="mt-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Please specify other reason:
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows="3"
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      required
                      placeholder="Please provide details about your return reason..."
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Order Details */}
          <div className="p-6 md:w-1/2">
            <p className="mb-4 text-gray-600 font-medium">Order ID: {orderId}</p>
            <div className="space-y-4">
              {orderDetails && orderDetails.items && orderDetails.items.map((item, index) => (
                <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="ml-4">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Price: ₱{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex justify-end space-x-4">
          <button
          onClick={onClose}
          className="px-4 py-2 border border-orange-500 text-orange-500 hover:bg-orange-100 px-4 py-2 rounded transition-colors"
        >
          No, Keep Order
        </button>
        <button
          onClick={handleConfirmReturn}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          disabled={isReturn && (selectedReasons.length === 0 || (selectedReasons.includes('other') && !otherReason.trim()))}
        >
          {isReturn ? 'Yes, Return Product' : 'Yes, Cancel Order'}
        </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isReturn, setIsReturn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await axios.get('/api/all-orders', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        setError('You are not authorized to view this page. Please log in again.');
      } else {
        setError(error.response?.data?.error || 'An error occurred while fetching orders');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      setSelectedOrderDetails(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.response?.data?.error || 'An error occurred while fetching order details');
    }
  };

  const handleCancelOrder = async (orderId) => {
    setSelectedOrderId(orderId);
    await fetchOrderDetails(orderId);
    setIsModalOpen(true);
  };

  const handleReturn = async (orderId) => {
    setSelectedOrderId(orderId);
    await fetchOrderDetails(orderId);
    setIsReturn(true);
    setIsModalOpen(true);
  };

  const confirmAction = async (orderId, reason = null) => {
    try {
      const token = localStorage.getItem('authToken');
      if (isReturn) {
        await axios.post(`/api/return-order/${orderId}`, { reason }, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
      } else {
        await axios.post(`/api/cancel-order/${orderId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
      }
      fetchOrders();
    } catch (error) {
      console.error(`Error ${isReturn ? 'returning' : 'cancelling'} order:`, error);
      setError(error.response?.data?.error || `An error occurred while ${isReturn ? 'returning' : 'cancelling'} the order`);
    } finally {
      setIsReturn(false);
    }
  };

  const handleOrderReceived = async (orderId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`/api/order-received/${orderId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      // Update the local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'Received' }
            : order
        )
      );
    } catch (error) {
      console.error('Error marking order as received:', error);
      setError(error.response?.data?.error || 'An error occurred while updating the order status');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Received':
        return 'bg-green-100 text-green-600';
      case 'Delivered':
        return 'bg-green-100 text-green-600';
      case 'Processed':
        return 'bg-orange-50 text-orange-500';
      case 'Shipped':
        return 'bg-orange-100 text-orange-600';
      case 'Cancelled':
        return 'bg-red-100 text-red-500';
      case 'Returned':
        return 'bg-yellow-100 text-yellow-600';
      case 'Refunded':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-orange-50 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="mt-4 text-lg text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => router.back()} 
        className="mb-4 text-orange-500 hover:text-orange-600"
      >
         ← Back
      </button>
      <h1 className="text-2xl font-bold mb-6">Order Tracking</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">You haven't ordered yet</h2>
          <p className="text-gray-600 mb-4">Explore our products and place your first order!</p>
          <button 
            onClick={() => router.push('/home')}
            className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <li 
              key={order.id} 
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-lg hover:shadow-gray-400 transition-shadow"
              onClick={() => router.push(`/order-tracking/${order.id}`)}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-lg">Order ID: {order.id}</p>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(order.status)}`}>
                  {order.status === 'Received' && <Check size={16} className="inline mr-1" />}
                  {order.status}
                </span>
              </div>
              <p className="mb-1">Tracking Number: {order.tracking_number}</p>
              <p className="mb-1">Date: {new Date(order.order_date).toLocaleDateString()}</p>
              <p className="mb-3">Total: ₱{(Number(order.total) || 0).toFixed(2)}</p>
              <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                {order.status === 'Order Placed' && (
                  <button 
                onClick={() => {
                  setIsReturn(false);
                  handleCancelOrder(order.id);
                }}
                className="border border-red-500 text-red-500 hover:bg-red-100 px-4 py-2 rounded"
              >
                Cancel Order
              </button>
            )}
            {(order.status === 'Delivered' || order.status === 'Received') && (
              <>
                <button 
                  onClick={() => handleReturn(order.id)}
                  className="border border-orange-500 text-orange-500 hover:bg-orange-100 px-4 py-2 rounded"
                >
                  Return/Refund
                </button>
                {order.status === 'Delivered' && (
                  <button 
                    onClick={() => handleOrderReceived(order.id)}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center"
                  >
                    Order Received
                  </button>
                )}
              </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <CancelConfirmationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsReturn(false);
          setSelectedOrderDetails(null);
        }}
        onConfirm={confirmAction}
        orderId={selectedOrderId}
        isReturn={isReturn}
        orderDetails={selectedOrderDetails}
      />
    </div>
  );
};

export default OrderTracking;