/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Community } from './pages/Community';
import { Shop } from './pages/Shop';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms'; 
import { Contact } from './pages/Contact';
import { CartProvider } from './context/CartContext';
import { Cart } from './pages/Cart';
import { Gallery } from './components/Gallery';
import { ProtectedRoute } from './components/ProtectedRoute';

// Admin Imports
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminGallery } from './pages/admin/AdminGallery';
import { AdminCommunity } from './pages/admin/AdminCommunity';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminShop } from './pages/admin/AdminShop'; 

/* ==========================================
   👥 PUBLIC SITE LAYOUT WRAPPER
   ========================================== */
function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* This renders whatever public page matches the current URL */}
      <Footer />
    </>
  );
}

/* ==========================================
   🔒 ADMIN PORTAL LAYOUT WRAPPER
   ========================================== */
function AdminLayout() {
  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 👈 Your Admin Sidebar goes here and stays persistent across admin pages */}
      {/* <AdminSidebar /> */}
      
      <main className="admin-content" style={{ flex: 1, padding: '20px' }}>
        <Outlet /> {/* This renders your AdminGallery or AdminCommunity components */}
      </main>
    </div>
  );
}


/* ==========================================
   🚀 CORE APP CONFIGURATION
   ========================================== */
export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          
          {/* 🌟 ALL PUBLIC USER VIEWS (Wrapped with public Navbar & Footer) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/community" element={<Community />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/gallery" element={<Gallery />} />
          </Route>

          {/* 🔐 BACKEND SIGN-IN SPACE (No navbar, footer, or sidebar) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* 🔒 PROTECTED CORE DASHBOARDS (No public elements, include Sidebar instead) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/shop" element={<AdminShop />} />
              <Route path="/admin/gallery" element={<AdminGallery />} />
              <Route path="/admin/community" element={<AdminCommunity />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}