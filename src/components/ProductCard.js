import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';

const ProductCard = ({ product, onClick, delay, isLimited }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

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

  const truncateDescription = (description, wordLimit = 12) => {
    const words = description.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return description;
  };

  const formatRating = (rating) => {
    const numericRating = Number(rating);
    return isNaN(numericRating) ? 'N/A' : numericRating.toFixed(1);
  };

  return (
    <div 
      className={`bg-white shadow-xl rounded-lg overflow-hidden cursor-pointer 
                  transition-all duration-500 ease-in-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  hover:shadow-xl hover:shadow-gray-400 transform hover:-translate-y-1
                  w-full h-full relative`}
      onClick={() => onClick(product)}
    >
      {isLimited && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          Limited
        </div>
      )}
      <div className="relative h-32 xs:h-36 sm:h-40 md:h-48 w-full overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <div className="p-3 xs:p-4 sm:p-5 flex flex-col justify-between h-auto">
        <div>
          <h3 className="text-sm xs:text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2 truncate">{product.name}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
            {truncateDescription(product.description, 8)}
          </p>
        </div>
        <div>
          <div className="flex items-center mb-1 sm:mb-2">
            {renderStars(product.avg_rating)}
            <span className="text-gray-600 text-xs sm:text-sm ml-1">
              ({formatRating(product.avg_rating)})
            </span>
          </div>
          <div className="text-sm xs:text-base sm:text-lg font-medium text-gray-900">₱{product.price}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;