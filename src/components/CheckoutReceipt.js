import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

const CheckoutReceipt = ({ isOpen, onClose, cartItems, billingInfo, paymentMethod, subtotal, delivery, total, onPlaceOrder, isLoading }) => {
  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    onClose(); // Close the receipt modal first
    onPlaceOrder(); // Then process the order
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Items</h3>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <Image 
                    src={item.image_url} 
                    alt={item.name} 
                    width={64} 
                    height={64} 
                    className="rounded-md object-cover"
                  />
                  <div className="flex-grow">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Delivery Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Full Name:</p>
                <p className="font-medium">{billingInfo.fullName}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone Number:</p>
                <p className="font-medium">+63 {billingInfo.phoneNumber}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Address:</p>
                <p className="font-medium">{billingInfo.address}</p>
              </div>
              <div>
                <p className="text-gray-600">City:</p>
                <p className="font-medium">{billingInfo.city}</p>
              </div>
              <div>
                <p className="text-gray-600">State/Province:</p>
                <p className="font-medium">{billingInfo.stateProvince}</p>
              </div>
              <div>
                <p className="text-gray-600">Postal Code:</p>
                <p className="font-medium">{billingInfo.postalCode}</p>
              </div>
              <div>
                <p className="text-gray-600">Delivery Address Type:</p>
                <p className="font-medium">{billingInfo.deliveryAddress}</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Payment Method</h3>
            <p className="font-medium">{paymentMethod}</p>
          </div>

          {/* Total */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee:</span>
              <span>₱{delivery.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-orange-600">₱{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={isLoading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition duration-300 font-semibold text-lg"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutReceipt;