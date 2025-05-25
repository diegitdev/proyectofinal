import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  FormHelperText,
  Alert
} from '@mui/material';
import { perfumeService, categoriaService, notaOlfativaService } from '../services/api';

function PerfumeCreator({ user }) {
  const navigate = useNavigate();
  const [perfume, setPerfume] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    categorias: [],
    notas: []
  });
  const [categorias, setCategorias] = useState([]);
  const [notasOlfativas, setNotasOlfativas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Verificar si el usuario es administrador
    if (!user || user.rol !== 'ADMIN') {
      setError('Solo los administradores pueden crear perfumes estándar');
      setTimeout(() => {
        navigate('/');
      }, 3000);
      return;
    }

    // Cargar categorías y notas olfativas
    const fetchData = async () => {
      try {
        const [categoriasRes, notasRes] = await Promise.all([
          categoriaService.getAll(),
          notaOlfativaService.getAll()
        ]);
        setCategorias(categoriasRes.data);
        setNotasOlfativas(notasRes.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar categorías y notas olfativas');
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfume({
      ...perfume,
      [name]: value
    });
  };

  const handleCategoriasChange = (event) => {
    const { value } = event.target;
    setPerfume({
      ...perfume,
      categorias: value
    });
  };

  const handleNotasChange = (event) => {
    const { value } = event.target;
    setPerfume({
      ...perfume,
      notas: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!perfume.nombre || !perfume.precio) {
      setError('El nombre y el precio son obligatorios');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Preparar datos
      const perfumeData = {
        ...perfume,
        precio: parseFloat(perfume.precio)
      };
      
      // Enviar al servidor
      await perfumeService.create(perfumeData);
      setSuccess('Perfume creado con éxito');
      
      // Limpiar formulario
      setPerfume({
        nombre: '',
        descripcion: '',
        precio: '',
        imagen: '',
        categorias: [],
        notas: []
      });
      
      // Redireccionar después de 2 segundos
      setTimeout(() => {
        navigate('/perfumes');
      }, 2000);
    } catch (err) {
      console.error('Error al crear el perfume:', err);
      setError('Error al crear el perfume. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (error && (!user || user.rol !== 'ADMIN')) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Redirigiendo...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Crear Nuevo Perfume
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nombre"
            name="nombre"
            margin="normal"
            value={perfume.nombre}
            onChange={handleChange}
            required
          />
          
          <TextField
            fullWidth
            label="Descripción"
            name="descripcion"
            margin="normal"
            multiline
            rows={4}
            value={perfume.descripcion}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            label="Precio"
            name="precio"
            margin="normal"
            type="number"
            value={perfume.precio}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: '$',
            }}
          />
          
          <TextField
            fullWidth
            label="URL de la imagen"
            name="imagen"
            margin="normal"
            value={perfume.imagen}
            onChange={handleChange}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="categorias-label">Categorías</InputLabel>
            <Select
              labelId="categorias-label"
              multiple
              value={perfume.categorias}
              onChange={handleCategoriasChange}
              input={<OutlinedInput label="Categorías" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const categoria = categorias.find(c => c.id === value);
                    return <Chip key={value} label={categoria ? categoria.nombre : value} />;
                  })}
                </Box>
              )}
            >
              {categorias.map((categoria) => (
                <MenuItem key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Selecciona las categorías a las que pertenece el perfume</FormHelperText>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="notas-label">Notas Olfativas</InputLabel>
            <Select
              labelId="notas-label"
              multiple
              value={perfume.notas}
              onChange={handleNotasChange}
              input={<OutlinedInput label="Notas Olfativas" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const nota = notasOlfativas.find(n => n.id === value);
                    return <Chip key={value} label={nota ? nota.nombre : value} />;
                  })}
                </Box>
              )}
            >
              {notasOlfativas.map((nota) => (
                <MenuItem key={nota.id} value={nota.id}>
                  {nota.nombre}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Selecciona las notas olfativas del perfume</FormHelperText>
          </FormControl>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Perfume'}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default PerfumeCreator; 