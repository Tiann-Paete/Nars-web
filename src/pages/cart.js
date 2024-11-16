import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/router';
import GCashModal from '../components/GCashModal';
import { CheckCircle, Loader, Truck  } from 'lucide-react';
import CheckoutReceipt from '../components/CheckoutReceipt';

const MINDANAO_CITIES = {
  "Davao City": "Davao del Sur",
  "Panabo City": "Davao del Norte",
  "Tagum City": "Davao del Norte",
  "Samal City": "Davao del Norte",
  "Digos City": "Davao del Sur",
  "Mati City": "Davao Oriental",
  "Cagayan de Oro City": "Misamis Oriental",
  "Iligan City": "Lanao del Norte",
  "Malaybalay City": "Bukidnon",
  "Valencia City": "Bukidnon",
  "Oroquieta City": "Misamis Occidental",
  "Ozamis City": "Misamis Occidental",
  "Tangub City": "Misamis Occidental",
  "Zamboanga City": "Zamboanga del Sur",
  "Pagadian City": "Zamboanga del Sur",
  "Dipolog City": "Zamboanga del Norte",
  "Dapitan City": "Zamboanga del Norte",
  "General Santos City": "South Cotabato",
  "Koronadal City": "South Cotabato",
  "Tacurong City": "Sultan Kudarat",
  "Kidapawan City": "Cotabato",
  "Butuan City": "Agusan del Norte",
  "Cabadbaran City": "Agusan del Norte",
  "Bayugan City": "Agusan del Sur",
  "Surigao City": "Surigao del Norte",
  "Tandag City": "Surigao del Sur",
  "Bislig City": "Surigao del Sur",
  "Cotabato City": "Maguindanao",
  "Marawi City": "Lanao del Sur"
};

const Cart = () => {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    deliveryAddress: 'Home'
  });
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [formErrors, setFormErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [productStock, setProductStock] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCheckoutReceipt, setShowCheckoutReceipt] = useState(false);
  const [showDeliveryAnimation, setShowDeliveryAnimation] = useState(false);



  useEffect(() => {
    const fetchProductStock = async () => {
      try {
        const response = await axios.get('/api/products');
        const stockMap = {};
        response.data.forEach(product => {
          // Using the stock_quantity from the API response which now comes from product_stocks
          stockMap[product.id] = product.stock_quantity;
        });
        setProductStock(stockMap);
      } catch (error) {
        console.error('Error fetching product stock:', error);
      }
    };

    fetchProductStock();
  }, []);

  const handleQuantityChange = (itemId, newQuantity) => {
    const availableStock = productStock[itemId] || 0;
    if (newQuantity > 0 && newQuantity <= availableStock) {
      updateQuantity(itemId, newQuantity, availableStock);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'city') {
      setBillingInfo({
        ...billingInfo,
        city: value,
        stateProvince: MINDANAO_CITIES[value] || ''
      });
    } else {
      setBillingInfo({ ...billingInfo, [name]: value });
    }
    
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleCitySelect = (city) => {
    setBillingInfo({
      ...billingInfo,
      city,
      stateProvince: MINDANAO_CITIES[city]
    });
    setIsDropdownOpen(false);
    setFormErrors({ ...formErrors, city: '' });
  };

  const calculateDelivery = () => {
    return 60.00;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = calculateDelivery();
  const total = subtotal + delivery;

  const validateForm = () => {
    const errors = {};
    Object.keys(billingInfo).forEach(key => {
      if (!billingInfo[key]) {
        errors[key] = 'This field is required';
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const placeOrder = async () => {
    if (!validateForm()) {
      return;
    }
  
    setIsLoading(true);
  
    if (paymentMethod === 'GCash') {
      setShowGCashModal(true);
      setShowCheckoutReceipt(false);
      setIsLoading(false);
    } else if (paymentMethod === 'COD') {
      await processOrder();
    }
  };

  const processOrder = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('/api/place-order', {
        billingInfo,
        paymentMethod,
        cartItems,
        subtotal,
        delivery,
        total
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.data.success) {
        setOrderId(response.data.orderId);
        setShowDeliveryAnimation(true);
        clearCart();
        setOrderPlaced(true);
      }
    } catch (error) {
      console.error('Error placing order:', error.response ? error.response.data : error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGCashPayment = async (fullName, gcashNumber) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('/api/place-order', {
        billingInfo,
        paymentMethod: 'GCash',
        paymentDetails: { fullName, gcashNumber },
        cartItems,
        subtotal,
        delivery,
        total
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setOrderId(response.data.orderId);
        setShowGCashModal(false);
        setShowDeliveryAnimation(true); // Show delivery animation after successful GCash payment
        clearCart();
        setOrderPlaced(true);
      }
    } catch (error) {
      console.error('Error placing order:', error.response ? error.response.data : error.message);
    }
  };
  
  const DeliveryAnimationAlert = ({ onClose, orderId, onOrderAgain, onCheckOrder }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowConfirmation(true);
      }, 6000);
  
      return () => clearTimeout(timer);
    }, []);
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <style>{`
          @keyframes tada {
            0% { transform: scale(1); }
            10%, 20% { transform: scale(0.9) rotate(-3deg); }
            30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
            40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
            100% { transform: scale(1) rotate(0); }
          }
          .animate-tada {
            animation: tada 1s ease-in-out;
          }
        `}</style>
        <div className={`bg-white p-8 rounded-lg max-w-md w-full ${showConfirmation ? 'animate-tada' : ''}`}>
          {!showConfirmation ? (
            <div className="flex flex-col items-center">
              <svg 
                viewBox="0 0 200 100" 
                className="w-48 h-32 mb-4"
              >
                {/* SVG content remains exactly the same */}
                {/* Sky Background */}
                <rect x="0" y="0" width="200" height="80" fill="#F0F9FF" />
                
                {/* Sun */}
                <circle cx="30" cy="20" r="8" fill="#FBBF24" />
                
                {/* Clouds */}
                <path d="M160,25 Q165,20 170,25 Q175,20 180,25 Q185,30 175,30 Q165,30 160,25" fill="#E2E8F0" />
                <path d="M130,15 Q135,10 140,15 Q145,10 150,15 Q155,20 145,20 Q135,20 130,15" fill="#E2E8F0" />
                
                {/* Road */}
                <rect x="0" y="80" width="200" height="20" fill="#94A3B8" />
                <line x1="10" y1="90" x2="30" y2="90" stroke="#E2E8F0" strokeWidth="2" />
                <line x1="50" y1="90" x2="70" y2="90" stroke="#E2E8F0" strokeWidth="2" />
                <line x1="90" y1="90" x2="110" y2="90" stroke="#E2E8F0" strokeWidth="2" />
                <line x1="130" y1="90" x2="150" y2="90" stroke="#E2E8F0" strokeWidth="2" />
                <line x1="170" y1="90" x2="190" y2="90" stroke="#E2E8F0" strokeWidth="2" />
  
                {/* Store with Updated Design */}
                <g transform="translate(20, 30)">
                  <rect x="0" y="15" width="35" height="35" fill="#64748B" />
                  <rect x="0" y="15" width="35" height="4" fill="#FB923C" />
                  <rect x="5" y="30" width="25" height="20" fill="#CBD5E1" />
                  <rect x="2" y="10" width="31" height="5" fill="#475569" />
                  <text x="4" y="14" fontSize="3.2" fill="white">NARS SCHOOL</text>
                  <text x="6" y="8" fontSize="3" fill="white">SUPPLIES</text>
                  <rect x="15" y="35" width="8" height="15" fill="#94A3B8" />
                  
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="15,25; 15,25; 55,25; 55,25"
                      keyTimes="0; 0.3; 0.4; 1"
                      dur="6s"
                      fill="freeze"
                    />
                    <g>
                      <animate 
                        attributeName="opacity"
                        values="1; 1; 0; 0"
                        keyTimes="0; 0.3; 0.4; 1"
                        dur="6s"
                        fill="freeze"
                      />
                      <rect width="12" height="12" fill="#854D0E" />
                      <line x1="0" y1="6" x2="12" y2="6" stroke="#A16207" strokeWidth="1" />
                      <line x1="6" y1="0" x2="6" y2="12" stroke="#A16207" strokeWidth="1" />
                    </g>
                  </g>
                </g>
                
                {/* Delivery Truck */}
                <g>
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="-50,0; 50,0; 50,0; 200,0"
                      keyTimes="0; 0.3; 0.8; 1"
                      dur="6s"
                      fill="freeze"
                    />
                    
                    <rect x="10" y="50" width="40" height="25" fill="#FB923C" rx="2" />
                    <rect x="8" y="65" width="44" height="2" fill="#EA580C" />
                    
                    <g>
                      <animate 
                        attributeName="opacity"
                        values="0; 0; 1; 1"
                        keyTimes="0; 0.4; 0.45; 1"
                        dur="6s"
                        fill="freeze"
                      />
                      <rect x="15" y="55" width="12" height="12" fill="#854D0E">
                        <animate
                          attributeName="x"
                          values="35;15;15"
                          keyTimes="0;0.1;1"
                          dur="0.3s"
                          begin="2.4s"
                          fill="freeze"
                        />
                      </rect>
                      <line x1="15" y1="61" x2="27" y2="61" stroke="#A16207" strokeWidth="1">
                        <animate
                          attributeName="x1"
                          values="35;15;15"
                          keyTimes="0;0.1;1"
                          dur="0.3s"
                          begin="2.4s"
                          fill="freeze"
                        />
                        <animate
                          attributeName="x2"
                          values="47;27;27"
                          keyTimes="0;0.1;1"
                          dur="0.3s"
                          begin="2.4s"
                          fill="freeze"
                        />
                      </line>
                      <line x1="21" y1="55" x2="21" y2="67" stroke="#A16207" strokeWidth="1">
                        <animate
                          attributeName="x1"
                          values="41;21;21"
                          keyTimes="0;0.1;1"
                          dur="0.3s"
                          begin="2.4s"
                          fill="freeze"
                        />
                        <animate
                          attributeName="x2"
                          values="41;21;21"
                          keyTimes="0;0.1;1"
                          dur="0.3s"
                          begin="2.4s"
                          fill="freeze"
                        />
                      </line>
                    </g>
  
                    <rect x="50" y="55" width="25" height="20" fill="#F97316" rx="4" />
                    <rect x="48" y="60" width="4" height="15" fill="#EA580C" />
                    
                    <rect x="55" y="60" width="15" height="8" fill="#BFDBFE" rx="1" />
                    <line x1="62" y1="60" x2="62" y2="68" stroke="#93C5FD" strokeWidth="1" />
                    
                    <circle cx="20" cy="80" r="6" fill="#1F2937">
                      <animate
                        attributeName="transform"
                        attributeType="XML"
                        type="rotate"
                        from="0 20 80"
                        to="360 20 80"
                        dur="1s"
                        repeatCount="6"
                        values="360 20 80;0 20 80;0 20 80;360 20 80"
                        keyTimes="0;0.3;0.8;1"
                      />
                    </circle>
                    <circle cx="20" cy="80" r="3" fill="#4B5563" />
                    <circle cx="60" cy="80" r="6" fill="#1F2937">
                      <animate
                        attributeName="transform"
                        attributeType="XML"
                        type="rotate"
                        from="0 60 80"
                        to="360 60 80"
                        dur="1s"
                        repeatCount="6"
                        values="360 60 80;0 60 80;0 60 80;360 60 80"
                        keyTimes="0;0.3;0.8;1"
                      />
                    </circle>
                    <circle cx="60" cy="80" r="3" fill="#4B5563" />
                  </g>
                </g>
                
                {/* House */}
                <g transform="translate(140, 35)">
                  <rect x="25" y="5" width="5" height="10" fill="#475569" />
                  <path d="M0,35 L20,15 L40,35" fill="#475569" />
                  <rect x="5" y="35" width="30" height="30" fill="#64748B" />
                  <rect x="15" y="45" width="10" height="20" fill="#CBD5E1" />
                  <circle cx="22" cy="55" r="1" fill="#1F2937" />
                  <rect x="8" y="40" width="6" height="6" fill="#BFDBFE" />
                  <rect x="26" y="40" width="6" height="6" fill="#BFDBFE" />
                </g>
              </svg>
              
              <h2 className="text-2xl font-bold text-orange-500 animate-bounce">
                Processing Order
              </h2>
              <p className="text-gray-600 mt-2">
                Your order is being prepared...
              </p>
            </div>
          ) : (
            <div className="animate-[fadeIn_0.5s_ease-in]">
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <Truck className="w-12 h-12 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-orange-500">Your order is confirmed!</h2>
                  <p className="text-gray-600">Order ID: {orderId}</p>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={onCheckOrder}
                  className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300 flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Check Your Order
                </button>
                
                <button
                  onClick={onOrderAgain}
                  className="w-full bg-orange-100 text-orange-500 px-4 py-3 rounded-lg hover:bg-orange-200 transition-colors duration-300"
                >
                  Order Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-8">
        <button 
          onClick={() => router.push('/home')} 
          className="mb-6 text-orange-500 hover:text-orange-600 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Products
        </button>
        
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="w-full md:w-1/2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Billing Address</h2>
              <form className="space-y-4">
                <div className="flex flex-col">
                  <label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-1"></label>
                  <input 
                    id="fullName"
                    name="fullName" 
                    value={billingInfo.fullName} 
                    onChange={handleInputChange} 
                    placeholder="Fullname" 
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 mb-1"></label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                      +63
                    </span>
                    <input 
                      id="phoneNumber"
                      name="phoneNumber" 
                      value={billingInfo.phoneNumber} 
                      onChange={handleInputChange} 
                      placeholder="Phone Number" 
                      className="flex-1 p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  {formErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>}
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1"></label>
                  <input 
                    id="address"
                    name="address" 
                    value={billingInfo.address} 
                    onChange={handleInputChange} 
                    placeholder="Address" 
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                </div>
                
                  <div className="flex gap-4">
        <div className="flex flex-col flex-1">
          <label htmlFor="city" className="text-sm font-medium text-gray-700 mb-1">City</label>
          <div className="relative">
            <button
            id="city"
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex w-full justify-between items-center rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {billingInfo.city || 'Select a city'}
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>

            {isDropdownOpen && (
  <div className="absolute left-0 z-10 mt-2 w-full max-h-[30vh] overflow-y-auto origin-top-right rounded-md bg-gray-100 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
    style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#CBD5E1 #F3F4F6',
    }}>
    <style jsx>{`
      .absolute::-webkit-scrollbar {
        width: 6px;
      }
      .absolute::-webkit-scrollbar-track {
        background: #F3F4F6;
        border-radius: 10px;
      }
      .absolute::-webkit-scrollbar-thumb {
        background: #CBD5E1;
        border-radius: 10px;
      }
      .absolute::-webkit-scrollbar-thumb:hover {
        background: #94A3B8;
      }
    `}</style>
    <div className="py-1">
      <div className="px-3 py-2 text-xs font-semibold text-gray-600">Davao Region</div>
      {["Davao City", "Panabo City", "Tagum City", "Samal City", "Digos City", "Mati City"].map((city) => (
        <button
          key={city}
          onClick={() => handleCitySelect(city)}
          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-200 transition-colors duration-150"
        >
          {city}
        </button>
      ))}
    </div>
    <div className="py-1">
      <div className="px-3 py-2 text-xs font-semibold text-gray-600">Northern Mindanao</div>
      {["Cagayan de Oro City", "Iligan City", "Malaybalay City", "Valencia City", "Oroquieta City", "Ozamis City", "Tangub City"].map((city) => (
        <button
          key={city}
          onClick={() => handleCitySelect(city)}
          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-200 transition-colors duration-150"
        >
          {city}
        </button>
      ))}
    </div>
    <div className="py-1">
      <div className="px-3 py-2 text-xs font-semibold text-gray-600">Zamboanga Peninsula</div>
      {["Zamboanga City", "Pagadian City", "Dipolog City", "Dapitan City"].map((city) => (
        <button
          key={city}
          onClick={() => handleCitySelect(city)}
          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-200 transition-colors duration-150"
        >
          {city}
        </button>
      ))}
    </div>
    <div className="py-1">
      <div className="px-3 py-2 text-xs font-semibold text-gray-600">SOCCSKSARGEN</div>
      {["General Santos City", "Koronadal City", "Tacurong City", "Kidapawan City"].map((city) => (
        <button
          key={city}
          onClick={() => handleCitySelect(city)}
          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-200 transition-colors duration-150"
        >
          {city}
        </button>
      ))}
    </div>
    <div className="py-1">
      <div className="px-3 py-2 text-xs font-semibold text-gray-600">CARAGA Region</div>
      {["Butuan City", "Cabadbaran City", "Bayugan City", "Surigao City", "Tandag City", "Bislig City"].map((city) => (
        <button
          key={city}
          onClick={() => handleCitySelect(city)}
          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-200 transition-colors duration-150"
        >
          {city}
        </button>
      ))}
    </div>
    <div className="py-1">
      <div className="px-3 py-2 text-xs font-semibold text-gray-600">BARMM</div>
      {["Cotabato City", "Marawi City"].map((city) => (
        <button
          key={city}
          onClick={() => handleCitySelect(city)}
          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-200 transition-colors duration-150"
        >
          {city}
        </button>
      ))}
    </div>
  </div>
)}
          </div>
          {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
        </div>

        <div className="flex flex-col flex-1">
          <label htmlFor="stateProvince" className="text-sm font-medium text-gray-700 mb-1">State/Province</label>
          <input
            id="stateProvince"
            name="stateProvince"
            value={billingInfo.stateProvince}
            readOnly
            className="w-full p-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Auto-filled based on city"
          />
        </div>
      </div>
                
                <div className="flex flex-col">
                  <label htmlFor="postalCode" className="text-sm font-medium text-gray-700 mb-1"></label>
                  <input 
                    id="postalCode"
                    name="postalCode" 
                    value={billingInfo.postalCode} 
                    onChange={handleInputChange} 
                    placeholder="Postal Code" 
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {formErrors.postalCode && <p className="text-red-500 text-sm mt-1">{formErrors.postalCode}</p>}
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-3 mt-4">Label as:</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <span className="relative">
                        <input
                          type="radio"
                          name="deliveryAddress"
                          value="Home"
                          checked={billingInfo.deliveryAddress === 'Home'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span className="block w-6 h-6 bg-white border border-gray-300 rounded-full"></span>
                        <span className={`absolute inset-0 rounded-full ${billingInfo.deliveryAddress === 'Home' ? 'bg-orange-500' : ''} transition-all duration-200 ease-in-out`} style={{ transform: billingInfo.deliveryAddress === 'Home' ? 'scale(0.5)' : 'scale(0)', opacity: billingInfo.deliveryAddress === 'Home' ? '1' : '0' }}></span>
                      </span>
                      <span className="ml-2">Home</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <span className="relative">
                        <input
                          type="radio"
                          name="deliveryAddress"
                          value="Work"
                          checked={billingInfo.deliveryAddress === 'Work'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span className="block w-6 h-6 bg-white border border-gray-300 rounded-full"></span>
                        <span className={`absolute inset-0 rounded-full ${billingInfo.deliveryAddress === 'Work' ? 'bg-orange-500' : ''} transition-all duration-200 ease-in-out`} style={{ transform: billingInfo.deliveryAddress === 'Work' ? 'scale(0.5)' : 'scale(0)', opacity: billingInfo.deliveryAddress === 'Work' ? '1' : '0' }}></span>
                      </span>
                      <span className="ml-2">Work</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Payment Method</h2>
        <div className="space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <label className="flex items-center cursor-pointer w-full md:w-auto">
            <span className="relative ml-20">
              <input
                type="radio"
                name="paymentMethod"
                value="GCash"
                checked={paymentMethod === 'GCash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="sr-only"
              />
              <span className="block w-6 h-6 bg-white border border-gray-300 rounded-full"></span>
              <span className={`absolute inset-0 rounded-full ${paymentMethod === 'GCash' ? 'bg-orange-500' : ''} transition-all duration-200 ease-in-out`} style={{ transform: paymentMethod === 'GCash' ? 'scale(0.5)' : 'scale(0)', opacity: paymentMethod === 'GCash' ? '1' : '0' }}></span>
            </span>
            <Image
              src="/ImageLogo/Gcash.png"
              alt="GCash"
              width={60}
              height={25}
              className="ml-2 object-contain"
            />
          </label>
          <label className="flex items-center cursor-pointer w-full md:w-auto">
            <span className="relative ml-20">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="sr-only"
              />
              <span className="block w-6 h-6 bg-white border border-gray-300 rounded-full"></span>
              <span className={`absolute inset-0 rounded-full ${paymentMethod === 'COD' ? 'bg-orange-500' : ''} transition-all duration-200 ease-in-out`} style={{ transform: paymentMethod === 'COD' ? 'scale(0.5)' : 'scale(0)', opacity: paymentMethod === 'COD' ? '1' : '0' }}></span>
            </span>
            <Image
              src="/ImageLogo/COD.png"
              alt="Cash on Delivery"
              width={120}
              height={120}
              className="ml-2 object-contain"
            />
          </label>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-orange-500 border-b pb-2">Your Order</h2>
            {cartItems.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center mb-4 pb-4 border-b">
                    <Image src={item.image_url} alt={item.name} width={64} height={64} className="object-cover rounded-md" />
                    <div className="ml-4 flex-grow">
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-orange-600">₱ {Number(item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center">
          <button 
            onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))} 
            className={`px-2 py-1 border rounded-l ${item.quantity > 1 ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} transition`}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="px-4 py-1 border-t border-b">
            {isNaN(item.quantity) ? 0 : item.quantity}
          </span>
          <button 
            onClick={() => handleQuantityChange(item.id, Math.min(item.quantity + 1, productStock[item.id] || 0))} 
            className={`px-2 py-1 border rounded-r ${item.quantity < (productStock[item.id] || 0) ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} transition`}
            disabled={item.quantity >= (productStock[item.id] || 0)}
          >
            +
          </button>
        </div>
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">You have not added any items to your cart yet.</p>
                <button 
                  onClick={() => router.push('/home')} 
                  className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition duration-300"
                >
                  Start Shopping
                </button>
              </div>
            )}
              
              {cartItems.length > 0 && (
                <>
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between"><span>Subtotal:</span><span>₱ {subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Delivery:</span><span>₱ {delivery.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Total:</span><span className="text-orange-600">₱ {total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button 
  onClick={() => {
    if (validateForm()) {
      setShowCheckoutReceipt(true);
    }
  }}
  disabled={isLoading}
  className={`w-full bg-orange-500 text-white py-3 rounded-lg mt-6 hover:bg-orange-600 transition duration-300 font-semibold text-lg flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
>
  {isLoading ? (
    <>
      <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
      Processing...
    </>
  ) : (
    'Proceed Checkout'
  )}
</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <GCashModal
        isOpen={showGCashModal}
        onClose={() => setShowGCashModal(false)}
        onConfirm={handleGCashPayment}
        amount={total}
      />
      
      {showDeliveryAnimation && (
        <DeliveryAnimationAlert
          orderId={orderId}
          onClose={() => setShowDeliveryAnimation(false)}
          onOrderAgain={() => {
            router.push('/home');
            setShowDeliveryAnimation(false);
          }}
          onCheckOrder={() => {
            router.push(`/order-tracking/${orderId}`);
            setShowDeliveryAnimation(false);
          }}
        />
      )}
      <CheckoutReceipt
  isOpen={showCheckoutReceipt}
  onClose={() => setShowCheckoutReceipt(false)}
  cartItems={cartItems}
  billingInfo={billingInfo}
  paymentMethod={paymentMethod}
  subtotal={subtotal}
  delivery={delivery}
  total={total}
  onPlaceOrder={placeOrder}
  isLoading={isLoading}
/>

    </div>
  );
};

export default Cart;