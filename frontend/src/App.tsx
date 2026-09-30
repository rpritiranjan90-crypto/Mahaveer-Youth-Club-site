import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './admin/AuthContext';
import { ProtectedRoute } from './admin/ProtectedRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HistoryPage } from './pages/HistoryPage';
import { MembersPage } from './pages/MembersPage';
import { CelebrationsPage } from './pages/CelebrationsPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { DonatePage } from './pages/DonatePage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUpdatesPage } from './pages/admin/AdminUpdatesPage';
import { AdminActivitiesPage } from './pages/admin/AdminActivitiesPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminMembersPage } from './pages/admin/AdminMembersPage';
import { AdminSecurityPage } from './pages/admin/AdminSecurityPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Application Shell Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/celebrations" element={<CelebrationsPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/404" element={<NotFoundPage />} />
          </Route>

          {/* Admin Login Route (Unprotected) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/updates" element={<AdminUpdatesPage />} />
              <Route path="/admin/activities" element={<AdminActivitiesPage />} />
              <Route path="/admin/gallery" element={<AdminGalleryPage />} />
              <Route path="/admin/members" element={<AdminMembersPage />} />
              <Route path="/admin/security" element={<AdminSecurityPage />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
            </Route>
          </Route>

          {/* Catch-all 404 Route */}
          <Route element={<PublicLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
