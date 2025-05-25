import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Chip,
  CardActions,
  Container,
  useTheme,
  Fade,
  alpha,
  Slider,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import { perfumeService, categoriaService, notaOlfativaService } from '../services/api';
// Ya no necesitamos PerfumeList.css

const PerfumeList = () => {
  const [perfumes, setPerfumes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [notasOlfativas, setNotasOlfativas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedNotaOlfativa, setSelectedNotaOlfativa] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const theme = useTheme();

  // Establecer valores mínimos y máximos de precio según los datos
  const [minMaxPrice, setMinMaxPrice] = useState([0, 200]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [perfumesResponse, categoriasResponse, notasResponse] = await Promise.all([
          perfumeService.getAll(),
          categoriaService.getAll(),
          notaOlfativaService.getAll()
        ]);
        
        const perfumesData = Array.isArray(perfumesResponse.data) ? perfumesResponse.data : [];
        setPerfumes(perfumesData);
        
        const categoriasData = Array.isArray(categoriasResponse.data) ? categoriasResponse.data : [];
        setCategorias(categoriasData);
        
        const notasData = Array.isArray(notasResponse.data) ? notasResponse.data : [];
        setNotasOlfativas(notasData);
        
        // Calcular el rango de precios de los perfumes
        if (perfumesData.length > 0) {
          const prices = perfumesData.map(p => p.precio).filter(p => p != null);
          if (prices.length > 0) {
            const min = Math.floor(Math.min(...prices));
            const max = Math.ceil(Math.max(...prices));
            setMinMaxPrice([min, max]);
            setPriceRange([min, max]);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar los datos:', err);
        let errorMsg = 'Error al cargar los perfumes.';
        if (err.response) {
          errorMsg = `Error ${err.response.status}: ${err.response.data?.message || err.response.statusText || 'Error'}`;
        }
        setPerfumes([]);
        setCategorias([]);
        setNotasOlfativas([]);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (event) => setSearchTerm(event.target.value);
  const handleCategoriaSelect = (categoriaId) => setSelectedCategoria(id => id === categoriaId ? null : categoriaId);
  const handleNotaOlfativaSelect = (notaId) => setSelectedNotaOlfativa(id => id === notaId ? null : notaId);
  
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };
  
  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategoria(null);
    setSelectedNotaOlfativa(null);
    setPriceRange(minMaxPrice);
  };

  const filteredPerfumes = perfumes.filter(perfume => {
    const safeSearchTerm = searchTerm.toLowerCase();
    
    // Filtro por texto (nombre o descripción)
    const matchesSearch = perfume.nombre?.toLowerCase().includes(safeSearchTerm) ||
                          perfume.descripcion?.toLowerCase().includes(safeSearchTerm);
    
    // Filtro por categoría
    const matchesCategoria = !selectedCategoria || 
                             perfume.categorias?.some(c => {
                               const catId = typeof c === 'object' ? c.id : c;
                               return catId === selectedCategoria;
                             });
    
    // Filtro por nota olfativa
    const matchesNota = !selectedNotaOlfativa || 
                        perfume.notasOlfativas?.some(n => {
                          const notaId = typeof n === 'object' ? n.id : n;
                          return notaId === selectedNotaOlfativa;
                        });
    
    // Filtro por rango de precio
    const matchesPrice = !perfume.precio || 
                         (perfume.precio >= priceRange[0] && 
                          perfume.precio <= priceRange[1]);
    
    return matchesSearch && matchesCategoria && matchesNota && matchesPrice;
  });

  const categoriasArray = Array.isArray(categorias) ? categorias : [];
  const notasArray = Array.isArray(notasOlfativas) ? notasOlfativas : [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ p: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold', color: theme.palette.primary.dark }}>
        Descubre Nuestras Fragancias
      </Typography>

      {/* Búsqueda principal */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={handleSearch}
          sx={{
            flexGrow: 1,
            '& .MuiOutlinedInput-root': { borderRadius: '30px', backgroundColor: alpha(theme.palette.grey[200], 0.4)},
            '& .MuiOutlinedInput-input': { paddingLeft: '14px' }
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start" sx={{ pl: 1 }}><SearchIcon color="action" /></InputAdornment>,
          }}
        />
        <Button 
          variant="outlined" 
          startIcon={<FilterListIcon />}
          onClick={toggleFilters}
          sx={{ 
            whiteSpace: 'nowrap', 
            borderRadius: '20px',
            borderColor: filtersVisible ? theme.palette.primary.main : theme.palette.grey[400],
            color: filtersVisible ? theme.palette.primary.main : theme.palette.grey[700],
            '&:hover': { borderColor: theme.palette.primary.main }
          }}
        >
          Filtros
        </Button>
      </Box>

      {/* Panel de filtros avanzados */}
      <Accordion 
        expanded={filtersVisible} 
        onChange={() => setFiltersVisible(!filtersVisible)}
        sx={{ 
          mb: 4, 
          borderRadius: '16px',
          '&:before': { display: 'none' },
          boxShadow: filtersVisible ? 3 : 1
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="filter-panel-content"
          id="filter-panel-header"
          sx={{ display: 'none' }}
        />
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Filtro de categorías */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight="500">
                Categorías
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categoriasArray.map((categoria) => (
                  <Chip
                    key={categoria.id}
                    label={categoria.nombre}
                    onClick={() => handleCategoriaSelect(categoria.id)}
                    color="primary"
                    variant={selectedCategoria === categoria.id ? "filled" : "outlined"}
                    clickable
                    sx={{
                      borderRadius: '16px', px: 1.5, py: 0.5, fontWeight: 500,
                      ...(selectedCategoria !== categoria.id && {
                        borderColor: theme.palette.grey[400],
                        color: theme.palette.grey[800],
                        bgcolor: 'transparent',
                      }),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.light, selectedCategoria === categoria.id ? 0.3 : 0.1),
                      }
                    }}
                  />
                ))}
              </Box>
            </Grid>
            
            {/* Filtro de notas olfativas */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight="500">
                Notas Olfativas
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {notasArray.map((nota) => (
                  <Chip
                    key={nota.id}
                    label={nota.nombre}
                    onClick={() => handleNotaOlfativaSelect(nota.id)}
                    color="secondary"
                    variant={selectedNotaOlfativa === nota.id ? "filled" : "outlined"}
                    clickable
                    sx={{
                      borderRadius: '16px', px: 1.5, py: 0.5, fontWeight: 500,
                      ...(selectedNotaOlfativa !== nota.id && {
                        borderColor: theme.palette.grey[400],
                        color: theme.palette.grey[800],
                        bgcolor: 'transparent',
                      }),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.secondary.light, selectedNotaOlfativa === nota.id ? 0.3 : 0.1),
                      }
                    }}
                  />
                ))}
              </Box>
            </Grid>
            
            {/* Filtro de precio */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight="500">
                Rango de Precio
              </Typography>
              <Box sx={{ px: 2, pt: 1 }}>
                <Slider
                  value={priceRange}
                  onChange={handlePriceChange}
                  valueLabelDisplay="on"
                  min={minMaxPrice[0]}
                  max={minMaxPrice[1]}
                  valueLabelFormat={(value) => `${value}€`}
                  sx={{
                    '& .MuiSlider-valueLabel': {
                      backgroundColor: theme.palette.primary.main,
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {minMaxPrice[0]}€
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {minMaxPrice[1]}€
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Botones de acción de filtros */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={resetFilters}
                sx={{ mr: 2 }}
              >
                Limpiar Filtros
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Indicadores de filtros activos */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {searchTerm && (
          <Chip 
            label={`Búsqueda: ${searchTerm}`} 
            onDelete={() => setSearchTerm('')}
            color="default"
            size="small"
          />
        )}
        {selectedCategoria && (
          <Chip 
            label={`Categoría: ${categoriasArray.find(c => c.id === selectedCategoria)?.nombre || 'Seleccionada'}`} 
            onDelete={() => setSelectedCategoria(null)}
            color="primary"
            size="small"
          />
        )}
        {selectedNotaOlfativa && (
          <Chip 
            label={`Nota: ${notasArray.find(n => n.id === selectedNotaOlfativa)?.nombre || 'Seleccionada'}`} 
            onDelete={() => setSelectedNotaOlfativa(null)}
            color="secondary"
            size="small"
          />
        )}
        {(priceRange[0] !== minMaxPrice[0] || priceRange[1] !== minMaxPrice[1]) && (
          <Chip 
            label={`Precio: ${priceRange[0]}€ - ${priceRange[1]}€`} 
            onDelete={() => setPriceRange(minMaxPrice)}
            color="default"
            size="small"
          />
        )}
      </Box>

      {/* Lista de Perfumes */}
      {filteredPerfumes.length === 0 ? (
        <Alert severity="info" icon={<SearchIcon />} sx={{ mt: 4, p: 2.5, fontSize: '1rem' }}>
          No hemos encontrado fragancias que coincidan con los filtros seleccionados. Intenta con otros criterios de búsqueda.
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {filteredPerfumes.map((perfume) => (
            <Grid item xs={12} sm={6} md={4} key={perfume.id}>
              <Fade in={true} timeout={500}>
                <Card sx={{
                  height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.09)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 12px 25px rgba(0,0,0,0.15)',
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="320"
                    image={perfume.imagen || '/placeholder-image.jpg'}
                    alt={perfume.nombre}
                    sx={{
                      objectFit: 'cover',
                      backgroundColor: '#f8f8f8',
                      p: 0,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                      width: '100%',
                      display: 'block'
                    }}
                  />
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: 3,
                    display: 'flex', 
                    flexDirection: 'column',
                    bgcolor: alpha(theme.palette.background.paper, 0.9)
                  }}>
                    <Typography gutterBottom variant="h5" component="div" sx={{ 
                      fontWeight: 700,
                      mb: 2,
                      minHeight: '3em',
                      color: theme.palette.primary.dark,
                      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      paddingBottom: 1
                    }}>
                      {perfume.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                        mb: 2.5,
                        height: '4.5em',
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        display: '-webkit-box', 
                        WebkitLineClamp: '3', 
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.5em',
                        fontStyle: 'italic',
                        color: alpha(theme.palette.text.secondary, 0.9)
                    }}>
                      {perfume.descripcion || 'Descripción no disponible.'}
                    </Typography>
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                       <Typography variant="h5" sx={{ 
                         fontWeight: 'bold', 
                         mb: 2,
                         color: theme.palette.primary.main,
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         p: 1,
                         borderRadius: '15px',
                         bgcolor: alpha(theme.palette.primary.light, 0.1),
                       }}>
                        {perfume.precio ? `${perfume.precio.toFixed(2)} €` : 'N/A'}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, justifyContent: 'center' }}>
                        {perfume.categorias?.map((categoria, index) => {
                          const categoriaName = typeof categoria === 'object' ? categoria.nombre : 
                                               categoriasArray.find(c => c.id === categoria)?.nombre || `Cat.${categoria}`;
                          return (
                            <Chip
                              size="small"
                              label={categoriaName}
                              key={index}
                              sx={{ 
                                borderRadius: '12px', 
                                bgcolor: alpha(theme.palette.secondary.light, 0.15),
                                color: theme.palette.secondary.dark,
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ 
                    p: 2.5,
                    justifyContent: 'space-between',
                    borderTop: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.grey[50], 0.7)
                  }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<InfoOutlinedIcon />}
                      component={Link} 
                      to={`/perfumes/${perfume.id}`}
                      sx={{ 
                        borderRadius: '15px',
                        px: 2,
                        borderColor: theme.palette.grey[400],
                        color: theme.palette.grey[800],
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.light, 0.05)
                        }
                      }}
                    >
                      Detalles
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small" 
                      endIcon={<ShoppingCartIcon />}
                      component={Link} 
                      to={`/perfumes/${perfume.id}`}
                      sx={{ 
                        borderRadius: '15px',
                        px: 2,
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Comprar
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default PerfumeList;