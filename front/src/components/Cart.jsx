import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Grid,
  TextField,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Card,
  CardMedia,
  CardContent,
  ButtonGroup
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { carritoService, checkAuth, getCurrentUser } from '../services/api';
import '../styles/Cart.css';

const Cart = ({ user }) => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [direccionEnvio, setDireccionEnvio] = useState('');
  const [metodoPago, setMetodoPago] = useState('TARJETA');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [procesandoCompra, setProcesandoCompra] = useState(false);

  const metodosPago = [
    { value: 'TARJETA', label: 'Tarjeta de crédito/débito' },
    { value: 'PAYPAL', label: 'PayPal' },
    { value: 'TRANSFERENCIA', label: 'Transferencia bancaria' }
  ];

  useEffect(() => {
    fetchCarrito();
  }, [user, navigate]);

  const fetchCarrito = async () => {
    try {
      // Verificar autenticación
      if (!checkAuth()) {
        setError("Necesitas iniciar sesión para ver tu carrito");
        setLoading(false);
        navigate('/login');
        return;
      }

      // Obtener usuario actual
      const currentUser = user || getCurrentUser();
      if (!currentUser) {
        setError("Error al obtener información del usuario");
        setLoading(false);
        navigate('/login');
        return;
      }
      
      setLoading(true);
      // Enviar el usuarioId como parámetro de consulta
      const response = await carritoService.getCarrito({ usuarioId: currentUser.id });
      
      // Asegurarnos de que la respuesta tenga la estructura correcta
      const carritoData = response.data || {};
      setCarrito({
        ...carritoData,
        detalles: carritoData.detalles || []
      });
      setError(null);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      
      let errorMsg = 'Error al cargar el carrito. Por favor, inténtalo de nuevo más tarde.';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMsg = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            break;
          case 403:
            errorMsg = 'Error de permisos: No tienes acceso al carrito.';
            navigate('/login');
            break;
          default:
            errorMsg = `Error ${error.response.status}: ${error.response.data?.message || 'Error del servidor'}`;
        }
      } else if (error.request) {
        errorMsg = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarItem = async (detalleId) => {
    try {
      if (!checkAuth()) {
        navigate('/login');
        return;
      }

      const currentUser = user || getCurrentUser();
      await carritoService.removeItem(detalleId, { params: { usuarioId: currentUser.id } });
      
      // Actualizar el estado local para evitar recargar todo el carrito
      setCarrito({
        ...carrito,
        detalles: carrito.detalles.filter(d => d.id !== detalleId)
      });
      
      setSnackbar({
        open: true,
        message: 'Producto eliminado del carrito',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al eliminar item:', error);
      let errorMsg = 'Error al eliminar el producto del carrito';
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    }
  };

  const handleUpdateCantidad = async (detalleId, cantidad) => {
    try {
      if (!checkAuth()) {
        navigate('/login');
        return;
      }

      const currentUser = user || getCurrentUser();
      if (!currentUser) {
        setError("Error al obtener información del usuario");
        navigate('/login');
        return;
      }

      // Primero actualizamos la UI localmente para una experiencia fluida
      const detalleActual = carrito.detalles.find(d => d.id === detalleId);
      if (!detalleActual) return;

      const newCantidad = Math.max(1, detalleActual.cantidad + cantidad);
      // Obtener el precio del producto, ya sea de perfume, perfumePersonalizado o del precio general
      const precioUnitario = detalleActual.precioUnitario || detalleActual.precio || 
                         (detalleActual.perfume ? detalleActual.perfume.precio : 0) || 
                         (detalleActual.perfumePersonalizado ? detalleActual.perfumePersonalizado.precio : 0) || 
                         0;
      
      console.log('Actualizando cantidad:', {
        detalleId,
        nuevaCantidad: newCantidad,
        precioUnitario: precioUnitario,
        subtotalCalculado: precioUnitario * newCantidad
      });
      
      // Actualizar estado local para respuesta inmediata
      setCarrito({
        ...carrito,
        detalles: carrito.detalles.map(detalle => {
          if (detalle.id === detalleId) {
            return {
              ...detalle,
              cantidad: newCantidad,
              precioUnitario: precioUnitario,
              subtotal: precioUnitario * newCantidad
            };
          }
          return detalle;
        })
      });
      
      // Intentamos sincronizar con el backend si existe la función
      try {
        if (carritoService.updateCantidad) {
          await carritoService.updateCantidad(detalleId, newCantidad);
        } else {
          console.warn('La función updateCantidad no está disponible en el servicio.');
        }
      } catch (error) {
        console.error('Error al sincronizar cantidad con el backend:', error);
        // No revertimos la UI, seguimos con el cambio local
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      setSnackbar({
        open: true,
        message: 'Error al actualizar cantidad',
        severity: 'error'
      });
    }
  };

  const calcularTotal = () => {
    if (!carrito || !carrito.detalles || carrito.detalles.length === 0) {
      return 0;
    }
    return carrito.detalles.reduce((total, detalle) => {
      // Si el subtotal es NaN, undefined o null, usar 0
      const subtotal = detalle.subtotal;
      const validSubtotal = (!isNaN(subtotal) && subtotal !== null && subtotal !== undefined) ? subtotal : 0;
      
      // Logging para debug
      if (isNaN(subtotal) || subtotal === null || subtotal === undefined) {
        console.warn('Subtotal inválido en detalle:', {
          detalleId: detalle.id,
          precio: detalle.precio || detalle.precioUnitario,
          cantidad: detalle.cantidad,
          subtotal: subtotal,
          usando: validSubtotal
        });
      }
      
      return total + validSubtotal;
    }, 0);
  };

  const handleCheckout = async () => {
    if (!direccionEnvio.trim()) {
      setSnackbar({
        open: true,
        message: 'Por favor, ingresa una dirección de envío',
        severity: 'warning'
      });
      return;
    }

    try {
      if (!checkAuth()) {
        navigate('/login');
        return;
      }

      setProcesandoCompra(true);
      const currentUser = user || getCurrentUser();
      
      console.log("Iniciando proceso de checkout con datos:", {
        usuarioId: currentUser.id,
        direccionEnvio,
        metodoPago
      });
      
      const response = await carritoService.checkout({
        usuarioId: currentUser.id,
        direccionEnvio,
        metodoPago
      });
      
      console.log("Respuesta del checkout:", response.data);
      
      setSnackbar({
        open: true,
        message: '¡Compra realizada con éxito! Redirigiendo a la factura...',
        severity: 'success'
      });
      
      // Resetear el carrito y campos después de la compra exitosa
      setCarrito({...carrito, detalles: []});
      setDireccionEnvio('');
      
      // Navegar a la factura generada
      if (response.data && response.data.id) {
        // Dar tiempo al backend para procesar y guardar la factura
        setTimeout(() => {
          navigate(`/facturas/${response.data.id}`);
        }, 1500);
      } else {
        console.warn("No se recibió un ID de factura en la respuesta:", response.data);
        // Navegar al perfil del usuario como fallback
        setTimeout(() => {
          navigate(`/perfil`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error al realizar checkout:', error);
      let errorMsg = 'Error al procesar la compra. Por favor, inténtalo de nuevo.';
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (error.response) {
        errorMsg = `Error al procesar la compra: ${error.response.data?.message || error.response.statusText}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    } finally {
      setProcesandoCompra(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/perfumes')}
        >
          Ver perfumes
        </Button>
      </Box>
    );
  }

  if (!carrito || !carrito.detalles || carrito.detalles.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Tu carrito está vacío</Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            ¡Añade algunos perfumes para comenzar!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/perfumes')}
          >
            Explorar perfumes
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom className="cart-title">
        Carrito de Compras
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, mb: { xs: 2, md: 0 } }}>
            <List>
              {carrito.detalles.map((detalle) => {
                const nombreProducto = detalle.perfume?.nombre || detalle.perfumePersonalizado?.nombre || 'Producto';
                const imagenProducto = detalle.perfume?.imagen || detalle.perfumePersonalizado?.imagen || '';
                const precio = detalle.precioUnitario || detalle.precio || 
                             (detalle.perfume ? detalle.perfume.precio : 0) || 
                             (detalle.perfumePersonalizado ? detalle.perfumePersonalizado.precio : 0) || 
                             0;
                
                return (
                  <React.Fragment key={detalle.id}>
                    <ListItem className="cart-item">
                      <Card sx={{ display: 'flex', width: '100%' }}>
                        <CardMedia
                          component="img"
                          sx={{ width: 80, height: 80, objectFit: 'contain' }}
                          image={imagenProducto || '/placeholder.png'}
                          alt={nombreProducto}
                        />
                        <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography component="div" variant="h6">
                                {nombreProducto}
                              </Typography>
                              <Typography variant="subtitle1" color="text.secondary" component="div">
                                ${precio.toFixed(2)} por unidad
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Typography variant="body2" mr={2}>
                                  Cantidad:
                                </Typography>
                                <ButtonGroup size="small">
                                  <Button onClick={() => handleUpdateCantidad(detalle.id, -1)}>
                                    <RemoveIcon fontSize="small" />
                                  </Button>
                                  <Button disableRipple>{detalle.cantidad}</Button>
                                  <Button onClick={() => handleUpdateCantidad(detalle.id, 1)}>
                                    <AddIcon fontSize="small" />
                                  </Button>
                                </ButtonGroup>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              <Typography variant="h6" color="primary">
                                ${(isNaN(detalle.subtotal) ? 0 : detalle.subtotal).toFixed(2)}
                              </Typography>
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleEliminarItem(detalle.id)}
                                color="error"
                                sx={{ p: 0, mt: 1 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Resumen de compra
            </Typography>
            
            <Box sx={{ my: 2 }}>
              <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <strong>${calcularTotal().toFixed(2)}</strong>
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Envío:</span>
                <strong>Gratis</strong>
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total:</span>
                <strong>${calcularTotal().toFixed(2)}</strong>
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Dirección de envío"
              variant="outlined"
              value={direccionEnvio}
              onChange={(e) => setDireccionEnvio(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              select
              fullWidth
              label="Método de pago"
              variant="outlined"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              sx={{ mb: 3 }}
            >
              {metodosPago.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={handleCheckout}
              disabled={procesandoCompra}
              startIcon={<ShoppingCartCheckoutIcon />}
            >
              {procesandoCompra ? 'Procesando...' : 'Finalizar Compra'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cart; 