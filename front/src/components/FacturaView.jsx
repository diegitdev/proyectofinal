import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { facturaService, checkAuth, getCurrentUser } from '../services/api';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FacturaPDF from './FacturaPDF';

const FacturaView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pdfReady, setPdfReady] = useState(false);

  useEffect(() => {
    const fetchFactura = async () => {
      // Verificar autenticación
      if (!checkAuth()) {
        navigate('/login');
        return;
      }

      const currentUser = user || getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        console.log(`Intentando obtener factura con ID: ${id}, intento: ${retryCount + 1}`);
        
        const response = await facturaService.getById(id);
        console.log("Datos de factura recibidos:", response.data);
        setFactura(response.data);
        setPdfReady(true);

        // Verificar si la factura pertenece al usuario o es admin
        if (response.data.usuarioId !== currentUser.id && currentUser.rol !== 'ADMIN') {
          setError('No tienes permiso para ver esta factura');
          navigate('/');
        }
      } catch (err) {
        console.error('Error al cargar factura:', err);
        
        // Mostrar detalles específicos del error
        let errorMsg = 'Error al cargar la factura. ';
        
        if (err.response) {
          // Si es un error 404, podemos intentar de nuevo después de un tiempo
          if (err.response.status === 404 && retryCount < 3) {
            errorMsg += `La factura aún no está lista. Reintentando... (${retryCount + 1}/3)`;
            setError(errorMsg);
            
            // Esperar 2 segundos antes de reintentar
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 2000);
            return;
          } else if (err.response.status === 404) {
            errorMsg += 'No se encontró la factura.';
          } else {
            errorMsg += `Error del servidor: ${err.response.status}`;
          }
        } else if (err.request) {
          errorMsg += 'No se pudo conectar con el servidor.';
        } else {
          errorMsg += err.message;
        }
        
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchFactura();
  }, [id, user, navigate, retryCount]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Generando Factura...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/perfil')}
          >
            Volver a Mi Perfil
          </Button>
        </Box>
      </Container>
    );
  }

  if (!factura) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ my: 2 }}>No se encontró la factura</Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/perfil')}
          >
            Volver a Mi Perfil
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
        
        {pdfReady && (
          <PDFDownloadLink
            document={<FacturaPDF factura={factura} />}
            fileName={`factura_${factura.id}.pdf`}
          >
            {({ blob, url, loading, error }) => (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                disabled={loading}
              >
                {loading ? 'Generando PDF...' : 'Descargar Factura'}
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </Box>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="h4" align="center" gutterBottom>
            FACTURA
          </Typography>
          <Typography variant="h6" gutterBottom>
            Luxury Scents
          </Typography>
          <Typography variant="body2">
            C/ Perfume Nº123, 28001 Madrid, España
          </Typography>
          <Typography variant="body2">
            CIF: B12345678
          </Typography>
          <Typography variant="body2">
            info@luxuryscents.com
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', width: 200 }}>
              Nº Factura:
            </Typography>
            <Typography variant="body1">
              {factura.id}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', width: 200 }}>
              Fecha:
            </Typography>
            <Typography variant="body1">
              {formatDate(factura.fechaEmision)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', width: 200 }}>
              Cliente:
            </Typography>
            <Typography variant="body1">
              {factura.usuarioNombre || 'Cliente'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', width: 200 }}>
              Email:
            </Typography>
            <Typography variant="body1">
              {factura.usuarioCorreo || 'No disponible'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', width: 200 }}>
              Dirección de envío:
            </Typography>
            <Typography variant="body1">
              {factura.direccionEnvio || 'No especificada'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', width: 200 }}>
              Método de pago:
            </Typography>
            <Typography variant="body1">
              {factura.metodoPago || 'No especificado'}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="h6" gutterBottom>
          Detalles
        </Typography>
        
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><Typography variant="subtitle2">Descripción</Typography></TableCell>
                <TableCell align="center"><Typography variant="subtitle2">Cantidad</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2">Precio</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2">Total</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {factura.detalles && factura.detalles.map((detalle, index) => (
                <TableRow key={index}>
                  <TableCell>{detalle.nombreProducto}</TableCell>
                  <TableCell align="center">{detalle.cantidad}</TableCell>
                  <TableCell align="right">{detalle.precioUnitario.toFixed(2)} €</TableCell>
                  <TableCell align="right">{detalle.subtotal.toFixed(2)} €</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>TOTAL:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {factura.total.toFixed(2)} €
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }}>
          Gracias por su compra. Este documento sirve como comprobante de pago.
        </Typography>
      </Paper>
    </Container>
  );
};

export default FacturaView; 