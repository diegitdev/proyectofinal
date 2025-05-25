  import React, { useState, useEffect } from 'react';
  import { Navigate, Link } from 'react-router-dom';
  import {
    Box,
    Typography,
    Container,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Divider,
    Tabs,
    Tab,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Alert
  } from '@mui/material';
  import { useTheme } from '@mui/material/styles';
  import { checkAuth, getCurrentUser, perfumeService, categoriaService, notaOlfativaService } from '../services/api';
  import AdminUsersList from './AdminUsersList';

  // Importamos algunos iconos relevantes
  import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
  import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
  import InventoryIcon from '@mui/icons-material/Inventory';
  import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
  import EditIcon from '@mui/icons-material/Edit';
  import DeleteIcon from '@mui/icons-material/Delete';
  import AddIcon from '@mui/icons-material/Add';

  // Componente para panel de contenido por pestañas
  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`admin-tabpanel-${index}`}
        aria-labelledby={`admin-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  function a11yProps(index) {
    return {
      id: `admin-tab-${index}`,
      'aria-controls': `admin-tabpanel-${index}`,
    };
  }

  function AdminPanel({ user }) {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    
    // Estados para datos
    const [perfumes, setPerfumes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [notasOlfativas, setNotasOlfativas] = useState([]);
    const [loadingPerfumes, setLoadingPerfumes] = useState(false);
    const [loadingCategorias, setLoadingCategorias] = useState(false);
    const [loadingNotas, setLoadingNotas] = useState(false);
    const [error, setError] = useState(null);
    
    // Estados para diálogos de categoría
    const [openCategoriaDialog, setOpenCategoriaDialog] = useState(false);
    const [categoriaDialogMode, setCategoriaDialogMode] = useState('add'); // 'add' o 'edit'
    const [categoriaActual, setCategoriaActual] = useState({
      id: null,
      nombre: '',
      descripcion: ''
    });
    
    // Estados para diálogos de nota olfativa
    const [openNotaDialog, setOpenNotaDialog] = useState(false);
    const [notaDialogMode, setNotaDialogMode] = useState('add'); // 'add' o 'edit'
    const [notaActual, setNotaActual] = useState({
      id: null,
      nombre: '',
      descripcion: ''
    });

    useEffect(() => {
      const checkUserAccess = () => {
        // Verificar autenticación
        if (!checkAuth()) {
          setLoading(false);
          return;
        }

        const userFromProps = user || getCurrentUser();
        if (!userFromProps || userFromProps.rol !== 'ADMIN') {
          setLoading(false);
          return;
        }

        setCurrentUser(userFromProps);
        setLoading(false);
      };

      checkUserAccess();
    }, [user]);

    // Cargar datos cuando cambia la pestaña
    useEffect(() => {
      if (currentUser && currentUser.rol === 'ADMIN') {
        if (tabValue === 1) {
          fetchPerfumes();
        } else if (tabValue === 2) {
          fetchCategorias();
        } else if (tabValue === 3) {
          fetchNotasOlfativas();
        }
      }
    }, [tabValue, currentUser]);

    // Función para cargar perfumes
    const fetchPerfumes = async () => {
      try {
        setLoadingPerfumes(true);
        setError(null);
        const response = await perfumeService.getAll();
        setPerfumes(response.data);
      } catch (err) {
        console.error("Error al cargar perfumes:", err);
        setError("No se pudieron cargar los perfumes. Por favor, intenta de nuevo.");
      } finally {
        setLoadingPerfumes(false);
      }
    };

    // Función para cargar categorías
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true);
        setError(null);
        const response = await categoriaService.getAll();
        setCategorias(response.data);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
        setError("No se pudieron cargar las categorías. Por favor, intenta de nuevo.");
      } finally {
        setLoadingCategorias(false);
      }
    };

    // Función para cargar notas olfativas
    const fetchNotasOlfativas = async () => {
      try {
        setLoadingNotas(true);
        setError(null);
        const response = await notaOlfativaService.getAll();
        setNotasOlfativas(response.data);
      } catch (err) {
        console.error("Error al cargar notas olfativas:", err);
        setError("No se pudieron cargar las notas olfativas. Por favor, intenta de nuevo.");
      } finally {
        setLoadingNotas(false);
      }
    };

    // Funciones para gestionar categorías
    const handleOpenCategoriaDialog = (mode, categoria = null) => {
      setCategoriaDialogMode(mode);
      if (categoria) {
        setCategoriaActual({
          id: categoria.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion || ''
        });
      } else {
        setCategoriaActual({
          id: null,
          nombre: '',
          descripcion: ''
        });
      }
      setOpenCategoriaDialog(true);
    };

    const handleCloseCategoriaDialog = () => {
      setOpenCategoriaDialog(false);
    };

    const handleCategoriaChange = (e) => {
      const { name, value } = e.target;
      setCategoriaActual(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSaveCategoria = async () => {
      try {
        setError(null);
        
        if (!categoriaActual.nombre.trim()) {
          setError("El nombre de la categoría es requerido");
          return;
        }
        
        // Crear objeto con los datos a guardar
        const categoriaData = {
          id: categoriaActual.id,
          nombre: categoriaActual.nombre.trim(),
          descripcion: '' // Establecer descripción vacía por defecto
        };
        
        if (categoriaDialogMode === 'add') {
          await categoriaService.create(categoriaData);
        } else {
          await categoriaService.update(categoriaActual.id, categoriaData);
        }
        
        fetchCategorias();
        handleCloseCategoriaDialog();
      } catch (err) {
        console.error("Error al guardar categoría:", err);
        setError("Ocurrió un error al guardar la categoría. Por favor, intenta de nuevo.");
      }
    };

    const handleDeleteCategoria = async (id) => {
      if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.')) {
        try {
          setError(null);
          await categoriaService.delete(id);
          fetchCategorias();
        } catch (err) {
          console.error("Error al eliminar categoría:", err);
          setError("Ocurrió un error al eliminar la categoría. Por favor, intenta de nuevo.");
        }
      }
    };

    // Funciones para gestionar notas olfativas
    const handleOpenNotaDialog = (mode, nota = null) => {
      setNotaDialogMode(mode);
      if (mode === 'add') {
        setNotaActual({
          id: null,
          nombre: '',
          descripcion: ''
        });
      } else {
        setNotaActual({
          id: nota.id,
          nombre: nota.nombre || '',
          descripcion: nota.descripcion || ''
        });
      }
      setOpenNotaDialog(true);
    };

    const handleCloseNotaDialog = () => {
      setOpenNotaDialog(false);
    };

    const handleNotaChange = (e) => {
      const { name, value } = e.target;
      setNotaActual({
        ...notaActual,
        [name]: value
      });
    };

    const handleSaveNota = async () => {
      if (!notaActual.nombre || notaActual.nombre.trim() === '') {
        alert('El nombre de la nota olfativa es obligatorio');
        return;
      }

      try {
        const notaData = {
          id: notaActual.id,
          nombre: notaActual.nombre.trim(),
          descripcion: notaActual.descripcion.trim()
        };
        
        if (notaDialogMode === 'add') {
          await notaOlfativaService.create(notaData);
        } else {
          await notaOlfativaService.update(notaActual.id, notaData);
        }
        
        fetchNotasOlfativas();
        handleCloseNotaDialog();
      } catch (err) {
        console.error("Error al guardar nota olfativa:", err);
        setError("Ocurrió un error al guardar la nota olfativa. Por favor, intenta de nuevo.");
      }
    };

    const handleDeleteNota = async (notaId) => {
      if (!window.confirm('¿Estás seguro de que deseas eliminar esta nota olfativa?')) {
        return;
      }
      
      try {
        setLoading(true);
        await notaOlfativaService.remove(notaId);
        
        // Actualizar lista de notas tras eliminar
        fetchNotasOlfativas();
        
        setError(null);
      } catch (error) {
        console.error("Error al eliminar nota olfativa:", error);
        
        // Obtener un mensaje de error más específico
        let mensajeError = "No se pudo eliminar la nota olfativa.";
        
        if (error.response && error.response.data && error.response.data.message) {
          mensajeError = error.response.data.message;
        } else if (error.response && error.response.status === 400) {
          mensajeError = "No se puede eliminar esta nota olfativa porque está siendo utilizada por uno o más perfumes.";
        }
        
        setError(mensajeError);
      } finally {
        setLoading(false);
      }
    };

    // Manejar cambio de pestaña
    const handleTabChange = (event, newValue) => {
      setTabValue(newValue);
    };

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    // Redireccionar si no es administrador
    if (!currentUser || currentUser.rol !== 'ADMIN') {
      return <Navigate to="/" replace />;
    }

    return (
      <Container maxWidth="lg" sx={{ py: theme.spacing(4) }}>
        <Paper
          elevation={3}
          sx={{
            p: theme.spacing(3),
            borderRadius: theme.shape.borderRadius * 1.5,
          }}
        >
          {/* Cabecera del Panel */}
          <Box
            display="flex"
            alignItems="center"
            mb={theme.spacing(3)}
            pb={theme.spacing(2)}
            borderBottom={`1px solid ${theme.palette.divider}`}
          >
            <AdminPanelSettingsIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1" fontWeight="medium">
                Panel de Administración
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Bienvenido. Gestiona los recursos clave de la aplicación.
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Paper sx={{ width: '100%', mb: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="admin tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Inicio" {...a11yProps(0)} />
                <Tab label="Perfumes" {...a11yProps(1)} />
                <Tab label="Categorías" {...a11yProps(2)} />
                <Tab label="Notas Olfativas" {...a11yProps(3)} />
                <Tab label="Usuarios" {...a11yProps(4)} />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h5" gutterBottom>
                Bienvenido al Panel de Administración
              </Typography>
              <Typography variant="body1" paragraph>
                Selecciona una de las pestañas para gestionar los diferentes aspectos de la tienda.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                <Typography variant="h6">Accesos rápidos:</Typography>
                <Link to="#" onClick={(e) => { e.preventDefault(); setTabValue(1); }}>
                  Gestionar catálogo de perfumes
                </Link>
                <Link to="#" onClick={(e) => { e.preventDefault(); setTabValue(2); }}>
                  Gestionar categorías
                </Link>
                <Link to="#" onClick={(e) => { e.preventDefault(); setTabValue(3); }}>
                  Gestionar notas olfativas
                </Link>
                <Link to="#" onClick={(e) => { e.preventDefault(); setTabValue(4); }}>
                  Gestionar usuarios
                </Link>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Catálogo de Perfumes</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  component={Link}
                  to="/admin/perfumes/new"
                >
                  Nuevo Perfume
                </Button>
              </Box>
              
              {loadingPerfumes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><Typography variant="subtitle2">ID</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2">Nombre</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2">Categoría</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2">Precio</Typography></TableCell>
                        <TableCell align="center"><Typography variant="subtitle2">Acciones</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {perfumes.length > 0 ? (
                        perfumes.map(perfume => (
                          <TableRow key={perfume.id}>
                            <TableCell>{perfume.id}</TableCell>
                            <TableCell>{perfume.nombre}</TableCell>
                            <TableCell>{perfume.categoria?.nombre || 'Sin categoría'}</TableCell>
                            <TableCell>{perfume.precio?.toFixed(2)} €</TableCell>
                            <TableCell align="center">
                              <IconButton 
                                color="primary" 
                                component={Link} 
                                to={`/admin/perfumes/edit/${perfume.id}`}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                component={Link} 
                                to={`/admin/perfumes/delete/${perfume.id}`}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No hay perfumes en el catálogo
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Gestión de Categorías</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenCategoriaDialog('add')}
                >
                  Nueva Categoría
                </Button>
              </Box>
              
              {loadingCategorias ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><Typography variant="subtitle2">ID</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2">Nombre</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2">Descripción</Typography></TableCell>
                        <TableCell align="center"><Typography variant="subtitle2">Acciones</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categorias.length > 0 ? (
                        categorias.map(categoria => (
                          <TableRow key={categoria.id}>
                            <TableCell>{categoria.id}</TableCell>
                            <TableCell>{categoria.nombre}</TableCell>
                            <TableCell>{categoria.descripcion}</TableCell>
                            <TableCell align="center">
                              <IconButton 
                                color="primary" 
                                onClick={() => handleOpenCategoriaDialog('edit', categoria)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                onClick={() => handleDeleteCategoria(categoria.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No hay categorías definidas
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {/* Diálogo para añadir/editar categoría */}
              <Dialog open={openCategoriaDialog} onClose={handleCloseCategoriaDialog}>
                <DialogTitle>
                  {categoriaDialogMode === 'add' ? 'Crear Nueva Categoría' : 'Editar Categoría'}
                </DialogTitle>
                <DialogContent>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  <TextField
                    autoFocus
                    margin="dense"
                    name="nombre"
                    label="Nombre"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={categoriaActual.nombre}
                    onChange={handleCategoriaChange}
                    sx={{ mb: 2 }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseCategoriaDialog}>Cancelar</Button>
                  <Button onClick={handleSaveCategoria} variant="contained">Guardar</Button>
                </DialogActions>
              </Dialog>
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Notas Olfativas</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenNotaDialog('add')}
                >
                  Nueva Nota Olfativa
                </Button>
              </Box>
              
              {loadingNotas ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><Typography variant="subtitle2">ID</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2">Nombre</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2">Descripción</Typography></TableCell>
                        <TableCell align="center"><Typography variant="subtitle2">Acciones</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {notasOlfativas.length > 0 ? (
                        notasOlfativas.map(nota => (
                          <TableRow key={nota.id}>
                            <TableCell>{nota.id}</TableCell>
                            <TableCell>{nota.nombre}</TableCell>
                            <TableCell>
                              {nota.descripcion ? 
                                (nota.descripcion.length > 100 ? 
                                  `${nota.descripcion.substring(0, 100)}...` : 
                                  nota.descripcion) : 
                                'Sin descripción'}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton 
                                color="primary" 
                                onClick={() => handleOpenNotaDialog('edit', nota)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                onClick={() => handleDeleteNota(nota.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body1" sx={{ py: 2 }}>
                              No hay notas olfativas registradas.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {/* Diálogo para añadir/editar nota olfativa */}
              <Dialog 
                open={openNotaDialog} 
                onClose={handleCloseNotaDialog}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>
                  {notaDialogMode === 'add' ? 'Crear Nueva Nota Olfativa' : 'Editar Nota Olfativa'}
                </DialogTitle>
                <DialogContent dividers>
                  <Box component="form" sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      required
                      margin="normal"
                      id="nombre"
                      name="nombre"
                      label="Nombre"
                      value={notaActual.nombre}
                      onChange={handleNotaChange}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      id="descripcion"
                      name="descripcion"
                      label="Descripción"
                      multiline
                      rows={4}
                      value={notaActual.descripcion}
                      onChange={handleNotaChange}
                      helperText="Describe las características de esta nota olfativa"
                    />
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseNotaDialog}>Cancelar</Button>
                  <Button 
                    onClick={handleSaveNota} 
                    variant="contained" 
                    color="primary"
                  >
                    Guardar
                  </Button>
                </DialogActions>
              </Dialog>
            </TabPanel>
            
            <TabPanel value={tabValue} index={4}>
              <AdminUsersList user={currentUser} />
            </TabPanel>
          </Paper>
        </Paper>
      </Container>
    );
  }

  export default AdminPanel;