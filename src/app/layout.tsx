import './globals.css';
import { Inter, Figtree } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Providers from './components/Providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

export const metadata = {
  title: 'Top Tier Men',
  description: 'Become the best version of yourself',
  viewport: 'width=device-width, initial-scale=1.0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} ${figtree.className}`}>
      <body>
        <Providers>
          {children}
        </Providers>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastStyle={{
            backgroundColor: '#232D1A',
            color: '#8BAE5A',
            border: '1px solid #3A4D23',
          }}
        />
      </body>
    </html>
  );
}
