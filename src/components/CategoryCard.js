import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const CategoryCard = ({ category, onSelect, index }) => {
  const categoryIcons = {
    'Paper Items': 'https://cdn-icons-png.flaticon.com/128/2541/2541984.png',
    'Writing Supplies': 'https://cdn-icons-png.flaticon.com/128/501/501412.png',
    'Binders & Folders': 'https://cdn-icons-png.flaticon.com/128/9409/9409697.png',
    'Organization Tools': 'https://cdn-icons-png.flaticon.com/128/639/639343.png',
    'Art Supplies': 'https://cdn-icons-png.flaticon.com/128/3813/3813691.png',
    'Limited Items': 'https://cdn-icons-png.flaticon.com/128/1440/1440502.png',
    'Miscellaneous Supplies': 'https://cdn-icons-png.flaticon.com/128/3976/3976525.png',
    'School Bags and Carriers': 'https://cdn-icons-png.flaticon.com/128/3275/3275955.png',

    // Add more category icons as needed
  };

  const iconUrl = categoryIcons[category.name] || 'https://cdn-icons-png.flaticon.com/128/1665/1665680.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-lg overflow-hidden shadow-xl hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(category.name)}
    >
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <div className="mb-6 relative w-24 h-24">
          <Image
            src={iconUrl}
            alt={category.name}
            layout="fill"
            objectFit="contain"
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 text-center">{category.name}</h3>
      </div>
    </motion.div>
  );
};

export default CategoryCard;