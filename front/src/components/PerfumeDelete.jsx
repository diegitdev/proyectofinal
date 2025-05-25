import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Paper, CircularProgress,
  Alert, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { perfumeService, checkAuth, getCurrentUser } from '../services/api';

const PerfumeDelete = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPerfume = async () => {
      // Verificar autenticación y permisos
      if (!checkAuth()) {
        navigate('/login');
        return;
      }
      
      const currentUser = user || getCurrentUser();
      if (!currentUser || currentUser.rol !== 'ADMIN') {
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        const response = await perfumeService.getById(id);
        setPerfume(response.data);
      } catch (err) {
        console.error('Error al cargar datos del perfume:', err);
        setError('No se pudo cargar la información del perfume. Por favor, intenta nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerfume();
  }, [id, user, navigate]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await perfumeService.delete(id);
      
      // Navegamos de vuelta a la lista de perfumes con un mensaje de éxito
      navigate('/perfumes', { 
        state: { 
          message: 'Perfume eliminado correctamente',
          severity: 'success'
        } 
      });
    } catch (error) {
      console.error('Error al eliminar perfume:', error);
      
      // Verificar si es un error de integridad referencial (perfume con facturas)
      if (error?.response?.status === 409 || 
          (error?.response?.status === 500 && 
           error?.response?.data?.message?.includes('FK1EWTJY575YSLRYMKGSV8955YH'))) {
        // Error de integridad referencial (perfume asociado a facturas)
        setError(
          error?.response?.data?.message || 
          'No se puede eliminar este perfume porque está asociado a facturas existentes. Primero debes eliminar las facturas relacionadas.'
        );
      } else {
        setError('Ocurrió un error al eliminar el perfume. Por favor, inténtalo de nuevo.');
      }
      
      setDeleting(false);
      setDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h5" color="error" gutterBottom>
            No se pudo eliminar el perfume
          </Typography>
          
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          
          {error.includes("facturas existentes") && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" paragraph>
                Este perfume no puede ser eliminado porque está siendo usado en facturas. 
                Para eliminar el perfume, primero debes eliminar o modificar todas las facturas 
                que lo incluyen.
              </Typography>
              <Typography variant="body1">
                Alternativas:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body1">
                    Modificar las facturas para usar un perfume diferente.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    En lugar de eliminar, considera desactivar temporalmente este perfume.
                  </Typography>
                </li>
              </ul>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/perfumes')}
            >
              Volver a la lista de perfumes
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/perfumes/${id}`)}
            >
              Ver detalles del perfume
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (!perfume) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>No se encontró el perfume solicitado</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/perfumes')}
        >
          Volver a la lista de perfumes
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/perfumes/${id}`)}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4">Eliminar Perfume</Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom color="error">
          ¿Estás seguro de que deseas eliminar este perfume?
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="body1">
            <strong>Nombre:</strong> {perfume.nombre}
          </Typography>
          
          {perfume.descripcion && (
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>Descripción:</strong> {perfume.descripcion}
            </Typography>
          )}
          
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Precio:</strong> {perfume.precio?.toFixed(2)} €
          </Typography>
        </Box>
        
        <Alert severity="warning" sx={{ mb: 3 }}>
          Esta acción no se puede deshacer. Una vez eliminado, todos los datos asociados a este perfume se perderán permanentemente.
        </Alert>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/perfumes/${id}`)}
          >
            Cancelar
          </Button>
          
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Eliminar Perfume
          </Button>
        </Box>
      </Paper>
      
      {/* Diálogo de confirmación */}
      <Dialog
        open={dialogOpen}
        onClose={() => !deleting && setDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás completamente seguro de que deseas eliminar el perfume "{perfume.nombre}"? 
            Esta acción es irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)} 
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Eliminar Definitivamente'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PerfumeDelete; 