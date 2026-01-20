import React from 'react';
import { BrowserRouter as Router, useRoutes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import routes from './routes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AutoUpdater from './components/AutoUpdater';
import ScrollToTop from './components/ScrollToTop';
import AnnouncementBanner from './components/common/AnnouncementBanner';
import LiveBanner from './components/common/LiveBanner';


const AppContent = () => {
  const element = useRoutes(routes);
  const location = useLocation();

  // Hide Navbar and Footer on protected/admin routes AND auth pages
  const isProtectedRoute = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/pastor') ||
    location.pathname.startsWith('/member') ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <AnnouncementBanner />
      <LiveBanner />
      {!isProtectedRoute && <Navbar />}
      <main className="flex-grow">
        {element}
      </main>
      {!isProtectedRoute && <Footer />}
      <WhatsAppButton />
      <AutoUpdater />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
