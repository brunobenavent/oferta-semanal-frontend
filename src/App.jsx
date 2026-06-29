import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { PreOrderProvider } from './context/PreOrderContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Goodbye from './components/Goodbye';
import CookieBanner from './components/CookieBanner';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import AvisoLegal from './pages/AvisoLegal';
import CondicionesGenerales from './pages/CondicionesGenerales';
import Privacidad from './pages/Privacidad';
import Cookies from './pages/Cookies';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Clients from './pages/Clients';
import NotFound from './pages/NotFound';
import Contacto from './pages/Contacto';
import PreOrders from './pages/PreOrders';
import SendPreorder from './pages/SendPreorder';
// UserForm deprecated — all CRUD via modal in Users.jsx
// import UserForm from './pages/UserForm';


function App() {
  const [semana, setSemana] = useState('');
  const [totalSinFiltros, setTotalSinFiltros] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const handleCounts = useCallback((total, filtered) => {
    setTotalSinFiltros(total);
    setFilteredCount(filtered);
  }, []);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Ofertas Semanales Viveros Guzmán',
        text: 'Mira las ofertas de esta semana',
        url: window.location.href,
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <Router>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
        <Goodbye />
        <FavoritesProvider>
          <PreOrderProvider>
            <Navbar semana={semana} totalSinFiltros={totalSinFiltros} filteredCount={filteredCount} />
            <CookieBanner />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<Home onShare={handleShare} onSemana={setSemana} onCounts={handleCounts} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/contact" element={<Contacto />} />
                <Route path="/users" element={<Users />} />
                <Route path="/users/new" element={<Navigate to="/users" replace />} />
                <Route path="/users/:id/edit" element={<Navigate to="/users" replace />} />
                <Route path="/clientes" element={<Clients />} />
                <Route path="/pedidos" element={<PreOrders />} />
                <Route path="/pedidos/enviar" element={<SendPreorder />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/aviso-legal" element={<AvisoLegal />} />
                <Route path="/condiciones-generales" element={<CondicionesGenerales />} />
                <Route path="/privacidad" element={<Privacidad />} />
                <Route path="/cookies" element={<Cookies />} />
              </Routes>
            </div>
            <Footer />
          </PreOrderProvider>
        </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
