import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ShoppingCartIcon, EnvelopeIcon, PencilIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';

export default function Home() {
  const [isPinned, setIsPinned] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const aboutSectionRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsPinned(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (aboutSectionRef.current) {
      observer.observe(aboutSectionRef.current);
    }

    let scrollTimer;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);

      scrollTimer = setTimeout(() => {
        setIsHeaderVisible(false);
      }, 2000);

      // Update active section based on scroll position
      const sections = ['home', 'about', 'products', 'contact'];
      let currentSection = sections[0];
      const headerHeight = 100; // Adjust this value based on your actual header height
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - headerHeight - 1) {
          currentSection = section;
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(scrollTimer);
      if (aboutSectionRef.current) {
        observer.unobserve(aboutSectionRef.current);
      }
    };
  }, [lastScrollY]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(sectionId);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-800 text-neutral-800">
      <style jsx global>{`
        body {
          --scrollbar-color: #f97316;
          --scrollbar-bg-color: #262626;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        body::-webkit-scrollbar {
          display: none;
        }
        body.is-scrolling {
          scrollbar-width: auto;
          -ms-overflow-style: auto;
        }
        body.is-scrolling::-webkit-scrollbar {
          display: block;
          width: 14px;
        }
        body.is-scrolling::-webkit-scrollbar-track {
          background: var(--scrollbar-bg-color);
        }
        body.is-scrolling::-webkit-scrollbar-thumb {
          background-color: var(--scrollbar-color);
          border-radius: 7px;
          border: 3px solid var(--scrollbar-bg-color);
        }
         @keyframes pinAnimation {
          0% { transform: translate(-50%, -100%) rotate(-45deg); }
          100% { transform: translate(-50%, -50%) rotate(0deg); }
        }
        .pin {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translate(-50%, -100%) rotate(-45deg);
          transition: transform 0.5s ease-out;
        }
        .pin.pinned {
          animation: pinAnimation 0.5s forwards;
        }
        .text-3d {
          text-shadow: 
            0px 1px 0px #c45d12,
            0px 2px 0px #b85611,
            0px 3px 0px #ac4f10,
            0px 4px 0px #a0490f,
            0px 5px 0px #94430e,
            0px 6px 0px #883d0d,
            0px 7px 10px rgba(0, 0, 0, 0.4);
        }
       @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .icon-bounce:hover svg {
          animation: bounce 0.5s infinite;
        }

        .button-scale {
          transition: transform 0.3s ease;
        }

        .button-scale:hover {
          transform: scale(1.05);
        }
      `}</style>
      
      
      <header className={`py-3 px-4 fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isHeaderVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} bg-opacity-90`}>
        <div className="container mx-auto max-w-7xl flex justify-between items-center">
          <div className="z-30">
            <Image
              src="/Logo/NarsN.png"
              alt="NARS Logo"
              width={60}
              height={40}
              className="cursor-pointer"
            />
          </div>
          {!isMobile && (
            <nav className="flex items-center">
              <ul className="flex space-x-6 mr-12">
                {["home", "about", "products", "contact"].map((section) => (
                  <li key={section}>
                    <button 
                      onClick={() => scrollToSection(section)} 
                      className={`text-neutral-100 hover:text-orange-400 transition duration-300 ${activeSection === section ? "text-orange-400 font-bold" : ""}`}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => router.push('/signup')} 
                className="bg-orange-500 text-neutral-100 px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-300 flex items-center button-scale icon-bounce"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Register
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="home" className="py-24 min-h-screen flex items-center relative">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/ImageSample/narsStore.png" 
              alt="Nar's Store" 
              layout="fill"
              objectFit="cover"
              className="object-center"
            />
            <div className="absolute inset-0 bg-black opacity-60"></div>
          </div>
          <div className="container mx-auto max-w-7xl px-4 relative z-10">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl text-white md:text-5xl font-bold mb-6">
                Welcome to <span className="text-orange-400 text-3d">Nar's</span> School Supplies
              </h1>
              <p className="text-xl text-gray-100 mb-10">Your one-stop shop for all your educational needs</p>
              <button 
                onClick={() => router.push('/signin')} 
                className="bg-orange-500 text-neutral-100 px-8 py-3 rounded-lg text-lg hover:bg-orange-600 transition duration-300 shadow-md flex items-center justify-center mx-auto md:mx-0 button-scale icon-bounce"
              >
                <ShoppingCartIcon className="h-6 w-6 mr-2" />
                Shop Now
              </button>
            </div>
          </div>
        </section>


         {/* About Section */}
         <section id="about" ref={aboutSectionRef} className="py-24 pt-28 min-h-screen flex items-center bg-neutral-800 relative overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 relative">
              <div className="rounded-lg overflow-hidden">
                <Image 
                  src="/ImageSample/building1.png" 
                  alt="Nar's School Supply Store" 
                  width={500}
                  height={300}
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
              <div className={`pin ${isPinned ? 'pinned' : ''}`}>
                <Image
                  src="/ImageSample/pushpin1.png"
                  alt="Pushpin"
                  width={50}
                  height={50}
                />
              </div>
            </div>
            <div className="md:w-1/2 md:pl-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-orange-400">About Nar's</h2>
              <p className="text-lg md:text-xl text-gray-100 leading-relaxed">
                Nar's School Supplies has been serving students and educators for over 4 years. 
                We pride ourselves on offering high-quality products at affordable prices, 
                ensuring that everyone has access to the tools they need for success.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section id="products" className="py-24 min-h-screen flex items-center">
          <div className="container mx-auto max-w-7xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-orange-400">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {[
                { name: "Basic Bundle", description: "Essential school supplies for everyday use", feature: "As low as ₱60", image: "7972_6643" },
                { name: "Premium Package", description: "High-quality materials for the dedicated student", feature: "High Quality", image: "7978_6646" },
                { name: "Complete Set", description: "Everything you need for a successful school year", feature: "15% off", image: "7976_7976" }
              ].map((product, index) => (
                <div key={index} className={`bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col transform hover:scale-105 ${index === 1 ? 'md:-mt-4 md:mb-4' : ''}`}>
                  <div className={`relative overflow-hidden ${index === 1 ? 'h-56' : 'h-48'}`}>
                    <Image 
                      src={`https://www.officewarehouse.com.ph/__resources/_web_data_/products/products/image_gallery/${product.image}.jpg`} 
                      alt={product.name} 
                      layout="fill" 
                      objectFit="contain" 
                      className="transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className={`p-6 flex-grow flex flex-col justify-between ${index === 1 ? 'md:p-7' : ''}`}>
                    <div>
                      <h3 className={`font-semibold mb-2 text-orange-400 ${index === 1 ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'}`}>{product.name}</h3>
                      <p className="text-neutral-600 mb-3">{product.description}</p>
                      <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                        {product.feature}
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push('/signin')}
                      className="bg-orange-500 text-neutral-100 px-4 py-2 rounded hover:bg-orange-600 transition duration-300 w-full shadow-sm mt-auto flex items-center justify-center"
                    >
                      Check Now
                      <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="contact" className="py-24 min-h-screen flex items-center bg-neutral-800">
          <div className="container mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-orange-400">Ready to get started?</h2>
            <p className="text-xl text-gray-100 mb-10">Contact us today to learn more about our products and services.</p>
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="bg-orange-500 text-neutral-100 px-8 py-3 rounded-lg text-lg hover:bg-orange-600 transition duration-300 shadow-md flex items-center justify-center mx-auto"
            >
              <EnvelopeIcon className="h-6 w-6 mr-2" />
              Contact Us
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-neutral-800 text-neutral-100 py-6">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <p>&copy; 2024 Nar's School Supplies. All rights reserved.</p>
        </div>
      </footer>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsContactModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg p-8 max-w-md w-full m-4 relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4 text-orange-400">Contact Us</h3>
            <div className="flex justify-center space-x-4 mb-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="transition duration-300">
                <Image src="/ImageLogo/facebook.png" alt="Facebook" width={40} height={40} />
              </a>
              <a href="mailto:contact@narsschoolsupplies.com" className="transition duration-300">
                <Image src="/ImageLogo/gmail.png" alt="Gmail" width={40} height={40} />
              </a>
            </div>
            <p className="text-gray-600 text-center">Follow us on Facebook or send us an email!</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}