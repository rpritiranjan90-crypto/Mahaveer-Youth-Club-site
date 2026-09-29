import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './admin/AuthContext';
import { ProtectedRoute } from './admin/ProtectedRoute';
import { AdminLayout } from './admin/AdminLayout';
import { AdminLoginPage } from './admin/AdminLoginPage';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminUpdatesPage } from './admin/AdminUpdatesPage';
import { AdminGalleryPage } from './admin/AdminGalleryPage';
import { AdminActivitiesPage } from './admin/AdminActivitiesPage';
import { AdminHistoryPage } from './admin/AdminHistoryPage';
import { AdminClubPage } from './admin/AdminClubPage';
import { AdminDonationPage } from './admin/AdminDonationPage';

import { PublicLayout } from './components/layout/PublicLayout';
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
      <AuthProvider>
        <Routes>
          {/* ----------------------------------------------------------------- */}
          {/* Public Website Routes (Wrapped with Public Layout)               */}
          {/* ----------------------------------------------------------------- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/puja" element={<PujaPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/showcase" element={<ComponentShowcase />} />
            <Route path="/404" element={<NotFoundPage />} />
          </Route>

          {/* ----------------------------------------------------------------- */}
          {/* Admin Authentication Routes                                       */}
          {/* ----------------------------------------------------------------- */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ----------------------------------------------------------------- */}
          {/* Protected Admin Management Routes                                 */}
          {/* ----------------------------------------------------------------- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="updates" element={<AdminUpdatesPage />} />
              <Route path="gallery" element={<AdminGalleryPage />} />
              <Route path="activities" element={<AdminActivitiesPage />} />
              <Route path="history" element={<AdminHistoryPage />} />
              <Route path="club" element={<AdminClubPage />} />
              <Route path="donation" element={<AdminDonationPage />} />
            </Route>
          </Route>

          {/* ----------------------------------------------------------------- */}
          {/* Catch-all 404 Route                                               */}
          {/* ----------------------------------------------------------------- */}
          <Route element={<PublicLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
