import type { Metadata } from 'next';
import { Playfair_Display, Montserrat, Lato } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingButton from '@/components/layout/BookingButton';

// Налаштування шрифтів з підтримкою польської мови
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
      {/* Застосовуємо базовий шрифт Lato, колір фону та тексту на весь `body` */}
      <body className={`${lato.className} bg-foxy-bg text-foxy-text antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <BookingButton />
      </body>
    </html>
  );
}