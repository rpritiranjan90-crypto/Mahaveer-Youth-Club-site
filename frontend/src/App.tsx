import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HistoryPage } from './pages/HistoryPage';
import { PujaPage } from './pages/PujaPage';
import { GalleryPage } from './pages/GalleryPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { DonatePage } from './pages/DonatePage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ComponentShowcase } from './components/showcase/ComponentShowcase';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FFF8EE] text-[#241A17] font-sans antialiased selection:bg-orange-200 selection:text-orange-950">
        {/* Public Website Header */}
        <Navbar />

        {/* Main Content Viewport */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/puja" element={<PujaPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/showcase" element={<ComponentShowcase />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Public Website Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
