import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EE] text-[#241A17] font-sans antialiased selection:bg-orange-200 selection:text-orange-950">
      {/* Public Header */}
      <Navbar />

      {/* Main Public Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <Footer />
    </div>
  );
};
