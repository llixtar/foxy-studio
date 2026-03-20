// app/admin/layout.tsx
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="admin-container bg-gray-50 min-h-screen">
      {/* Тут ми пізніше додамо бічне меню або шапку адмінки */}
      <nav className="bg-white border-b p-4 mb-6 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <span className="font-bold text-foxy-accent">Foxy Studio Admin</span>
          <a href="/" className="text-sm text-gray-500 hover:text-black transition-colors">
            На головну →
          </a>
        </div>
      </nav>
      
      <main>
        {children}
      </main>
    </section>
  );
}