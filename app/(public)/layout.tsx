import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingButton from '@/components/layout/BookingButton';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import CalInitializer from '@/components/layout/CalInitializer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CalInitializer />
      
      <Header />
      {/* Тут рендериться сама головна сторінка */}
      <main>{children}</main>
      <Footer />
      
      <BookingButton />
      <WhatsAppButton />
    </>
  );
}