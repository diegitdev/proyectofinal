import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { perfumeService, carritoService } from '../services/api';
import '../styles/PerfumeDetail.css';
// Importar íconos para los botones de administrador
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PerfumeDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPerfume = async () => {
      try {
        setLoading(true);
        const response = await perfumeService.getById(id);
        setPerfume(response.data);
        console.log(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching perfume details:', err);
        setError('No se pudo cargar la información del perfume');
        setLoading(false);
      }
    };

    fetchPerfume();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(value < 1 ? 1 : value);
  };

  const handleAddToCart = async () => {
    if (!user) {
      // Redirigir a login si el usuario no está autenticado
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      
      // Crear el objeto con los datos del item para el carrito
      const cartItem = {
        usuarioId: user.id,
        perfumeId: perfume.id,
        cantidad: quantity
      };
      
      // Llamar al servicio para agregar al carrito
      await carritoService.addItem(cartItem);
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Perfume añadido al carrito correctamente');
      
      // Resetear la cantidad
      setQuantity(1);
      
      // Eliminar el mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Error al añadir al carrito. Inténtalo de nuevo más tarde.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Navegar a la página de edición de perfume
  const handleEdit = () => {
    navigate(`/editar-perfume/${id}`);
  };

  // Navegar a la página de eliminación de perfume
  const handleDelete = () => {
    navigate(`/eliminar-perfume/${id}`);
  };

  // Navegar de vuelta a la lista de perfumes
  const handleBack = () => {
    navigate('/perfumes');
  };

  if (loading) {
    return <div className="loading">Cargando información del perfume...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!perfume) {
    return <div className="not-found">Perfume no encontrado</div>;
  }

  return (
    <div className="perfume-detail-container">
      {/* Barra de navegación y acciones de administrador */}
      <div className="detail-actions-bar">
        <button className="back-button" onClick={handleBack}>
          <ArrowBackIcon /> Volver
        </button>
        
        {/* Mostrar botones de administrador solo si el usuario es admin */}
        {user && user.rol === 'ADMIN' && (
          <div className="admin-actions">
            <button className="edit-button" onClick={handleEdit}>
              <EditIcon /> Editar
            </button>
            <button className="delete-button" onClick={handleDelete}>
              <DeleteIcon /> Eliminar
            </button>
          </div>
        )}
      </div>
      
      <div className="perfume-detail-content">
        <div className="perfume-image-container">
          <img 
            src={perfume.imagen || '/placeholder-perfume.jpg'} 
            alt={perfume.nombre} 
            className="perfume-detail-image"
          />
        </div>
        
        <div className="perfume-info-container">
          <h1 className="perfume-title">{perfume.nombre}</h1>
          
          <div className="perfume-price">{perfume.precio}€</div>
          
          <div className="perfume-categories">
            {perfume.categorias?.map(cat => (
              <span key={cat.id || cat} className="category-tag">{cat.nombre || cat}</span>
            ))}
          </div>
          
          <div className="perfume-description">
            <h3>Descripción</h3>
            <p>{perfume.descripcion}</p>
          </div>
          
          <div className="perfume-notes">
            <h3>Notas Olfativas</h3>
            <div className="notes-list">
              {perfume.notasOlfativas?.map(nota => (
                <span key={nota.id || nota} className="note-tag">{nota.nombre || nota}</span>
              ))}
            </div>
          </div>
          
          <div className="add-to-cart-section">
            <div className="quantity-selector">
              <label htmlFor="quantity">Cantidad:</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
              />
            </div>
            
            <button 
              className="add-to-cart-button"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? 'Agregando...' : 'Añadir al Carrito'}
            </button>
          </div>
          
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfumeDetail; 