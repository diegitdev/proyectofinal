import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { perfumeService, categoriaService } from '../services/api';
import '../styles/Home.css';

const Home = () => {
  const [featuredPerfumes, setFeaturedPerfumes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Obtener el usuario del localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener los perfumes destacados
        const perfumeResponse = await perfumeService.getAll();
        // Tomar solo los primeros 4 para mostrar como destacados
        setFeaturedPerfumes(perfumeResponse.data.slice(0, 4));
        
        // Obtener todas las categorías
        const categoriaResponse = await categoriaService.getAll();
        setCategories(categoriaResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        let errorMsg = 'No se pudieron cargar los datos. Por favor, inténtalo de nuevo más tarde.';
        
        if (err.response) {
          if (err.response.status === 403) {
            errorMsg = 'Error 403: Acceso prohibido. El servidor ha entendido la solicitud pero se niega a autorizarla.';
            console.log('Detalle del error 403:', err.response.data);
          } else if (err.response.status === 401) {
            errorMsg = 'Error 401: No autorizado. Se requiere autenticación para acceder a este recurso.';
          } else {
            errorMsg = `Error ${err.response.status}: ${err.response.statusText || 'Error del servidor'}`;
          }
        }
        
        setError(errorMsg);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="home-container">
      {/* Banner principal */}
      <section className="hero-banner">
        <div className="banner-content">
          <h1>Descubre tu aroma perfecto</h1>
          <p>Explora nuestra colección de fragancias exclusivas o crea tu propio perfume personalizado</p>
          <div className="banner-buttons">
            <Link to="/perfumes" className="btn primary">Ver Perfumes</Link>
            {user && (
              <Link to="/crear-personalizado" className="btn secondary">Crear Perfume Personalizado</Link>
            )}
          </div>
        </div>
      </section>

      {/* Sección de perfumes destacados */}
      <section className="featured-section">
        <h2>Perfumes Destacados</h2>
        <div className="perfume-grid">
          {featuredPerfumes.map(perfume => (
            <div key={perfume.id} className="perfume-card">
              <div className="perfume-image">
                <img src={perfume.imagen || '/placeholder-perfume.jpg'} alt={perfume.nombre} />
              </div>
              <div className="perfume-info">
                <h3>{perfume.nombre}</h3>
                <p className="price">{perfume.precio}€</p>
                <Link to={`/perfumes/${perfume.id}`} className="btn view-details">Ver Detalles</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de categorías */}
      <section className="categories-section">
        <h2>Categorías de Perfumes</h2>
        <div className="categories-grid">
          {Array.isArray(categories) && categories.map(category => (
            <Link 
              key={category.id} 
              to={`/perfumes?categoria=${category.id}`} 
              className="category-card"
            >
              <h3>{category.nombre}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Sección de creación de perfumes */}
      <section className="create-section">
        <div className="create-content">
          <h2>Crea tu propio perfume</h2>
          <p>Selecciona las notas olfativas que más te gusten y crea una fragancia única que refleje tu personalidad</p>
          <div className="create-buttons">
            {user && !user.rol === 'ADMIN' && (
              <Link to="/crear-personalizado" className="btn primary">
                Crear Perfume Personalizado
              </Link>
            )}
            {user?.rol === 'ADMIN' && (
              <Link to="/crear" className="btn secondary">
                Crear Perfume Estándar
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 