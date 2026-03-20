import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Montserrat, Lato } from 'next/font/google';
import './globals.css';

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="scroll-smooth">
      {/* Класи шрифтів і фон мають бути тут, щоб працювати і в адмінці */}
      <body className={`${lato.className} ${playfair.variable} ${montserrat.variable} bg-foxy-bg text-foxy-text antialiased`}>
        {children}
      </body>
    </html>
  );
}