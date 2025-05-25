import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usuarioService } from '../services/api';
import '../styles/Auth.css';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validar que se hayan introducido todos los campos
      if (!formData.nombre || !formData.correo || !formData.contrasena || !formData.confirmarContrasena) {
        setError('Por favor, rellena todos los campos');
        setLoading(false);
        return;
      }

      // Validar que las contraseñas coincidan
      if (formData.contrasena !== formData.confirmarContrasena) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      // Validar longitud mínima de la contraseña
      if (formData.contrasena.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      // Crear objeto de datos para el registro (sin incluir confirmarContrasena)
      const registroData = {
        nombre: formData.nombre,
        correo: formData.correo,
        contrasena: formData.contrasena
      };

      // Llamar al servicio de registro
      const response = await usuarioService.register(registroData);
      const userData = response.data;
      
      // Notificar al componente padre sobre el registro exitoso
      onRegister(userData);
      
      // Redirigir a la página principal
      navigate('/');
    } catch (err) {
      console.error('Error durante el registro:', err);
      
      // Usar el mensaje de error personalizado si está disponible
      if (err.userMessage) {
        setError(err.userMessage);
      } else if (err.response) {
        // Manejar diferentes errores según el código de respuesta
        if (err.response.status === 400) {
          setError('Este correo electrónico ya está registrado. Intenta con otro.');
        } else if (err.response.status === 500) {
          setError('Error del servidor. Por favor, inténtalo más tarde.');
        } else {
          setError(`Error: ${err.response.data?.mensaje || 'Por favor, inténtalo más tarde.'}`);
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        setError('Error inesperado. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Crear Cuenta</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Contraseña (mínimo 6 caracteres)"
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmarContrasena">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmarContrasena"
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              placeholder="Confirmar contraseña"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>¿Ya tienes una cuenta? <Link to="/login" className="auth-link">Iniciar Sesión</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register; 