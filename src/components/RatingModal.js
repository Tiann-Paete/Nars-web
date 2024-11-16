import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';

const RatingModal = ({ order, onClose, onSubmit }) => {
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  const handleRating = (productId, rating) => {
    setRatings(prev => ({ ...prev, [productId]: rating }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit({ 
      orderId: order.orderId,
      ratings, 
      feedback 
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageClick = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  const items = order?.items || [];

  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleOutsideClick}
      >
        <motion.div
          key="modal-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-4">Rate Products</h2>
          {items.length === 0 ? (
            <p>No products found for this order.</p>
          ) : (
            <ul className="overflow-y-auto flex-grow">
              {items.map((item, index) => (
                <li key={index} className="mb-4 flex items-center">
                  <div className="w-20 h-20 mr-4 relative cursor-pointer" onClick={() => handleImageClick(item.imageUrl)}>
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold">{item.name}</p>
                    <div className="flex mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={24}
                          className={`cursor-pointer transition-colors duration-200 ${
                            star <= (ratings[item.id] || 0) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          onClick={() => handleRating(item.id, star)}
                        />
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6">
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
              Additional Feedback
            </label>
            <textarea
              id="feedback"
              rows="3"
              className="mt-1 block w-full rounded-md border-orange-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent"
              placeholder="Please share any additional feedback about your order..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSubmit}
              className="ml-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors duration-300"
              disabled={items.length === 0 || isSubmitting}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              animate={isSubmitting ? { opacity: 0.7 } : { opacity: 1 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Ratings'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {zoomedImage && (
        <motion.div
          key="zoomed-image-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setZoomedImage(null)}
        >
          <motion.div
            key="zoomed-image-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-3xl max-h-[80vh]"
          >
            <img src={zoomedImage} alt="Zoomed product" className="max-w-full max-h-full object-contain rounded-lg" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RatingModal;