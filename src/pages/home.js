import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { MagnifyingGlassIcon, UserCircleIcon, ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import CategoryCard from '../components/CategoryCard';
import { useCart } from '../CartContext';
import { motion } from 'framer-motion';
import ProtectedRoute from '../components/ProtectedRoute';

function Home({ navigateToCart }) {
  const [firstName, setFirstName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 15;
  const { cartItems } = useCart();
  const dropdownRef = useRef(null);
  const [displayMode, setDisplayMode] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const [error, setError] = useState(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  
  useEffect(() => {
    console.log('Home component mounted');
    const token = localStorage.getItem('authToken');
    console.log('Token in Home:', token ? 'exists' : 'not found');
    
    if (!token) {
      console.error("No auth token found");
      router.push('/signin');
      return;
    }
  
    fetch("/api/user", { 
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      credentials: "include" 
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setFirstName(data.firstName);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        if (error.message === 'Network response was not ok') {
          // Handle 401 error
          localStorage.removeItem('authToken');
          router.push('/signin');
        }
      });

    fetchProducts('all');
    fetchCategories();

    // Add event listener for closing dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error("No auth token found");
        setError("You are not logged in. Please sign in.");
        router.push('/signin');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      };

      const [userData, productsData, categoriesData] = await Promise.all([
        axios.get("/api/user", config),
        axios.get('/api/products', config),
        axios.get('/api/categories', config)
      ]);

      console.log("User data:", userData.data);

      if (userData.data.success) {
        setFirstName(userData.data.firstName);
      } else {
        console.error("User data fetch failed:", userData.data);
        setError("Failed to fetch user data. Please try logging in again.");
      }
      setProducts(productsData.data);
      setCategories(categoriesData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response && error.response.status === 401) {
        setError("Your session has expired. Please sign in again.");
        router.push('/signin');
      } else {
        setError("An error occurred while loading the page. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchProducts = (mode, category = null) => {
    setIsLoading(true);
    let url = '/api/products';
    if (mode === 'limited') {
      url = '/api/limited-items';
    } else if (category) {
      url = `/api/products/category/${encodeURIComponent(category)}`;
    }
  
    console.log("Fetching products from:", url);
  
    axios.get(url)
      .then(response => {
        console.log("Fetched products:", response.data);
        console.log("Number of products fetched:", response.data.length);
        setProducts(response.data); // No need to filter here anymore
        setCurrentPage(1);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error.response ? error.response.data : error.message);
        console.error("Error status:", error.response ? error.response.status : 'No response');
        console.error("Error headers:", error.response ? error.response.headers : 'No response');
        setIsLoading(false);
      });
  };

  const fetchCategories = () => {
    axios.get('/api/categories')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
      });
  };

  const handleDisplayModeChange = (mode) => {
    console.log("Display mode changed:", mode);
    setDisplayMode(mode);
    setSelectedCategory(null);
    fetchProducts(mode);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setDisplayMode('category');
    fetchProducts('category', category);
  };
  
  const handleLogout = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      console.log('Logging out user:', userEmail);
  
      if (!userEmail) {
        console.error('User email not found in localStorage');
        router.push('/signin');
        return;
      }
  
      const response = await axios.get('/api/logout', { 
        withCredentials: true,
        headers: {
          'user-email': userEmail
        }
      });
      
      console.log('Logout response:', response.data);
  
      if (response.data.success) {
        console.log('Logout successful. Clearing local storage and redirecting to signin page.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        router.push('/signin');
      } else {
        console.error('Logout failed:', response.data.error);
        setError(response.data.error || 'Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear local storage and redirect
      console.log('Error during logout. Clearing local storage and redirecting to signin page.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      router.push('/signin');
    }
  };
  
  const handleSearchFocus = () => {
    if (window.innerWidth <= 768) {  // Adjust this breakpoint as needed
      setIsSearchExpanded(true);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSearchBlur = () => {
    if (window.innerWidth <= 768) {  // Adjust this breakpoint as needed
      setIsSearchExpanded(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
      setDisplayMode('search');
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };


  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-orange-500 focus:outline-none"
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
              <div className="flex-shrink-0 hidden md:block ml-4 mr-16">
                <Image
                  src="/Logo/narslogo.png"
                  alt="NARS Logo"
                  width={100}
                  height={40}
                  className=""
                />
              </div>
              <div className="hidden md:block ml-12 mr-6">
                <div className="flex items-baseline space-x-4">
                  <button 
                    onClick={() => handleDisplayModeChange('limited')} 
                    className={`relative text-white hover:text-orange-500 px-3 py-2 rounded-md text-md font-medium cursor-pointer transition-all ease-in-out
                                before:content-[''] before:absolute before:bg-orange-500 before:h-[1px] before:w-0 hover:before:w-[50%] before:bottom-0 before:left-[50%] before:transition-[width] before:ease-in-out before:duration-300
                                after:content-[''] after:absolute after:bg-orange-500 after:h-[1px] after:w-0 hover:after:w-[50%] after:bottom-0 after:right-[50%] after:transition-[width] after:ease-in-out after:duration-300
                                ${displayMode === 'limited' ? 'text-orange-500' : ''}`}
                  >
                    Limited Items
                  </button>
                  <button 
                    onClick={() => handleDisplayModeChange('categories')} 
                    className={`relative text-white hover:text-orange-500 px-3 py-2 rounded-md text-md font-medium cursor-pointer transition-all ease-in-out
                                before:content-[''] before:absolute before:bg-orange-500 before:h-[1px] before:w-0 hover:before:w-[50%] before:bottom-0 before:left-[50%] before:transition-[width] before:ease-in-out before:duration-300
                                after:content-[''] after:absolute after:bg-orange-500 after:h-[1px] after:w-0 hover:after:w-[50%] after:bottom-0 after:right-[50%] after:transition-[width] after:ease-in-out after:duration-300
                                ${displayMode === 'categories' ? 'text-orange-500' : ''}`}
                  >
                    Categories
                  </button>
                  <button 
                    onClick={() => handleDisplayModeChange('all')} 
                    className={`relative text-white hover:text-orange-500 px-3 py-2 rounded-md text-md font-medium cursor-pointer transition-all ease-in-out
                                before:content-[''] before:absolute before:bg-orange-500 before:h-[1px] before:w-0 hover:before:w-[50%] before:bottom-0 before:left-[50%] before:transition-[width] before:ease-in-out before:duration-300
                                after:content-[''] after:absolute after:bg-orange-500 after:h-[1px] after:w-0 hover:after:w-[50%] after:bottom-0 after:right-[50%] after:transition-[width] after:ease-in-out after:duration-300
                                ${displayMode === 'all' ? 'text-orange-500' : ''}`}
                  >
                    All Supplies
                  </button>
                </div>
              </div>
            </div>
            <div className={`flex-1 max-w-xl mx-2 md:mx-8 transition-all duration-300 ${isSearchExpanded ? 'w-full' : 'w-40 md:w-full'}`}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder={isSearchExpanded || window.innerWidth > 768 ? "Search for supplies..." : "Search..."}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            <button type="submit" className="absolute right-3 top-2">
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            </button>
              </form>
            </div>
            <div className="flex items-center">
              <button 
                onClick={navigateToCart} 
                className="text-white hover:text-orange-500 relative mr-4"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <div className="relative" ref={dropdownRef}>
  <button 
    onClick={() => setShowDropdown(!showDropdown)}
    className="flex items-center focus:outline-none group"
  >
    <UserCircleIcon className="h-8 w-8 text-white group-hover:text-orange-500 transition-colors duration-200" />
  </button>
  {showDropdown && (
    <div className="absolute right-0 mt-3 w-64 bg-neutral-800 rounded-lg shadow-lg py-2 z-10 border border-gray-700">
    <div className="flex items-center">
  <p className="text-sm font-medium text-gray-300 ml-4 mr-2">Welcome,</p>
  <p className="text-lg font-semibold text-orange-500">{firstName}</p>
</div>
      <div className="py-1">
        <button 
          onClick={() => {
            router.push('/order-tracking');
            setShowDropdown(false);
          }}
          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700 hover:text-orange-500 transition-colors duration-200"
        >
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Order Tracking
          </span>
        </button>
        <button 
          onClick={() => {
            router.push('/order-history');
            setShowDropdown(false);
          }}
          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700 hover:text-orange-500 transition-colors duration-200"
        >
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Order History
          </span>
        </button>
      </div>
      <div className="border-t border-gray-700 mt-1 pt-1">
        <button 
          onClick={() => {
            handleLogout();
            setShowDropdown(false);
          }}
          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700 hover:text-orange-500 transition-colors duration-200"
        >
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </span>
        </button>
      </div>
    </div>
  )}
</div>
            </div>
          </div>
        </div>
        <div 
          ref={mobileMenuRef}
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              onClick={() => {
                handleDisplayModeChange('limited');
                setIsMobileMenuOpen(false);
              }} 
              className={`block text-white hover:text-orange-500 px-3 py-2 rounded-md text-base font-medium ${displayMode === 'limited' ? 'text-orange-500' : ''}`}
            >
              Limited Items
            </button>
            <button 
              onClick={() => {
                handleDisplayModeChange('categories');
                setIsMobileMenuOpen(false);
              }} 
              className={`block text-white hover:text-orange-500 px-3 py-2 rounded-md text-base font-medium ${displayMode === 'categories' ? 'text-orange-500' : ''}`}
            >
              Categories
            </button>
            <button 
              onClick={() => {
                handleDisplayModeChange('all');
                setIsMobileMenuOpen(false);
              }} 
              className={`block text-white hover:text-orange-500 px-3 py-2 rounded-md text-base font-medium ${displayMode === 'all' ? 'text-orange-500' : ''}`}
            >
              All Supplies
            </button>
          </div>
        </div>
      </header>
      <main className="flex-grow max-w-[1400px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          {displayMode === 'limited' ? 'Limited Items' : 
           displayMode === 'categories' ? 'Shop by Category' : 
           displayMode === 'search' ? 'Search Results' :
           selectedCategory || 'All Supplies'}
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          </div>
        ) : displayMode === 'categories' ? (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {categories.map((category, index) => (
        <CategoryCard 
          key={category.id} 
          category={category} 
          onSelect={handleCategorySelect} 
          index={index}
        />
      ))}
    </motion.div>
  ) : displayMode === 'search' ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4 md:gap-6">
            {searchResults.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={handleProductClick} 
                isLimited={product.category === 'Limited'}
                delay={index * 100}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4 md:gap-6">
  {currentProducts.map((product, index) => (
    <ProductCard 
      key={product.id} 
      product={product} 
      onClick={handleProductClick} 
      isLimited={product.category === 'Limited'}
      delay={index * 100}
    />
  ))}
</div>
  )}
  {displayMode !== 'categories' && displayMode !== 'search' && (
  <Pagination
    productsPerPage={productsPerPage}
    totalProducts={products.length}
    paginate={paginate}
    currentPage={currentPage}
  />
)}
      </main>
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
}

const Pagination = ({ productsPerPage, totalProducts, paginate, currentPage }) => {
  const [showMore, setShowMore] = useState(false);
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  const renderPageNumbers = () => {
    const renderedPageNumbers = [];
    const totalPages = pageNumbers.length;

    if (totalPages <= 5) {
      return pageNumbers.map(number => renderPageButton(number));
    }

    // Always show first page
    renderedPageNumbers.push(renderPageButton(1));

    if (currentPage <= 3) {
      for (let i = 2; i <= 4; i++) {
        renderedPageNumbers.push(renderPageButton(i));
      }
      renderedPageNumbers.push(renderEllipsis());
      renderedPageNumbers.push(renderPageButton(totalPages));
    } else if (currentPage >= totalPages - 2) {
      renderedPageNumbers.push(renderEllipsis());
      for (let i = totalPages - 3; i <= totalPages; i++) {
        renderedPageNumbers.push(renderPageButton(i));
      }
    } else {
      renderedPageNumbers.push(renderEllipsis());
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        renderedPageNumbers.push(renderPageButton(i));
      }
      renderedPageNumbers.push(renderEllipsis());
      renderedPageNumbers.push(renderPageButton(totalPages));
    }

    return renderedPageNumbers;
  };

  const renderPageButton = (number) => (
    <li key={number}>
      <button
        onClick={() => paginate(number)}
        className={`px-4 py-2 mx-1 rounded ${
          currentPage === number
            ? 'bg-orange-500 text-white shadow-lg'
            : 'bg-white text-orange-500 hover:bg-orange-100 shadow-xl'
        }`}
      >
        {number}
      </button>
    </li>
  );

  const renderEllipsis = () => (
    <li key="ellipsis">
      <button
        onClick={() => setShowMore(!showMore)}
        className="px-4 py-2 mx-1 rounded bg-white text-orange-500 hover:bg-orange-100 shadow-xl"
      >
        ...
      </button>
    </li>
  );

  return (
    <nav className="flex justify-center mt-8">
      <ul className="flex flex-wrap justify-center">
        {renderPageNumbers()}
      </ul>
    </nav>
  );
};

export default function ProtectedHome(props) {
  return (
    <ProtectedRoute>
      <Home {...props} />
    </ProtectedRoute>
  );
}