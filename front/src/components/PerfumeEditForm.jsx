import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Grid,
  FormControl, InputLabel, Select, MenuItem, Chip, Paper,
  CircularProgress, Alert, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { perfumeService, categoriaService, notaOlfativaService, checkAuth, getCurrentUser } from '../services/api';

const PerfumeEditForm = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados
  const [perfume, setPerfume] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: ''
  });
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [notasSeleccionadas, setNotasSeleccionadas] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [notasDisponibles, setNotasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // Cargar datos del perfume y catálogos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
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
        
        setLoading(true);
        
        // Cargar perfume por ID
        const perfumeResponse = await perfumeService.getById(id);
        const perfumeData = perfumeResponse.data;
        
        setPerfume({
          nombre: perfumeData.nombre || '',
          descripcion: perfumeData.descripcion || '',
          precio: perfumeData.precio ? perfumeData.precio.toString() : '',
          imagen: perfumeData.imagen || ''
        });
        
        // Cargar categorías
        const categoriasResponse = await categoriaService.getAll();
        // Asegurar que no haya duplicados usando el ID como identificador
        const categoriasUnicas = Array.from(
          new Map(categoriasResponse.data.map(item => [item.id, item])).values()
        );
        setCategoriasDisponibles(categoriasUnicas);
        
        // Cargar notas olfativas
        const notasResponse = await notaOlfativaService.getAll();
        // Asegurar que no haya duplicados usando el ID como identificador
        const notasUnicas = Array.from(
          new Map(notasResponse.data.map(item => [item.id, item])).values()
        );
        setNotasDisponibles(notasUnicas);
        
        // Establecer categorías seleccionadas (evitar duplicados)
        if (perfumeData.categorias) {
          const categoriasUnicas = Array.from(
            new Map(perfumeData.categorias.map(item => [item.id, item])).values()
          );
          setCategoriasSeleccionadas(categoriasUnicas);
        }
        
        // Establecer notas seleccionadas (evitar duplicados)
        if (perfumeData.notasOlfativas) {
          const notasUnicas = Array.from(
            new Map(perfumeData.notasOlfativas.map(item => [item.id, item])).values()
          );
          setNotasSeleccionadas(notasUnicas);
        }
        
      } catch (error) {
        console.error("Error al cargar datos del perfume:", error);
        setError("No se pudieron cargar los datos del perfume. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfume({ ...perfume, [name]: value });
  };

  // Manejar selección de categoría
  const handleCategoriaChange = (e) => {
    const categoriaId = e.target.value;
    const categoriaSeleccionada = categoriasDisponibles.find(cat => cat.id === categoriaId);
    
    if (categoriaSeleccionada && !categoriasSeleccionadas.some(cat => cat.id === categoriaId)) {
      setCategoriasSeleccionadas([...categoriasSeleccionadas, categoriaSeleccionada]);
    }
  };

  // Manejar selección de nota olfativa
  const handleNotaChange = (e) => {
    const notaId = e.target.value;
    const notaSeleccionada = notasDisponibles.find(nota => nota.id === notaId);
    
    if (notaSeleccionada && !notasSeleccionadas.some(nota => nota.id === notaId)) {
      setNotasSeleccionadas([...notasSeleccionadas, notaSeleccionada]);
    }
  };

  // Eliminar categoría seleccionada
  const handleQuitarCategoria = (id) => {
    setCategoriasSeleccionadas(categoriasSeleccionadas.filter(cat => cat.id !== id));
  };

  // Eliminar nota seleccionada
  const handleQuitarNota = (id) => {
    setNotasSeleccionadas(notasSeleccionadas.filter(nota => nota.id !== id));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!perfume.nombre.trim()) {
      setError("Por favor, ingresa un nombre para el perfume");
      return;
    }

    if (!perfume.precio || isNaN(parseFloat(perfume.precio)) || parseFloat(perfume.precio) <= 0) {
      setError("Por favor, ingresa un precio válido");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Preparar datos del perfume con solo las propiedades necesarias
      // Creamos un objeto limpio con la estructura que espera el backend
      const perfumeData = {
        id: id,
        nombre: perfume.nombre.trim(),
        descripcion: perfume.descripcion || '',
        precio: parseFloat(perfume.precio),
        imagen: perfume.imagen || '',
        categorias: categoriasSeleccionadas.map(cat => ({ id: cat.id })),
        notasOlfativas: notasSeleccionadas.map(nota => ({ id: nota.id }))
      };
      
      // Utilizamos el endpoint simple-update para evitar problemas de conversión
      const response = await perfumeService.update(id, perfumeData);
      console.log("Respuesta del servidor:", response);
      
      setMensaje("El perfume ha sido actualizado con éxito");
      
      // Redireccionar después de 2 segundos
      setTimeout(() => {
        navigate(`/perfumes/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error al actualizar perfume:", error);
      let mensajeError = "Ocurrió un error al actualizar el perfume. Por favor, intenta de nuevo.";
      
      // Si hay un mensaje de error específico del servidor, lo mostramos
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          mensajeError = error.response.data;
        } else if (error.response.data.message) {
          mensajeError = error.response.data.message;
        }
      }
      
      setError(mensajeError);
    } finally {
      setSaving(false);
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/perfumes/${id}`)}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4">Editar Perfume</Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
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
                label="Nombre del perfume"
                name="nombre"
                value={perfume.nombre}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio (€)"
                name="precio"
                type="number"
                value={perfume.precio}
                onChange={handleChange}
                variant="outlined"
                required
                inputProps={{ min: "0.01", step: "0.01" }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="URL de la imagen"
                name="imagen"
                value={perfume.imagen}
                onChange={handleChange}
                variant="outlined"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </Grid>
            
            {/* Previsualización de la imagen */}
            {perfume.imagen && (
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 300,
                    height: 300,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    p: 2,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={perfume.imagen}
                    alt={perfume.nombre}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                value={perfume.descripcion}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Categorías</InputLabel>
                <Select
                  value=""
                  onChange={handleCategoriaChange}
                  label="Categorías"
                >
                  {categoriasDisponibles.map((categoria) => (
                    <MenuItem 
                      key={`categoria-${categoria.id}`} 
                      value={categoria.id}
                      disabled={categoriasSeleccionadas.some(c => c.id === categoria.id)}
                    >
                      {categoria.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Notas olfativas</InputLabel>
                <Select
                  value=""
                  onChange={handleNotaChange}
                  label="Notas olfativas"
                >
                  {notasDisponibles.map((nota) => (
                    <MenuItem 
                      key={`nota-${nota.id}`} 
                      value={nota.id}
                      disabled={notasSeleccionadas.some(n => n.id === nota.id)}
                    >
                      {nota.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {categoriasSeleccionadas.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Categorías seleccionadas:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {categoriasSeleccionadas.map((categoria) => (
                    <Chip
                      key={`cat-chip-${categoria.id}`}
                      label={categoria.nombre}
                      onDelete={() => handleQuitarCategoria(categoria.id)}
                      color="primary"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Stack>
              </Grid>
            )}
            
            {notasSeleccionadas.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Notas olfativas seleccionadas:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {notasSeleccionadas.map((nota) => (
                    <Chip
                      key={`nota-chip-${nota.id}`}
                      label={nota.nombre}
                      onDelete={() => handleQuitarNota(nota.id)}
                      color="secondary"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Stack>
              </Grid>
            )}
            
            <Grid item xs={12} textAlign="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={saving}
                startIcon={<SaveIcon />}
                sx={{ mt: 2, minWidth: 200 }}
              >
                {saving ? <CircularProgress size={24} /> : "Guardar Cambios"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PerfumeEditForm; 