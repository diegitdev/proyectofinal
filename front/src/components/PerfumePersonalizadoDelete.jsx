import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Button, CircularProgress,
  Alert, Divider, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle
} from '@mui/material';
import { checkAuth } from '../services/api';
import perfumePersonalizadoService from '../services/perfumePersonalizadoService';

const PerfumePersonalizadoDelete = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  useEffect(() => {
    const cargarPerfume = async () => {
      if (!checkAuth()) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const respuesta = await perfumePersonalizadoService.getById(id);
        setPerfume(respuesta.data);
      } catch (error) {
        console.error('Error al cargar el perfume:', error);
        setError('No se pudo cargar el perfume. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    cargarPerfume();
  }, [id, navigate]);
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleDelete = async () => {
    try {
      setEliminando(true);
      await perfumePersonalizadoService.delete(id);
      
      // Cerrar el diálogo
      setOpenDialog(false);
      
      // Redireccionar después de 1 segundo
      setTimeout(() => {
        navigate('/mis-perfumes', { state: { message: 'Perfume eliminado con éxito' } });
      }, 1000);
      
    } catch (error) {
      console.error('Error al eliminar el perfume:', error);
      setError('No se pudo eliminar el perfume. Por favor, intenta nuevamente.');
      setOpenDialog(false);
      setEliminando(false);
    }
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
        <Button component={Link} to="/mis-perfumes" sx={{ mt: 2 }}>
          Volver a mis perfumes
        </Button>
      </Container>
    );
  }
  
  if (!perfume) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">No se encontró el perfume solicitado</Alert>
        <Button component={Link} to="/mis-perfumes" sx={{ mt: 2 }}>
          Volver a mis perfumes
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" color="error" gutterBottom align="center">
          Eliminar Perfume
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ my: 3 }}>
          <Typography variant="h5" gutterBottom>
            {perfume.nombre}
          </Typography>
          
          <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
            ¿Estás seguro de que deseas eliminar este perfume personalizado? Esta acción no se puede deshacer.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
          <Button 
            variant="outlined" 
            component={Link} 
            to={`/perfumes-personalizados/${id}`}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleOpenDialog}
            disabled={eliminando}
          >
            {eliminando ? <CircularProgress size={24} /> : "Eliminar Perfume"}
          </Button>
        </Box>
      </Paper>
      
      {/* Diálogo de confirmación */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás completamente seguro de que deseas eliminar "{perfume.nombre}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PerfumePersonalizadoDelete; 