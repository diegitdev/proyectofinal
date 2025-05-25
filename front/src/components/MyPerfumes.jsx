import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button,
  CircularProgress, Snackbar, Alert, Chip, Container, alpha, Divider
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { checkAuth, getCurrentUser } from '../services/api';
import perfumePersonalizadoService from '../services/perfumePersonalizadoService';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PaletteIcon from '@mui/icons-material/Palette'; // Icono para "Mis Creaciones"
import { useTheme } from '@mui/material/styles';

// Funciones auxiliares para validar las imágenes
const isValidImageUrl = (url) => {
  if (!url) return false;
  if (url.trim() === '') return false;
  if (url.includes('placeholder')) return false;
  return true;
};

const MyPerfumes = ({ user }) => {
  const theme = useTheme();
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchMyPerfumes = async () => {
      setLoading(true);
      setError(null);
      if (!checkAuth()) {
          navigate('/login', { state: { message: "Necesitas iniciar sesión para ver tus perfumes.", severity: "warning" }});
          return;
      }
      const currentUser = user || getCurrentUser();
      if (!currentUser?.id) {
          localStorage.clear();
          navigate('/login', { state: { message: "Error al verificar tu sesión. Por favor, inicia sesión de nuevo.", severity: "error" }});
          return;
      }
      try {
        console.log(`Solicitando perfumes personalizados para el usuario ID: ${currentUser.id}`);
        const response = await perfumePersonalizadoService.getByUsuario(currentUser.id);
        
        if (response && Array.isArray(response.data)) {
          console.log(`Perfumes personalizados recibidos: ${response.data.length}`);
          setPerfumes(response.data);
        } else {
          console.warn('La respuesta no contiene un array de perfumes:', response);
          setPerfumes([]);
        }
      } catch (err) {
        console.error('Error al cargar tus perfumes:', err);
        
        // Mensaje más específico según el tipo de error
        let errorMessage = 'Error desconocido al cargar tus perfumes.';
        
        if (err.code === 'ERR_NETWORK') {
          errorMessage = 'No se ha podido conectar con el servidor. Por favor, verifica que el servidor backend esté en funcionamiento.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setPerfumes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPerfumes();

    if (location.state?.message) {
      setSnackbar({ open: true, message: location.state.message, severity: location.state.severity || 'success' });
      navigate(location.pathname, { replace: true, state: {} });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Renderizados Condicionales ---

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: '60vh' }}><CircularProgress size={60} /></Box>;
  if (error) return <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}><Alert severity="error" sx={{ p: 2 }}>{error}</Alert></Container>;

  // --- Estado Vacío ---
  if (!loading && perfumes.length === 0) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mt: 6, p: 4, bgcolor: alpha(theme.palette.primary.light, 0.05), borderRadius: '20px' }}>
          <PaletteIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" color="primary.dark" gutterBottom>
            Tu Colección Personal
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            ¡Aquí aparecerán tus fragancias únicas! Empieza a experimentar y crea tu primer perfume personalizado.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/crear-personalizado" size="large" sx={{ mt: 2, borderRadius: '25px', px: 4 }}>
            Crear mi Primer Perfume
          </Button>
        </Box>
      </Container>
    );
  }

  // --- Renderizado Principal (con perfumes) ---
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {" "}
      {/* Más padding vertical */}
      {/* Sección Título */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <PaletteIcon
          sx={{
            fontSize: 40,
            color: "primary.dark",
            verticalAlign: "middle",
            mr: 1,
          }}
        />
        <Typography
          variant="h3"
          component="h1"
          fontWeight="bold"
          color="primary.dark"
          display="inline"
        >
          {" "}
          {/* H3 */}
          Mis Creaciones Únicas
        </Typography>
      </Box>
      {/* Separador y Botón Crear Nuevo (Centrado) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          mb: 6,
        }}
      >
        {" "}
        {/* Margen inferior aumentado */}
        <Divider sx={{ width: "50%", my: 2 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/crear-personalizado"
          size="large" // Botón grande para destacar
          sx={{ mt: 2, borderRadius: "25px", px: 5, py: 1.5 }} // Más padding y redondeado
        >
          Crear un Nuevo Perfume
        </Button>
      </Box>
      {/* Grid de Perfumes (2 columnas) */}
      <Grid container spacing={6}>
        {" "}
        {/* Espaciado aumentado */}
        {perfumes.map((perfume) => (
          // Grid item md={6} para 2 columnas
          <Grid item xs={12} sm={6} md={6} key={perfume.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: "20px", // Bordes más redondeados
                overflow: "hidden",
                boxShadow: "0 6px 18px rgba(0,0,0,0.09)", // Sombra base
                transition: "transform 0.35s ease, box-shadow 0.35s ease",
                "&:hover": {
                  transform: "translateY(-7px) scale(1.015)", // Efecto hover más pronunciado
                  boxShadow: "0 12px 28px rgba(0,0,0,0.14)",
                },
              }}
            >
              {/* Área de Imagen */}
              <Box
                sx={{
                  height: 300, // Altura imagen aumentada
                  bgcolor: alpha(theme.palette.grey[100], 0.6), // Fondo ligero
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  p: 0, // Eliminamos el padding para que la imagen ocupe todo el espacio
                  borderBottom: `1px solid ${theme.palette.divider}`, // Línea divisoria
                  overflow: "hidden", // Asegurar que la imagen no desborde
                  position: "relative", // Para posicionar elementos internos
                  "&::after": isValidImageUrl(perfume.imagenUrl)
                    ? {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.05)",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      }
                    : {},
                  "&:hover::after": isValidImageUrl(perfume.imagenUrl)
                    ? {
                        opacity: 1,
                      }
                    : {},
                }}
              >
                {isValidImageUrl(perfume.imagenUrl) ? (
                  <img
                    src={perfume.imagenUrl}
                    alt={perfume.nombre || "Perfume personalizado"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover", // Asegura que la imagen cubre todo el espacio
                      display: "block", // Asegurar que se muestra como bloque
                    }}
                    onError={(e) => {
                      console.error(
                        "Error al cargar imagen:",
                        perfume.imagenUrl
                      );
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      
                      // Insertar elementos directamente en el DOM para mostrar el error
                      const errorContainer = document.createElement('div');
                      errorContainer.style.textAlign = 'center';
                      errorContainer.style.color = '#888';
                      errorContainer.style.width = '100%';
                      errorContainer.style.height = '100%';
                      errorContainer.style.display = 'flex';
                      errorContainer.style.flexDirection = 'column';
                      errorContainer.style.justifyContent = 'center';
                      errorContainer.style.alignItems = 'center';
                      
                      // Icono
                      const iconDiv = document.createElement('div');
                      iconDiv.innerHTML = `
                        <svg width="70" height="70" viewBox="0 0 24 24" fill="#888">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                      `;
                      
                      // Texto de error
                      const textDiv = document.createElement('div');
                      textDiv.style.marginTop = '8px';
                      textDiv.textContent = 'Error al cargar imagen';
                      
                      // Añadir al contenedor
                      errorContainer.appendChild(iconDiv);
                      errorContainer.appendChild(textDiv);
                      
                      // Añadir al DOM
                      e.target.parentNode.appendChild(errorContainer);
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: "center", color: "grey.400" }}>
                    <ImageNotSupportedIcon sx={{ fontSize: 60, mb: 1 }} />
                    <Typography variant="body2">
                      Sin imagen
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Contenido de la Card */}
              <CardContent
                sx={{
                  flexGrow: 1,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {" "}
                {/* Padding contenido aumentado */}
                <Typography
                  variant="h5"
                  fontWeight={700}
                  gutterBottom
                  sx={{ minHeight: { xs: 0, sm: "2.8em" } }}
                  noWrap
                >
                  {" "}
                  {/* Título H5 */}
                  {perfume.nombre || "Mi Creación"}
                </Typography>
                <Typography
                  variant="body1" // Descripción body1
                  color="text.secondary"
                  sx={{
                    mb: 2, // Más margen inferior
                    // Permite hasta 3-4 líneas aprox.
                    maxHeight: "6em", // MaxHeight en lugar de height fijo
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    // Para navegadores que soportan -webkit-line-clamp (Safari, Chrome)
                    display: "-webkit-box",
                    WebkitLineClamp: "4",
                    WebkitBoxOrient: "vertical",
                    // Fallback para otros navegadores (puede no cortar perfectamente en 4 líneas)
                    lineHeight: "1.5em",
                  }}
                >
                  {perfume.descripcion || "No se proporcionó descripción."}
                </Typography>
              </CardContent>

              {/* Acciones de la Card */}
              <CardActions
                sx={{
                  justifyContent: "space-between",
                  p: 2.5, // Padding acciones aumentado
                  borderTop: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.grey[50], 0.7), // Fondo acciones
                }}
              >
               <Button
                    size="medium"
                    variant="outlined"
                    startIcon={<InfoOutlinedIcon />}
                    component={RouterLink}
                    to={`/perfumes-personalizados/${perfume.id}`}
                    sx={{
                      color: theme.palette.primary.main,
                      borderColor: theme.palette.primary.main,
                      textTransform: 'none',
                      fontWeight: 500,
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main + '10', // suaviza el hover con opacidad (aprox. 6% si hex)
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                    aria-label={`Ver detalles del perfume con ID ${perfume.id}`}
                  >
                    Detalles
                </Button>


                <Button
                  size="medium"
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  component={RouterLink}
                  to={`/perfumes-personalizados/editar/${perfume.id}`}
                  sx={{ borderRadius: "25px", px: 3 }}
                >
                  {" "}
                  {/* size medium */}
                  Editar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", boxShadow: 6 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyPerfumes;