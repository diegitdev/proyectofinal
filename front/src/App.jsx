// src/pages/Home.jsx o src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import './styles/App.css';
// Componentes de páginas
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import PerfumeList from './components/PerfumeList';
import PerfumeDetail from './components/PerfumeDetail';
import PerfumeCreator from './components/PerfumeCreator';
import PerfumePersonalizadoCreator from './components/PerfumePersonalizadoCreator';
import PerfumePersonalizadoDetail from './components/PerfumePersonalizadoDetail';
import PerfumePersonalizadoEdit from './components/PerfumePersonalizadoEdit';
import PerfumePersonalizadoDelete from './components/PerfumePersonalizadoDelete';
import PerfumeEditForm from './components/PerfumeEditForm';
import PerfumeDelete from './components/PerfumeDelete';
import MyPerfumes from './components/MyPerfumes';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import AdminUsersList from './components/AdminUsersList';
import FacturaView from './components/FacturaView';
import { logout } from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8e44ad', // Morado para perfumes
    },
    secondary: {
      main: '#2c83c5',
    },
    background: {
      default: '#f9f9f9',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
  },
});

// Componente de ruta protegida
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Componente de ruta protegida para administradores
const AdminRoute = ({ user, children }) => {
  if (!user || user.rol !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNavbar, setShowNavbar] = useState(true);
  const [showFooter, setShowFooter] = useState(true);

  // Comprobar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    console.log("App montado");
    
    // Simular verificación de autenticación
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);

    // Manejar errores globales
    const handleError = (event) => {
      console.error('Error global:', event.error);
      // Aquí podrías mostrar una notificación al usuario
    };

    window.addEventListener('error', handleError);

    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'o') {
        event.preventDefault(); // Prevenir el comportamiento por defecto si existe
        setShowNavbar(prevState => !prevState);
      }
      if (event.ctrlKey && event.key === 'p') {
        event.preventDefault(); // Prevenir el cuadro de diálogo de impresión
        setShowFooter(prevState => !prevState);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Este return se ejecuta cuando el componente se desmonta
    return () => {
      console.log("App desmontado");
      window.removeEventListener('error', handleError);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="app">
          {showNavbar && (
            <nav className="navbar">
              <div className="nav-brand">
                <Link to="/" className="logo">Luxury Scents</Link>
              </div>
              <div className="nav-links">
                <Link to="/">Inicio</Link>
                <Link to="/perfumes">Perfumes</Link>
                {user && user.rol === 'ADMIN' && (
                  <Link to="/admin" className="admin-link">Admin</Link>
                )}
                {user && (
                  <Link to="/mis-perfumes">Mis Perfumes</Link>
                )}
                {user && (
                  <Link to="/carrito">Carrito</Link>
                )}
              </div>
              <div className="user-actions">
                {user ? (
                  <>
                    <div className="user-info">
                      <span className="user-greeting">Hola,</span>
                      <span className="user-name">{user.nombre}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <div className="auth-links">
                    <Link to="/login" className="login-link">Iniciar sesión</Link>
                    <Link to="/registro" className="register-link">Registrarse</Link>
                  </div>
                )}
              </div>
            </nav>
          )}

          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/registro" element={<Register onRegister={handleLogin} />} />
              <Route path="/perfumes" element={<PerfumeList />} />
              <Route path="/perfumes/:id" element={<PerfumeDetail user={user} />} />
              
              {/* Rutas para perfumes */}
              <Route path="/crear" element={
                <AdminRoute user={user}>
                  <PerfumeCreator user={user} />
                </AdminRoute>
              } />
              <Route path="/editar-perfume/:id" element={
                <AdminRoute user={user}>
                  <PerfumeEditForm user={user} />
                </AdminRoute>
              } />
              <Route path="/eliminar-perfume/:id" element={
                <AdminRoute user={user}>
                  <PerfumeDelete user={user} />
                </AdminRoute>
              } />
              
              {/* Rutas para perfumes personalizados */}
              <Route path="/crear-personalizado" element={
                <ProtectedRoute user={user}>
                  <PerfumePersonalizadoCreator user={user} />
                </ProtectedRoute>
              } />
              <Route path="/perfumes-personalizados/:id" element={
                <ProtectedRoute user={user}>
                  <PerfumePersonalizadoDetail user={user} />
                </ProtectedRoute>
              } />
              <Route path="/perfumes-personalizados/editar/:id" element={
                <ProtectedRoute user={user}>
                  <PerfumePersonalizadoEdit user={user} />
                </ProtectedRoute>
              } />
              <Route path="/perfumes-personalizados/eliminar/:id" element={
                <ProtectedRoute user={user}>
                  <PerfumePersonalizadoDelete user={user} />
                </ProtectedRoute>
              } />
              
              <Route path="/mis-perfumes" element={
                <ProtectedRoute user={user}>
                  <MyPerfumes user={user} />
                </ProtectedRoute>
              } />
              <Route path="/carrito" element={
                <ProtectedRoute user={user}>
                  <Cart user={user} />
                </ProtectedRoute>
              } />
              <Route path="/facturas/:id" element={
                <ProtectedRoute user={user}>
                  <FacturaView user={user} />
                </ProtectedRoute>
              } />
              
              {/* Rutas del panel de administración */}
              <Route path="/admin" element={
                <AdminRoute user={user}>
                  <AdminPanel user={user} />
                </AdminRoute>
              } />
              <Route path="/admin/usuarios" element={
                <AdminRoute user={user}>
                  <AdminUsersList user={user} />
                </AdminRoute>
              } />
              
              {/* Rutas específicas para el panel de admin */}
              <Route path="/admin/perfumes/new" element={
                <AdminRoute user={user}>
                  <PerfumeCreator user={user} />
                </AdminRoute>
              } />
              <Route path="/admin/perfumes/edit/:id" element={
                <AdminRoute user={user}>
                  <PerfumeEditForm user={user} />
                </AdminRoute>
              } />
              <Route path="/admin/perfumes/delete/:id" element={
                <AdminRoute user={user}>
                  <PerfumeDelete user={user} />
                </AdminRoute>
              } />
            </Routes>
          </div>

          {showFooter && (
            <footer className="footer">
              <p>&copy; 2025 Luxury Scents - Proyecto Final</p>
            </footer>
          )}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;