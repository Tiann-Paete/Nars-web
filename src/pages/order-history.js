import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import RatingModal from '../components/RatingModal';
import { Star, Loader, ShoppingBag, Check } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/order-history', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setError(error.response?.data?.error || 'An error occurred while fetching order history');
    } finally {
      setLoading(false);
    }
  };

  const handleRateProduct = async (order) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/order/${order.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      const detailedOrder = response.data;
      
      const preparedOrder = {
        ...detailedOrder,
        items: detailedOrder.items.map(item => ({
          ...item,
          name: item.name,
          imageUrl: item.imageUrl || '/placeholder-image.jpg'
        }))
      };
      
      setSelectedOrder(preparedOrder);
      setShowRatingModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('An error occurred while fetching order details');
    }
  };

  const handleRatingSubmit = async ({ orderId, ratings, feedback }) => {
    try {
      if (!orderId) {
        throw new Error('No order selected or invalid order ID');
      }
      const token = localStorage.getItem('authToken');
      await axios.post(`/api/submit-ratings/${orderId}`, 
        { ratings, feedback }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      setShowRatingModal(false);
      fetchOrderHistory();
    } catch (error) {
      console.error('Error submitting ratings:', error);
      setError('An error occurred while submitting ratings');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processed': return 'text-orange-500';
      case 'Shipped': return 'text-orange-500';
      case 'Delivered': return 'text-green-500';
      case 'Received': return 'text-green-600';
      case 'Cancelled': return 'text-red-500';
      case 'Returned': return 'text-yellow-600';
      default: return 'text-orange-400';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Received':
        return 'bg-green-100 text-green-600';
      case 'Returned':
        return 'bg-yellow-100 text-yellow-600';
      case 'Cancelled':
        return 'bg-red-100 text-red-500';
      case 'Delivered':
        return 'bg-green-100 text-green-600';
      case 'Return Cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-orange-100 text-orange-500';
    }
  };

  const toggleProductList = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const renderProductList = (products, orderId) => {
    const productList = products.split(', ');
    const displayedProducts = productList.slice(0, 5);
    const remainingProducts = productList.slice(5);
  
    return (
      <div>
        <p className="font-semibold mb-2">Products Ordered:</p>
        <ul className="list-disc pl-5">
          {displayedProducts.map((product, index) => (
            <li key={index}>{product}</li>
          ))}
          {remainingProducts.length > 0 && (
            <li>
              {expandedOrders[orderId] ? (
                <>
                  {remainingProducts.map((product, index) => (
                    <span key={index + displayedProducts.length}>{product}<br /></span>
                  ))}
                </>
              ) : (
                <span 
                  className="text-orange-500 cursor-pointer"
                  onClick={() => toggleProductList(orderId)}
                >
                  ... {remainingProducts.length} more {remainingProducts.length === 1 ? 'product' : 'products'}
                </span>
              )}
            </li>
          )}
        </ul>
        {expandedOrders[orderId] && remainingProducts.length > 0 && (
          <p 
            className="text-orange-500 cursor-pointer mt-2"
            onClick={() => toggleProductList(orderId)}
          >
            Show less
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => router.back()} 
        className="mb-4 text-orange-500 hover:text-orange-600"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader className="w-12 h-12 text-orange-500 animate-spin" />
          <p className="mt-4 text-lg text-gray-600">Loading your order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">You haven't placed any orders yet</h2>
          <p className="text-gray-600 mb-4">Start shopping and make your first order!</p>
          <button 
            onClick={() => router.push('/home')}
            className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            Explore Products
          </button>
        </div>
      ) : (
        <ul className="space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="p-6 border rounded-lg shadow-md bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold">Order ID: {order.id}</p>
                  <p>Tracking Number: {order.tracking_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeStyle(order.status)}`}>
                  {order.status === 'Received' && <Check size={16} className="inline mr-1" />}
                  {order.status}
                </span>
              </div>
              <p>Date: {new Date(order.order_date).toLocaleDateString()}</p>
              <p>Total: ₱{typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</p>
              {renderProductList(order.products, order.id)}
              {(order.status === 'Delivered' || order.status === 'Received') && order.is_rated === 0 && (
                <button
                  onClick={() => handleRateProduct(order)}
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300 flex items-center shadow-sm"
                >
                  <Star className="mr-2" size={18} />
                  Rate Products
                </button>
              )}
              {order.is_rated === 1 && (
                <p className="mt-4 text-green-600 bg-green-100 px-4 py-2 rounded-md inline-block shadow-sm">Thank you for rating this order!</p>
              )}
            </li>
          ))}
        </ul>
      )}
      {showRatingModal && selectedOrder && (
        <RatingModal
          order={selectedOrder}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default OrderHistory;