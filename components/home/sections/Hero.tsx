export default function Hero() {
  return (
    // h-screen робить секцію на всю висоту екрана.
    // Змінили: items-center на items-end, щоб текст опустився вниз.
    <section className="relative h-screen w-full flex items-end justify-center overflow-hidden bg-foxy-bg">
      
      {/* Відео-фон (відцентрований і розтягнутий) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover object-center"
      >
        <source src="/assets/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Оверлей: затемнення фону для читабельності тексту */}
      {/* Оновили градієнт: зробили темніше знизу (from-black/80), куди переїхав текст */}
      <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-[1]"></div>

      {/* Текстовий контент */}
      {/* Змінили: mt-16 на pb-20 md:pb-32 для відступу від низу, max-w-4xl для кращої верстки */}
      <div className="relative z-10 flex flex-col items-center justify-end text-center px-4 pb-20 md:pb-32 max-w-4xl mx-auto h-full">
        {/* Заголовок лишили як є, додали leading-tight */}
        <h1 className="font-playfair mb-6 text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-lg leading-tight">
          Foxy Studio
        </h1>
        {/* Опис: додали два рядки та використали <br />. text-base md:text-xl для адаптивності */}
        <p className="font-lato max-w-2xl text-base md:text-xl text-white/95 drop-shadow-md tracking-wide leading-relaxed">
          Twoja strefa piękna i relaksu w sercu Świdnicy.<br />
          Twój przytulny zakątek piękna.<br />
          Umów się na chwilę tylko dla siebie.
        </p>
      </div>
    </section>
  );
}