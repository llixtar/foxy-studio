import Hero from '@/components/home/sections/Hero';
import Services from '@/components/home/sections/Services';
import Promotions from '@/components/home/sections/Promotions';
import PriceList from '@/components/home/sections/PriceList';
import Gallery from '@/components/home/sections/Gallery';
import Team from '@/components/home/sections/Team';
import Contact from '@/components/home/sections/Contact';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Hero />
      <Services />
      <PriceList />
      <Team />
      <Contact />

      <Gallery />
      {/* <Promotions />  */}
      {/* Місце для наступних секцій: послуги, відгуки тощо */}
    </main>
  );
}