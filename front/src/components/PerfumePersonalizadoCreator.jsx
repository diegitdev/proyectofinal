import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Grid,
  FormControl, InputLabel, Select, MenuItem, Chip, Paper,
  CircularProgress, Alert, Stack, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';

// Servicios
import { notaOlfativaService, checkAuth, getCurrentUser } from '../services/api';
import perfumePersonalizadoService from '../services/perfumePersonalizadoService';

const PerfumePersonalizadoCreator = ({ user }) => {
  const navigate = useNavigate();

  // Estado
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [notasSeleccionadas, setNotasSeleccionadas] = useState([]);
  const [notasDisponibles, setNotasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingNotas, setLoadingNotas] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  
  // Estados para manejo de imagen
  const [imagenUrl, setImagenUrl] = useState('');
  const [errorImagen, setErrorImagen] = useState(null);

  // Cargar notas olfativas al iniciar
  useEffect(() => {
    async function cargarNotas() {
      try {
        // Verificar autenticación
        if (!checkAuth()) {
          navigate('/login');
          return;
        }
        
        console.log('Intentando cargar notas olfativas...');
        const respuesta = await notaOlfativaService.getAll();
        
        if (respuesta && Array.isArray(respuesta.data)) {
          console.log(`${respuesta.data.length} notas olfativas cargadas correctamente`);
          setNotasDisponibles(respuesta.data);
        } else {
          console.warn('Respuesta inesperada al cargar notas olfativas:', respuesta);
          setNotasDisponibles([]);
          setError("No se pudieron cargar las notas olfativas. Formato de respuesta inesperado.");
        }
      } catch (error) {
        console.error("Error al cargar notas olfativas:", error);
        
        // Mensaje más específico según el tipo de error
        let errorMessage = "No se pudieron cargar las notas olfativas. Intenta de nuevo más tarde.";
        
        if (error.code === 'ERR_NETWORK') {
          errorMessage = "No se ha podido conectar con el servidor. Por favor, verifica que el servidor backend esté en funcionamiento.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoadingNotas(false);
      }
    }

    cargarNotas();
  }, [navigate]);

  // Manejar selección de notas
  const handleNotaChange = (event) => {
    const idNota = event.target.value;
    const notaSeleccionada = notasDisponibles.find(nota => nota.id === idNota);
    
    if (notaSeleccionada && !notasSeleccionadas.some(nota => nota.id === idNota)) {
      setNotasSeleccionadas([...notasSeleccionadas, notaSeleccionada]);
    }
  };

  // Eliminar nota seleccionada
  const handleQuitarNota = (id) => {
    setNotasSeleccionadas(notasSeleccionadas.filter(nota => nota.id !== id));
  };
  
  // Manejar cambio de URL de imagen
  const handleImagenUrlChange = (e) => {
    const url = e.target.value;
    setImagenUrl(url);
    setErrorImagen(null);
    
    if (!url || url.trim() === '') {
      return;
    }
    
    // Validación básica de URL
    if (!url.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      setErrorImagen("Por favor, introduce una URL válida");
    }
  };
  
  // Eliminar URL de imagen
  const handleEliminarImagen = () => {
    setImagenUrl('');
    setErrorImagen(null);
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      setError("Por favor, ingresa un nombre para tu perfume");
      return;
    }

    if (notasSeleccionadas.length === 0) {
      setError("Selecciona al menos una nota olfativa");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const currentUser = user || getCurrentUser();
      if (!currentUser || !currentUser.id) {
        setError("Error de autenticación. Por favor, inicia sesión nuevamente.");
        navigate('/login');
        return;
      }
      
      // Preparar datos del perfume en formato JSON
      const perfumeData = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || '',
        usuario: { 
          id: currentUser.id 
        },
        notas: notasSeleccionadas.map(nota => ({ id: nota.id }))
      };
      
      // Añadir URL de imagen si existe
      if (imagenUrl && imagenUrl.trim() !== '') {
        perfumeData.imagenUrl = imagenUrl.trim();
      }
      
      // Log para depuración
      console.log("Enviando datos al servidor en formato JSON:");
      console.log(JSON.stringify(perfumeData, null, 2));
      
      const response = await perfumePersonalizadoService.create(perfumeData);
      console.log("Respuesta del servidor:", response);
      
      setMensaje("¡Tu perfume personalizado ha sido creado con éxito!");
      
      // Limpiar formulario
      setNombre('');
      setDescripcion('');
      setNotasSeleccionadas([]);
      setImagenUrl('');
      
      // Redireccionar después de 2 segundos
      setTimeout(() => {
        navigate('/mis-perfumes');
      }, 2000);
      
    } catch (error) {
      console.error("Error al crear perfume:", error);
      
      let mensajeError = "Ocurrió un error al crear tu perfume. Por favor, intenta de nuevo.";
      
      // Si hay un mensaje de error específico del servidor, lo mostramos
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          mensajeError = error.response.data;
        } else if (error.response.data.message) {
          mensajeError = error.response.data.message;
        }
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  if (loadingNotas) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Crea tu Perfume Personalizado
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {mensaje && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {mensaje}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de tu perfume"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción (opcional)"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Selecciona notas olfativas</InputLabel>
                <Select
                  value=""
                  onChange={handleNotaChange}
                  label="Selecciona notas olfativas"
                >
                  {notasDisponibles.map((nota) => (
                    <MenuItem 
                      key={nota.id} 
                      value={nota.id}
                      disabled={notasSeleccionadas.some(n => n.id === nota.id)}
                    >
                      {nota.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {notasSeleccionadas.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Notas seleccionadas:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {notasSeleccionadas.map((nota) => (
                    <Chip
                      key={nota.id}
                      label={nota.nombre}
                      onDelete={() => handleQuitarNota(nota.id)}
                      color="primary"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Stack>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                URL de imagen (opcional):
              </Typography>
              <TextField
                fullWidth
                label="URL de la imagen"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imagenUrl}
                onChange={handleImagenUrlChange}
                InputProps={{
                  startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} />,
                  endAdornment: imagenUrl && (
                    <IconButton 
                      color="error" 
                      onClick={handleEliminarImagen}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )
                }}
                helperText="Introduce una URL de imagen válida (JPG, PNG, etc.)"
                variant="outlined"
                margin="normal"
              />
              
              {errorImagen && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errorImagen}
                </Alert>
              )}
              
              {imagenUrl && !errorImagen && (
                <Box 
                  sx={{ 
                    mt: 2, 
                    maxWidth: 300, 
                    maxHeight: 300, 
                    overflow: 'hidden',
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    p: 1
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Vista previa:
                  </Typography>
                  <img 
                    src={imagenUrl} 
                    alt="Vista previa" 
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
                    onError={(e) => {
                      console.error('Error al cargar imagen de vista previa:', imagenUrl);
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      setErrorImagen("No se pudo cargar la imagen. Verifica la URL.");
                      // Mostrar placeholder en caso de error
                      const placeholder = document.createElement('div');
                      placeholder.innerHTML = `
                        <div style="text-align: center; color: #888; width: 100%; height: 150px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                          <svg width="50" height="50" viewBox="0 0 24 24" fill="#888">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                          <span style="margin-top: 8px;">Error al cargar imagen</span>
                        </div>
                      `;
                      e.target.parentNode.appendChild(placeholder.firstElementChild);
                    }}
                  />
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} textAlign="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 2, minWidth: 200 }}
              >
                {loading ? <CircularProgress size={24} /> : "Crear Perfume"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PerfumePersonalizadoCreator;