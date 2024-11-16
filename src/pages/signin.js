import Image from "next/image";
import { useState } from "react";
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';

const CustomAlert = ({ message, isError }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    transition={{ duration: 0.3 }}
    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4"
  >
    <div className={`rounded-lg shadow-lg p-6 max-w-sm w-full flex items-center ${isError ? 'bg-red-50' : 'bg-green-50'}`}>
      {isError ? (
        <AlertCircle className="text-red-500 mr-3" size={24} />
      ) : (
        <CheckCircle className="text-green-500 mr-3" size={24} />
      )}
      <p className={`text-center ${isError ? 'text-red-800' : 'text-green-800'}`}>{message}</p>
    </div>
  </motion.div>
);


export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const router = useRouter();
  const setUserEmailInLocalStorage = (email) => {
    localStorage.setItem('userEmail', email);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlertMessage("");
    setIsError(false);
    try {
      console.log('Attempting to sign in...');
      const response = await axios.post('/api/signin', 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      console.log('Sign-in response:', response.data);
      setAlertMessage(response.data.message);
      setIsError(false);
      
      localStorage.setItem('authToken', response.data.token);
      console.log('Token stored in localStorage');
      
      setUserEmailInLocalStorage(email);
      console.log('User email stored in localStorage');

      setTimeout(() => {
        setAlertMessage("");
        console.log('Redirecting to home...');
        router.push('/home');
      }, 2000);
    } catch (error) {
      console.error('Sign-in error:', error);
      setAlertMessage(error.response?.data?.error || 'Invalid email or password');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen flex items-center justify-center lg:justify-end bg-white overflow-hidden">
      <div className="absolute inset-0 z-0">
      <div className="absolute top-4 right-12 z-30">
        <Link href="/">
          <Image
            src="/Logo/NarsN.png"
            alt="NARS Logo"
            width={60}
            height={40}
            className="cursor-pointer"
          />
        </Link>
      </div>
        <Image 
          src="/ImageSample/Narsdoor.png" 
          alt="Nar's Storefront" 
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 object-left-top lg:object-center"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 lg:bg-opacity-0 lg:backdrop-blur-sm lg:backdrop-brightness-55 lg:w-1/2 lg:left-auto"></div>
      </div>


      <AnimatePresence>
        {alertMessage && <CustomAlert message={alertMessage} isError={isError} />}
      </AnimatePresence>
      <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-4 lg:mr-80 mb-8 animate-slideInRight"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-orange-400">Welcome Back!</h2>
          <p className="text-gray-600 mt-2 mb-8">Sign in to your Nar's account</p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full px-3 py-3 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 peer"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-orange-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
            >
              Email address
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-3 py-3 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 peer"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-orange-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-orange-600 hover:text-orange-500">Forgot your password?</a>
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => router.push('/signup')}
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            Sign up
          </button>
        </p>
      </motion.div>
    </div>
  );
}