import type { Metadata } from 'next';
import { Playfair_Display, Montserrat, Lato } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingButton from '@/components/layout/BookingButton';
import CalInitializer from '@/components/layout/CalInitializer'; // Винесемо логіку сюди

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-playfair'
});
const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-montserrat'
});
const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-lato'
});

export const metadata: Metadata = {
  title: 'Foxy Studio | Salon Kosmetyczny Świdnica',
  description: 'Nowoczesny salon kosmetyczny w Świdnicy. Stylizacja brwi, manicure, przedłużanie rzęs i tatuaż.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="scroll-smooth">
      <body className={`${lato.className} ${playfair.variable} ${montserrat.variable} bg-foxy-bg text-foxy-text antialiased`}>
        {/* Ініціалізація Cal.com (Клієнтський компонент) */}
        <CalInitializer />
        
        <Header />
        <main>{children}</main>
        <Footer />
        
        {/* Твоя кнопка, яка тепер буде відкривати календар */}
        <BookingButton />
      </body>
    </html>
  );
}