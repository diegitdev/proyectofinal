import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import { usuarioService } from '../services/api';
import '../styles/Auth.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Limpiar error específico del campo cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.correo) {
      newErrors.correo = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(formData.correo)) {
      newErrors.correo = 'Ingresa un correo electrónico válido';
    }
    
    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es obligatoria';
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      // Llamar al servicio de login
      const response = await usuarioService.login(formData);
      const userData = response.data;
      
      // Notificar al componente padre sobre el login exitoso
      onLogin(userData);
      
      // Redirigir a la página principal
      navigate('/');
    } catch (err) {
      console.error('Error durante el login:', err);
      
      // Usar el mensaje de error personalizado si está disponible
      if (err.userMessage) {
        setError(err.userMessage);
      } else if (err.response) {
        // Manejar diferentes errores según el código de respuesta
        if (err.response.status === 401) {
          setError('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
        } else if (err.response.status === 404) {
          setError('Usuario no encontrado. ¿Estás registrado?');
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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box className="auth-container">
      <Paper elevation={3} className="auth-form-container">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Iniciar Sesión
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <TextField
            fullWidth
            label="Correo electrónico"
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="tu@email.com"
            margin="normal"
            variant="outlined"
            required
            error={!!errors.correo}
            helperText={errors.correo}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            id="contrasena"
            name="contrasena"
            value={formData.contrasena}
            onChange={handleChange}
            placeholder="Tu contraseña"
            margin="normal"
            variant="outlined"
            required
            error={!!errors.contrasena}
            helperText={errors.contrasena}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Button 
            type="submit" 
            fullWidth
            variant="contained"
            color="primary"
            className="auth-button"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
          </Button>
        </form>
        
        <Box className="auth-links" textAlign="center" mt={2}>
          <Typography variant="body2">
            ¿No tienes una cuenta? <Link to="/registro" className="auth-link">Crear Cuenta</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 