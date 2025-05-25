import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Grid,
  FormControl, InputLabel, Select, MenuItem, Chip, Paper,
  CircularProgress, Alert, Stack, IconButton, InputAdornment
} from '@mui/material';
import { notaOlfativaService, checkAuth, getCurrentUser } from '../services/api';
import perfumePersonalizadoService from '../services/perfumePersonalizadoService';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';

const PerfumePersonalizadoEdit = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados para el formulario
  const [perfume, setPerfume] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    notas: [],
    imagenEliminada: false
  });
  const [notasDisponibles, setNotasDisponibles] = useState([]);
  
  // Estados para carga y errores
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  
  // Estados para la imagen
  const [imagenUrl, setImagenUrl] = useState('');
  const [urlPreview, setUrlPreview] = useState(null);
  const [errorImagen, setErrorImagen] = useState(null);
  const [originalImagenUrl, setOriginalImagenUrl] = useState(''); // Para rastrear la URL original

  // Cargar datos del perfume y notas olfativas
  useEffect(() => {
    const cargarDatos = async () => {
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
        
        setLoading(true);
        
        // Cargar notas olfativas disponibles
        const responseNotas = await notaOlfativaService.getAll();
        setNotasDisponibles(responseNotas.data);
        
        // Cargar datos del perfume personalizado
        const responsePerfume = await perfumePersonalizadoService.getById(id);
        const perfumeData = responsePerfume.data;
        
        // Verificar si el perfume pertenece al usuario o es admin
        if (perfumeData.usuario.id !== currentUser.id && currentUser.rol !== 'ADMIN') {
          setError('No tienes permiso para editar este perfume');
          navigate('/mis-perfumes');
          return;
        }
        
        // Añadir el flag de imagen eliminada inicialmente en false
        setPerfume({
          ...perfumeData,
          imagenEliminada: false
        });
        
        // Si el perfume tiene imagen y no es un placeholder, establecer la URL
        if (perfumeData.imagenUrl && !perfumeData.imagenUrl.includes('placeholder')) {
          const imagenUrlLimpia = perfumeData.imagenUrl.trim();
          setImagenUrl(imagenUrlLimpia);
          setUrlPreview(imagenUrlLimpia);
          setOriginalImagenUrl(imagenUrlLimpia); // Guardar la URL original
          console.log("Imagen original cargada:", imagenUrlLimpia);
        } else {
          // Limpiar valores de imagen en caso de que no haya una válida
          setImagenUrl('');
          setUrlPreview(null);
          setOriginalImagenUrl('');
          console.log("No se encontró una imagen válida para el perfume");
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos del perfume. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [id, navigate, user]);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfume(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar selección de notas olfativas
  const handleNotaChange = (event) => {
    const idNota = event.target.value;
    const notaSeleccionada = notasDisponibles.find(nota => nota.id === idNota);
    
    if (notaSeleccionada && !perfume.notas.some(nota => nota.id === idNota)) {
      setPerfume(prev => ({
        ...prev,
        notas: [...prev.notas, notaSeleccionada]
      }));
    }
  };
  
  // Eliminar nota seleccionada
  const handleQuitarNota = (id) => {
    setPerfume(prev => ({
      ...prev,
      notas: prev.notas.filter(nota => nota.id !== id)
    }));
  };
  
  // Manejar cambio de URL de imagen
  const handleImagenUrlChange = (e) => {
    try {
      const url = e.target.value;
      
      // Prevenir recursión infinita y establecer el valor
      setImagenUrl(url);
      setErrorImagen(null);
      
      // Si se cambió la URL, considerar que ya no se eliminará
      if (perfume.imagenEliminada) {
        setPerfume(prev => ({
          ...prev,
          imagenEliminada: false
        }));
      }
      
      // Actualizar la vista previa solo si hay un valor
      if (!url || url.trim() === '') {
        setUrlPreview(null);
        return;
      }
      
      // Validación básica de URL - usamos una expresión regular más simple
      const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)*$/;
      if (!urlPattern.test(url)) {
        setErrorImagen("Por favor, introduce una URL válida");
        setUrlPreview(null);
        return;
      }
      
      // Si la URL es válida, establecemos la vista previa
      setUrlPreview(url.trim());
    } catch (error) {
      console.error("Error en handleImagenUrlChange:", error);
      setErrorImagen("Error al procesar la URL");
      setUrlPreview(null);
    }
  };
  
  // Eliminar URL de imagen
  const handleEliminarImagen = () => {
    setImagenUrl('');
    setUrlPreview(null);
    setErrorImagen(null);
    
    // Añadir flag para indicar que la imagen ha sido eliminada deliberadamente
    setPerfume(prev => ({
      ...prev,
      imagenEliminada: true
    }));
  };
  
  // Restaurar imagen original si existe
  const handleRestaurarImagen = () => {
    if (originalImagenUrl) {
      setImagenUrl(originalImagenUrl);
      setUrlPreview(originalImagenUrl);
      setPerfume(prev => ({
        ...prev,
        imagenEliminada: false
      }));
      setErrorImagen(null);
    }
  };
  
  // Enviar formulario de edición
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!perfume.nombre.trim()) {
      setError("Por favor, ingresa un nombre para tu perfume");
      return;
    }
    
    if (perfume.notas.length === 0) {
      setError("Selecciona al menos una nota olfativa");
      return;
    }
    
    try {
      setLoadingSubmit(true);
      setError(null);
      
      // Preparar datos para la actualización - Usamos un objeto simple en lugar de FormData
      const datosActualizados = {
        nombre: perfume.nombre.trim(),
        descripcion: perfume.descripcion ? perfume.descripcion.trim() : '',
        notasIds: perfume.notas.map(nota => nota.id)
      };
      
      // Añadir las notas olfativas
      console.log(`Enviando ${perfume.notas.length} notas olfativas:`);
      perfume.notas.forEach((nota, index) => {
        console.log(`- Nota ${index + 1}: ID=${nota.id}, Nombre=${nota.nombre}`);
      });
      
      // Manejar la URL de imagen correctamente
      if (perfume.imagenEliminada) {
        // Enviar explícitamente una cadena vacía para indicar que se debe eliminar la imagen
        datosActualizados.imagenUrl = '';
        console.log("Enviando señal de eliminación de imagen (imagenUrl='')");
      } else if (imagenUrl && imagenUrl.trim() !== '') {
        try {
          // Validar la URL antes de enviarla
          const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)*$/;
          if (urlPattern.test(imagenUrl.trim())) {
            // Si hay una URL válida, enviarla
            datosActualizados.imagenUrl = imagenUrl.trim();
            console.log("Enviando URL de imagen:", imagenUrl.trim());
          } else {
            console.warn("URL de imagen inválida, no se enviará:", imagenUrl);
            setError("La URL de la imagen no es válida. Por favor, corrige la URL o elimínala.");
            setLoadingSubmit(false);
            return;
          }
        } catch (err) {
          console.error("Error al procesar la URL de la imagen:", err);
          datosActualizados.imagenUrl = '';
          console.log("Error con la URL, enviando URL vacía");
        }
      } else if (originalImagenUrl && originalImagenUrl === imagenUrl) {
        // Si es la misma URL original, enviarla también para mantener consistencia
        datosActualizados.imagenUrl = originalImagenUrl;
        console.log("Enviando URL original de imagen:", originalImagenUrl);
      }
      
      // Mostrar resumen de lo que se enviará
      console.log("=== Resumen de datos a enviar ===");
      console.log(JSON.stringify(datosActualizados, null, 2));
      console.log("=== Fin resumen ===");
      
      // Enviar actualización
      const response = await perfumePersonalizadoService.update(perfume.id, datosActualizados);
      console.log("Respuesta de actualización:", response);
      
      // Verificar si los datos del servidor corresponden a lo enviado
      if (response.data) {
        console.log("=== Verificación de datos actualizados ===");
        console.log("Nombre esperado:", perfume.nombre.trim());
        console.log("Nombre recibido:", response.data.nombre);
        console.log("Descripción esperada:", perfume.descripcion ? perfume.descripcion.trim() : '');
        console.log("Descripción recibida:", response.data.descripcion);
        console.log("URL imagen esperada:", perfume.imagenEliminada ? 'eliminada' : imagenUrl || 'sin cambios');
        console.log("URL imagen recibida:", response.data.imagenUrl);
        console.log("=== Fin verificación ===");
      }
      
      setMensaje("¡Tu perfume personalizado ha sido actualizado con éxito!");
      
      // Redireccionar después de 2 segundos
      setTimeout(() => {
        navigate('/mis-perfumes', { 
          state: { 
            message: "Perfume actualizado con éxito", 
            severity: "success" 
          } 
        });
      }, 2000);
    } catch (err) {
      console.error('Error al actualizar perfume:', err);
      let errorMsg = 'Ocurrió un error al actualizar el perfume. Por favor, intenta de nuevo.';
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoadingSubmit(false);
    }
  };
  
  if (loading) {
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
          Editar Perfume Personalizado
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
        
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="nombre"
                label="Nombre del perfume"
                value={perfume.nombre}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="descripcion"
                label="Descripción (opcional)"
                value={perfume.descripcion || ''}
                onChange={handleChange}
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
                      disabled={perfume.notas.some(n => n.id === nota.id)}
                    >
                      {nota.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {perfume.notas.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Notas seleccionadas:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {perfume.notas.map((nota) => (
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
                Imagen del Perfume (opcional)
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  name="imagenUrl"
                  label="URL de imagen"
                  value={imagenUrl}
                  onChange={handleImagenUrlChange}
                  variant="outlined"
                  placeholder="Ingresa la URL de una imagen para tu perfume"
                  error={!!errorImagen}
                  helperText={errorImagen || "Ingresa una URL válida de imagen (https://ejemplo.com/imagen.jpg)"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: imagenUrl || perfume.imagenEliminada ? (
                      <InputAdornment position="end">
                        {perfume.imagenEliminada && originalImagenUrl ? (
                          <IconButton onClick={handleRestaurarImagen} title="Restaurar imagen original">
                            <PhotoCamera />
                          </IconButton>
                        ) : (
                          <IconButton onClick={handleEliminarImagen} title="Eliminar imagen">
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Box>
              
              {/* Vista previa de la imagen */}
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                {perfume.imagenEliminada ? (
                  <Box 
                    sx={{ 
                      border: '1px dashed #ccc', 
                      borderRadius: 1, 
                      p: 3, 
                      bgcolor: '#f9f9f9',
                      maxWidth: 300,
                      mx: 'auto'
                    }}
                  >
                    <Typography color="text.secondary" variant="body2">
                      La imagen será eliminada al guardar
                    </Typography>
                  </Box>
                ) : urlPreview ? (
                  <Box
                    sx={{
                      maxWidth: 300,
                      maxHeight: 300,
                      mx: 'auto',
                      border: '1px solid #eee',
                      borderRadius: 1,
                      p: 1,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <img 
                      src={urlPreview}
                      alt="Vista previa"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto'
                      }}
                      onError={(e) => {
                        console.error("Error al cargar la imagen de vista previa");
                        e.target.style.display = 'none';
                        
                        // Crear contenedor de error con estilo directamente
                        const errorContainer = document.createElement('div');
                        errorContainer.style.textAlign = 'center';
                        errorContainer.style.color = '#888';
                        errorContainer.style.backgroundColor = '#f9f9f9';
                        errorContainer.style.border = '1px solid #eee';
                        errorContainer.style.padding = '1rem';
                        errorContainer.style.borderRadius = '4px';
                        errorContainer.style.marginTop = '8px';
                        
                        // Añadir ícono
                        const iconElement = document.createElement('div');
                        iconElement.style.fontSize = '40px';
                        iconElement.style.marginBottom = '8px';
                        iconElement.textContent = '🖼️';
                        
                        // Añadir texto
                        const textElement = document.createElement('div');
                        textElement.textContent = 'Error al cargar la imagen';
                        
                        // Añadir elementos al contenedor
                        errorContainer.appendChild(iconElement);
                        errorContainer.appendChild(textElement);
                        
                        // Si hay un padre, añadir el contenedor de error
                        if (e.target.parentNode) {
                          e.target.parentNode.appendChild(errorContainer);
                        }
                        
                        // Establecer el error de imagen
                        setErrorImagen("No se pudo cargar la imagen. Verifica que la URL sea correcta.");
                        setUrlPreview(null);
                      }}
                    />
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      border: '1px dashed #ccc', 
                      borderRadius: 1, 
                      p: 3, 
                      bgcolor: '#f9f9f9',
                      maxWidth: 300,
                      mx: 'auto'
                    }}
                  >
                    <Typography color="text.secondary" variant="body2">
                      No hay imagen seleccionada
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/mis-perfumes')}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loadingSubmit}
              >
                {loadingSubmit ? <CircularProgress size={24} /> : "Guardar Cambios"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PerfumePersonalizadoEdit;