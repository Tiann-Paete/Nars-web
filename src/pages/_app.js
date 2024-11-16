import "@/styles/globals.css";
import { CartProvider } from '../CartContext';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const navigateToCart = () => {
    router.push('/cart');
  };

  return (
    <CartProvider>
      <Component {...pageProps} navigateToCart={navigateToCart} />
    </CartProvider>
  );
}