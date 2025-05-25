import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Paper, 
  Grid, Chip, Divider, CircularProgress, Alert
} from '@mui/material';
import { checkAuth, getCurrentUser } from '../services/api';
import perfumePersonalizadoService from '../services/perfumePersonalizadoService';

// Funciones auxiliares para manejar las imágenes
const isValidImageUrl = (perfume) => {
  if (!perfume) return false;
  
  // Verificar si hay una imagen y no es la imagen por defecto
  if (perfume.imagen && !perfume.imagen.includes('placeholder')) {
    return true;
  }
  
  if (perfume.imagenUrl && !perfume.imagenUrl.includes('placeholder')) {
    return true;
  }
  
  // Si el valor es una cadena vacía o nulo, devolver false
  if (!perfume.imagen && !perfume.imagenUrl) {
    return false;
  }
  
  // Si está presente pero es vacío, devolver false
  if ((perfume.imagen && perfume.imagen.trim() === '') || 
      (perfume.imagenUrl && perfume.imagenUrl.trim() === '')) {
    return false;
  }
  
  return false;
};

const getImageUrl = (perfume) => {
  if (!perfume) return '';
  
  if (perfume.imagen && perfume.imagen.trim() !== '' && !perfume.imagen.includes('placeholder')) {
    return perfume.imagen.startsWith('http') 
      ? perfume.imagen 
      : `/uploads/${perfume.imagen}`;
  }
  
  if (perfume.imagenUrl && perfume.imagenUrl.trim() !== '' && !perfume.imagenUrl.includes('placeholder')) {
    return perfume.imagenUrl.startsWith('http') 
      ? perfume.imagenUrl 
      : `http://localhost:8080/uploads/${perfume.imagenUrl}`;
  }
  
  return '';
};

const PerfumePersonalizadoDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [esUsuarioCreador, setEsUsuarioCreador] = useState(false);
  const [imagenError, setImagenError] = useState(false);
  
  useEffect(() => {
    const cargarPerfume = async () => {
      try {
        // Verificar autenticación
        if (!checkAuth()) {
          navigate('/login');
          return;
        }
        
        // Obtener el usuario actual
        const currentUser = user || getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        
        // Cargar datos del perfume personalizado
        const response = await perfumePersonalizadoService.getById(id);
        const perfumeData = response.data;
        
        console.log("Datos del perfume cargados:", perfumeData);
        setPerfume(perfumeData);
        
        // Verificar si el usuario actual es el creador del perfume
        setEsUsuarioCreador(
          perfumeData.usuario.id === currentUser.id || 
          currentUser.rol === 'ADMIN'
        );
      } catch (err) {
        console.error('Error al cargar perfume:', err);
        setError('Error al cargar los datos del perfume. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    cargarPerfume();
  }, [id, navigate, user]);
  
  // Manejador de error de imagen
  const handleImageError = () => {
    console.error("Error al cargar la imagen del perfume");
    setImagenError(true);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/mis-perfumes"
          >
            Volver a Mis Perfumes
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!perfume) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">No se encontró el perfume solicitado.</Alert>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/mis-perfumes"
          >
            Volver a Mis Perfumes
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          {/* Sección de imagen del perfume */}
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box 
              sx={{ 
                width: '100%', 
                maxWidth: 250, 
                height: 250, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd'
              }}
            >
              {isValidImageUrl(perfume) && !imagenError ? (
                <img 
                  src={getImageUrl(perfume)} 
                  alt={perfume.nombre} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain' 
                  }} 
                  onError={handleImageError}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No hay imagen disponible
                </Typography>
              )}
            </Box>
          </Grid>
          
          {/* Información del perfume */}
          <Grid item xs={12} sm={8}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" gutterBottom>
                {perfume.nombre}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Creado por: {perfume.usuario?.nombre || 'Usuario'}
              </Typography>
              
              <Typography variant="body1" sx={{ mt: 2 }}>
                {perfume.descripcion || 'Sin descripción'}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Notas Olfativas
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {perfume.notas && perfume.notas.length > 0 ? (
                  perfume.notas.map(nota => (
                    <Chip 
                      key={nota.id} 
                      label={nota.nombre} 
                      variant="outlined" 
                      size="small" 
                      title={nota.descripcion || 'Sin descripción'}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay notas olfativas definidas
                  </Typography>
                )}
              </Box>
            </Box>
            
            {perfume.aprobado && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" color="green">
                  Este perfume está aprobado y disponible para compra
                </Typography>
                
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Precio: {perfume.precio?.toFixed(2) || '0.00'} €
                </Typography>
              </Box>
            )}
            
            {!perfume.aprobado && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info">
                  Este perfume está pendiente de aprobación por nuestro equipo
                </Alert>
              </Box>
            )}
          </Grid>
          
          {/* Botones de acción */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                component={Link} 
                to="/mis-perfumes"
              >
                Volver a Mis Perfumes
              </Button>
              
              {esUsuarioCreador && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`/perfumes-personalizados/editar/${perfume.id}`}
                  >
                    Editar
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    component={Link}
                    to={`/perfumes-personalizados/eliminar/${perfume.id}`}
                  >
                    Eliminar
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PerfumePersonalizadoDetail; 