
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './components/admin/DashboardPage';
import ListingsPage from './components/admin/ListingsPage';
import BlogsPage from './components/admin/BlogsPage';
import ListingForm from './components/admin/ListingForm';
import BlogForm from './components/admin/BlogForm';
import FooterContentPage from './components/admin/FooterContentPage';
import HeroContentPage from './components/admin/HeroContentPage';

const App: React.FC = () => {
  const auth = useContext(AuthContext);

  if (auth === null) {
    return <div>Loading...</div>; // Or a spinner
  }
  
  const { session } = auth;

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" /> : <LoginPage />} />
        <Route 
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/hero" element={<HeroContentPage />} />
                  <Route path="/listings" element={<ListingsPage />} />
                  <Route path="/listings/new" element={<ListingForm />} />
                  <Route path="/listings/edit/:id" element={<ListingForm />} />
                  <Route path="/blogs" element={<BlogsPage />} />
                  <Route path="/blogs/new" element={<BlogForm />} />
                  <Route path="/blogs/edit/:id" element={<BlogForm />} />
                  <Route path="/footer" element={<FooterContentPage />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;