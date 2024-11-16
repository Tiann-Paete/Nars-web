import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '../CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStarHalfAlt, faFaceFrown } from '@fortawesome/free-solid-svg-icons';

const ProductModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef();
  const { addToCart } = useCart();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, product.stock_quantity));
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    if (product.stock_quantity === 0) {
      alert(`${String.fromCodePoint(0x1F641)} Sorry, this product is not available.`);
      return;
    }
    setIsAnimating(true);
    addToCart({ ...product, quantity, stock_quantity: product.stock_quantity });
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 1000);
  };

  const renderStars = (rating) => {
    const numericRating = Number(rating);
    if (isNaN(numericRating)) return null;

    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;
    
    return Array(5).fill(0).map((_, index) => {
      if (index < fullStars) {
        return <span key={index} className="text-yellow-400">★</span>;
      } else if (index === fullStars && hasHalfStar) {
        return <FontAwesomeIcon key={index} icon={faStarHalfAlt} className="text-yellow-400 text-xs" />;
      } else {
        return <span key={index} className="text-gray-300">☆</span>;
      }
    });
  };

  const formatRating = (rating, count) => {
    const numericRating = Number(rating);
    if (isNaN(numericRating)) return 'N/A';
    return count > 0 ? `${numericRating.toFixed(1)} - ${count} ${count === 1 ? 'review' : 'reviews'}` : 'No reviews yet';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-lg p-4 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal">
        <div className="relative h-48 sm:h-64 mb-4">
          <Image
            src={product.image_url}
            alt={product.name}
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{product.name}</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {renderStars(product.avg_rating)}
            <span className="text-gray-600 ml-1 text-sm">
              {formatRating(product.avg_rating, product.rating_count)}
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold">₱{product.price}</div>
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Available Stock: {product.stock_quantity}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center border rounded-full overflow-hidden mb-4 sm:mb-0">
            <button onClick={decrementQuantity} className="px-3 py-1 bg-gray-100 hover:bg-gray-200" disabled={product.stock_quantity === 0}>-</button>
            <span className="px-3 py-1">{quantity}</span>
            <button onClick={incrementQuantity} className="px-3 py-1 bg-gray-100 hover:bg-gray-200" disabled={product.stock_quantity === 0}>+</button>
          </div>
          <button 
            onClick={handleAddToCart}
            className={`${
              product.stock_quantity === 0 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600'
            } text-white px-4 py-2 rounded transition-all duration-300 w-full sm:w-auto ${
              isAnimating ? 'animate-toss' : ''
            }`}
            disabled={isAnimating || product.stock_quantity === 0}
          >
            {isAnimating ? 'Added!' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;